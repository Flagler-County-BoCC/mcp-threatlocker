import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { validate } from '../../lib/validate.js';
import { handleToolError } from '../../lib/tool-error-handler.js';
import {
  ApplicationGetByIdSchema,
  ApplicationGetByParametersSchema,
  ApplicationGetForMaintenanceModeSchema,
  ApplicationGetMatchingListSchema,
  ApplicationGetResearchDetailsByIdSchema,
  ApplicationInsertSchema,
  ApplicationUpdateByIdSchema,
  ApplicationDeleteSchema,
  ApplicationConfirmDeleteSchema,
} from './application.schema.js';
import { applicationService } from '../../lib/container.js';
import { createLogger } from '../../lib/logger.js';

const log = createLogger({ module: 'applicationTool' });

export function registerApplicationTools(server: McpServer): void {
  server.tool(
    'application_get_by_id',
    'Get an application by ID.',
    ApplicationGetByIdSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(ApplicationGetByIdSchema, params);
      log.debug({ applicationId: input.applicationId }, 'application_get_by_id called');
      try {
        const result = await applicationService.getById(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'application_get_by_id');
      }
    },
  );

  server.tool(
    'application_get_by_parameters',
    'Get applications by parameters (paginated list with filtering and sorting).',
    ApplicationGetByParametersSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(ApplicationGetByParametersSchema, params);
      log.debug({ pageNumber: input.pageNumber }, 'application_get_by_parameters called');
      try {
        const result = await applicationService.getByParameters(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'application_get_by_parameters');
      }
    },
  );

  server.tool(
    'application_get_for_maintenance_mode',
    'Get applications available for maintenance mode assignment.',
    ApplicationGetForMaintenanceModeSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(ApplicationGetForMaintenanceModeSchema, params);
      log.debug({ osType: input.osType }, 'application_get_for_maintenance_mode called');
      try {
        const result = await applicationService.getForMaintenanceMode(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'application_get_for_maintenance_mode');
      }
    },
  );

  server.tool(
    'application_get_matching_list',
    'Get applications matching file characteristics (hash, path, cert). Used during approval request processing.',
    ApplicationGetMatchingListSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(ApplicationGetMatchingListSchema, params);
      log.debug({ hash: input.hash }, 'application_get_matching_list called');
      try {
        const result = await applicationService.getMatchingList(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'application_get_matching_list');
      }
    },
  );

  server.tool(
    'application_get_research_details_by_id',
    'Get research details for an application (risk ratings, categories, countries, access levels).',
    ApplicationGetResearchDetailsByIdSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(ApplicationGetResearchDetailsByIdSchema, params);
      log.debug(
        { applicationId: input.applicationId },
        'application_get_research_details_by_id called',
      );
      try {
        const result = await applicationService.getResearchDetailsById(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'application_get_research_details_by_id');
      }
    },
  );

  server.tool(
    'application_insert',
    '⚠️ WRITE: Create a new custom application.',
    ApplicationInsertSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(ApplicationInsertSchema, params);
      log.debug({ name: input.name }, 'application_insert called');
      try {
        const result = await applicationService.insert(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'application_insert');
      }
    },
  );

  server.tool(
    'application_update_by_id',
    '⚠️ WRITE: Update an existing application name/description.',
    ApplicationUpdateByIdSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(ApplicationUpdateByIdSchema, params);
      log.debug({ applicationId: input.applicationId }, 'application_update_by_id called');
      try {
        const result = await applicationService.updateById(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'application_update_by_id');
      }
    },
  );

  server.tool(
    'application_delete',
    '⚠️ WRITE/DELETE: Delete applications without attached policies.',
    ApplicationDeleteSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(ApplicationDeleteSchema, params);
      log.debug({ count: input.applications.length }, 'application_delete called');
      try {
        const result = await applicationService.delete(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'application_delete');
      }
    },
  );

  server.tool(
    'application_confirm_delete',
    '⚠️ WRITE/DELETE: Delete applications that have attached policies.',
    ApplicationConfirmDeleteSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(ApplicationConfirmDeleteSchema, params);
      log.debug({ count: input.applications.length }, 'application_confirm_delete called');
      try {
        const result = await applicationService.confirmDelete(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'application_confirm_delete');
      }
    },
  );
}
