import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { validate } from '../../lib/validate.js';
import { handleToolError } from '../../lib/tool-error-handler.js';
import {
  DeployPoliciesSchema,
  DeployPoliciesForComputerSchema,
} from './deploy-policy-queue.schema.js';
import { deployPolicyQueueService } from '../../lib/container.js';
import { createLogger } from '../../lib/logger.js';

const log = createLogger({ module: 'deployPolicyQueueTool' });

export function registerDeployPolicyQueueTools(server: McpServer): void {
  server.tool(
    'deploy_policies',
    '⚠️ WRITE: Queue policy deployment for all computers in an organization.',
    DeployPoliciesSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(DeployPoliciesSchema, params);
      log.debug({ managedOrganizationId: input.managedOrganizationId }, 'deploy_policies called');
      try {
        const result = await deployPolicyQueueService.deployPolicies(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'deploy_policies');
      }
    },
  );

  server.tool(
    'deploy_policies_for_computer',
    '⚠️ WRITE: Queue policy deployment for a specific computer.',
    DeployPoliciesForComputerSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(DeployPoliciesForComputerSchema, params);
      log.debug({ computerId: input.computerId }, 'deploy_policies_for_computer called');
      try {
        const result = await deployPolicyQueueService.deployPoliciesForComputer(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'deploy_policies_for_computer');
      }
    },
  );
}
