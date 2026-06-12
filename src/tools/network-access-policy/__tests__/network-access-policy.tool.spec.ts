import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createTestClient,
  getText,
  type TestClient,
} from '../../../../tests/helpers/createTestClient.js';
import { registerNetworkAccessPolicyTools } from '../network-access-policy.tool.js';
import { networkAccessPolicyService } from '../../../lib/container.js';
import { ExternalServiceError } from '../../../errors/index.js';

vi.mock('../../../lib/container.js');

describe('network-access-policy MCP tools', () => {
  let tc: TestClient;

  beforeEach(async () => {
    tc = await createTestClient(registerNetworkAccessPolicyTools);
  });

  afterEach(async () => {
    await tc.cleanup();
  });

  describe('network_access_policy_insert', () => {
    const validArgs = {
      allDestinations: false,
      allPorts: true,
      allSources: false,
      computerGroupId: 'test-group-0001',
      direction: 2,
      name: 'Allow Outbound',
      policyActionId: 1,
      policyScheduleStatus: 0,
      protocol: 1,
      status: 1,
    };

    it('returns new policy on success', async () => {
      vi.mocked(networkAccessPolicyService.insert).mockResolvedValueOnce({ id: 'test-nap-0001' });
      const result = await tc.client.callTool({
        name: 'network_access_policy_insert',
        arguments: validArgs,
      });
      expect(result.isError).toBeFalsy();
    });

    it('returns isError:true on ExternalServiceError', async () => {
      vi.mocked(networkAccessPolicyService.insert).mockRejectedValueOnce(
        new ExternalServiceError('ThreatLocker', 'Forbidden', 403),
      );
      const result = await tc.client.callTool({
        name: 'network_access_policy_insert',
        arguments: validArgs,
      });
      expect(result.isError).toBe(true);
      expect(getText(result)).toMatch(/EXTERNAL_SERVICE_ERROR/);
    });

    it('returns isError:true when required fields are missing', async () => {
      const result = await tc.client.callTool({
        name: 'network_access_policy_insert',
        arguments: {},
      });
      expect(result.isError).toBe(true);
    });
  });
});
