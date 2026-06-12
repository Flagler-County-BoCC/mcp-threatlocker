import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { validate } from '../../lib/validate.js';
import { handleToolError } from '../../lib/tool-error-handler.js';
import { ThreatlockerVersionGetForDropdownSchema } from './threatlocker-version.schema.js';
import { threatlockerVersionService } from '../../lib/container.js';
import { createLogger } from '../../lib/logger.js';

const log = createLogger({ module: 'threatlockerVersionTool' });

export function registerThreatlockerVersionTools(server: McpServer): void {
  server.tool(
    'threatlocker_version_get_for_dropdown',
    'Get available ThreatLocker agent versions for the version selector dropdown.',
    ThreatlockerVersionGetForDropdownSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(ThreatlockerVersionGetForDropdownSchema, params);
      log.debug({}, 'threatlocker_version_get_for_dropdown called');
      try {
        const result = await threatlockerVersionService.getForDropdown(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'threatlocker_version_get_for_dropdown');
      }
    },
  );
}
