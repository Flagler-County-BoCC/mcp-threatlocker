# Contributing to mcp-threatlocker

Thank you for your interest in contributing! This document covers everything you need to get started.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Adding a New Tool](#adding-a-new-tool)
- [Coding Standards](#coding-standards)
- [Testing Requirements](#testing-requirements)
- [Submitting a Pull Request](#submitting-a-pull-request)

## Code of Conduct

This project follows the [Contributor Covenant](CODE_OF_CONDUCT.md). All participants are expected
to uphold its standards in every interaction.

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork:
   ```bash
   git clone https://github.com/<your-username>/mcp-threatlocker.git
   cd mcp-threatlocker
   ```
3. Install dependencies: `npm install`
4. Copy the example env file: `cp .env.example .env`
5. Set `THREATLOCKER_API_KEY` in your `.env` (a real key is only needed for integration testing)
6. Create a feature branch: `git checkout -b feat/your-feature`

## Development Workflow

```bash
npm run dev           # Watch mode — recompiles on save
npm run lint          # ESLint (must produce 0 errors)
npm run typecheck     # TypeScript strict-mode check
npm run test          # Vitest unit tests
npm run test:coverage # Coverage report (must meet thresholds)
npm run build         # Production build to dist/
```

Before opening a PR, ensure all four quality gates pass:

```bash
npm run lint && npm run typecheck && npm run test:coverage && npm run build
```

## Adding a New Tool

Every tool follows a four-file pattern inside `src/tools/<module>/`:

### 1 — Schema (`<module>.schema.ts`)

Define a Zod schema for the tool's input. Use `z.coerce.number()` and `z.coerce.boolean()` for
numeric and boolean fields so MCP string-typed inputs are coerced automatically.

```typescript
export const MyNewToolSchema = z.object({
  requiredField: z.string().min(1),
  optionalPage: z.coerce.number().int().min(1).default(1),
  managedOrganizationId: z.string().uuid().optional(), // standard org override
});
```

### 2 — Service (`<module>.service.ts`)

Add a method that calls the ThreatLocker API via `this.http`. Wrap Axios errors as
`ExternalServiceError` at the HTTP client layer — service methods should throw only `AppError`
subclasses.

```typescript
async myNewTool(input: MyNewToolInput): Promise<unknown> {
  const res = await this.http.get('/portalapi/MyEndpoint', {
    params: input,
    headers: buildOrgHeaders(input.managedOrganizationId),
  });
  return res.data;
}
```

### 3 — Tool registration (`<module>.tool.ts`)

Register the tool with `server.tool()`. Prefix write-operation descriptions with `⚠️ WRITE:`.

```typescript
server.tool(
  'my_module_new_tool',
  'Get something useful from ThreatLocker.',
  MyNewToolSchema.shape,
  async (params): Promise<CallToolResult> => {
    try {
      const result = await myService.myNewTool(validate(MyNewToolSchema, params));
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    } catch (err) {
      return handleToolError(err, 'my_module_new_tool');
    }
  },
);
```

### 4 — Tests (`__tests__/<module>.tool.spec.ts`)

Add at least three test cases:

```typescript
it('returns data on success', async () => { ... });
it('returns isError:true on ExternalServiceError', async () => { ... });
it('returns isError:true when required field is missing', async () => { ... });
```

If the tool mutates data, add its name to `WRITE_TOOL_NAMES` in `src/lib/profile.ts`.

## Coding Standards

| Concern | Rule |
|---------|------|
| Type safety | No `any` — use `unknown` and narrow with Zod or type guards |
| Logging | Use `createLogger({ module: '...' })` — never `console.log` |
| Error handling | All catch blocks must call `handleToolError(err, toolName)` and return the result |
| Tool names | snake_case, prefixed with the module name (e.g., `computer_get_by_all_parameters`) |
| Write descriptions | Prefix with `⚠️ WRITE:` or `⚠️ WRITE/DELETE:` |
| Imports | No cross-layer imports — tool handlers import services, not HTTP clients directly |
| Comments | Only when the *why* is non-obvious; never document what the code already says |

TypeScript strict settings are enforced: `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`,
and `noImplicitOverride`.

## Testing Requirements

- Every tool must have tests covering success, error (`ExternalServiceError`), and missing required inputs
- Mock the service layer via `vi.mock('../../../lib/container.js')` — no real HTTP calls in unit tests
- `npm run test:coverage` must continue to pass all thresholds:
  - Lines: 80%
  - Functions: 80%
  - Statements: 80%
  - Branches: 75%

## Submitting a Pull Request

1. Push your branch to your fork
2. Open a PR against `main` in this repository
3. Complete the pull request template (description, test plan, checklist)
4. All CI checks must be green before a review is requested
5. A maintainer will review within 5 business days
