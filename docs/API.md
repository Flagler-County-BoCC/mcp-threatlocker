# Tool Reference

This MCP server exposes 90 tools across 24 domain modules. All tools return JSON text content.

## Error Handling

All tools return `isError: true` with a structured error string on failure — they never throw.
Error strings follow the pattern:

```
Error [CODE]: message
```

Common error codes:

| Code | Meaning |
|------|---------|
| `EXTERNAL_SERVICE_ERROR` | ThreatLocker API returned an error (includes HTTP status) |
| `VALIDATION_ERROR` | Input failed Zod schema validation |
| `WRITE_BLOCKED` | Tool is a write operation not enabled in the current profile |

## Write Gate

Tools marked **⚠️ WRITE** are blocked in read-only mode (default). Enable them via
`MCP_WRITE_ALLOWLIST`. See [docs/ENVIRONMENT.md](ENVIRONMENT.md) for details.

## Managed Organization Override

Most tools accept an optional `managedOrganizationId` (UUID) parameter. When supplied, the
request is scoped to that organization instead of the authenticated account's default organization.
Omit it to operate on the default organization.

---

## Action Log

### `action_log_get_by_parameters`

Get unified audit log entries (paginated). Retrieves audit log entries with filtering, grouping,
and optional CSV export.

**Input:**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `managedOrganizationId` | `string (UUID)` | No | — | Organization override |
| `startDate` | `string` | Yes | — | Start of date range (ISO 8601) |
| `endDate` | `string` | Yes | — | End of date range (ISO 8601) |
| `pageNumber` | `number` | No | `1` | Page number |
| `pageSize` | `number` | No | `50` | Results per page (max 10000) |
| `search` | `string` | No | — | Text filter |
| `groupBy` | `string` | No | — | Grouping field |
| `exportCsv` | `boolean` | No | `false` | Return CSV instead of JSON |

---

## Application

### `application_get_by_id`

Get an application by ID.

**Input:** `applicationId` (string, required), `managedOrganizationId` (UUID, optional)

### `application_get_by_parameters`

Get applications by parameters (paginated list with filtering and sorting).

**Input:**

| Field | Type | Required | Default |
|-------|------|----------|---------|
| `managedOrganizationId` | UUID | No | — |
| `pageNumber` | number | No | `1` |
| `pageSize` | number | No | `50` |
| `search` | string | No | — |
| `searchBy` | `"app"` \| `"full"` \| `"process"` \| `"hash"` \| `"cert"` \| `"created"` \| `"categories"` \| `"countries"` | No | — |
| `orderBy` | string | No | — |
| `isAscending` | boolean | No | — |

### `application_get_for_maintenance_mode`

Get applications available for maintenance mode assignment.

**Input:** `managedOrganizationId` (UUID, optional)

### `application_get_matching_list`

Get applications matching file characteristics (hash, path, cert). Used during approval request
processing.

**Input:** `managedOrganizationId` (UUID, optional), `hash` (string), `path` (string),
`cert` (string)

### `application_get_research_details_by_id`

Get research details for an application (risk ratings, categories, countries, access levels).

**Input:** `applicationId` (string, required), `managedOrganizationId` (UUID, optional)

### `application_insert` ⚠️ WRITE

Create a new custom application.

**Input:** `name` (string, required), `description` (string), `managedOrganizationId` (UUID, optional)

### `application_update_by_id` ⚠️ WRITE

Update an existing application name/description.

**Input:** `applicationId` (string, required), `name` (string), `description` (string),
`managedOrganizationId` (UUID, optional)

### `application_delete` ⚠️ WRITE/DELETE

Delete applications without attached policies.

**Input:** `applicationIds` (string[], required), `managedOrganizationId` (UUID, optional)

### `application_confirm_delete` ⚠️ WRITE/DELETE

Delete applications that have attached policies.

**Input:** `applicationIds` (string[], required), `managedOrganizationId` (UUID, optional)

---

## Application File

### `application_file_get_by_application_id`

Get application file rules by application ID (paginated).

**Input:** `applicationId` (string, required), `pageNumber` (number, default `1`),
`pageSize` (number, default `50`), `managedOrganizationId` (UUID, optional)

### `application_file_insert` ⚠️ WRITE

Add a new application file rule to a custom application.

**Input:** `applicationId` (string, required), `managedOrganizationId` (UUID, optional),
plus file rule fields (path, hash, cert, etc.)

