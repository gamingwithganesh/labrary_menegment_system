import { dbStore } from '@/lib/store';
import { getAuthenticatedUser } from '@/lib/auth';
import { successResponse, errorResponse, badRequestResponse, notFoundResponse } from '@/lib/api-response';

export async function GET(request) {
  try {
    const user = getAuthenticatedUser(request);
    const { searchParams } = new URL(request.url);
    const memberEmail = searchParams.get('memberEmail') || searchParams.get('memberId') || (['Student', 'Faculty', 'Student/Faculty'].includes(user?.role) ? user?.email : '');
    const bookId = searchParams.get('bookId') || '';
    const status = searchParams.get('status') || '';
    const collegeCode = user?.role === 'Super Admin' ? '' : (user?.collegeCode || '');

    const records = await dbStore.getReservations({ memberEmail, bookId, status, collegeCode });
    return successResponse(records, 'Reservations retrieved successfully');
  } catch (error) {
    console.error('Error in GET /api/reservations:', error);
    return errorResponse('Failed to retrieve reservations');
  }
}

export async function POST(request) {
  try {
    const user = getAuthenticatedUser(request);
    const body = await request.json().catch(() => ({}));
    const { bookId, memberId, memberName, memberEmail, studentId, department } = body;

    if (!bookId) {
      return badRequestResponse('Book ID is required for reservation / issue request');
    }

    const reservation = await dbStore.createReservation({
      bookId,
      memberId: memberId || user?.id || user?._id?.toString() || 'M-101',
      memberName: memberName || user?.name || 'Student Borrower',
      memberEmail: memberEmail || user?.email || '',
      studentId: studentId || user?.studentId || user?.employeeId || '',
      department: department || user?.department || 'General',
      collegeCode: user?.collegeCode || ''
    });

    return successResponse(reservation, 'Book issue request / hold placed successfully', 201);
  } catch (error) {
    console.error('Error in POST /api/reservations:', error);
    return errorResponse(error.message || 'Failed to place book reservation');
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { id, status, pickupDeadline } = body;

    if (!id || !status) {
      return badRequestResponse('Reservation ID and new status are required');
    }

    const updatePayload = { status };
    if (pickupDeadline) updatePayload.pickupDeadline = pickupDeadline;

    const updated = await dbStore.updateReservation(id, updatePayload);
    if (!updated) {
      return notFoundResponse('Reservation request not found');
    }

    return successResponse(updated, `Request marked as ${status}`);
  } catch (error) {
    console.error('Error in PATCH /api/reservations:', error);
    return errorResponse('Failed to update reservation status');
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return badRequestResponse('Reservation ID is required to cancel');
    }

    const cancelled = await dbStore.cancelReservation(id);
    return successResponse(cancelled, 'Reservation cancelled');
  } catch (error) {
    console.error('Error in DELETE /api/reservations:', error);
    return errorResponse('Failed to cancel reservation');
  }
}
