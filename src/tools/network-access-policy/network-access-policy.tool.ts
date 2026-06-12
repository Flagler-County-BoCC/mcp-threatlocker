import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { validate } from '../../lib/validate.js';
import { handleToolError } from '../../lib/tool-error-handler.js';
import { NetworkAccessPolicyInsertSchema } from './network-access-policy.schema.js';
import { networkAccessPolicyService } from '../../lib/container.js';
import { createLogger } from '../../lib/logger.js';

const log = createLogger({ module: 'networkAccessPolicyTool' });

export function registerNetworkAccessPolicyTools(server: McpServer): void {
  server.tool(
    'network_access_policy_insert',
    '⚠️ WRITE: Create a new network access policy rule.',
    NetworkAccessPolicyInsertSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(NetworkAccessPolicyInsertSchema, params);
      log.debug(
        { name: input.name, computerGroupId: input.computerGroupId },
        'network_access_policy_insert called',
      );
      try {
        const result = await networkAccessPolicyService.insert(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'network_access_policy_insert');
      }
    },
  );
}
