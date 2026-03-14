import crypto from 'crypto';

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(message: string, code: string, statusCode = 500) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

export class AuthError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 'AUTH_ERROR', 401);
    this.name = 'AuthError';
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Invalid input') {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

export class DatabaseError extends AppError {
  constructor(message = 'A database error occurred') {
    super(message, 'DATABASE_ERROR', 500);
    this.name = 'DatabaseError';
  }
}

export class ApiError extends AppError {
  constructor(message = 'An API error occurred') {
    super(message, 'API_ERROR', 500);
    this.name = 'ApiError';
  }
}

export function toSafeError(error: unknown): { message: string; code: string } {
  if (error instanceof AppError) {
    return { message: error.message, code: error.code };
  }

  return { message: 'An unexpected error occurred.', code: 'INTERNAL_ERROR' };
}

export function hashIdentifier(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

export function logServerError(error: unknown, context: { action: string; userId?: string }): void {
  const safe = toSafeError(error);
  const userIdHash = context.userId ? hashIdentifier(context.userId) : undefined;

  console.error('[HealthOS]', {
    action: context.action,
    userId: userIdHash,
    code: safe.code,
    message: safe.message,
  });
}
