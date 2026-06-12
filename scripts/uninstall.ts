#!/usr/bin/env tsx
/**
 * Removes mcp-threatlocker from Claude Desktop and Claude Code.
 * Run with: npm run uninstall
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SERVER_KEY = 'mcp-threatlocker';
const TEMPLATES_DIR = path.join(ROOT, 'templates', '.claude', 'commands');
const GLOBAL_COMMANDS_DIR = path.join(os.homedir(), '.claude', 'commands');

function getDesktopConfigPath(): string {
  switch (process.platform) {
    case 'darwin':
      return path.join(
        os.homedir(),
        'Library',
        'Application Support',
        'Claude',
        'claude_desktop_config.json',
      );
    case 'win32':
      return path.join(
        process.env['APPDATA'] ?? path.join(os.homedir(), 'AppData', 'Roaming'),
        'Claude',
        'claude_desktop_config.json',
      );
    default:
      return path.join(os.homedir(), '.config', 'Claude', 'claude_desktop_config.json');
  }
}

function getClaudeCodeConfigPath(): string {
  return path.join(os.homedir(), '.claude.json');
}

function readJson(filePath: string): Record<string, unknown> {
  if (!fs.existsSync(filePath)) return {};
  const raw = fs.readFileSync(filePath, 'utf-8').trim();
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    console.error(`\n  ${filePath} is not valid JSON — fix manually.\n`);
    process.exit(1);
  }
}

function writeJson(filePath: string, data: Record<string, unknown>): void {
  const backupPath = `${filePath}.bak`;
  if (fs.existsSync(filePath)) fs.copyFileSync(filePath, backupPath);
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf-8');
}

function deregister(configPath: string, label: string): void {
  if (!fs.existsSync(configPath)) {
    console.log(`\n  ${label}: config not found — nothing to remove.`);
    return;
  }
  const cfg = readJson(configPath);
  const servers = cfg['mcpServers'] as Record<string, unknown> | undefined;
  if (!servers || !(SERVER_KEY in servers)) {
    console.log(`\n  ${label}: ${SERVER_KEY} not registered — nothing to remove.`);
    return;
  }
  delete servers[SERVER_KEY];
  if (Object.keys(servers).length === 0) delete cfg['mcpServers'];
  writeJson(configPath, cfg);
  console.log(`\n  Removed from ${label}: ${configPath}`);
}

function removeCommands(): void {
  if (!fs.existsSync(TEMPLATES_DIR) || !fs.existsSync(GLOBAL_COMMANDS_DIR)) return;
  const templateFiles = new Set(fs.readdirSync(TEMPLATES_DIR).filter((f) => f.endsWith('.md')));
  if (templateFiles.size === 0) return;
  let removed = 0;
  for (const file of templateFiles) {
    const dest = path.join(GLOBAL_COMMANDS_DIR, file);
    if (fs.existsSync(dest)) {
      fs.unlinkSync(dest);
      removed++;
    }
  }
  if (removed > 0) {
    console.log(`\n  Removed ${removed} slash command(s) from ${GLOBAL_COMMANDS_DIR}`);
  }
}

function main(): void {
  deregister(getDesktopConfigPath(), 'Claude Desktop');
  deregister(getClaudeCodeConfigPath(), 'Claude Code');
  removeCommands();
  console.log('\n  Manual steps remaining:');
  console.log('    1. Restart Claude Desktop');
  console.log(`    2. Delete project directory: ${ROOT}`);
  console.log();
}

main();
