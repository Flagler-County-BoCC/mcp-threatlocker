import { AppError } from './AppError.js';

export class BadRequestError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 400, 'BAD_REQUEST', true, context);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 401, 'UNAUTHORIZED', true, context);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 403, 'FORBIDDEN', true, context);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 404, 'NOT_FOUND', true, context);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 409, 'CONFLICT', true, context);
  }
}

export class UnprocessableEntityError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 422, 'UNPROCESSABLE_ENTITY', true, context);
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 429, 'TOO_MANY_REQUESTS', true, context);
  }
}

export class InternalServerError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 500, 'INTERNAL_SERVER_ERROR', false, context);
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 503, 'SERVICE_UNAVAILABLE', true, context);
  }
}