### `application_file_update` ⚠️ WRITE

Update an existing application file rule.

**Input:** `fileRuleId` (string, required), `applicationId` (string, required),
`managedOrganizationId` (UUID, optional), plus updated file rule fields

### `application_file_delete_by_id` ⚠️ WRITE/DELETE

Delete a single application file rule.

**Input:** `fileRuleId` (string, required), `managedOrganizationId` (UUID, optional)

---

## Approval Request

### `approval_request_get_by_parameters`

Get approval requests by parameters (paginated, filtered by status).

**Input:**

| Field | Type | Required | Default |
|-------|------|----------|---------|
| `managedOrganizationId` | UUID | No | — |
| `status` | `"pending"` \| `"approved"` \| `"denied"` | No | — |
| `pageNumber` | number | No | `1` |
| `pageSize` | number | No | `50` |

### `approval_request_get_count`

Get count of pending approval requests.

**Input:** `managedOrganizationId` (UUID, optional)

### `approval_request_get_file_download_details`

Get file download details (filename and fileUrl) for an approval request.

**Input:** `approvalRequestId` (string, required), `managedOrganizationId` (UUID, optional)

### `approval_request_get_permit_application_by_id`

Get full approval request information by ID including pre-formatted JSON for permit processing.

**Input:** `approvalRequestId` (string, required), `managedOrganizationId` (UUID, optional)

### `approval_request_authorize_for_permit` ⚠️ WRITE

Authorize Cyber Hero Team to permit an approval request.

**Input:** `approvalRequestId` (string, required), `managedOrganizationId` (UUID, optional)

### `approval_request_permit_application` ⚠️ WRITE

Process an Application Control approval request (Execute or Elevate action types).

**Input:** `approvalRequestId` (string, required), `action` (string, required),
`managedOrganizationId` (UUID, optional), plus policy parameters

---

## Computer

### `computer_get_by_all_parameters`

Get computers with filtering and sorting (paginated).

**Input:**

| Field | Type | Required | Default |
|-------|------|----------|---------|
| `managedOrganizationId` | UUID | No | — |
| `orderBy` | enum | Yes | — |
| `pageNumber` | number | No | `1` |
| `pageSize` | number | No | `50` |
| `action` | string | No | — |
| `childOrganizations` | boolean | No | — |
| `computerGroup` | string | No | — |
| `computerId` | string | No | — |
| `isAscending` | boolean | No | — |
| `kindOfAction` | enum | No | — |
| `searchBy` | number (1–5) | No | — |
| `searchText` | string | No | — |

`orderBy` values: `computername`, `group`, `action`, `lastcheckin`, `computerinstalldate`,
`deniedcountthreedays`, `threatlockerversion`

`kindOfAction` values: `Computer Mode`, `TamperProtectionDisabled`, `NeedsReview`,
`ReadyToSecure`, `BaselineNotUploaded`, `Update Channel`

`searchBy` values: 1=Computer/Asset Name, 2=Username, 3=Computer Group Name,
4=Last Check-in IP, 5=Organization Name

### `computer_get_for_edit_by_id`

Get computer details for editing.

**Input:** `computerId` (string, required), `managedOrganizationId` (UUID, optional)

### `computer_get_for_new_computer`

Get computer group info for new computer installation (returns install keys per group).

**Input:** `managedOrganizationId` (UUID, optional)

### `computer_get_download`

Get download URL for ThreatLocker installer.

**Input:** `platform` (string), `brand` (string), `apiKey` (string),
`fileType` (`stub` | `windows` | `pssscript` | `mac` | `debian` | `redhat` | `windowsxp` | `remediation`)

### `computer_signed_script_download`

Download signed ThreatLockerVerifier.exe (returns binary).

**Input:** `brand` (string, required)

### `computer_sample_path_download`

Download sample.bat logon script.

**Input:** `brand` (string, required), `authKey` (string, required)

### `computer_unsigned_script_download`

Download unsigned ThreatLockerVerifier-Unsigned.exe.

**Input:** `brand` (string, required)

### `computer_update_for_edit` ⚠️ WRITE

Update computer settings (name, group, proxy config, options).

**Input:** `computerId` (string), `computerGroupId` (string), `name` (string),
`useProxyServer` (boolean), `proxyServerOption` (string), `proxyUrlEntry` (string),
`proxyURL` (string), `options` (string[]), `managedOrganizationId` (UUID, optional)

