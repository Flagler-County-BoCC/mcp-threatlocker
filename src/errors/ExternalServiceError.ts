import { AppError } from './AppError.js';

export class ExternalServiceError extends AppError {
  public readonly service: string;
  public readonly upstreamStatusCode?: number;

  constructor(
    service: string,
    message: string,
    upstreamStatusCode?: number,
    context?: Record<string, unknown>,
  ) {
    super(`${service}: ${message}`, 502, 'EXTERNAL_SERVICE_ERROR', true, context);
    this.service = service;
    if (upstreamStatusCode !== undefined) {
      this.upstreamStatusCode = upstreamStatusCode;
    }
  }
}
