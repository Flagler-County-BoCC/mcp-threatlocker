# Environment Variables

All environment variables are validated at startup using Zod. If a required variable is missing or
invalid, the server exits with a descriptive error message.

## Required

### `THREATLOCKER_API_KEY`

| | |
|---|---|
| Type | `string` |
| Min length | 8 characters |
| Example | `a1b2c3d4e5f6...` (64-char hex token) |

Your ThreatLocker Portal API key. Generate one in the portal at **Settings → API Keys**.

The server will refuse to start if this variable is absent or shorter than 8 characters.

## Optional — ThreatLocker instance

### `THREATLOCKER_INSTANCE`

| | |
|---|---|
| Type | `string` |
| Default | `h` |
| Example | `h` |

The single-letter instance identifier used to construct the default base URL:
`https://portalapi.<instance>.threatlocker.com`. Contact ThreatLocker support if you are unsure
which letter applies to your portal.

### `THREATLOCKER_BASE_URL`

| | |
|---|---|
| Type | `string` (URL) |
| Default | Auto-derived from `THREATLOCKER_INSTANCE` |
| Example | `https://portalapi.h.threatlocker.com` |

Override the full base URL. Useful for on-premises deployments or custom proxy configurations.
When set, `THREATLOCKER_INSTANCE` is still used for the startup log but the URL is not derived
from it.

## Optional — Write gate

### `MCP_WRITE_ALLOWLIST`

| | |
|---|---|
| Type | `string` (comma-separated tool names or `*`) |
| Default | `""` (empty — read-only mode) |
| Example | `maintenance_mode_insert,maintenance_mode_end_by_id` |

Controls which write/delete tools are permitted to execute.

| Value | Active profile | Behaviour |
|-------|----------------|-----------|
| `""` (empty) | `read-only` | All 26 write tools return a blocked error |
| Comma-separated names | `restricted-write` | Only listed tools execute |
| `*` | `full-access` | All tools execute |

The active profile is logged at startup and visible in the pino log line:

```json
{ "profile": "read-only", "tools": 90, ... }
```

**26 gated write tools:**

```
application_insert
application_update_by_id
application_delete
application_confirm_delete
approval_request_authorize_for_permit
approval_request_permit_application
computer_update_for_edit
computer_update_baseline_rescan
computer_update_should_restart_by_ids
computer_update_should_restart_by_organization
computer_move_to_other_organization
computer_enable_protection
computer_disable_protection
computer_remove_duplicate
computer_update_maintenance_mode
computer_update_threatlocker_version_by_ids
computer_delete_by_ids
deploy_policies
deploy_policies_for_computer
maintenance_mode_insert
maintenance_mode_end_by_id
maintenance_mode_update_end_date
network_access_policy_insert
scheduled_agent_action_create
scheduled_agent_action_abort
user_invite_by_username
```

### `MCP_REQUIRE_CONFIRM`

| | |
|---|---|
| Type | `"true"` or `"false"` |
| Default | `"false"` |

When `"true"`, every write tool execution emits a `warn`-level pino log entry before the upstream
call is made. Useful for audit trails without blocking operations.

## Optional — Logging

### `LOG_LEVEL`

| | |
|---|---|
| Type | `"trace"` \| `"debug"` \| `"info"` \| `"warn"` \| `"error"` \| `"fatal"` \| `"silent"` |
| Default | `"info"` |

pino log level. Set to `"silent"` in test environments to suppress all output.

## Optional — Runtime

### `NODE_ENV`

| | |
|---|---|
| Type | `"development"` \| `"test"` \| `"production"` |
| Default | `"development"` |

Affects log formatting (pretty-print in development, JSON in production) and test helper
behaviour.

## Example `.env`

```bash
# Required
THREATLOCKER_API_KEY=your-64-char-hex-api-key

# Instance (defaults to "h")
THREATLOCKER_INSTANCE=h

# Write gate — uncomment and adjust as needed
# MCP_WRITE_ALLOWLIST=maintenance_mode_insert,maintenance_mode_end_by_id
# MCP_REQUIRE_CONFIRM=false

# Logging
# LOG_LEVEL=info
# NODE_ENV=production
```

Copy `.env.example` to `.env` and fill in the required values.
