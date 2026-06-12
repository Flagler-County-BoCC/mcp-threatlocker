import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { validate } from '../../lib/validate.js';
import { handleToolError } from '../../lib/tool-error-handler.js';
import {
  SystemAuditGetByParametersSchema,
  SystemAuditGetForHealthCenterSchema,
} from './system-audit.schema.js';
import { systemAuditService } from '../../lib/container.js';
import { createLogger } from '../../lib/logger.js';

const log = createLogger({ module: 'systemAuditTool' });

export function registerSystemAuditTools(server: McpServer): void {
  server.tool(
    'system_audit_get_by_parameters',
    'Get system audit logs (paginated). Covers Create/Delete/Logon/Modify/Read actions by admin users.',
    SystemAuditGetByParametersSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(SystemAuditGetByParametersSchema, params);
      log.debug(
        { pageNumber: input.pageNumber, startDate: input.startDate },
        'system_audit_get_by_parameters called',
      );
      try {
        const result = await systemAuditService.getByParameters(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'system_audit_get_by_parameters');
      }
    },
  );

  server.tool(
    'system_audit_get_for_health_center',
    'Get system audit summary for health center display (login activity over N days).',
    SystemAuditGetForHealthCenterSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(SystemAuditGetForHealthCenterSchema, params);
      log.debug(
        { days: input.days, isLoggedIn: input.isLoggedIn },
        'system_audit_get_for_health_center called',
      );
      try {
        const result = await systemAuditService.getForHealthCenter(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'system_audit_get_for_health_center');
      }
    },
  );
}
