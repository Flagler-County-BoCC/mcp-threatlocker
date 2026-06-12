import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { validate } from '../../lib/validate.js';
import { handleToolError } from '../../lib/tool-error-handler.js';
import {
  ApplicationFileGetByApplicationIdSchema,
  ApplicationFileInsertSchema,
  ApplicationFileUpdateSchema,
  ApplicationFileDeleteByIdSchema,
} from './application-file.schema.js';
import { applicationFileService } from '../../lib/container.js';
import { createLogger } from '../../lib/logger.js';

const log = createLogger({ module: 'applicationFileTool' });

export function registerApplicationFileTools(server: McpServer): void {
  server.tool(
    'application_file_get_by_application_id',
    'Get application file rules by application ID (paginated).',
    ApplicationFileGetByApplicationIdSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(ApplicationFileGetByApplicationIdSchema, params);
      log.debug(
        { applicationId: input.applicationId, pageNumber: input.pageNumber },
        'application_file_get_by_application_id called',
      );
      try {
        const result = await applicationFileService.getByApplicationId(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'application_file_get_by_application_id');
      }
    },
  );

  server.tool(
    'application_file_insert',
    '⚠️ WRITE: Add a new application file rule to a custom application.',
    ApplicationFileInsertSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(ApplicationFileInsertSchema, params);
      log.debug({ applicationId: input.applicationId }, 'application_file_insert called');
      try {
        const result = await applicationFileService.insert(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'application_file_insert');
      }
    },
  );

  server.tool(
    'application_file_update',
    '⚠️ WRITE: Update an existing application file rule.',
    ApplicationFileUpdateSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(ApplicationFileUpdateSchema, params);
      log.debug({ applicationFileId: input.applicationFileId }, 'application_file_update called');
      try {
        const result = await applicationFileService.update(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'application_file_update');
      }
    },
  );

  server.tool(
    'application_file_delete_by_id',
    '⚠️ WRITE/DELETE: Delete a single application file rule.',
    ApplicationFileDeleteByIdSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(ApplicationFileDeleteByIdSchema, params);
      log.debug(
        { applicationFileId: input.applicationFileId },
        'application_file_delete_by_id called',
      );
      try {
        const result = await applicationFileService.deleteById(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'application_file_delete_by_id');
      }
    },
  );
}
