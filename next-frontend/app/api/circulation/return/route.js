import { dbStore } from '@/lib/store';
import { getAuthenticatedUser } from '@/lib/auth';
import { successResponse, errorResponse, badRequestResponse, forbiddenResponse } from '@/lib/api-response';

export async function POST(request) {
  try {
    const user = getAuthenticatedUser(request);
    if (user && !['Admin', 'Super Admin', 'Librarian'].includes(user.role)) {
      return forbiddenResponse('Only circulation staff or administrators can process returns');
    }

    const body = await request.json().catch(() => ({}));
    const { circulationId } = body;

    if (!circulationId) {
      return badRequestResponse('Circulation ID is required');
    }

    const returnedRecord = await dbStore.returnBook(circulationId);
    return successResponse(returnedRecord, 'Book returned successfully');
  } catch (error) {
    console.error('Error in POST /api/circulation/return:', error);
    return badRequestResponse(error.message || 'Failed to process return');
  }
}
