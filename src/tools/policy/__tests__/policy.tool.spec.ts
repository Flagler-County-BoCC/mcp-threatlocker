import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createTestClient,
  parseText,
  getText,
  type TestClient,
} from '../../../../tests/helpers/createTestClient.js';
import { registerPolicyTools } from '../policy.tool.js';
import { policyService } from '../../../lib/container.js';
import { ExternalServiceError } from '../../../errors/index.js';

vi.mock('../../../lib/container.js');

describe('policy MCP tools', () => {
  let tc: TestClient;

  beforeEach(async () => {
    tc = await createTestClient(registerPolicyTools);
  });

  afterEach(async () => {
    await tc.cleanup();
  });

  describe('policy_get_by_id', () => {
    it('returns policy on success', async () => {
      vi.mocked(policyService.getById).mockResolvedValueOnce({
        id: 'test-policy-0001',
        name: 'Allow Chrome',
      });
      const result = await tc.client.callTool({
        name: 'policy_get_by_id',
        arguments: { policyId: 'test-policy-0001' },
      });
      expect(result.isError).toBeFalsy();
      expect(parseText(result)).toMatchObject({ id: 'test-policy-0001' });
    });

    it('returns isError:true on ExternalServiceError', async () => {
      vi.mocked(policyService.getById).mockRejectedValueOnce(
        new ExternalServiceError('ThreatLocker', 'Not Found', 404),
      );
      const result = await tc.client.callTool({
        name: 'policy_get_by_id',
        arguments: { policyId: 'test-policy-9999' },
      });
      expect(result.isError).toBe(true);
      expect(getText(result)).toMatch(/EXTERNAL_SERVICE_ERROR/);
    });

    it('returns isError:true when policyId is missing', async () => {
      const result = await tc.client.callTool({ name: 'policy_get_by_id', arguments: {} });
      expect(result.isError).toBe(true);
    });
  });

  describe('policy_get_by_parameters', () => {
    it('returns paginated policies on success', async () => {
      vi.mocked(policyService.getByParameters).mockResolvedValueOnce({
        items: [{ id: 'test-policy-0001' }],
        total: 1,
      });
      const result = await tc.client.callTool({
        name: 'policy_get_by_parameters',
        arguments: { filter: '' },
      });
      expect(result.isError).toBeFalsy();
      expect(parseText(result)).toMatchObject({ total: 1 });
    });

    it('returns isError:true on ExternalServiceError', async () => {
      vi.mocked(policyService.getByParameters).mockRejectedValueOnce(
        new ExternalServiceError('ThreatLocker', 'Server Error', 500),
      );
      const result = await tc.client.callTool({
        name: 'policy_get_by_parameters',
        arguments: { filter: '' },
      });
      expect(result.isError).toBe(true);
    });
  });

  describe('policy_get_for_view_by_application_id', () => {
    it('returns policies for an application on success', async () => {
      vi.mocked(policyService.getForViewByApplicationId).mockResolvedValueOnce({
        items: [],
        total: 0,
      });
      const result = await tc.client.callTool({
        name: 'policy_get_for_view_by_application_id',
        arguments: { applicationId: 'test-app-0001', organizationId: 'test-org-0001' },
      });
      expect(result.isError).toBeFalsy();
    });
  });
});
