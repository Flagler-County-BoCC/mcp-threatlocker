import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { AppError } from '../errors/index.js';
import { createLogger } from './logger.js';

const log = createLogger({ module: 'toolErrorHandler' });

export function handleToolError(err: unknown, toolName: string): CallToolResult {
  if (err instanceof AppError) {
    if (!err.isOperational) {
      log.error({ err, toolName }, 'Non-operational error in tool');
    } else {
      log.warn({ err, toolName, code: err.code }, 'Operational error in tool');
    }
    return {
      content: [{ type: 'text', text: `Error [${err.code}]: ${err.message}` }],
      isError: true,
    };
  }

  log.error({ err, toolName }, 'Unexpected error in tool');
  return {
    content: [{ type: 'text', text: 'An unexpected error occurred' }],
    isError: true,
  };
}
