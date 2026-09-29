import { dbStore } from '@/lib/store';
import { getAuthenticatedUser } from '@/lib/auth';
import { successResponse, errorResponse, notFoundResponse, forbiddenResponse } from '@/lib/api-response';

export async function DELETE(request, { params }) {
  try {
    const user = getAuthenticatedUser(request);
    if (user && !['Admin', 'Super Admin'].includes(user.role)) {
      return forbiddenResponse('Only administrators can remove users');
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
