import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/store';
import { getAuthenticatedUser } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request) {
  try {
    const user = getAuthenticatedUser(request);
    if (!user || (user.role !== 'Admin' && user.role !== 'Super Admin')) {
      return errorResponse('Admin authority required to view audit trails', 403);
    }

    const collegeCode = user.role === 'Super Admin' ? '' : (user.collegeCode || 'APN-WARDHA');
    const logs = await dbStore.getAuditLogs({ collegeCode, limit: 100 });
    return successResponse(logs);
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}
