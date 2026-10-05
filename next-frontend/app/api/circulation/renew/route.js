import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/store';
import { getAuthenticatedUser } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function POST(request) {
  try {
    const user = getAuthenticatedUser(request);
    if (!user) {
      return errorResponse('Authentication required', 401);
    }

    const body = await request.json();
    const { circulationId } = body;

    if (!circulationId) {
      return errorResponse('Circulation ID is required for renewal', 400);
    }

    const renewed = await dbStore.renewBook({
      circulationId,
      memberEmail: user.email
    });

    return successResponse(renewed, 'Book loan successfully renewed for 14 days');
  } catch (error) {
    return errorResponse(error.message, 400);
  }
}
