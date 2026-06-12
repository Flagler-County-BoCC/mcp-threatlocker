import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { validate } from '../../lib/validate.js';
import { handleToolError } from '../../lib/tool-error-handler.js';
import { ResearchInformationGetAllCategoriesSchema } from './research-information.schema.js';
import { researchInformationService } from '../../lib/container.js';
import { createLogger } from '../../lib/logger.js';

const log = createLogger({ module: 'researchInformationTool' });

export function registerResearchInformationTools(server: McpServer): void {
  server.tool(
    'research_information_get_all_categories',
    'Get all application research categories (used for filtering research details).',
    ResearchInformationGetAllCategoriesSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(ResearchInformationGetAllCategoriesSchema, params);
      log.debug(
        { getStoreCategories: input.getStoreCategories },
        'research_information_get_all_categories called',
      );
      try {
        const result = await researchInformationService.getAllCategories(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'research_information_get_all_categories');
      }
    },
  );
}
