require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const PORT = process.env.PORT || 8000;
const JWT_SECRET = process.env.JWT_SECRET || 'libman-secret';
const MONGODB_URI = process.env.MONGODB_URI || '';

function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  const initialUsers = [
    {
      id: '1',
      name: 'Admin User',
      email: 'admin@libman.edu',
      password: bcrypt.hashSync('admin123', 10),
      role: 'Administrator'
    },
    {
      id: '2',
      name: 'Library Staff',
      email: 'staff@libman.edu',
      password: bcrypt.hashSync('staff123', 10),
      role: 'Library Staff'
    },
    {
      id: '3',
      name: 'Student User',
      email: 'student@libman.edu',
      password: bcrypt.hashSync('student123', 10),
      role: 'Student/Faculty Member'
    }
  ];

  let users = initialUsers.map((user) => ({ ...user }));
  let books = [
    {
      id: '1',
      title: 'Clean Code',
      author: 'Robert C. Martin',
      subject: 'Programming',
      isbn: '9780132350884',
      accession_number: 'ACC-1001',
      shelf_location: 'A-01',
      quantity: 5,
      available: 4
    },
    {
      id: '2',
      title: 'The Pragmatic Programmer',
      author: 'Andrew Hunt',
      subject: 'Programming',
      isbn: '9780201616224',
      accession_number: 'ACC-1002',
      shelf_location: 'A-02',
      quantity: 3,
      available: 2
    }
  ];

  let circulations = [];
  let acquisitions = [];
  let serials = [];
  let newspaperLogs = [];
  let misLogs = [];

  async function connectToMongo() {
    if (!MONGODB_URI) return;
    try {
      await mongoose.connect(MONGODB_URI);
      console.log('MongoDB connected');
    } catch (error) {
      console.warn('MongoDB not available, using in-memory storage:', error.message);
    }
  }

  async function findUserByEmail(email) {
    if (mongoose.connection.readyState === 1) {
      const user = await mongoose.connection.db.collection('users').findOne({ email });
      return user || null;
    }
    return users.find((user) => user.email === email) || null;
  }

  async function findUserById(id) {
    if (mongoose.connection.readyState === 1) {
      const user = await mongoose.connection.db.collection('users').findOne({ id });
      return user || null;
    }
    return users.find((user) => user.id === id) || null;
  }

  function createToken(user) {
    return jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
  }

  async function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

    if (!token) {
      return res.status(401).json({ detail: 'Missing bearer token' });
    }

    try {
      const payload = jwt.verify(token, JWT_SECRET);
      const user = await findUserById(payload.userId);
      if (!user) {
        return res.status(401).json({ detail: 'Unauthorized' });
      }
      req.user = user;
      return next();
    } catch (error) {
      return res.status(401).json({ detail: 'Invalid token' });
    }
  }

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'LIB-MAN backend running' });
  });

  app.post('/api/v1/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await findUserByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ detail: 'Invalid credentials' });
    }

    const safeUser = { id: user.id, name: user.name, email: user.email, role: user.role };
    return res.json({
      access_token: createToken(user),
      token_type: 'bearer',
      user: safeUser
    });
  });

  app.get('/api/v1/auth/me', authenticateToken, async (req, res) => {
    return res.json({ user: req.user });
  });

  app.get('/api/v1/books', authenticateToken, (req, res) => {
    const { search = '', subject = '' } = req.query;
    const filtered = books.filter((book) => {
      const matchesSearch = !search || [book.title, book.author, book.subject, book.isbn, book.accession_number, book.shelf_location]
        .join(' ')
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesSubject = !subject || subject === 'All' || book.subject === subject;
      return matchesSearch && matchesSubject;
    });

    res.json(filtered);
  });

  app.post('/api/v1/books', authenticateToken, (req, res) => {
    const book = {
      id: `${Date.now()}`,
      ...req.body,
      quantity: Number(req.body.quantity || 1),
      available: Number(req.body.available || req.body.quantity || 1)
    };
    books.push(book);
    res.status(201).json(book);
  });

  app.put('/api/v1/books/:id', authenticateToken, (req, res) => {
    const index = books.findIndex((book) => book.id === req.params.id);
    if (index === -1) return res.status(404).json({ detail: 'Book not found' });
    books[index] = { ...books[index], ...req.body };
    res.json(books[index]);
  });

  app.delete('/api/v1/books/:id', authenticateToken, (req, res) => {
    const index = books.findIndex((book) => book.id === req.params.id);
    if (index === -1) return res.status(404).json({ detail: 'Book not found' });
    books.splice(index, 1);
    res.json({ status: 'deleted' });
  });

  app.get('/api/v1/circulation', authenticateToken, (req, res) => {
    res.json(circulations);
  });

  app.post('/api/v1/circulation/issue', authenticateToken, (req, res) => {
    const { book_id, member_name, member_email, due_date } = req.body;
    const book = books.find((b) => b.id === book_id);
    if (!book) return res.status(404).json({ detail: 'Book not found' });
    if (book.available <= 0) return res.status(400).json({ detail: 'No copies available' });

    book.available -= 1;
    const circulation = {
      id: `${Date.now()}`,
      book_id,
      book_title: book.title,
      member_name,
      member_email,
      due_date,
      status: 'issued'
    };
    circulations.push(circulation);
    res.status(201).json(circulation);
  });

  app.post('/api/v1/circulation/return', authenticateToken, (req, res) => {
    const { circulation_id } = req.body;
    const circulation = circulations.find((c) => c.id === circulation_id);
    if (!circulation) return res.status(404).json({ detail: 'Circulation not found' });

    const book = books.find((b) => b.id === circulation.book_id);
    if (book) book.available += 1;

    circulation.status = 'returned';
    res.json(circulation);
  });

  app.delete('/api/v1/circulation/:id', authenticateToken, (req, res) => {
    const index = circulations.findIndex((c) => c.id === req.params.id);
    if (index === -1) return res.status(404).json({ detail: 'Circulation not found' });
    circulations.splice(index, 1);
    res.json({ status: 'deleted' });
  });

  app.get('/api/v1/acquisitions', authenticateToken, (req, res) => {
    res.json(acquisitions);
  });

  app.post('/api/v1/acquisitions', authenticateToken, (req, res) => {
    const acquisition = { id: `${Date.now()}`, ...req.body };
    acquisitions.push(acquisition);
    res.status(201).json(acquisition);
  });

  app.get('/api/v1/serials', authenticateToken, (req, res) => {
    res.json(serials);
  });

  app.post('/api/v1/serials', authenticateToken, (req, res) => {
    const serial = { id: `${Date.now()}`, ...req.body };
    serials.push(serial);
    res.status(201).json(serial);
  });

  app.delete('/api/v1/serials/:id', authenticateToken, (req, res) => {
    const index = serials.findIndex((s) => s.id === req.params.id);
    if (index === -1) return res.status(404).json({ detail: 'Serial not found' });
    serials.splice(index, 1);
    res.json({ status: 'deleted' });
  });

  app.get('/api/v1/serials/newspaper-logs', authenticateToken, (req, res) => {
    res.json(newspaperLogs);
  });

  app.post('/api/v1/serials/newspaper-logs', authenticateToken, (req, res) => {
    const entry = { id: `${Date.now()}`, ...req.body };
    newspaperLogs.push(entry);
    res.status(201).json(entry);
  });

  app.get('/api/v1/reports/dashboard-metrics', authenticateToken, (req, res) => {
    res.json({
      total_books: books.length,
      total_users: users.length,
      issued_books: circulations.filter((c) => c.status === 'issued').length,
      returned_books: circulations.filter((c) => c.status === 'returned').length,
      total_acquisitions: acquisitions.length,
      total_serials: serials.length
    });
  });

  app.get('/api/v1/reports/mis-logs', authenticateToken, (req, res) => {
    res.json(misLogs);
  });

  app.post('/api/v1/reports/mis-logs', authenticateToken, (req, res) => {
    const entry = { id: `${Date.now()}`, ...req.body };
    misLogs.push(entry);
    res.status(201).json(entry);
  });

  app.delete('/api/v1/auth/users/:id', authenticateToken, (req, res) => {
    const index = users.findIndex((u) => u.id === req.params.id);
    if (index === -1) return res.status(404).json({ detail: 'User not found' });
    users.splice(index, 1);
    res.json({ status: 'deleted' });
  });

  connectToMongo();
  return app;
}

const app = createApp();

function startServer(port = PORT) {
  return app.listen(port, () => {
    console.log(`LIB-MAN backend listening on port ${port}`);
  });
}

if (require.main === module) {
  startServer();
}

module.exports = { app, createApp, startServer };
