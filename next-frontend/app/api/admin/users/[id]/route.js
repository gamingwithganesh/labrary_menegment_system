import { dbStore } from '@/lib/store';
import { getAuthenticatedUser, sanitizeUser } from '@/lib/auth';
import { successResponse, errorResponse, notFoundResponse, forbiddenResponse, badRequestResponse } from '@/lib/api-response';

export async function PATCH(request, { params }) {
  try {
    const user = getAuthenticatedUser(request);
    if (user && !['Admin', 'Super Admin', 'Librarian', 'Staff'].includes(user.role)) {
      return forbiddenResponse('Only authorized library staff can update user status');
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    
    // Allowed update fields
    const allowedFields = ['status', 'department', 'role', 'maxBorrowLimit', 'btCardValidUntil', 'btCardIssueDate', 'btCardNumber', 'studentId', 'employeeId', 'phone', 'name'];
    const updatePayload = {};
    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        updatePayload[key] = body[key];
      }
    }

    if (Object.keys(updatePayload).length === 0) {
      return badRequestResponse('No valid fields provided for update');
    }

    const updated = await dbStore.updateUser(id, updatePayload);
    if (!updated) {
      return notFoundResponse('User not found');
    }

    return successResponse(sanitizeUser(updated), 'User profile updated successfully');
  } catch (error) {
    console.error(`Error in PATCH /api/admin/users/${params?.id}:`, error);
    return errorResponse('Failed to update user');
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = getAuthenticatedUser(request);
    if (user && !['Admin', 'Super Admin', 'Librarian', 'Staff'].includes(user.role)) {
      return forbiddenResponse('Only administrators and authorized library staff can remove users');
    }

    const { id } = await params;
    const deleted = await dbStore.deleteUser(id);
    if (!deleted) {
      return notFoundResponse('User not found');
    }

    return successResponse(null, 'User deleted from campus directory');
  } catch (error) {
    console.error(`Error in DELETE /api/admin/users/${params?.id}:`, error);
    return errorResponse('Failed to delete user');
  }
}
