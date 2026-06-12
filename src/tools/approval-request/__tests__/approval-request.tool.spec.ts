import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createTestClient,
  parseText,
  getText,
  type TestClient,
} from '../../../../tests/helpers/createTestClient.js';
import { registerApprovalRequestTools } from '../approval-request.tool.js';
import { approvalRequestService } from '../../../lib/container.js';
import { ExternalServiceError } from '../../../errors/index.js';

vi.mock('../../../lib/container.js');

describe('approval-request MCP tools', () => {
  let tc: TestClient;

  beforeEach(async () => {
    tc = await createTestClient(registerApprovalRequestTools);
  });

  afterEach(async () => {
    await tc.cleanup();
  });

  describe('approval_request_get_by_parameters', () => {
    it('returns paginated requests on success', async () => {
      vi.mocked(approvalRequestService.getByParameters).mockResolvedValueOnce({
        items: [{ id: 'test-req-0001', status: 'Pending' }],
        total: 1,
      });
      const result = await tc.client.callTool({
        name: 'approval_request_get_by_parameters',
        arguments: { statusId: 1 },
      });
      expect(result.isError).toBeFalsy();
      expect(parseText(result)).toMatchObject({ total: 1 });
    });

    it('returns isError:true on ExternalServiceError', async () => {
      vi.mocked(approvalRequestService.getByParameters).mockRejectedValueOnce(
        new ExternalServiceError('ThreatLocker', 'Unauthorized', 401),
      );
      const result = await tc.client.callTool({
        name: 'approval_request_get_by_parameters',
        arguments: { statusId: 1 },
      });
      expect(result.isError).toBe(true);
      expect(getText(result)).toMatch(/EXTERNAL_SERVICE_ERROR/);
    });
  });

  describe('approval_request_get_count', () => {
    it('returns count on success', async () => {
      vi.mocked(approvalRequestService.getCount).mockResolvedValueOnce({ count: 5 });
      const result = await tc.client.callTool({
        name: 'approval_request_get_count',
        arguments: {},
      });
      expect(result.isError).toBeFalsy();
      expect(parseText(result)).toMatchObject({ count: 5 });
    });
  });

  describe('approval_request_get_permit_application_by_id', () => {
    it('returns permit application details on success', async () => {
      vi.mocked(approvalRequestService.getPermitApplicationById).mockResolvedValueOnce({
        id: 'test-req-0001',
        applicationJson: '{}',
      });
      const result = await tc.client.callTool({
        name: 'approval_request_get_permit_application_by_id',
        arguments: { approvalRequestId: 'test-req-0001' },
      });
      expect(result.isError).toBeFalsy();
      expect(parseText(result)).toMatchObject({ id: 'test-req-0001' });
    });

    it('returns isError:true when approvalRequestId is missing', async () => {
      const result = await tc.client.callTool({
        name: 'approval_request_get_permit_application_by_id',
        arguments: {},
      });
      expect(result.isError).toBe(true);
    });
  });
});
