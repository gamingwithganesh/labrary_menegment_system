import { dbStore } from '@/lib/store';
import { comparePassword, generateToken, sanitizeUser } from '@/lib/auth';
import { successResponse, errorResponse, badRequestResponse, unauthorizedResponse } from '@/lib/api-response';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, password } = body;

    if (!email || !password) {
      return badRequestResponse('Email and password are required.');
    }

    const user = await dbStore.findUserByEmail(email);
    if (!user) {
      return unauthorizedResponse('Invalid email or password.');
    }

    if (user.status === 'Suspended') {
      return unauthorizedResponse('Account has been suspended. Please contact administrator.');
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      return unauthorizedResponse('Invalid email or password.');
    }

    const sanitized = sanitizeUser(user);
    const token = generateToken(sanitized);

    const response = successResponse(
      {
        access_token: token,
        user: sanitized
      },
      'Login successful'
    );

    // Set secure HTTP-only cookie for defense-in-depth
    response.cookies.set('libman_token', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('Error during login:', error);
    return errorResponse('An error occurred during login. Please try again.');
  }
}
