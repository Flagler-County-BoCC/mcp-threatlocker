import { type ZodTypeAny } from 'zod';
import { ValidationError } from '../errors/index.js';

export function validate<S extends ZodTypeAny>(schema: S, data: unknown): S['_output'] {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ValidationError(result.error.issues);
  }
  return result.data as S['_output'];
}
