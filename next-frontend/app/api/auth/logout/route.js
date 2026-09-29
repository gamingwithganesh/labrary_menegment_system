import { successResponse } from '@/lib/api-response';

export async function POST() {
  const response = successResponse(null, 'Logged out successfully');
  response.cookies.set('libman_token', '', {
    maxAge: 0,
    path: '/'
  });
  return response;
}
