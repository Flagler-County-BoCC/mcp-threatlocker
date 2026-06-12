Show the mcp-forge rewrite plan for mcp-threatlocker.

1. Extract `projectType` from the AUDIT_MANIFEST in context (should be `mcp-server`)
2. Call `list_steps` from mcp-forge with `{ projectType: "mcp-server" }`
3. Display all steps marked APPLIES or SKIP
4. Recommend the next unapplied step
