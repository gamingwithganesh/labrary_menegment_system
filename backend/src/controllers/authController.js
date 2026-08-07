const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'libman-secret';

const DEMO_USERS = [
  { email: 'admin@libman.edu', password: 'admin123', role: 'Admin', name: 'Admin User', department: 'Administration', institution: 'LIB-MAN' },
  { email: 'superadmin@libman.edu', password: 'admin123', role: 'Super Admin', name: 'Super Admin', department: 'Executive Management', institution: 'LIB-MAN' },
  { email: 'librarian@libman.edu', password: 'admin123', role: 'Librarian', name: 'Head Librarian', department: 'Library', institution: 'LIB-MAN' },
  { email: 'student@libman.edu', password: 'admin123', role: 'Student/Faculty', name: 'Student User', department: 'Student', institution: 'LIB-MAN' }
];

const ensureDemoUser = async (email, password) => {
  const trimmedEmail = String(email || '').toLowerCase().trim();
  const demoUser = DEMO_USERS.find((candidate) => candidate.email === trimmedEmail && candidate.password === password);
  if (!demoUser) return null;

  const existing = await User.findOne({ email: trimmedEmail });
  if (existing) {
    existing.name = demoUser.name;
    existing.role = demoUser.role;
    existing.department = demoUser.department;
    existing.institution = demoUser.institution;
    existing.permissions = existing.permissions || [];
    await existing.save();
    return existing;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const created = await User.create({
    name: demoUser.name,
    email: trimmedEmail,
    passwordHash,
    role: demoUser.role,
    department: demoUser.department,
    institution: demoUser.institution,
    permissions: []
  });

  return created;
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email || '').toLowerCase().trim();
    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      user = await ensureDemoUser(normalizedEmail, password);
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
    const safeUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      institution: user.institution,
      permissions: user.permissions
    };

    res.json({ access_token: token, tokenType: 'bearer', user: safeUser });
  } catch (error) {
    next(error);
  }
};

const me = async (req, res) => {
  const user = req.user;
  res.json({ user });
};

const listUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).lean();
    res.json(users.map((user) => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      institution: user.institution,
      status: user.status,
      createdAt: user.createdAt
    })));
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    await user.deleteOne();
    res.json({ status: 'deleted' });
  } catch (error) {
    next(error);
  }
};

const captcha = async (req, res) => {
  const a = Math.floor(Math.random() * 8) + 3;
  const b = Math.floor(Math.random() * 7) + 2;
  res.json({ question: `What is ${a} + ${b}?` });
};

const register = async (req, res, next) => {
  try {
    const { name, email, password, role = 'Library Staff', department = '', institution = '' } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    if (await User.findOne({ email: normalizedEmail })) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email: normalizedEmail,
      passwordHash,
      role,
      department,
      institution,
      permissions: []
    });

    await user.save();

    res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (error) {
    next(error);
  }
};

module.exports = { login, me, listUsers, deleteUser, captcha, register };