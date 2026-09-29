import { dbStore } from '@/lib/store';
import { getAuthenticatedUser } from '@/lib/auth';
import { successResponse, errorResponse, badRequestResponse, forbiddenResponse } from '@/lib/api-response';

export async function GET() {
  try {
    const broadcasts = await dbStore.getBroadcasts();
    return successResponse(broadcasts, 'Broadcast notices retrieved');
  } catch (error) {
    console.error('Error in GET /api/superadmin/broadcast:', error);
    return errorResponse('Failed to retrieve broadcasts');
  }
}

export async function POST(request) {
  try {
    const user = getAuthenticatedUser(request);
    if (user && user.role !== 'Super Admin') {
      return forbiddenResponse('Only Super Admin can broadcast messages');
    }

    const body = await request.json().catch(() => ({}));
    const { target, message, severity } = body;

    if (!message) {
      return badRequestResponse('Broadcast message is required');
    }

    const created = await dbStore.createBroadcast({
      target: target || 'All Colleges',
      message: message.trim(),
      severity: severity || 'Info Notice'
    });

    return successResponse(created, 'Broadcast alert dispatched', 201);
  } catch (error) {
    console.error('Error in POST /api/superadmin/broadcast:', error);
    return errorResponse('Failed to broadcast alert');
  }
}
