# Architecture

## Overview

`mcp-threatlocker` is a **stdio MCP server** — it communicates exclusively over standard
input/output using the [Model Context Protocol](https://modelcontextprotocol.io) JSON-RPC wire
format. There is no HTTP port, no web server, and no persistent process state beyond the lifecycle
of a single MCP session.

## Request Flow

```
MCP Client (Cursor / Claude Desktop / Claude Code)
         │  JSON-RPC over stdin/stdout
         ▼
┌──────────────────────────┐
│   StdioServerTransport    │  src/stdio.ts
│   (MCP SDK)               │  connects transport to server, handles signal shutdown
└───────────┬──────────────┘
            │
            ▼
┌──────────────────────────┐
│   McpServer               │  src/server.ts
│   (tool registry)         │  write-gate proxy wraps server.tool() at registration time
└───────────┬──────────────┘
            │  tool call dispatched by name
            ▼
┌──────────────────────────┐
│   Tool Handler            │  src/tools/<module>/<module>.tool.ts
│                           │  1. isToolAllowedForProfile() check (write gate)
│                           │  2. validate(Schema, params) → throws ValidationError on failure
│                           │  3. calls service method
│                           │  4. returns JSON text content
│                           │  catch: handleToolError → isError: true, never throws
└───────────┬──────────────┘
            │
            ▼
┌──────────────────────────┐
│   Service                 │  src/tools/<module>/<module>.service.ts
│   (business logic)        │  throws AppError subclasses (ExternalServiceError, ValidationError)
└───────────┬──────────────┘
            │
            ▼
┌──────────────────────────┐
│   HTTP Client             │  src/lib/http-client.ts
│   (Axios + auth)          │  injects THREATLOCKER_API_KEY header on every request
│                           │  wraps Axios errors as ExternalServiceError
└───────────┬──────────────┘
            │  HTTPS
            ▼
  ThreatLocker Portal API
  (portalapi.<instance>.threatlocker.com)
```

## Key Design Decisions

### Single Axios instance (DI container)

A single `AxiosInstance` is created at startup (`src/lib/http-client.ts`) with the base URL and
auth header pre-configured. All 24 service classes receive it via the DI container
(`src/lib/container.ts`). This means:

- The API key is set exactly once
- All outbound requests share connection pooling
- Mocking in tests requires only `vi.mock('../../../lib/container.js')`

### Write gate via ES Proxy

`src/server.ts` wraps `McpServer` in an ES `Proxy` that intercepts `server.tool()` calls at
registration time. For any tool in `WRITE_TOOL_NAMES`, the original callback is replaced with a
guarded version that:

1. Calls `isToolAllowedForProfile(name)` — returns `blockedResult()` if not allowed
2. Optionally logs the execution at `warn` level when `MCP_REQUIRE_CONFIRM=true`
3. Delegates to the original callback

The proxy is used only for registration. The underlying `rawServer` is passed to
`server.connect()`, so the MCP transport is unaware of the gate.

### Error handling contract

Tool handlers never throw. Every catch block calls:

```typescript
return handleToolError(err, toolName);
```

This returns a `CallToolResult` with `isError: true` and a formatted `Error [CODE]: message`
string. MCP clients that inspect `isError` receive a machine-readable error without the transport
layer treating it as a protocol error.

### Input validation at the boundary

`validate(Schema, params)` is called in every tool handler before reaching the service layer.
If the MCP SDK delivers params that pass JSON-Schema validation but fail Zod refinements (e.g., a
UUID format check), the handler catches the resulting `ValidationError` and returns it as
`isError: true`. The ThreatLocker API is never called with invalid inputs.

### `z.coerce` for MCP inputs

MCP tool parameters arrive as JSON-Schema-typed values, but the MCP SDK may deliver them as
strings. All numeric and boolean fields in tool schemas use `z.coerce.number()` and
`z.coerce.boolean()` to handle this automatically.

## Directory Layout

```
src/
├── config/
│   ├── env.ts         # Zod schema — parses and validates process.env at startup
│   └── index.ts       # Exports typed `config` object
├── errors/
│   └── index.ts       # AppError, ExternalServiceError, ValidationError
├── lib/
│   ├── container.ts   # DI: creates and exports 24 named service singletons
│   ├── http-client.ts # Axios factory with base URL and auth header
│   ├── logger.ts      # pino factory with redact paths; silent in test env
│   ├── profile.ts     # WRITE_TOOL_NAMES set, isToolAllowedForProfile(), blockedResult()
│   ├── tool-error-handler.ts  # handleToolError(err, toolName) → CallToolResult
│   └── validate.ts    # validate<S>(schema, data) → typed output or throws ValidationError
├── stdio.ts           # Entry point: createServer() → connect(StdioServerTransport)
├── server.ts          # createServer(): applies write gate, registers all 90 tools
└── tools/
    └── <module>/
        ├── <module>.schema.ts   # Zod input schemas + TypeScript inferred types
        ├── <module>.service.ts  # Service class — HTTP calls + business logic
        └── <module>.tool.ts     # server.tool() registrations for this module
```

## Testing Architecture

Unit tests mock the entire service layer:

```typescript
vi.mock('../../../lib/container.js');
// vi.mocked(myService.method).mockResolvedValueOnce(...)
```

`tests/helpers/createTestClient.ts` wires a real `McpServer` + `InMemoryTransport` + `Client`
in-process, so tool handlers run end-to-end (including Zod validation and `handleToolError`)
without any network calls.

Integration tests in `tests/integration/` use the same helper to verify:

- Exactly 90 tools are registered
- Every module contributes at least one tool
- All tool names are snake_case
- All tool descriptions are non-empty

## Sequence: Write-Gated Tool Call (read-only mode)

```
Client                    McpServer (proxy)         isToolAllowedForProfile
  │                            │                            │
  │── callTool("app_insert") ──▶                            │
  │                            │── WRITE_TOOL_NAMES.has ──▶ │
  │                            │                            │── writeAllowlist.length === 0
  │                            │◀──────── false ────────────│
  │                            │
  │◀── isError:true, "Tool 'application_insert' is a write operation and is not enabled..." ──┘
```

## Sequence: Successful Read Tool Call

```
Client           Tool Handler        Service         HTTP Client     ThreatLocker API
  │                   │                  │                │                │
  │── callTool ──────▶│                  │                │                │
  │                   │── validate ──▶   │                │                │
  │                   │── getById ──────▶│                │                │
  │                   │                  │── GET /... ───▶│                │
  │                   │                  │                │── HTTPS GET ──▶│
  │                   │                  │                │◀── 200 JSON ───│
  │                   │                  │◀── res.data ───│                │
  │                   │◀── result ───────│                │                │
  │◀── JSON text ─────│                  │                │                │
```
