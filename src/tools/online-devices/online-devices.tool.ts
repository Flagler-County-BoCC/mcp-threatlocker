import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { validate } from '../../lib/validate.js';
import { handleToolError } from '../../lib/tool-error-handler.js';
import { OnlineDevicesGetByParametersSchema } from './online-devices.schema.js';
import { onlineDevicesService } from '../../lib/container.js';
import { createLogger } from '../../lib/logger.js';

const log = createLogger({ module: 'onlineDevicesTool' });

export function registerOnlineDevicesTools(server: McpServer): void {
  server.tool(
    'online_devices_get_by_parameters',
    'Get currently online devices (paginated).',
    OnlineDevicesGetByParametersSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(OnlineDevicesGetByParametersSchema, params);
      log.debug({ pageNumber: input.pageNumber }, 'online_devices_get_by_parameters called');
      try {
        const result = await onlineDevicesService.getByParameters(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'online_devices_get_by_parameters');
      }
    },
  );
}
