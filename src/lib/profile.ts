import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { config } from '../config/index.js';
import { createLogger } from './logger.js';

const log = createLogger({ module: 'profile' });

/** All tool names that perform write or delete operations (marked ⚠️ WRITE in descriptions). */
export const WRITE_TOOL_NAMES = new Set<string>([
  // application
  'application_insert',
  'application_update_by_id',
  'application_delete',
  'application_confirm_delete',
  // approval-request
  'approval_request_authorize_for_permit',
  'approval_request_permit_application',
  // computer
  'computer_update_for_edit',
  'computer_update_baseline_rescan',
  'computer_update_should_restart_by_ids',
  'computer_update_should_restart_by_organization',
  'computer_move_to_other_organization',
  'computer_enable_protection',
  'computer_disable_protection',
  'computer_remove_duplicate',
  'computer_update_maintenance_mode',
  'computer_update_threatlocker_version_by_ids',
  'computer_delete_by_ids',
  // deploy-policy-queue
  'deploy_policies',
  'deploy_policies_for_computer',
  // maintenance-mode
  'maintenance_mode_insert',
  'maintenance_mode_end_by_id',
  'maintenance_mode_update_end_date',
  // network-access-policy
  'network_access_policy_insert',
  // scheduled-agent-action
  'scheduled_agent_action_create',
  'scheduled_agent_action_abort',
  // user
  'user_invite_by_username',
]);

/**
 * Returns true if the tool may execute given the current write-allowlist profile.
 * Read-only tools are always allowed. Write tools require an explicit allowlist entry
 * or the wildcard '*'.
 */
export function isToolAllowedForProfile(toolName: string): boolean {
  if (!WRITE_TOOL_NAMES.has(toolName)) return true;
  const { writeAllowlist } = config.mcp;
  if (writeAllowlist.includes('*')) return true;
  const allowed = writeAllowlist.includes(toolName);
  if (!allowed) {
    log.warn({ toolName }, 'Write tool blocked — not in MCP_WRITE_ALLOWLIST');
  }
  return allowed;
}

/** Standard blocked-write response returned when allowlist check fails. */
export function blockedResult(toolName: string): CallToolResult {
  return {
    content: [
      {
        type: 'text',
        text:
          `Tool '${toolName}' is a write operation and is not enabled. ` +
          `Add it to MCP_WRITE_ALLOWLIST (comma-separated) or set MCP_WRITE_ALLOWLIST=* to allow all writes.`,
      },
    ],
    isError: true,
  };
}
