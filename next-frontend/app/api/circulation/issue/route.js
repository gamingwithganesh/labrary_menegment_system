import { dbStore } from '@/lib/store';
import { getAuthenticatedUser } from '@/lib/auth';
import { successResponse, errorResponse, badRequestResponse, forbiddenResponse } from '@/lib/api-response';

export async function POST(request) {
  try {
    const user = getAuthenticatedUser(request);
    if (user && !['Admin', 'Super Admin', 'Librarian'].includes(user.role)) {
      return forbiddenResponse('Only circulation staff or administrators can issue books');
    }

    const body = await request.json().catch(() => ({}));
    const { bookId, memberId, memberName, memberEmail } = body;

    if (!bookId || !memberId) {
      return badRequestResponse('Both bookId and memberId are required to issue a book');
    }

    const issuedRecord = await dbStore.issueBook({
      bookId,
      memberId,
      memberName: memberName || 'Student Borrower',
      memberEmail: memberEmail || ''
    });

    return successResponse(issuedRecord, 'Book issued successfully', 201);
  } catch (error) {
    console.error('Error in POST /api/circulation/issue:', error);
    return badRequestResponse(error.message || 'Failed to issue book');
  }
}
