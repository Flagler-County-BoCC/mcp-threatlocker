import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { validate } from '../../lib/validate.js';
import { handleToolError } from '../../lib/tool-error-handler.js';
import { UserGetAllTimezonesSchema, UserInviteByUsernameSchema } from './user.schema.js';
import { userService } from '../../lib/container.js';
import { createLogger } from '../../lib/logger.js';

const log = createLogger({ module: 'userTool' });

export function registerUserTools(server: McpServer): void {
  server.tool(
    'user_get_all_timezones',
    'Get all available timezones for user/organization settings.',
    UserGetAllTimezonesSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(UserGetAllTimezonesSchema, params);
      log.debug({}, 'user_get_all_timezones called');
      try {
        const result = await userService.getAllTimezones(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'user_get_all_timezones');
      }
    },
  );

  server.tool(
    'user_invite_by_username',
    '⚠️ WRITE: Invite a user to the ThreatLocker portal by email address.',
    UserInviteByUsernameSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(UserInviteByUsernameSchema, params);
      log.debug({ email: input.email }, 'user_invite_by_username called');
      try {
        const result = await userService.inviteByUsername(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'user_invite_by_username');
      }
    },
  );
}
