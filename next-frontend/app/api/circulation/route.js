import { dbStore } from '@/lib/store';
import { getAuthenticatedUser } from '@/lib/auth';
import { successResponse, errorResponse, notFoundResponse, badRequestResponse } from '@/lib/api-response';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId') || '';
    const status = searchParams.get('status') || '';

    const records = await dbStore.getCirculations({ memberId, status });
    return successResponse(records, 'Circulation records retrieved');
  } catch (error) {
    console.error('Error in GET /api/circulation:', error);
    return errorResponse('Failed to retrieve circulation records');
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id') || searchParams.get('circulationId');
    const clearAll = searchParams.get('clearAll') === 'true';

    if (id) {
      const deleted = await dbStore.deleteCirculation(id);
      if (!deleted) {
        return notFoundResponse('Circulation record not found');
      }
      return successResponse(deleted, 'Circulation record deleted');
    }

    if (clearAll) {
      await dbStore.clearCirculations();
      return successResponse(null, 'All circulation records have been cleared');
    }

    return badRequestResponse('Please provide a record ID or set clearAll=true');
  } catch (error) {
    console.error('Error in DELETE /api/circulation:', error);
    return errorResponse('Failed to delete circulation records');
  }
}
