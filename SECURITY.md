# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.x     | ✓         |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

To report a vulnerability, email the maintainers at: **security@your-org.example.com**

Include as much of the following as possible:

- A description of the vulnerability and its potential impact
- The affected version(s)
- Steps to reproduce or a proof-of-concept
- Any suggested mitigations

You will receive an acknowledgement within 48 hours and a substantive response within 7 days. We
will keep you informed as the issue is investigated, and credit you in the fix if you wish.

## Security Measures in This Project

### Credential handling

- All credentials are managed through environment variables — never hard-coded or committed to source
- `.env`, `.env.local`, `*.pem`, `*.key`, `*.crt`, and `token.txt` are listed in `.gitignore`
- `THREATLOCKER_API_KEY` is validated at startup and rejected if shorter than 8 characters

### Input validation

- Every tool call validates its full input with a Zod schema before the service layer is reached
- Invalid inputs return `isError: true` immediately — the ThreatLocker API is never called with
  malformed data
- No `z.any()` is used in any tool schema

### Write gate

- The server ships in **read-only mode** by default — all 26 mutating tools are blocked unless
  explicitly enabled via `MCP_WRITE_ALLOWLIST`
- Blocked write operations return a descriptive error explaining which env var to configure
- Setting `MCP_REQUIRE_CONFIRM=true` emits a `warn`-level audit log entry for every write
  operation executed

### Log redaction

- pino's `redact` option removes `Authorization`, `threatlockerApiKey`, and `THREATLOCKER_API_KEY`
  from every log entry, including nested paths
- Raw credentials never appear in error messages — upstream API errors are wrapped as
  `ExternalServiceError` before propagating

### Dependencies

- `npm audit` is run in CI on every push; the pipeline fails on high-severity findings
- All production dependencies are pinned with `^` semver ranges; `"*"` and `"latest"` are prohibited

### Docker

- The production Docker image runs as a non-root `appuser` (uid 1001)
- `.env` files are excluded from the Docker build context via `.dockerignore`

### No `eval`

- `eval()` and `new Function()` are banned by the ESLint configuration

## Dependency Disclosure

This project uses the following security-relevant libraries:

| Library | Purpose |
|---------|---------|
| `zod` | Input validation for all tool parameters |
| `pino` | Structured logging with field redaction |
| `axios` | HTTP client for ThreatLocker API calls |
| `@modelcontextprotocol/sdk` | MCP server transport and tool registration |
