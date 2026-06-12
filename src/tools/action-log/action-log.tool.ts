import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { validate } from '../../lib/validate.js';
import { handleToolError } from '../../lib/tool-error-handler.js';
import { ActionLogGetByParametersSchema } from './action-log.schema.js';
import { actionLogService } from '../../lib/container.js';
import { createLogger } from '../../lib/logger.js';

const log = createLogger({ module: 'actionLogTool' });

export function registerActionLogTools(server: McpServer): void {
  server.tool(
    'action_log_get_by_parameters',
    'Get unified audit log entries (paginated). Retrieves audit log entries with filtering, grouping, and optional CSV export.',
    ActionLogGetByParametersSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(ActionLogGetByParametersSchema, params);
      log.debug(
        { pageNumber: input.pageNumber, startDate: input.startDate },
        'action_log_get_by_parameters called',
      );
      try {
        const result = await actionLogService.getByParameters(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'action_log_get_by_parameters');
      }
    },
  );
}
