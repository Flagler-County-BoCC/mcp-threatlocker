import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { validate } from '../../lib/validate.js';
import { handleToolError } from '../../lib/tool-error-handler.js';
import {
  ApprovalRequestGetByParametersSchema,
  ApprovalRequestGetCountSchema,
  ApprovalRequestGetFileDownloadDetailsSchema,
  ApprovalRequestGetPermitApplicationByIdSchema,
  ApprovalRequestAuthorizeForPermitSchema,
  ApprovalRequestPermitApplicationSchema,
} from './approval-request.schema.js';
import { approvalRequestService } from '../../lib/container.js';
import { createLogger } from '../../lib/logger.js';

const log = createLogger({ module: 'approvalRequestTool' });

export function registerApprovalRequestTools(server: McpServer): void {
  server.tool(
    'approval_request_get_by_parameters',
    'Get approval requests by parameters (paginated, filtered by status).',
    ApprovalRequestGetByParametersSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(ApprovalRequestGetByParametersSchema, params);
      log.debug(
        { statusId: input.statusId, pageNumber: input.pageNumber },
        'approval_request_get_by_parameters called',
      );
      try {
        const result = await approvalRequestService.getByParameters(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'approval_request_get_by_parameters');
      }
    },
  );

  server.tool(
    'approval_request_get_count',
    'Get count of pending approval requests.',
    ApprovalRequestGetCountSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(ApprovalRequestGetCountSchema, params);
      log.debug(
        { includeChildOrganizations: input.includeChildOrganizations },
        'approval_request_get_count called',
      );
      try {
        const result = await approvalRequestService.getCount(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'approval_request_get_count');
      }
    },
  );

  server.tool(
    'approval_request_get_file_download_details',
    'Get file download details (filename and fileUrl) for an approval request.',
    ApprovalRequestGetFileDownloadDetailsSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(ApprovalRequestGetFileDownloadDetailsSchema, params);
      log.debug(
        { approvalRequestId: input.approvalRequestId },
        'approval_request_get_file_download_details called',
      );
      try {
        const result = await approvalRequestService.getFileDownloadDetails(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'approval_request_get_file_download_details');
      }
    },
  );

  server.tool(
    'approval_request_get_permit_application_by_id',
    'Get full approval request information by ID including pre-formatted JSON for permit processing.',
    ApprovalRequestGetPermitApplicationByIdSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(ApprovalRequestGetPermitApplicationByIdSchema, params);
      log.debug(
        { approvalRequestId: input.approvalRequestId },
        'approval_request_get_permit_application_by_id called',
      );
      try {
        const result = await approvalRequestService.getPermitApplicationById(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'approval_request_get_permit_application_by_id');
      }
    },
  );

  server.tool(
    'approval_request_authorize_for_permit',
    '⚠️ WRITE: Authorize Cyber Hero Team to permit an approval request.',
    ApprovalRequestAuthorizeForPermitSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(ApprovalRequestAuthorizeForPermitSchema, params);
      log.debug(
        { approvalRequestId: input.approvalRequestId },
        'approval_request_authorize_for_permit called',
      );
      try {
        const result = await approvalRequestService.authorizeForPermit(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'approval_request_authorize_for_permit');
      }
    },
  );

  server.tool(
    'approval_request_permit_application',
    '⚠️ WRITE: Process an Application Control approval request (Execute or Elevate action types).',
    ApprovalRequestPermitApplicationSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(ApprovalRequestPermitApplicationSchema, params);
      log.debug({ computerId: input.computerId }, 'approval_request_permit_application called');
      try {
        const result = await approvalRequestService.permitApplication(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'approval_request_permit_application');
      }
    },
  );
}
