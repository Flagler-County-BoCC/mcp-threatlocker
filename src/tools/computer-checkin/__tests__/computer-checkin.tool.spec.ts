import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createTestClient,
  parseText,
  getText,
  type TestClient,
} from '../../../../tests/helpers/createTestClient.js';
import { registerComputerCheckinTools } from '../computer-checkin.tool.js';
import { computerCheckinService } from '../../../lib/container.js';
import { ExternalServiceError } from '../../../errors/index.js';

vi.mock('../../../lib/container.js');

describe('computer-checkin MCP tools', () => {
  let tc: TestClient;

  beforeEach(async () => {
    tc = await createTestClient(registerComputerCheckinTools);
  });

  afterEach(async () => {
    await tc.cleanup();
  });

  describe('computer_checkin_get_by_parameters', () => {
    it('returns check-in history on success', async () => {
      vi.mocked(computerCheckinService.getByParameters).mockResolvedValueOnce({
        items: [{ id: 'test-checkin-0001', checkedInAt: '2024-01-01T00:00:00Z' }],
        total: 1,
      });
      const result = await tc.client.callTool({
        name: 'computer_checkin_get_by_parameters',
        arguments: { computerId: 'test-computer-0001', hideHeartbeat: false },
      });
      expect(result.isError).toBeFalsy();
      expect(parseText(result)).toMatchObject({ total: 1 });
    });

    it('returns isError:true on ExternalServiceError', async () => {
      vi.mocked(computerCheckinService.getByParameters).mockRejectedValueOnce(
        new ExternalServiceError('ThreatLocker', 'Unauthorized', 401),
      );
      const result = await tc.client.callTool({
        name: 'computer_checkin_get_by_parameters',
        arguments: { computerId: 'test-computer-0001', hideHeartbeat: false },
      });
      expect(result.isError).toBe(true);
      expect(getText(result)).toMatch(/EXTERNAL_SERVICE_ERROR/);
    });

    it('returns isError:true when required fields are missing', async () => {
      const result = await tc.client.callTool({
        name: 'computer_checkin_get_by_parameters',
        arguments: {},
      });
      expect(result.isError).toBe(true);
    });
  });
});
