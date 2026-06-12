# mcp-threatlocker

> MCP server exposing all 90 ThreatLocker Portal API endpoints as Model Context Protocol tools.

![CI](https://github.com/Flagler-County-BoCC/mcp-threatlocker/actions/workflows/ci.yml/badge.svg)
![License](https://img.shields.io/github/license/Flagler-County-BoCC/mcp-threatlocker)
![Node](https://img.shields.io/badge/node-%3E%3D22.0.0-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)

## Table of Contents

- [Overview](#overview)
- [Requirements](#requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [MCP Configuration](#mcp-configuration)
- [Usage](#usage)
- [Tool Reference](#tool-reference)
- [Write Gate & Profiles](#write-gate--profiles)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## Overview

`mcp-threatlocker` connects AI assistants (Cursor, Claude Desktop, and any other MCP-compatible client)
directly to the [ThreatLocker](https://www.threatlocker.com) Portal API. All 90 API endpoints are
exposed as typed, validated MCP tools — organized into 24 domain modules covering applications,
computers, policies, maintenance modes, users, and more.

**Security first.** The server ships in **read-only mode** by default. Write and delete operations
are blocked at the tool-call layer until explicitly enabled via `MCP_WRITE_ALLOWLIST`. Every write
tool description is prefixed with `⚠️ WRITE` so AI clients and users can identify them immediately.

## Requirements

- Node.js ≥ 22.0.0
- A ThreatLocker Portal API key (portal → Settings → API Keys)
- npm ≥ 10

## Installation

### Automated setup (recommended)

Builds the project and registers it with Claude Desktop, Claude Code, and installs slash command
templates:

```bash
git clone https://github.com/Flagler-County-BoCC/mcp-threatlocker.git
cd mcp-threatlocker
npm install
cp .env.example .env
# Edit .env — set THREATLOCKER_API_KEY at minimum
npm run setup
```

To remove all registrations:

```bash
npm run uninstall
```

### Manual setup

```bash
git clone https://github.com/Flagler-County-BoCC/mcp-threatlocker.git
cd mcp-threatlocker
npm install
cp .env.example .env
# Edit .env
npm run build
```

Then add the server to your MCP client manually — see [MCP Configuration](#mcp-configuration).

## Configuration

See [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md) for a complete reference of every environment
variable.

Minimum required configuration:

```bash
THREATLOCKER_API_KEY=your-64-char-hex-api-key
```

## MCP Configuration

### Cursor (`.cursor/mcp.json`)

```json
{
  "mcpServers": {
    "mcp-threatlocker": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-threatlocker/dist/stdio.js"],
      "env": {
        "NODE_ENV": "production",
        "LOG_LEVEL": "info",
        "THREATLOCKER_API_KEY": "your-api-key-here",
        "THREATLOCKER_INSTANCE": "h"
      }
    }
  }
}
```

### Claude Desktop (`claude_desktop_config.json`)

```json
{
  "mcpServers": {
    "mcp-threatlocker": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-threatlocker/dist/stdio.js"],
      "env": {
        "THREATLOCKER_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

Config file locations:

| OS | Path |
|----|------|
| macOS | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Windows | `%APPDATA%\Claude\claude_desktop_config.json` |
| Linux | `~/.config/Claude/claude_desktop_config.json` |

### Claude Code

The automated setup script handles Claude Code registration:

```bash
npm run setup
```

This writes to `~/.claude.json` and copies slash command templates to `~/.claude/commands/`.

## Usage

The server communicates over stdio using the MCP JSON-RPC protocol. Once registered with your MCP
client, all 90 tools are immediately available.

### Development (watch mode)

```bash
npm run dev
```

### Production (stdio)

```bash
node dist/stdio.js
```

### Docker

```bash
docker build -t mcp-threatlocker .
docker run --rm -i \
  -e THREATLOCKER_API_KEY=your-key \
  mcp-threatlocker
```

### Inspect tools interactively

```bash
npm run inspect
```

This launches the [MCP Inspector](https://github.com/modelcontextprotocol/inspector) — a browser UI
for calling tools manually.

## Tool Reference

See [docs/API.md](docs/API.md) for the complete tool reference organized by module.

Quick-reference counts:

| Category | Count |
|----------|-------|
| Total tools | 90 |
| Read-only tools | ~64 |
| Write tools (gated by `MCP_WRITE_ALLOWLIST`) | 26 |
| Domain modules | 24 |

## Write Gate & Profiles

The server enforces three operational profiles based on `MCP_WRITE_ALLOWLIST`:

| Profile | `MCP_WRITE_ALLOWLIST` value | Behaviour |
|---------|----------------------------|-----------|
| `read-only` | _(empty — default)_ | All 26 write tools return a blocked error |
| `restricted-write` | Comma-separated tool names | Only listed tools execute |
| `full-access` | `*` | All tools execute |

Example — allow only maintenance mode writes:

```bash
MCP_WRITE_ALLOWLIST=maintenance_mode_insert,maintenance_mode_end_by_id,maintenance_mode_update_end_date
```

Set `MCP_REQUIRE_CONFIRM=true` to emit a `warn`-level audit log entry every time a write tool
executes — useful for change-tracking without blocking.

## Testing

```bash
npm test                 # All unit tests
npm run test:coverage    # Coverage report (thresholds: 80% lines/functions/statements, 75% branches)
npm run test:integration # Integration tests only
```

## Project Structure

```
src/
├── config/          # Zod-validated environment variables
├── errors/          # AppError hierarchy (ExternalServiceError, ValidationError, …)
├── lib/             # Shared utilities: http-client, logger, container, validate, profile
├── stdio.ts         # Entry point — starts MCP server over stdin/stdout
├── server.ts        # Tool registry with write-gate proxy
└── tools/           # 24 domain modules
    └── <module>/
        ├── <module>.schema.ts   # Zod input schemas
        ├── <module>.service.ts  # Business logic + HTTP calls
        └── <module>.tool.ts     # MCP tool registrations
tests/
├── helpers/         # createTestClient, parseText, getText utilities
├── integration/     # Full-server tests (tool count, smoke tests)
└── setup.ts         # Global vitest setup
scripts/
├── setup.ts         # Register server with Claude Desktop, Claude Code, and install slash commands
└── uninstall.ts     # Remove all registrations
templates/
└── .claude/commands/ # Slash command templates copied to ~/.claude/commands/ by npm run setup
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE) © 2024 Your Organization
