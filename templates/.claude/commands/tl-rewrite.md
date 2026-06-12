Run a full guided rewrite of mcp-threatlocker using mcp-forge steps 1–14.

1. Confirm AUDIT_MANIFEST exists in context; if not, run `/tl-audit` first
2. Apply steps 1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 13, 14 in order (skip step 6)
3. After each step, summarise files changed and confirm before proceeding
4. After step 14, run `npm run build && npm run typecheck` to verify
