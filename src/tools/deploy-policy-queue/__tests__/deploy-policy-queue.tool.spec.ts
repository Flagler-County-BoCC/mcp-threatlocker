import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createTestClient,
  getText,
  type TestClient,
} from '../../../../tests/helpers/createTestClient.js';
import { registerDeployPolicyQueueTools } from '../deploy-policy-queue.tool.js';
import { deployPolicyQueueService } from '../../../lib/container.js';
import { ExternalServiceError } from '../../../errors/index.js';

vi.mock('../../../lib/container.js');

describe('deploy-policy-queue MCP tools', () => {
  let tc: TestClient;

  beforeEach(async () => {
    tc = await createTestClient(registerDeployPolicyQueueTools);
  });

  afterEach(async () => {
    await tc.cleanup();
  });

  describe('deploy_policies', () => {
    it('returns success response', async () => {
      vi.mocked(deployPolicyQueueService.deployPolicies).mockResolvedValueOnce({ queued: true });
      const result = await tc.client.callTool({
        name: 'deploy_policies',
        arguments: {},
      });
      expect(result.isError).toBeFalsy();
    });

    it('returns isError:true on ExternalServiceError', async () => {
      vi.mocked(deployPolicyQueueService.deployPolicies).mockRejectedValueOnce(
        new ExternalServiceError('ThreatLocker', 'Unauthorized', 401),
      );
      const result = await tc.client.callTool({
        name: 'deploy_policies',
        arguments: {},
      });
      expect(result.isError).toBe(true);
      expect(getText(result)).toMatch(/EXTERNAL_SERVICE_ERROR/);
    });
  });

  describe('deploy_policies_for_computer', () => {
    it('returns success response', async () => {
      vi.mocked(deployPolicyQueueService.deployPoliciesForComputer).mockResolvedValueOnce({
        queued: true,
      });
      const result = await tc.client.callTool({
        name: 'deploy_policies_for_computer',
        arguments: { computerId: 'test-computer-0001', computerName: 'WORKSTATION-01' },
      });
      expect(result.isError).toBeFalsy();
    });

    it('returns isError:true when required fields are missing', async () => {
      const result = await tc.client.callTool({
        name: 'deploy_policies_for_computer',
        arguments: {},
      });
      expect(result.isError).toBe(true);
    });
  });
});
