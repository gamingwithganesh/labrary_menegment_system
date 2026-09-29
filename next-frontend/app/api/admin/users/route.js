import { dbStore } from '@/lib/store';
import { hashPassword, getAuthenticatedUser, sanitizeUser } from '@/lib/auth';
import { successResponse, errorResponse, badRequestResponse, forbiddenResponse } from '@/lib/api-response';

export async function GET(request) {
  try {
    const users = await dbStore.getAllUsers();
    const sanitized = users.map(u => sanitizeUser(u));
    return successResponse(sanitized, 'Users retrieved successfully');
  } catch (error) {
    console.error('Error in GET /api/admin/users:', error);
    return errorResponse('Failed to retrieve user directory');
  }
}

export async function POST(request) {
  try {
    const user = getAuthenticatedUser(request);
    if (user && !['Admin', 'Super Admin'].includes(user.role)) {
      return forbiddenResponse('Only administrators can create campus user accounts');
    }

    const body = await request.json().catch(() => ({}));
    const { name, email, role, department, institution, password } = body;

    if (!name || !email) {
      return badRequestResponse('Name and email are required');
    }

    const existing = await dbStore.findUserByEmail(email);
    if (existing) {
      return badRequestResponse('A user with this email address already exists');
    }

    const passwordHash = await hashPassword(password || 'admin123');
    const collegeName = body.collegeName || user?.collegeName || user?.institution || institution || 'Central Campus';
    const collegeCode = body.collegeCode || user?.collegeCode || '';
    const collegeId = body.collegeId || user?.collegeId || '';

    const created = await dbStore.createUser({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      role: role || 'Student',
      department: department || 'General',
      institution: collegeName,
      collegeName,
      collegeCode,
      collegeId,
      passwordHash,
      status: 'Active',
      activeLoans: 0,
      fineAmount: 0
    });

    return successResponse(sanitizeUser(created), 'User created successfully', 201);
  } catch (error) {
    console.error('Error in POST /api/admin/users:', error);
    return errorResponse('Failed to create user');
  }
}
