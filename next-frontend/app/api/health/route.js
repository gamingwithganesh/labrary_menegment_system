import { getDBHealth } from '@/lib/db';
import { successResponse } from '@/lib/api-response';

export async function GET() {
  const dbHealth = await getDBHealth();
  const uptimeSeconds = process.uptime ? Math.floor(process.uptime()) : 0;

  const healthPayload = {
    status: 'healthy',
    system: 'LIB-MAN Enterprise Library Management System',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    uptime: `${uptimeSeconds} seconds`,
    database: {
      status: dbHealth.status,
      connected: dbHealth.connected,
      driver: dbHealth.driver
    },
    environment: process.env.NODE_ENV || 'production'
  };

  return successResponse(healthPayload, 'System is healthy and operational');
}