### `computer_update_baseline_rescan` ⚠️ WRITE

Queue computers for baseline rescan.

**Input:** `computerDetailDtos` (array), `enableLearning` (boolean),
`managedOrganizationId` (UUID, optional)

### `computer_update_should_restart_by_ids` ⚠️ WRITE

Flag specific computers for restart.

**Input:** `computers` (array of `{ computerId, organizationId }`)

### `computer_update_should_restart_by_organization` ⚠️ WRITE

Flag all computers in the organization for restart.

**Input:** `value` (boolean)

### `computer_move_to_other_organization` ⚠️ WRITE

Move computers to another organization.

**Input:** `computerDetailDtos` (array), `enableLearningRescan` (boolean),
`targetComputerGroupId` (string), `targetOrganizationId` (string)

### `computer_enable_protection` ⚠️ WRITE

Enable protection on computers.

**Input:** `computerDetailDtos` (array of `{ computerId, organizationId }`)

### `computer_disable_protection` ⚠️ WRITE

Disable protection on computers (puts into maintenance mode).

**Input:** `computerDetailDtos` (array), `endDate` (string), `startDate` (string),
`maintenanceModeType` (number: 1=Monitor Only, 3=Learning Mode, 6=Disable Tamper Protection),
`permitEnd` (boolean), `applicationId` (string, optional),
`managedOrganizationId` (UUID, optional)

### `computer_remove_duplicate` ⚠️ WRITE/DELETE

Remove duplicate computer records.

**Input:** `value` (boolean)

### `computer_update_maintenance_mode` ⚠️ WRITE

Update maintenance mode for a computer.

**Input:** `applicationId` (string), `computerDetailDto` (object with `computerId`,
`organizationId`, `maintenanceTypeId`, `maintenanceEndDate`, `startDateTime`)

### `computer_update_threatlocker_version_by_ids` ⚠️ WRITE (DEPRECATED)

Update ThreatLocker agent version on computers. Use `scheduled_agent_action_create` for agents
≥10.7.3.

**Input:** `threatLockerVersion` (string), `threatLockerVersionId` (string),
`computerDetailDtos` (array)

### `computer_delete_by_ids` ⚠️ WRITE/DELETE

Remove computers from the portal (does not uninstall agent).

**Input:** `computers` (array of `{ computerId, computerName, organizationId }`)

---

## Computer Check-in

### `computer_checkin_get_by_parameters`

Get computer check-in history for a specific computer.

**Input:** `computerId` (string, required), `pageNumber` (number, default `1`),
`pageSize` (number, default `50`), `managedOrganizationId` (UUID, optional)

---

## Computer Group

### `computer_group_get_by_id`

Get a computer group by ID.

**Input:** `computerGroupId` (string, required), `managedOrganizationId` (UUID, optional)

### `computer_group_get_by_parameters`

Get computer groups with filtering and sorting (paginated).

**Input:** `managedOrganizationId` (UUID, optional), `pageNumber` (number), `pageSize` (number),
`search` (string), `orderBy` (string), `isAscending` (boolean)

### `computer_group_get_dropdown_with_organization`

Get computer groups dropdown list including organizations.

**Input:** `managedOrganizationId` (UUID, optional)

### `computer_group_get_dropdown_by_organization_id`

Get computer groups dropdown list filtered by OS type.

**Input:** `managedOrganizationId` (UUID, optional), `osType` (number, optional)

### `computer_group_get_for_download`

Get computer group info by install key (used during installer download).

**Input:** `installKey` (string, required)

### `computer_group_get_for_permit_application`

Get computer groups available for permit application processing.

**Input:** `managedOrganizationId` (UUID, optional)

### `computer_group_get_group_and_computer`

Get combined list of groups and computers for applies-to selectors.

**Input:** `managedOrganizationId` (UUID, optional)

### `computer_group_insert` ⚠️ WRITE

Create a new computer group.

**Input:** `name` (string), `managedOrganizationId` (UUID, optional), plus group settings

### `computer_group_update_by_id` ⚠️ WRITE

Update an existing computer group.

**Input:** `computerGroupId` (string, required), plus updated group fields,
`managedOrganizationId` (UUID, optional)

### `computer_group_delete` ⚠️ WRITE/DELETE

Delete computer groups.

**Input:** `computerGroupIds` (string[], required), `managedOrganizationId` (UUID, optional)

---

## Configuration Manager

### `cm_configuration_get_enabled`

