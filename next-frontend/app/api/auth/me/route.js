import { getAuthenticatedUser, sanitizeUser } from '@/lib/auth';
import { dbStore } from '@/lib/store';
import { successResponse, unauthorizedResponse, errorResponse } from '@/lib/api-response';

export async function GET(request) {
  try {
    const authUser = getAuthenticatedUser(request);
    if (!authUser) {
      return unauthorizedResponse('Not authenticated');
    }

    const user = await dbStore.findUserByEmail(authUser.email);
    if (!user) {
      return unauthorizedResponse('User not found');
    }

    return successResponse(sanitizeUser(user), 'Current user profile fetched');
  } catch (error) {
    console.error('Error fetching /api/auth/me:', error);
    return errorResponse('Failed to fetch user profile');
  }
}
