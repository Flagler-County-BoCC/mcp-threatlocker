import { z } from 'zod';

// Load .env before parsing — safe to call multiple times
try {
  const { createRequire } = await import('module');
  const require = createRequire(import.meta.url);
  (require('dotenv') as { config: () => void }).config();
} catch {}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  // Required — server cannot start without a valid API key
  THREATLOCKER_API_KEY: z.string().min(8),

  // Optional — computed from THREATLOCKER_INSTANCE if omitted
  THREATLOCKER_BASE_URL: z.string().url().optional(),

  // Optional — defaults to "h" (instance letter in portalapi.<instance>.threatlocker.com)
  THREATLOCKER_INSTANCE: z.string().min(1).default('h'),

  // Optional — controls pino log level
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal', 'silent']).default('info'),

  // Optional — comma-separated list of write tool names that are permitted.
  // Use '*' to allow all write tools. Default (empty) = read-only mode.
  MCP_WRITE_ALLOWLIST: z.string().default(''),

  // Optional — when 'true', write tool executions emit a warn-level audit log entry.
  MCP_REQUIRE_CONFIRM: z.enum(['true', 'false']).default('false'),
});

let env: z.infer<typeof envSchema>;

try {
  env = envSchema.parse(process.env);
} catch (err) {
  /* eslint-disable no-console */
  if (err instanceof z.ZodError) {
    const fields = err.errors.map((e) => `  ${e.path.join('.')}: ${e.message}`).join('\n');
    console.error(`[mcp-threatlocker] Missing or invalid environment variables:\n${fields}`);
    console.error('\nSet THREATLOCKER_API_KEY to a valid API token from the ThreatLocker portal.');
  } else {
    console.error('[mcp-threatlocker] Failed to parse environment:', err);
  }
  /* eslint-enable no-console */
  process.exit(1);
}

export { env };
