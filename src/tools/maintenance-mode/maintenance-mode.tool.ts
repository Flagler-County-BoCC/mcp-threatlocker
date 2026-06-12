import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { validate } from '../../lib/validate.js';
import { handleToolError } from '../../lib/tool-error-handler.js';
import {
  MaintenanceModeGetByComputerIdSchema,
  MaintenanceModeInsertSchema,
  MaintenanceModeEndByIdSchema,
  MaintenanceModeUpdateEndDateSchema,
} from './maintenance-mode.schema.js';
import { maintenanceModeService } from '../../lib/container.js';
import { createLogger } from '../../lib/logger.js';

const log = createLogger({ module: 'maintenanceModeTool' });

export function registerMaintenanceModeTools(server: McpServer): void {
  server.tool(
    'maintenance_mode_get_by_computer_id',
    'Get maintenance mode entries for a specific computer (paginated).',
    MaintenanceModeGetByComputerIdSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(MaintenanceModeGetByComputerIdSchema, params);
      log.debug(
        { computerId: input.computerId, pageNumber: input.pageNumber },
        'maintenance_mode_get_by_computer_id called',
      );
      try {
        const result = await maintenanceModeService.getByComputerId(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'maintenance_mode_get_by_computer_id');
      }
    },
  );

  server.tool(
    'maintenance_mode_insert',
    '⚠️ WRITE: Create a new maintenance mode entry for a computer.',
    MaintenanceModeInsertSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(MaintenanceModeInsertSchema, params);
      log.debug(
        { computerId: input.computerId, maintenanceTypeId: input.maintenanceTypeId },
        'maintenance_mode_insert called',
      );
      try {
        const result = await maintenanceModeService.insert(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'maintenance_mode_insert');
      }
    },
  );

  server.tool(
    'maintenance_mode_end_by_id',
    '⚠️ WRITE: End a maintenance mode entry immediately.',
    MaintenanceModeEndByIdSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(MaintenanceModeEndByIdSchema, params);
      log.debug(
        { ComputerID: input.ComputerID, MaintenanceModeId: input.MaintenanceModeId },
        'maintenance_mode_end_by_id called',
      );
      try {
        const result = await maintenanceModeService.endById(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'maintenance_mode_end_by_id');
      }
    },
  );

  server.tool(
    'maintenance_mode_update_end_date',
    '⚠️ WRITE: Update the end date of an active maintenance mode entry.',
    MaintenanceModeUpdateEndDateSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(MaintenanceModeUpdateEndDateSchema, params);
      log.debug(
        { computerId: input.computerId, maintenanceTypeId: input.maintenanceTypeId },
        'maintenance_mode_update_end_date called',
      );
      try {
        const result = await maintenanceModeService.updateEndDate(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'maintenance_mode_update_end_date');
      }
    },
  );
}
