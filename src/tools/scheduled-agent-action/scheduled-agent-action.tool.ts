import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { validate } from '../../lib/validate.js';
import { handleToolError } from '../../lib/tool-error-handler.js';
import {
  ScheduledAgentActionCreateSchema,
  ScheduledAgentActionAbortSchema,
  ScheduledAgentActionAppliesToSchema,
  ScheduledAgentActionGetByParametersSchema,
  ScheduledAgentActionGetForHydrationSchema,
  ScheduledAgentActionListSchema,
} from './scheduled-agent-action.schema.js';
import { scheduledAgentActionService } from '../../lib/container.js';
import { createLogger } from '../../lib/logger.js';

const log = createLogger({ module: 'scheduledAgentActionTool' });

export function registerScheduledAgentActionTools(server: McpServer): void {
  server.tool(
    'scheduled_agent_action_create',
    '⚠️ WRITE: Schedule a ThreatLocker agent version update across computers/groups.',
    ScheduledAgentActionCreateSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(ScheduledAgentActionCreateSchema, params);
      log.debug({ scheduledType: input.scheduledType }, 'scheduled_agent_action_create called');
      try {
        const result = await scheduledAgentActionService.create(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'scheduled_agent_action_create');
      }
    },
  );

  server.tool(
    'scheduled_agent_action_abort',
    '⚠️ WRITE: Abort a scheduled agent action.',
    ScheduledAgentActionAbortSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(ScheduledAgentActionAbortSchema, params);
      log.debug(
        { scheduledId: input.scheduledId, abortAll: input.abortAll },
        'scheduled_agent_action_abort called',
      );
      try {
        const result = await scheduledAgentActionService.abort(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'scheduled_agent_action_abort');
      }
    },
  );

  server.tool(
    'scheduled_agent_action_applies_to',
    'Get computers/groups available as targets for a scheduled agent action.',
    ScheduledAgentActionAppliesToSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(ScheduledAgentActionAppliesToSchema, params);
      log.debug({ osType: input.osType }, 'scheduled_agent_action_applies_to called');
      try {
        const result = await scheduledAgentActionService.appliesTo(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'scheduled_agent_action_applies_to');
      }
    },
  );

  server.tool(
    'scheduled_agent_action_get_by_parameters',
    'Get computers in a scheduled agent action with their status (paginated).',
    ScheduledAgentActionGetByParametersSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(ScheduledAgentActionGetByParametersSchema, params);
      log.debug(
        { scheduledId: input.scheduledId, pageNumber: input.pageNumber },
        'scheduled_agent_action_get_by_parameters called',
      );
      try {
        const result = await scheduledAgentActionService.getByParameters(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'scheduled_agent_action_get_by_parameters');
      }
    },
  );

  server.tool(
    'scheduled_agent_action_get_for_hydration',
    'Get scheduled agent action details needed to resume/hydrate a UI session.',
    ScheduledAgentActionGetForHydrationSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(ScheduledAgentActionGetForHydrationSchema, params);
      log.debug(
        { scheduledId: input.scheduledId },
        'scheduled_agent_action_get_for_hydration called',
      );
      try {
        const result = await scheduledAgentActionService.getForHydration(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'scheduled_agent_action_get_for_hydration');
      }
    },
  );

  server.tool(
    'scheduled_agent_action_list',
    'List all scheduled agent actions of a given type for an organization.',
    ScheduledAgentActionListSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(ScheduledAgentActionListSchema, params);
      log.debug({ scheduledType: input.scheduledType }, 'scheduled_agent_action_list called');
      try {
        const result = await scheduledAgentActionService.list(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'scheduled_agent_action_list');
      }
    },
  );
}
