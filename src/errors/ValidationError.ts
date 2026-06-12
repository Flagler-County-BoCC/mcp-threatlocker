import type { ZodIssue } from 'zod';
import { AppError } from './AppError.js';

export class ValidationError extends AppError {
  public readonly issues: ZodIssue[];

  constructor(issues: ZodIssue[]) {
    super('Validation failed', 422, 'VALIDATION_ERROR', true);
    this.issues = issues;
  }
}
