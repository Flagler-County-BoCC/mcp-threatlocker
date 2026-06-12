import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { validate } from '../../lib/validate.js';
import { handleToolError } from '../../lib/tool-error-handler.js';
import { ReportGetByOrganizationIdSchema, ReportGetDynamicDataSchema } from './report.schema.js';
import { reportService } from '../../lib/container.js';
import { createLogger } from '../../lib/logger.js';

const log = createLogger({ module: 'reportTool' });

export function registerReportTools(server: McpServer): void {
  server.tool(
    'report_get_by_organization_id',
    'Get available reports for an organization.',
    ReportGetByOrganizationIdSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(ReportGetByOrganizationIdSchema, params);
      log.debug(
        { managedOrganizationId: input.managedOrganizationId },
        'report_get_by_organization_id called',
      );
      try {
        const result = await reportService.getByOrganizationId(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'report_get_by_organization_id');
      }
    },
  );

  server.tool(
    'report_get_dynamic_data',
    'Get dynamic report data for a specific report ID with optional date filters.',
    ReportGetDynamicDataSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(ReportGetDynamicDataSchema, params);
      log.debug({ reportId: input.reportId }, 'report_get_dynamic_data called');
      try {
        const result = await reportService.getDynamicData(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'report_get_dynamic_data');
      }
    },
  );
}
