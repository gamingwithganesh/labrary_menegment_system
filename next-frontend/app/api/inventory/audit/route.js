import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/store';
import { getAuthenticatedUser } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request) {
  try {
    const user = getAuthenticatedUser(request);
    const collegeCode = user?.role === 'Super Admin' ? '' : (user?.collegeCode || 'APN-WARDHA');
    const audits = await dbStore.getInventoryAudits({ collegeCode });
    return successResponse(audits);
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}

export async function POST(request) {
  try {
    const user = getAuthenticatedUser(request);
    if (!user || (user.role !== 'Librarian' && user.role !== 'Admin' && user.role !== 'Super Admin')) {
      return errorResponse('Librarian or Admin privileges required for stock verification', 403);
    }

    const body = await request.json();
    const { scannedBarcodes } = body;

    if (!Array.isArray(scannedBarcodes)) {
      return errorResponse('scannedBarcodes must be an array of barcode strings', 400);
    }

    const collegeCode = user.role === 'Super Admin' ? (body.collegeCode || 'APN-WARDHA') : (user.collegeCode || 'APN-WARDHA');

    const result = await dbStore.runInventoryAudit({
      scannedBarcodes,
      auditedBy: `${user.name} (${user.role})`,
      collegeCode
    });

    return successResponse(result, 'Stock verification audit completed successfully', 201);
  } catch (error) {
    return errorResponse(error.message, 400);
  }
}
