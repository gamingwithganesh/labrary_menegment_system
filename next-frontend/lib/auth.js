import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'libman_production_secure_secret_key_change_in_env_2026';
const JWT_EXPIRES_IN = '7d';

/**
 * Hash a plain-text password using bcrypt
 */
export async function hashPassword(plainPassword) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainPassword, salt);
}

/**
 * Compare plain-text password with hashed password
 */
export async function comparePassword(plainPassword, hashedPassword) {
  if (!plainPassword || !hashedPassword) return false;
  return bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * Generate a JWT token for a user
 */
export function generateToken(user) {
  const payload = {
    id: user.id || user._id?.toString(),
    email: user.email,
    role: user.role,
    name: user.name,
    department: user.department,
    institution: user.institution || user.collegeName || 'Central Campus',
    collegeName: user.collegeName || user.institution || '',
    collegeCode: user.collegeCode || '',
    collegeId: user.collegeId || ''
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

/**
 * Extract token from Next.js Request Authorization header or cookies
 */
export function extractTokenFromRequest(request) {
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  // Fallback to cookie
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    const match = cookieHeader.match(/libman_token=([^;]+)/);
    if (match) {
      return match[1];
    }
  }

  return null;
}

/**
 * Authenticate incoming request and return decoded user payload
 */
export function getAuthenticatedUser(request) {
  const token = extractTokenFromRequest(request);
  if (!token) return null;
  return verifyToken(token);
}

/**
 * Sanitize user object for public/client responses (strip passwords)
 */
export function sanitizeUser(user) {
  if (!user) return null;
  const raw = user.toObject ? user.toObject() : { ...user };
  delete raw.password;
  delete raw.passwordHash;
  delete raw.__v;
  if (raw._id) {
    raw.id = raw._id.toString();
  }
  raw.collegeName = raw.collegeName || raw.institution || '';
  raw.collegeCode = raw.collegeCode || '';
  raw.collegeId = raw.collegeId || '';
  return raw;
}
