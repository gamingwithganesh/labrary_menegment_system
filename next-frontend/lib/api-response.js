import { NextResponse } from 'next/server';

/**
 * Standardized API success response
 */
export function successResponse(data, message = 'Success', status = 200) {
  return NextResponse.json(
    {
      success: true,
      message,
      data
    },
    { status }
  );
}

/**
 * Standardized API error response
 */
export function errorResponse(message = 'An unexpected error occurred', status = 500, errors = null) {
  const payload = {
    success: false,
    message
  };

  if (errors) {
    payload.errors = errors;
  }

  return NextResponse.json(payload, { status });
}

export function unauthorizedResponse(message = 'Authentication required') {
  return errorResponse(message, 401);
}

export function forbiddenResponse(message = 'Access forbidden: Insufficient permissions') {
  return errorResponse(message, 403);
}

export function notFoundResponse(message = 'Requested resource not found') {
  return errorResponse(message, 404);
}

export function badRequestResponse(message = 'Invalid request payload', errors = null) {
  return errorResponse(message, 400, errors);
}
