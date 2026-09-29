import { dbStore } from '@/lib/store';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET() {
  try {
    const metrics = await dbStore.getDashboardMetrics();
    return successResponse(metrics, 'Live dashboard metrics computed');
  } catch (error) {
    console.error('Error in GET /api/reports/dashboard-metrics:', error);
    return errorResponse('Failed to compute dashboard metrics');
  }
}
