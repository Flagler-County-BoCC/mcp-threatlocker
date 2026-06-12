import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createTestClient,
  parseText,
  getText,
  type TestClient,
} from '../../../../tests/helpers/createTestClient.js';
import { registerConfigManagerTools } from '../config-manager.tool.js';
import { configManagerService } from '../../../lib/container.js';
import { ExternalServiceError } from '../../../errors/index.js';

vi.mock('../../../lib/container.js');

describe('config-manager MCP tools', () => {
  let tc: TestClient;

  beforeEach(async () => {
    tc = await createTestClient(registerConfigManagerTools);
  });

  afterEach(async () => {
    await tc.cleanup();
  });

  describe('cm_configuration_get_enabled', () => {
    it('returns enabled configurations on success', async () => {
      vi.mocked(configManagerService.configurationGetEnabled).mockResolvedValueOnce([
        { id: 'test-config-0001', name: 'Firewall' },
      ]);
      const result = await tc.client.callTool({
        name: 'cm_configuration_get_enabled',
        arguments: {},
      });
      expect(result.isError).toBeFalsy();
      const parsed = parseText(result) as unknown[];
      expect(parsed).toHaveLength(1);
    });

    it('returns isError:true on ExternalServiceError', async () => {
      vi.mocked(configManagerService.configurationGetEnabled).mockRejectedValueOnce(
        new ExternalServiceError('ThreatLocker', 'Unauthorized', 401),
      );
      const result = await tc.client.callTool({
        name: 'cm_configuration_get_enabled',
        arguments: {},
      });
      expect(result.isError).toBe(true);
      expect(getText(result)).toMatch(/EXTERNAL_SERVICE_ERROR/);
    });
  });

  describe('cm_policy_get_by_parameters', () => {
    it('returns policies on success', async () => {
      vi.mocked(configManagerService.policyGetByParameters).mockResolvedValueOnce({
        items: [{ id: 'test-cmpol-0001' }],
        total: 1,
      });
      const result = await tc.client.callTool({
        name: 'cm_policy_get_by_parameters',
        arguments: { appliesTo: 'test-group-0001', status: 1 },
      });
      expect(result.isError).toBeFalsy();
      expect(parseText(result)).toMatchObject({ total: 1 });
    });

    it('returns isError:true on ExternalServiceError', async () => {
      vi.mocked(configManagerService.policyGetByParameters).mockRejectedValueOnce(
        new ExternalServiceError('ThreatLocker', 'Server Error', 500),
      );
      const result = await tc.client.callTool({
        name: 'cm_policy_get_by_parameters',
        arguments: { appliesTo: 'test-group-0001', status: 1 },
      });
      expect(result.isError).toBe(true);
    });

    it('returns isError:true when required fields are missing', async () => {
      const result = await tc.client.callTool({
        name: 'cm_policy_get_by_parameters',
        arguments: {},
      });
      expect(result.isError).toBe(true);
    });
  });
});