Get all enabled Configuration Manager configurations grouped by category.

**Input:** `managedOrganizationId` (UUID, optional)

### `cm_policy_get_by_parameters`

Get Configuration Manager policies by parameters (paginated, filtered by status and appliesTo).

**Input:** `managedOrganizationId` (UUID, optional), `status` (string), `appliesTo` (string),
`pageNumber` (number), `pageSize` (number)

---

## DAC (Dynamic Access Control)

### `dac_analysis_item_get_by_id`

Get a DAC analysis item by ID.

**Input:** `dacAnalysisItemId` (string, required), `managedOrganizationId` (UUID, optional)

### `dac_analysis_results_get_by_parameters`

Get DAC analysis results by parameters (paginated). Returns security posture findings by category
and criticality.

**Input:** `managedOrganizationId` (UUID, optional), `category` (string), `criticality` (string),
`pageNumber` (number, default `1`), `pageSize` (number, default `50`)

---

## Deploy Policy Queue

### `deploy_policies` ⚠️ WRITE

Queue policy deployment for all computers in an organization.

**Input:** `managedOrganizationId` (UUID, optional)

### `deploy_policies_for_computer` ⚠️ WRITE

Queue policy deployment for a specific computer.

**Input:** `computerId` (string, required), `managedOrganizationId` (UUID, optional)

---

## Maintenance Mode

### `maintenance_mode_get_by_computer_id`

Get maintenance mode entries for a specific computer (paginated).

**Input:** `computerId` (string, required), `pageNumber` (number, default `1`),
`pageSize` (number, default `50`), `managedOrganizationId` (UUID, optional)

### `maintenance_mode_insert` ⚠️ WRITE

Create a new maintenance mode entry for a computer.

**Input:** `computerId` (string), `applicationId` (string, optional), `startDate` (string),
`endDate` (string), `maintenanceModeType` (number), `managedOrganizationId` (UUID, optional)

### `maintenance_mode_end_by_id` ⚠️ WRITE

End a maintenance mode entry immediately.

**Input:** `maintenanceModeId` (string, required), `managedOrganizationId` (UUID, optional)

### `maintenance_mode_update_end_date` ⚠️ WRITE

Update the end date of an active maintenance mode entry.

**Input:** `maintenanceModeId` (string, required), `endDate` (string, required),
`managedOrganizationId` (UUID, optional)

---

## Network Access Policy

### `network_access_policy_insert` ⚠️ WRITE

Create a new network access policy rule.

**Input:** Policy rule fields including `name`, `direction`, `protocol`, `localPort`,
`remotePort`, `remoteAddress`, `action`, `appliesTo`,
`managedOrganizationId` (UUID, optional)

---

## Online Devices

### `online_devices_get_by_parameters`

Get currently online devices (paginated).

**Input:** `managedOrganizationId` (UUID, optional), `pageNumber` (number, default `1`),
`pageSize` (number, default `50`), `search` (string, optional)

---

## Organization

### `organization_create_child` ⚠️ WRITE

Create a new child organization under the current organization.

**Input:** `name` (string, required), plus organization settings

### `organization_get_auth_key`

Get the authentication key for an organization.

**Input:** `managedOrganizationId` (UUID, optional)

### `organization_get_child_organizations`

Get child organizations (paginated, filterable). Use for listing all managed organizations.

**Input:** `pageNumber` (number, default `1`), `pageSize` (number, default `50`),
`search` (string, optional), `managedOrganizationId` (UUID, optional)

### `organization_get_for_move_computers`

Get organizations available as targets for moving computers.

**Input:** `managedOrganizationId` (UUID, optional)

### `organization_update_auth_key` ⚠️ WRITE

Regenerate the authentication key for an organization.

**Input:** `managedOrganizationId` (UUID, optional)

---

## Permission

### `permission_get_for_administrator`

Get permissions for the currently authenticated administrator.

**Input:** _(none)_

---

## Policy

### `policy_get_by_id`

Get an application control policy by ID.

**Input:** `policyId` (string, required), `managedOrganizationId` (UUID, optional)

### `policy_get_by_parameters`

Get application control policies (paginated, filterable by group, OS, filter type).

**Input:** `managedOrganizationId` (UUID, optional), `computerGroupId` (string),
`osType` (number), `filterType` (string), `pageNumber` (number), `pageSize` (number)

### `policy_get_for_view_by_application_id`

Get policies that reference a specific application.

