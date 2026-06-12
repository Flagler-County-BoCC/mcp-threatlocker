Run Step 0 audit on the mcp-threatlocker codebase and emit an AUDIT_MANIFEST.

1. Call `get_step` from mcp-forge with `{ step: 0 }`
2. Apply the returned audit prompt to all source files under `src/`
3. Emit the complete AUDIT_MANIFEST JSON
4. List findings by severity (CRITICAL → LOW)
