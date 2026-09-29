import { dbStore } from '@/lib/store';
import { getAuthenticatedUser } from '@/lib/auth';
import { successResponse, errorResponse, badRequestResponse, forbiddenResponse } from '@/lib/api-response';

export async function GET() {
  try {
    const colleges = await dbStore.getColleges();
    return successResponse(colleges, 'Colleges directory retrieved');
  } catch (error) {
    console.error('Error in GET /api/superadmin/colleges:', error);
    return errorResponse('Failed to retrieve colleges directory');
  }
}

export async function POST(request) {
  try {
    const user = getAuthenticatedUser(request);
    if (user && user.role !== 'Super Admin') {
      return forbiddenResponse('Only Super Admin can onboard new colleges');
    }

    const body = await request.json().catch(() => ({}));
    const { name, code, adminName, adminEmail, adminPassword, location, libraryName, tagline, plan, duration, price, renewalDate } = body;

    if (!name || !code || !adminEmail) {
      return badRequestResponse('College name, code, and admin email are required');
    }

    const newCollege = await dbStore.createCollege({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      adminName: adminName || 'College Admin (Principal)',
      adminEmail: adminEmail.trim().toLowerCase(),
      adminPassword: adminPassword || 'admin123',
      location: location || '',
      libraryName: libraryName || 'Knowledge Resource Center',
      tagline: tagline || '',
      plan: plan || 'Standard Institutional',
      duration: duration || '12 Months',
      price: Number(price) || 15000,
      renewalDate: renewalDate || '2027-08-01',
      status: 'Active',
      studentsCount: 0,
      lastPing: 'Just now',
      health: 'Optimal'
    });

    return successResponse(newCollege, 'College onboarded successfully', 201);
  } catch (error) {
    console.error('Error in POST /api/superadmin/colleges:', error);
    if (error.code === 11000) {
      return badRequestResponse('A college with this code or email already exists.');
    }
    return errorResponse(error.message || 'Failed to onboard college');
  }
}
