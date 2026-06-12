import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createTestClient,
  parseText,
  getText,
  type TestClient,
} from '../../../../tests/helpers/createTestClient.js';
import { registerOnlineDevicesTools } from '../online-devices.tool.js';
import { onlineDevicesService } from '../../../lib/container.js';
import { ExternalServiceError } from '../../../errors/index.js';

vi.mock('../../../lib/container.js');

describe('online-devices MCP tools', () => {
  let tc: TestClient;

  beforeEach(async () => {
    tc = await createTestClient(registerOnlineDevicesTools);
  });

  afterEach(async () => {
    await tc.cleanup();
  });

  describe('online_devices_get_by_parameters', () => {
    it('returns online devices on success', async () => {
      vi.mocked(onlineDevicesService.getByParameters).mockResolvedValueOnce({
        items: [{ id: 'test-device-0001', name: 'SERVER-01' }],
        total: 1,
      });
      const result = await tc.client.callTool({
        name: 'online_devices_get_by_parameters',
        arguments: {},
      });
      expect(result.isError).toBeFalsy();
      expect(parseText(result)).toMatchObject({ total: 1 });
    });

    it('returns isError:true on ExternalServiceError', async () => {
      vi.mocked(onlineDevicesService.getByParameters).mockRejectedValueOnce(
        new ExternalServiceError('ThreatLocker', 'Unauthorized', 401),
      );
      const result = await tc.client.callTool({
        name: 'online_devices_get_by_parameters',
        arguments: {},
      });
      expect(result.isError).toBe(true);
      expect(getText(result)).toMatch(/EXTERNAL_SERVICE_ERROR/);
    });
  });
});
