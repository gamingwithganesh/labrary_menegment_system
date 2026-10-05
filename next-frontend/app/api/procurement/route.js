import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/store';
import { getAuthenticatedUser } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request) {
  try {
    const user = getAuthenticatedUser(request);
    const collegeCode = user?.role === 'Super Admin' ? '' : (user?.collegeCode || 'APN-WARDHA');
    const vendors = await dbStore.getVendors({ collegeCode });
    return successResponse(vendors);
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}

export async function POST(request) {
  try {
    const user = getAuthenticatedUser(request);
    if (!user || (user.role !== 'Librarian' && user.role !== 'Admin' && user.role !== 'Super Admin')) {
      return errorResponse('Librarian or Admin privileges required for procurement', 403);
    }

    const body = await request.json();
    const { action } = body;

    const collegeCode = user.role === 'Super Admin' ? (body.collegeCode || 'APN-WARDHA') : (user.collegeCode || 'APN-WARDHA');

    if (action === 'create_po') {
      const { vendorId, items, invoiceNumber, totalAmount } = body;
      const updated = await dbStore.createPurchaseOrder(vendorId, {
        itemsCount: items ? items.length : 0,
        totalAmount: Number(totalAmount) || 0,
        invoiceNumber: invoiceNumber || '',
        items: items || []
      });
      return successResponse(updated, 'Purchase Order successfully placed', 201);
    }

    // Default: Add new vendor
    const { name, contactPerson, email, phone, address } = body;
    if (!name) {
      return errorResponse('Vendor name is required', 400);
    }

    const newVendor = await dbStore.createVendor({
      name,
      contactPerson,
      email,
      phone,
      address,
      collegeCode
    });

    return successResponse(newVendor, 'Vendor added to procurement registry', 201);
  } catch (error) {
    return errorResponse(error.message, 400);
  }
}
