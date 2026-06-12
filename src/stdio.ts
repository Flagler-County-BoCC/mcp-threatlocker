#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from './server.js';
import { logger } from './lib/logger.js';
import { config } from './config/index.js';

async function main(): Promise<void> {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  logger.info(
    {
      app: 'mcp-threatlocker',
      env: config.env,
      profile: config.mcp.activeProfile,
      tools: 90,
      instance: config.threatlocker.instance,
    },
    'MCP stdio server started',
  );
}

process.on('SIGTERM', () => {
  logger.info('SIGTERM received — shutting down');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received — shutting down');
  process.exit(0);
});

process.on('unhandledRejection', (reason) => {
  logger.fatal({ reason }, 'Unhandled promise rejection');
  process.exit(1);
});

void main().catch((err) => {
  logger.fatal({ err }, 'Failed to start MCP server');
  process.exit(1);
});
