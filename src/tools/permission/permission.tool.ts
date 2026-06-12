import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { validate } from '../../lib/validate.js';
import { handleToolError } from '../../lib/tool-error-handler.js';
import { PermissionGetForAdministratorSchema } from './permission.schema.js';
import { permissionService } from '../../lib/container.js';
import { createLogger } from '../../lib/logger.js';

const log = createLogger({ module: 'permissionTool' });

export function registerPermissionTools(server: McpServer): void {
  server.tool(
    'permission_get_for_administrator',
    'Get permissions for the currently authenticated administrator.',
    PermissionGetForAdministratorSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(PermissionGetForAdministratorSchema, params);
      log.debug({}, 'permission_get_for_administrator called');
      try {
        const result = await permissionService.getForAdministrator(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'permission_get_for_administrator');
      }
    },
  );
}
