# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] — 2024-12-01

### Added

- Full MCP server implementation covering all 90 ThreatLocker Portal API endpoints across 24 domain modules
- **Write gate** — profile-based tool filtering via `MCP_WRITE_ALLOWLIST`:
  - `read-only` (default, empty allowlist) — blocks all 26 write/delete tools
  - `restricted-write` (comma-separated list) — permits only named tools
  - `full-access` (`*`) — all tools execute
- **Startup observability** — structured log line at startup includes `activeProfile`, `env`, `instance`, and tool count
- **Automated setup script** (`npm run setup`) — registers the server with Claude Desktop, Claude Code (`~/.claude.json`), and installs slash command templates to `~/.claude/commands/`
- **Uninstall script** (`npm run uninstall`) — removes all registrations cleanly
- Vitest unit test suite — 24 spec files, one per module, covering success, error, and validation paths
- Integration tests — full-server tool count assertion (exactly 90) and smoke tests
- ESLint flat config with `@typescript-eslint` type-checked rules and Prettier integration
- Multi-stage Dockerfile (`deps` → `build` → `production`) with non-root `appuser`
- GitHub Actions CI pipeline with lint, typecheck, test (coverage), and smoke-test jobs
- pino structured logging with `REDACT_PATHS` covering `Authorization`, `threatlockerApiKey`, and `THREATLOCKER_API_KEY`

### Modules

| Module | Tools |
|--------|-------|
| action-log | 1 |
| application | 9 |
| application-file | 4 |
| approval-request | 7 |
| computer | 18 |
| computer-checkin | 1 |
| computer-group | 10 |
| config-manager | 2 |
| dac | 2 |
| deploy-policy-queue | 2 |
| maintenance-mode | 4 |
| network-access-policy | 1 |
| online-devices | 1 |
| organization | 5 |
| permission | 1 |
| policy | 7 |
| report | 2 |
| research-information | 1 |
| scheduled-agent-action | 6 |
| system-audit | 2 |
| tag | 1 |
| threatlocker-version | 1 |
| user | 2 |
| user-roles | 1 |

[Unreleased]: https://github.com/your-org/mcp-threatlocker/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/your-org/mcp-threatlocker/releases/tag/v1.0.0
