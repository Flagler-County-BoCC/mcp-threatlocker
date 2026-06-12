import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createTestClient,
  parseText,
  getText,
  type TestClient,
} from '../../../../tests/helpers/createTestClient.js';
import { registerActionLogTools } from '../action-log.tool.js';
import { actionLogService } from '../../../lib/container.js';
import { ExternalServiceError } from '../../../errors/index.js';

vi.mock('../../../lib/container.js');

describe('action-log MCP tools', () => {
  let tc: TestClient;

  beforeEach(async () => {
    tc = await createTestClient(registerActionLogTools);
  });

  afterEach(async () => {
    await tc.cleanup();
  });

  describe('action_log_get_by_parameters', () => {
    it('returns formatted JSON on success', async () => {
      vi.mocked(actionLogService.getByParameters).mockResolvedValueOnce({
        data: [{ id: 'test-action-0001', action: 'Execute' }],
        total: 1,
      });
      const result = await tc.client.callTool({
        name: 'action_log_get_by_parameters',
        arguments: { startDate: '2024-01-01', endDate: '2024-01-31' },
      });
      expect(result.isError).toBeFalsy();
      const parsed = parseText(result);
      expect(parsed).toMatchObject({ data: [{ id: 'test-action-0001' }] });
    });

    it('returns isError:true on ExternalServiceError', async () => {
      vi.mocked(actionLogService.getByParameters).mockRejectedValueOnce(
        new ExternalServiceError('ThreatLocker', 'Unauthorized', 401),
      );
      const result = await tc.client.callTool({
        name: 'action_log_get_by_parameters',
        arguments: { startDate: '2024-01-01', endDate: '2024-01-31' },
      });
      expect(result.isError).toBe(true);
      expect(getText(result)).toMatch(/EXTERNAL_SERVICE_ERROR/);
    });

    it('returns isError:true when required fields are missing', async () => {
      const result = await tc.client.callTool({
        name: 'action_log_get_by_parameters',
        arguments: {},
      });
      expect(result.isError).toBe(true);
    });
  });
});
