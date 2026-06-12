import pino from 'pino';
import { config } from '../config/index.js';

/**
 * MCP stdio rule: stdout is exclusively for JSON-RPC messages.
 * ALL pino output is routed to stderr in every environment — never stdout.
 *
 *   development/test — pino-pretty → stderr  (destination: 2)
 *   production       — pino JSON   → process.stderr
 */

const REDACT_PATHS = [
  'password',
  'passwd',
  'secret',
  'token',
  'apiKey',
  'api_key',
  'authorization',
  // HTTP headers use title-case; cover both spellings
  'Authorization',
  'cookie',
  'priv',
  'privateKey',
  'clientSecret',
  // ThreatLocker-specific credential fields
  'threatlockerApiKey',
  'THREATLOCKER_API_KEY',
  '*.password',
  '*.token',
  '*.secret',
  '*.priv',
  '*.privateKey',
  '*.clientSecret',
  '*.apiKey',
  '*.authorization',
  '*.Authorization',
  '*.threatlockerApiKey',
];

const level = config.env === 'test' ? 'silent' : (process.env['LOG_LEVEL'] ?? config.log.level);

export const logger =
  config.env !== 'production'
    ? pino({
        level,
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            ignore: 'pid,hostname',
            destination: 2,
          },
        },
        redact: { paths: REDACT_PATHS, censor: '[REDACTED]' },
      })
    : pino(
        {
          level,
          base: {
            service: 'mcp-threatlocker',
            version: process.env['npm_package_version'] ?? 'unknown',
            env: config.env,
          },
          timestamp: pino.stdTimeFunctions.isoTime,
          redact: { paths: REDACT_PATHS, censor: '[REDACTED]' },
          serializers: {
            err: pino.stdSerializers.err,
          },
        },
        process.stderr,
      );

export function createLogger(context: Record<string, unknown>): pino.Logger {
  return logger.child(context);
}
