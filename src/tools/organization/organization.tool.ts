import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { validate } from '../../lib/validate.js';
import { handleToolError } from '../../lib/tool-error-handler.js';
import {
  OrganizationCreateChildSchema,
  OrganizationGetAuthKeySchema,
  OrganizationGetChildOrganizationsSchema,
  OrganizationGetForMoveComputersSchema,
  OrganizationUpdateAuthKeySchema,
} from './organization.schema.js';
import { organizationService } from '../../lib/container.js';
import { createLogger } from '../../lib/logger.js';

const log = createLogger({ module: 'organizationTool' });

export function registerOrganizationTools(server: McpServer): void {
  server.tool(
    'organization_create_child',
    '⚠️ WRITE: Create a new child organization under the current organization.',
    OrganizationCreateChildSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(OrganizationCreateChildSchema, params);
      log.debug({ displayName: input.displayName }, 'organization_create_child called');
      try {
        const result = await organizationService.createChild(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'organization_create_child');
      }
    },
  );

  server.tool(
    'organization_get_auth_key',
    'Get the authentication key for an organization.',
    OrganizationGetAuthKeySchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(OrganizationGetAuthKeySchema, params);
      log.debug(
        { managedOrganizationId: input.managedOrganizationId },
        'organization_get_auth_key called',
      );
      try {
        const result = await organizationService.getAuthKey(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'organization_get_auth_key');
      }
    },
  );

  server.tool(
    'organization_get_child_organizations',
    'Get child organizations (paginated, filterable). Use for listing all managed organizations.',
    OrganizationGetChildOrganizationsSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(OrganizationGetChildOrganizationsSchema, params);
      log.debug({ pageNumber: input.pageNumber }, 'organization_get_child_organizations called');
      try {
        const result = await organizationService.getChildOrganizations(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'organization_get_child_organizations');
      }
    },
  );

  server.tool(
    'organization_get_for_move_computers',
    'Get organizations available as targets for moving computers.',
    OrganizationGetForMoveComputersSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(OrganizationGetForMoveComputersSchema, params);
      log.debug({ searchText: input.searchText }, 'organization_get_for_move_computers called');
      try {
        const result = await organizationService.getForMoveComputers(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'organization_get_for_move_computers');
      }
    },
  );

  server.tool(
    'organization_update_auth_key',
    '⚠️ WRITE: Regenerate the authentication key for an organization.',
    OrganizationUpdateAuthKeySchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(OrganizationUpdateAuthKeySchema, params);
      log.debug(
        { managedOrganizationId: input.managedOrganizationId },
        'organization_update_auth_key called',
      );
      try {
        const result = await organizationService.updateAuthKey(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'organization_update_auth_key');
      }
    },
  );
}
