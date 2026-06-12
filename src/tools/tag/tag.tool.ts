import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { validate } from '../../lib/validate.js';
import { handleToolError } from '../../lib/tool-error-handler.js';
import { TagGetDropdownOptionsSchema } from './tag.schema.js';
import { tagService } from '../../lib/container.js';
import { createLogger } from '../../lib/logger.js';

const log = createLogger({ module: 'tagTool' });

export function registerTagTools(server: McpServer): void {
  server.tool(
    'tag_get_dropdown_options',
    'Get tag dropdown options for an organization.',
    TagGetDropdownOptionsSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(TagGetDropdownOptionsSchema, params);
      log.debug(
        { managedOrganizationId: input.managedOrganizationId },
        'tag_get_dropdown_options called',
      );
      try {
        const result = await tagService.getDropdownOptions(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'tag_get_dropdown_options');
      }
    },
  );
}
