import { dbStore } from '@/lib/store';
import { getAuthenticatedUser } from '@/lib/auth';
import { successResponse, errorResponse, badRequestResponse, forbiddenResponse } from '@/lib/api-response';

export async function GET() {
  try {
    const serials = await dbStore.getSerials();
    return successResponse(serials, 'Serials and periodicals retrieved');
  } catch (error) {
    console.error('Error in GET /api/serials:', error);
    return errorResponse('Failed to retrieve serials');
  }
}

export async function POST(request) {
  try {
    const user = getAuthenticatedUser(request);
    if (user && !['Admin', 'Super Admin', 'Librarian'].includes(user.role)) {
      return forbiddenResponse('Only library staff can register serial subscriptions');
    }

    const body = await request.json().catch(() => ({}));
    const { title, issn, frequency, vendor, subscriptionEnd, lastReceivedIssue } = body;

    if (!title) {
      return badRequestResponse('Serial title is required');
    }

    const newSerial = await dbStore.createSerial({
      title: title.trim(),
      issn: issn || '2049-3630',
      frequency: frequency || 'Monthly',
      vendor: vendor || 'Direct Publisher',
      subscriptionEnd: subscriptionEnd || '2027-01-01',
      status: 'Active',
      lastReceivedIssue: lastReceivedIssue || 'Vol 1 Issue 1'
    });

    return successResponse(newSerial, 'Serial subscription registered', 201);
  } catch (error) {
    console.error('Error in POST /api/serials:', error);
    return errorResponse('Failed to register serial subscription');
  }
}
