import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { validate } from '../../lib/validate.js';
import { handleToolError } from '../../lib/tool-error-handler.js';
import {
  DacAnalysisItemGetByIdSchema,
  DacAnalysisResultsGetByParametersSchema,
} from './dac.schema.js';
import { dacService } from '../../lib/container.js';
import { createLogger } from '../../lib/logger.js';

const log = createLogger({ module: 'dacTool' });

export function registerDacTools(server: McpServer): void {
  server.tool(
    'dac_analysis_item_get_by_id',
    'Get a DAC (Dynamic Access Control) analysis item by ID.',
    DacAnalysisItemGetByIdSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(DacAnalysisItemGetByIdSchema, params);
      log.debug({ analysisItemId: input.analysisItemId }, 'dac_analysis_item_get_by_id called');
      try {
        const result = await dacService.analysisItemGetById(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'dac_analysis_item_get_by_id');
      }
    },
  );

  server.tool(
    'dac_analysis_results_get_by_parameters',
    'Get DAC analysis results by parameters (paginated). Returns security posture findings by category and criticality.',
    DacAnalysisResultsGetByParametersSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(DacAnalysisResultsGetByParametersSchema, params);
      log.debug(
        { pageNumber: input.pageNumber, categoryId: input.categoryId },
        'dac_analysis_results_get_by_parameters called',
      );
      try {
        const result = await dacService.analysisResultsGetByParameters(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'dac_analysis_results_get_by_parameters');
      }
    },
  );
}
