import { dbStore } from '@/lib/store';
import { getAuthenticatedUser } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

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