**Input:** `applicationId` (string, required), `managedOrganizationId` (UUID, optional)

### `policy_insert` ⚠️ WRITE

Create a new application control policy.

**Input:** `applicationId` (string), `action` (string), `appliesTo` (string),
`managedOrganizationId` (UUID, optional), plus policy settings

### `policy_insert_for_copy` ⚠️ WRITE

Copy policies from one applies-to target to one or more targets.

**Input:** `sourcePolicyIds` (string[]), `targetAppliesToIds` (string[]),
`managedOrganizationId` (UUID, optional)

### `policy_update_by_id` ⚠️ WRITE

Update an existing application control policy.

**Input:** `policyId` (string, required), plus updated policy fields,
`managedOrganizationId` (UUID, optional)

### `policy_delete_by_ids` ⚠️ WRITE/DELETE

Delete application control policies.

**Input:** `policyIds` (string[], required), `managedOrganizationId` (UUID, optional)

---

## Report

### `report_get_by_organization_id`

Get available reports for an organization.

**Input:** `managedOrganizationId` (UUID, optional)

### `report_get_dynamic_data`

Get dynamic report data for a specific report ID with optional date filters.

**Input:** `reportId` (string, required), `startDate` (string, optional),
`endDate` (string, optional), `managedOrganizationId` (UUID, optional)

---

## Research Information

### `research_information_get_all_categories`

Get all application research categories (used for filtering research details).

**Input:** _(none)_

---

## Scheduled Agent Action

### `scheduled_agent_action_create` ⚠️ WRITE

Schedule a ThreatLocker agent version update across computers/groups.

**Input:** `threatLockerVersion` (string), `threatLockerVersionId` (string),
`appliesToIds` (string[]), `managedOrganizationId` (UUID, optional)

### `scheduled_agent_action_abort` ⚠️ WRITE

Abort a scheduled agent action.

**Input:** `scheduledAgentActionId` (string, required), `managedOrganizationId` (UUID, optional)

### `scheduled_agent_action_applies_to`

Get computers/groups available as targets for a scheduled agent action.

**Input:** `managedOrganizationId` (UUID, optional)

### `scheduled_agent_action_get_by_parameters`

Get computers in a scheduled agent action with their status (paginated).

**Input:** `scheduledAgentActionId` (string, required), `pageNumber` (number, default `1`),
`pageSize` (number, default `50`), `managedOrganizationId` (UUID, optional)

### `scheduled_agent_action_get_for_hydration`

Get scheduled agent action details needed to resume/hydrate a UI session.

**Input:** `scheduledAgentActionId` (string, required), `managedOrganizationId` (UUID, optional)

### `scheduled_agent_action_list`

List all scheduled agent actions of a given type for an organization.

**Input:** `actionType` (string, required), `managedOrganizationId` (UUID, optional)

---

## System Audit

### `system_audit_get_by_parameters`

Get system audit logs (paginated). Covers Create/Delete/Logon/Modify/Read actions by admin users.

**Input:**

| Field | Type | Required | Default |
|-------|------|----------|---------|
| `managedOrganizationId` | UUID | No | — |
| `startDate` | string | Yes | — |
| `endDate` | string | Yes | — |
| `pageNumber` | number | No | `1` |
| `pageSize` | number | No | `50` |
| `action` | string | No | — |
| `adminUsername` | string | No | — |

### `system_audit_get_for_health_center`

Get system audit summary for health center display (login activity over N days).

**Input:** `days` (number, required), `managedOrganizationId` (UUID, optional)

---

## Tag

### `tag_get_dropdown_options`

Get tag dropdown options for an organization.

**Input:** `managedOrganizationId` (UUID, optional)

---

## ThreatLocker Version

### `threatlocker_version_get_for_dropdown`

Get available ThreatLocker agent versions for the version selector dropdown.

**Input:** `managedOrganizationId` (UUID, optional)

---

## User

### `user_get_all_timezones`

Get all available timezones for user/organization settings.

**Input:** _(none)_

### `user_invite_by_username` ⚠️ WRITE

Invite a user to the ThreatLocker portal by email address.

**Input:** `username` (string — must be a valid email address),
`managedOrganizationId` (UUID, optional)

---

## User Roles

### `user_roles_get_by_parameters`

Get user roles and their permissions.

**Input:** `managedOrganizationId` (UUID, optional), `pageNumber` (number, default `1`),
`pageSize` (number, default `50`)
