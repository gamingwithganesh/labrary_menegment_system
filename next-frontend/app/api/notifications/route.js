import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/store';
import { getAuthenticatedUser } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request) {
  try {
    const user = getAuthenticatedUser(request);
    const collegeCode = user?.collegeCode || 'APN-WARDHA';
    const notifs = await dbStore.getNotifications({
      collegeCode,
      recipientEmail: user?.email || ''
    });
    return successResponse(notifs);
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}

export async function POST(request) {
  try {
    const user = getAuthenticatedUser(request);
    if (!user || (user.role !== 'Admin' && user.role !== 'Librarian' && user.role !== 'Super Admin')) {
      return errorResponse('Staff privileges required to publish announcements', 403);
    }

    const body = await request.json();
    const { title, message, type = 'ANNOUNCEMENT', recipientId = 'ALL' } = body;

    if (!title || !message) {
      return errorResponse('Title and message are required', 400);
    }

    const created = await dbStore.createNotification({
      title,
      message,
      type,
      recipientId,
      collegeCode: user.collegeCode || 'APN-WARDHA'
    });

    return successResponse(created, 'Notification broadcasted successfully', 201);
  } catch (error) {
    return errorResponse(error.message, 400);
  }
}
