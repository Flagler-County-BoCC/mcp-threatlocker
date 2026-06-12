#!/usr/bin/env tsx
/**
 * Registers mcp-threatlocker in Claude Desktop and Claude Code CLI.
 * Run with: npm run setup
 *
 * Writes a .bak backup before modifying any config file.
 * Claude Code config: ~/.claude.json  (type: "stdio")
 * Claude Desktop:     ~/Library/Application Support/Claude/claude_desktop_config.json (macOS)
 *                     %APPDATA%\Claude\claude_desktop_config.json                    (Windows)
 *                     ~/.config/Claude/claude_desktop_config.json                    (Linux)
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BINARY = path.join(ROOT, 'dist', 'stdio.js');
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
    console.error(
      `\n  Config at ${filePath} is not valid JSON — fix manually before re-running.\n`,
    );
    process.exit(1);
  }
}

function writeJson(filePath: string, data: Record<string, unknown>): void {
  const backupPath = `${filePath}.bak`;
  if (fs.existsSync(filePath)) fs.copyFileSync(filePath, backupPath);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf-8');
}

function registerDesktop(configPath: string): void {
  const configDir = path.dirname(configPath);
  if (!fs.existsSync(configDir)) {
    console.warn(
      `\n  Claude Desktop: config directory not found — may not be installed. Skipping.`,
    );
    return;
  }
  const cfg = readJson(configPath);
  const servers = (cfg['mcpServers'] as Record<string, unknown> | undefined) ?? {};
  const isUpdate = SERVER_KEY in servers;
  servers[SERVER_KEY] = { command: 'node', args: [BINARY] };
  cfg['mcpServers'] = servers;
  writeJson(configPath, cfg);
  console.log(`\n  ${isUpdate ? 'Updated' : 'Registered'} in Claude Desktop`);
  console.log(`  Config: ${configPath}`);
}

function registerClaudeCode(configPath: string): void {
  const cfg = readJson(configPath);
  const servers = (cfg['mcpServers'] as Record<string, unknown> | undefined) ?? {};
  const isUpdate = SERVER_KEY in servers;
  servers[SERVER_KEY] = { type: 'stdio', command: 'node', args: [BINARY] };
  cfg['mcpServers'] = servers;
  writeJson(configPath, cfg);
  console.log(`\n  ${isUpdate ? 'Updated' : 'Registered'} in Claude Code`);
  console.log(`  Config: ${configPath}`);
}

function installCommands(): void {
  if (!fs.existsSync(TEMPLATES_DIR)) return;
  fs.mkdirSync(GLOBAL_COMMANDS_DIR, { recursive: true });
  const files = fs.readdirSync(TEMPLATES_DIR).filter((f) => f.endsWith('.md'));
  const installed: string[] = [];
  const updated: string[] = [];
  for (const file of files) {
    const dest = path.join(GLOBAL_COMMANDS_DIR, file);
    const isUpdate = fs.existsSync(dest);
    fs.copyFileSync(path.join(TEMPLATES_DIR, file), dest);
    (isUpdate ? updated : installed).push(file.replace('.md', ''));
  }
  if (files.length > 0) {
    console.log(`\n  Slash commands → ${GLOBAL_COMMANDS_DIR}`);
    if (installed.length) console.log(`  Installed: ${installed.map((f) => `/${f}`).join('  ')}`);
    if (updated.length) console.log(`  Updated:   ${updated.map((f) => `/${f}`).join('  ')}`);
  }
}

function main(): void {
  if (!fs.existsSync(BINARY)) {
    console.error(
      '\n  Build not found. Run `npm run build` first (or use `npm run setup` which builds for you).\n',
    );
    process.exit(1);
  }
  registerDesktop(getDesktopConfigPath());
  registerClaudeCode(getClaudeCodeConfigPath());
  installCommands();
  console.log(`\n  Binary: ${BINARY}`);
  console.log('\n  Restart Claude Desktop to apply changes.');
  console.log('  Claude Code picks up changes automatically.\n');
}

main();
