import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { validate } from '../../lib/validate.js';
import { handleToolError } from '../../lib/tool-error-handler.js';
import { ComputerCheckinGetByParametersSchema } from './computer-checkin.schema.js';
import { computerCheckinService } from '../../lib/container.js';
import { createLogger } from '../../lib/logger.js';

const log = createLogger({ module: 'computerCheckinTool' });

export function registerComputerCheckinTools(server: McpServer): void {
  server.tool(
    'computer_checkin_get_by_parameters',
    'Get computer check-in history for a specific computer.',
    ComputerCheckinGetByParametersSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(ComputerCheckinGetByParametersSchema, params);
      log.debug(
        { computerId: input.computerId, pageNumber: input.pageNumber },
        'computer_checkin_get_by_parameters called',
      );
      try {
        const result = await computerCheckinService.getByParameters(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'computer_checkin_get_by_parameters');
      }
    },
  );
}
