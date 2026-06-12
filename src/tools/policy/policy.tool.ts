import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { validate } from '../../lib/validate.js';
import { handleToolError } from '../../lib/tool-error-handler.js';
import {
  PolicyGetByIdSchema,
  PolicyGetByParametersSchema,
  PolicyGetForViewByApplicationIdSchema,
  PolicyInsertSchema,
  PolicyInsertForCopySchema,
  PolicyUpdateByIdSchema,
  PolicyDeleteByIdsSchema,
} from './policy.schema.js';
import { policyService } from '../../lib/container.js';
import { createLogger } from '../../lib/logger.js';

const log = createLogger({ module: 'policyTool' });

export function registerPolicyTools(server: McpServer): void {
  server.tool(
    'policy_get_by_id',
    'Get an application control policy by ID.',
    PolicyGetByIdSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(PolicyGetByIdSchema, params);
      log.debug({ policyId: input.policyId }, 'policy_get_by_id called');
      try {
        const result = await policyService.getById(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'policy_get_by_id');
      }
    },
  );

  server.tool(
    'policy_get_by_parameters',
    'Get application control policies (paginated, filterable by group, OS, filter type).',
    PolicyGetByParametersSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(PolicyGetByParametersSchema, params);
      log.debug(
        { pageNumber: input.pageNumber, filter: input.filter },
        'policy_get_by_parameters called',
      );
      try {
        const result = await policyService.getByParameters(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'policy_get_by_parameters');
      }
    },
  );

  server.tool(
    'policy_get_for_view_by_application_id',
    'Get policies that reference a specific application.',
    PolicyGetForViewByApplicationIdSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(PolicyGetForViewByApplicationIdSchema, params);
      log.debug(
        { applicationId: input.applicationId },
        'policy_get_for_view_by_application_id called',
      );
      try {
        const result = await policyService.getForViewByApplicationId(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'policy_get_for_view_by_application_id');
      }
    },
  );

  server.tool(
    'policy_insert',
    '⚠️ WRITE: Create a new application control policy.',
    PolicyInsertSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(PolicyInsertSchema, params);
      log.debug({ name: input.name, policyActionId: input.policyActionId }, 'policy_insert called');
      try {
        const result = await policyService.insert(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'policy_insert');
      }
    },
  );

  server.tool(
    'policy_insert_for_copy',
    '⚠️ WRITE: Copy policies from one applies-to target to one or more targets.',
    PolicyInsertForCopySchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(PolicyInsertForCopySchema, params);
      log.debug({ count: input.policies.length }, 'policy_insert_for_copy called');
      try {
        const result = await policyService.insertForCopy(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'policy_insert_for_copy');
      }
    },
  );

  server.tool(
    'policy_update_by_id',
    '⚠️ WRITE: Update an existing application control policy.',
    PolicyUpdateByIdSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(PolicyUpdateByIdSchema, params);
      log.debug({ policyId: input.policyId }, 'policy_update_by_id called');
      try {
        const result = await policyService.updateById(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'policy_update_by_id');
      }
    },
  );

  server.tool(
    'policy_delete_by_ids',
    '⚠️ WRITE/DELETE: Delete application control policies.',
    PolicyDeleteByIdsSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(PolicyDeleteByIdsSchema, params);
      log.debug({ count: input.policies.length }, 'policy_delete_by_ids called');
      try {
        const result = await policyService.deleteByIds(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'policy_delete_by_ids');
      }
    },
  );
}
