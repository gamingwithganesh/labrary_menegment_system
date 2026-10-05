import { dbStore } from '@/lib/store';
import { hashPassword, getAuthenticatedUser, sanitizeUser } from '@/lib/auth';
import { successResponse, errorResponse, badRequestResponse, forbiddenResponse } from '@/lib/api-response';

export async function GET(request) {
  try {
    const authUser = getAuthenticatedUser(request);
    const collegeCode = authUser?.role === 'Super Admin' ? '' : (authUser?.collegeCode || '');
    const users = await dbStore.getAllUsers({ collegeCode });
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
    if (user && !['Admin', 'Super Admin', 'Librarian', 'Staff'].includes(user.role)) {
      return forbiddenResponse('Only authorized staff can create campus user accounts');
    }

    const body = await request.json().catch(() => ({}));
    const { name, email, role, department, institution, password, studentId, employeeId, btCardNumber, btCardValidUntil, phone } = body;

    if (!name || !email) {
      return badRequestResponse('Name and email are required');
    }

    const existing = await dbStore.findUserByEmail(email);
    if (existing) {
      return badRequestResponse('A user with this email or ID already exists');
    }

    const userRole = role || 'Student';
    const passwordHash = await hashPassword(password || 'student123');
    const collegeName = body.collegeName || user?.collegeName || user?.institution || institution || 'Central Campus';
    const collegeCode = body.collegeCode || user?.collegeCode || '';
    const collegeId = body.collegeId || user?.collegeId || '';
    const generatedBt = btCardNumber || (['Student', 'Faculty', 'Student/Faculty'].includes(userRole) ? `BT-2026-${Math.floor(1000 + Math.random() * 9000)}` : undefined);

    const created = await dbStore.createUser({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      username: email.toLowerCase().trim(),
      role: userRole,
      department: department || 'General',
      studentId: studentId || '',
      employeeId: employeeId || '',
      phone: phone || '',
      institution: collegeName,
      collegeName,
      collegeCode,
      collegeId,
      passwordHash,
      status: 'Active',
      activeLoans: 0,
      fineAmount: 0,
      maxBorrowLimit: userRole === 'Faculty' ? 10 : 5,
      btCardNumber: generatedBt,
      btCardValidUntil: btCardValidUntil || '2027-06-30'
    });

    return successResponse(sanitizeUser(created), 'User created successfully', 201);
  } catch (error) {
    console.error('Error in POST /api/admin/users:', error);
    return errorResponse('Failed to create user');
  }
}
