import { env } from './env.js';

const writeAllowlist = env.MCP_WRITE_ALLOWLIST
  ? env.MCP_WRITE_ALLOWLIST.split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  : ([] as string[]);

const activeProfile =
  writeAllowlist.length === 0
    ? 'read-only'
    : writeAllowlist.includes('*')
      ? 'full-access'
      : 'restricted-write';

export const config = {
  env: env.NODE_ENV,
  log: {
    level: env.LOG_LEVEL,
  },
  threatlocker: {
    apiKey: env.THREATLOCKER_API_KEY,
    instance: env.THREATLOCKER_INSTANCE,
    baseUrl:
      env.THREATLOCKER_BASE_URL ??
      `https://portalapi.${env.THREATLOCKER_INSTANCE}.threatlocker.com`,
  },
  mcp: {
    writeAllowlist,
    requireConfirm: env.MCP_REQUIRE_CONFIRM === 'true',
    activeProfile,
  },
} as const;
