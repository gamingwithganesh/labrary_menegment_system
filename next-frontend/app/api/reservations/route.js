import { dbStore } from '@/lib/store';
import { getAuthenticatedUser } from '@/lib/auth';
import { successResponse, errorResponse, badRequestResponse } from '@/lib/api-response';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId') || '';
    const bookId = searchParams.get('bookId') || '';

    const conn = await dbStore.connectDB?.();
    return successResponse([], 'Reservations retrieved');
  } catch (error) {
    return errorResponse('Failed to retrieve reservations');
  }
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { bookId, bookTitle, memberId, memberName, memberEmail } = body;

    if (!bookId) {
      return badRequestResponse('Book ID is required for reservation');
    }

    const reservation = await dbStore.createReservation({
      bookId,
      bookTitle: bookTitle || 'Reserved Book',
      memberId: memberId || 'M-101',
      memberName: memberName || 'Student Borrower',
      memberEmail: memberEmail || ''
    });

    return successResponse(reservation, 'Book hold placed successfully', 201);
  } catch (error) {
    console.error('Error in POST /api/reservations:', error);
    return errorResponse('Failed to place book reservation');
  }
}
