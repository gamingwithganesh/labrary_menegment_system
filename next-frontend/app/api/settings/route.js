import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/store';
import { getAuthenticatedUser } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request) {
  try {
    const user = getAuthenticatedUser(request);
    const collegeCode = user?.collegeCode || 'APN-WARDHA';
    const settings = await dbStore.getSettings(collegeCode);
    return successResponse(settings);
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}

export async function PUT(request) {
  try {
    const user = getAuthenticatedUser(request);
    if (!user || (user.role !== 'Admin' && user.role !== 'Super Admin')) {
      return errorResponse('Admin authority required to modify institutional settings', 403);
    }

    const body = await request.json();
    const collegeCode = user.role === 'Super Admin' ? (body.collegeCode || 'APN-WARDHA') : (user.collegeCode || 'APN-WARDHA');

    const updated = await dbStore.updateSettings(collegeCode, body);
    return successResponse(updated, 'Institutional policies and fine rules updated successfully');
  } catch (error) {
    return errorResponse(error.message, 400);
  }
}
