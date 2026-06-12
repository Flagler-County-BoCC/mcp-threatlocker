import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { validate } from '../../lib/validate.js';
import { handleToolError } from '../../lib/tool-error-handler.js';
import {
  CmConfigurationGetEnabledSchema,
  CmPolicyGetByParametersSchema,
} from './config-manager.schema.js';
import { configManagerService } from '../../lib/container.js';
import { createLogger } from '../../lib/logger.js';

const log = createLogger({ module: 'configManagerTool' });

export function registerConfigManagerTools(server: McpServer): void {
  server.tool(
    'cm_configuration_get_enabled',
    'Get all enabled Configuration Manager configurations grouped by category.',
    CmConfigurationGetEnabledSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(CmConfigurationGetEnabledSchema, params);
      log.debug({}, 'cm_configuration_get_enabled called');
      try {
        const result = await configManagerService.configurationGetEnabled(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'cm_configuration_get_enabled');
      }
    },
  );

  server.tool(
    'cm_policy_get_by_parameters',
    'Get Configuration Manager policies by parameters (paginated, filtered by status and appliesTo).',
    CmPolicyGetByParametersSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(CmPolicyGetByParametersSchema, params);
      log.debug(
        { pageNumber: input.pageNumber, status: input.status },
        'cm_policy_get_by_parameters called',
      );
      try {
        const result = await configManagerService.policyGetByParameters(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'cm_policy_get_by_parameters');
      }
    },
  );
}
