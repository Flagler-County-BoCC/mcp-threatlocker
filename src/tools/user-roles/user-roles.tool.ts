import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { validate } from '../../lib/validate.js';
import { handleToolError } from '../../lib/tool-error-handler.js';
import { UserRolesGetByParametersSchema } from './user-roles.schema.js';
import { userRolesService } from '../../lib/container.js';
import { createLogger } from '../../lib/logger.js';

const log = createLogger({ module: 'userRolesTool' });

export function registerUserRolesTools(server: McpServer): void {
  server.tool(
    'user_roles_get_by_parameters',
    'Get user roles and their permissions.',
    UserRolesGetByParametersSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(UserRolesGetByParametersSchema, params);
      log.debug({}, 'user_roles_get_by_parameters called');
      try {
        const result = await userRolesService.getByParameters(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'user_roles_get_by_parameters');
      }
    },
  );
}
