import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { validate } from '../../lib/validate.js';
import { handleToolError } from '../../lib/tool-error-handler.js';
import {
  ComputerGroupGetByIdSchema,
  ComputerGroupGetByParametersSchema,
  ComputerGroupGetDropdownWithOrganizationSchema,
  ComputerGroupGetDropdownByOrganizationIdSchema,
  ComputerGroupGetForDownloadSchema,
  ComputerGroupGetForPermitApplicationSchema,
  ComputerGroupGetGroupAndComputerSchema,
  ComputerGroupInsertSchema,
  ComputerGroupUpdateByIdSchema,
  ComputerGroupDeleteSchema,
} from './computer-group.schema.js';
import { computerGroupService } from '../../lib/container.js';
import { createLogger } from '../../lib/logger.js';

const log = createLogger({ module: 'computerGroupTool' });

export function registerComputerGroupTools(server: McpServer): void {
  server.tool(
    'computer_group_get_by_id',
    'Get a computer group by ID.',
    ComputerGroupGetByIdSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(ComputerGroupGetByIdSchema, params);
      log.debug({ computerGroupId: input.computerGroupId }, 'computer_group_get_by_id called');
      try {
        const result = await computerGroupService.getById(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'computer_group_get_by_id');
      }
    },
  );

  server.tool(
    'computer_group_get_by_parameters',
    'Get computer groups with filtering and sorting (paginated).',
    ComputerGroupGetByParametersSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(ComputerGroupGetByParametersSchema, params);
      log.debug(
        { pageNumber: input.pageNumber, osType: input.osType },
        'computer_group_get_by_parameters called',
      );
      try {
        const result = await computerGroupService.getByParameters(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'computer_group_get_by_parameters');
      }
    },
  );

  server.tool(
    'computer_group_get_dropdown_with_organization',
    'Get computer groups dropdown list including organizations.',
    ComputerGroupGetDropdownWithOrganizationSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(ComputerGroupGetDropdownWithOrganizationSchema, params);
      log.debug(
        { includeAvailableOrganizations: input.includeAvailableOrganizations },
        'computer_group_get_dropdown_with_organization called',
      );
      try {
        const result = await computerGroupService.getDropdownWithOrganization(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'computer_group_get_dropdown_with_organization');
      }
    },
  );

  server.tool(
    'computer_group_get_dropdown_by_organization_id',
    'Get computer groups dropdown list filtered by OS type.',
    ComputerGroupGetDropdownByOrganizationIdSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(ComputerGroupGetDropdownByOrganizationIdSchema, params);
      log.debug(
        { computerGroupOSTypeId: input.computerGroupOSTypeId },
        'computer_group_get_dropdown_by_organization_id called',
      );
      try {
        const result = await computerGroupService.getDropdownByOrganizationId(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'computer_group_get_dropdown_by_organization_id');
      }
    },
  );

  server.tool(
    'computer_group_get_for_download',
    'Get computer group info by install key (used during installer download).',
    ComputerGroupGetForDownloadSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(ComputerGroupGetForDownloadSchema, params);
      log.debug({ installKey: input.installKey }, 'computer_group_get_for_download called');
      try {
        const result = await computerGroupService.getForDownload(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'computer_group_get_for_download');
      }
    },
  );

  server.tool(
    'computer_group_get_for_permit_application',
    'Get computer groups available for permit application processing.',
    ComputerGroupGetForPermitApplicationSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(ComputerGroupGetForPermitApplicationSchema, params);
      log.debug({ osType: input.osType }, 'computer_group_get_for_permit_application called');
      try {
        const result = await computerGroupService.getForPermitApplication(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'computer_group_get_for_permit_application');
      }
    },
  );

  server.tool(
    'computer_group_get_group_and_computer',
    'Get combined list of groups and computers for applies-to selectors.',
    ComputerGroupGetGroupAndComputerSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(ComputerGroupGetGroupAndComputerSchema, params);
      log.debug({ OSType: input.OSType }, 'computer_group_get_group_and_computer called');
      try {
        const result = await computerGroupService.getGroupAndComputer(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'computer_group_get_group_and_computer');
      }
    },
  );

  server.tool(
    'computer_group_insert',
    '⚠️ WRITE: Create a new computer group.',
    ComputerGroupInsertSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(ComputerGroupInsertSchema, params);
      log.debug({ name: input.name, osType: input.osType }, 'computer_group_insert called');
      try {
        const result = await computerGroupService.insert(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'computer_group_insert');
      }
    },
  );

  server.tool(
    'computer_group_update_by_id',
    '⚠️ WRITE: Update an existing computer group.',
    ComputerGroupUpdateByIdSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(ComputerGroupUpdateByIdSchema, params);
      log.debug({ computerGroupId: input.computerGroupId }, 'computer_group_update_by_id called');
      try {
        const result = await computerGroupService.updateById(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'computer_group_update_by_id');
      }
    },
  );

  server.tool(
    'computer_group_delete',
    '⚠️ WRITE/DELETE: Delete computer groups.',
    ComputerGroupDeleteSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(ComputerGroupDeleteSchema, params);
      log.debug({ count: input.groups.length }, 'computer_group_delete called');
      try {
        const result = await computerGroupService.delete(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'computer_group_delete');
      }
    },
  );
}
