Apply a specific mcp-forge rewrite step to mcp-threatlocker.

Usage: /tl-step <n>

1. Parse the step number from the argument
2. Call `get_step` from mcp-forge with the step number and `projectType: "mcp-server"` where required
3. Apply the returned prompt to the current codebase
4. Show a summary of every file created or modified
5. Suggest `/tl-step <n+1>`
