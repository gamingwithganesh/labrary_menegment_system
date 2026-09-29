import { dbStore } from '@/lib/store';
import { getAuthenticatedUser } from '@/lib/auth';
import { successResponse, errorResponse, notFoundResponse, forbiddenResponse } from '@/lib/api-response';

export async function PUT(request, { params }) {
  try {
    const user = getAuthenticatedUser(request);
    if (user && user.role !== 'Super Admin') {
      return forbiddenResponse('Only Super Admin can modify college subscriptions');
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const updated = await dbStore.updateCollege(id, body);

    if (!updated) {
      return notFoundResponse('College not found');
    }

    return successResponse(updated, 'College subscription updated');
  } catch (error) {
    console.error(`Error in PUT /api/superadmin/colleges/${params?.id}:`, error);
    return errorResponse('Failed to update college');
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = getAuthenticatedUser(request);
    if (user && user.role !== 'Super Admin') {
      return forbiddenResponse('Only Super Admin can remove colleges');
    }

    const { id } = await params;
    const deleted = await dbStore.deleteCollege(id);

    if (!deleted) {
      return notFoundResponse('College not found');
    }

    return successResponse(null, 'College removed from SaaS directory');
  } catch (error) {
    console.error(`Error in DELETE /api/superadmin/colleges/${params?.id}:`, error);
    return errorResponse('Failed to remove college');
  }
}
