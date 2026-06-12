import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createTestClient,
  parseText,
  getText,
  type TestClient,
} from '../../../../tests/helpers/createTestClient.js';
import { registerMaintenanceModeTools } from '../maintenance-mode.tool.js';
import { maintenanceModeService } from '../../../lib/container.js';
import { ExternalServiceError } from '../../../errors/index.js';

vi.mock('../../../lib/container.js');

describe('maintenance-mode MCP tools', () => {
  let tc: TestClient;

  beforeEach(async () => {
    tc = await createTestClient(registerMaintenanceModeTools);
  });

  afterEach(async () => {
    await tc.cleanup();
  });

  describe('maintenance_mode_get_by_computer_id', () => {
    it('returns maintenance entries on success', async () => {
      vi.mocked(maintenanceModeService.getByComputerId).mockResolvedValueOnce({
        items: [{ id: 'test-mm-0001', maintenanceTypeId: 3 }],
        total: 1,
      });
      const result = await tc.client.callTool({
        name: 'maintenance_mode_get_by_computer_id',
        arguments: { computerId: 'test-computer-0001' },
      });
      expect(result.isError).toBeFalsy();
      expect(parseText(result)).toMatchObject({ total: 1 });
    });

    it('returns isError:true on ExternalServiceError', async () => {
      vi.mocked(maintenanceModeService.getByComputerId).mockRejectedValueOnce(
        new ExternalServiceError('ThreatLocker', 'Not Found', 404),
      );
      const result = await tc.client.callTool({
        name: 'maintenance_mode_get_by_computer_id',
        arguments: { computerId: 'test-computer-9999' },
      });
      expect(result.isError).toBe(true);
      expect(getText(result)).toMatch(/EXTERNAL_SERVICE_ERROR/);
    });

    it('returns isError:true when computerId is missing', async () => {
      const result = await tc.client.callTool({
        name: 'maintenance_mode_get_by_computer_id',
        arguments: {},
      });
      expect(result.isError).toBe(true);
    });
  });

  describe('maintenance_mode_end_by_id', () => {
    it('returns success on ending maintenance mode', async () => {
      vi.mocked(maintenanceModeService.endById).mockResolvedValueOnce({ success: true });
      const result = await tc.client.callTool({
        name: 'maintenance_mode_end_by_id',
        arguments: {
          ComputerID: 'test-computer-0001',
          MaintenanceModeId: 'test-mm-0001',
          MaintenanceTypeId: 3,
        },
      });
      expect(result.isError).toBeFalsy();
    });

    it('returns isError:true on ExternalServiceError', async () => {
      vi.mocked(maintenanceModeService.endById).mockRejectedValueOnce(
        new ExternalServiceError('ThreatLocker', 'Forbidden', 403),
      );
      const result = await tc.client.callTool({
        name: 'maintenance_mode_end_by_id',
        arguments: {
          ComputerID: 'test-computer-0001',
          MaintenanceModeId: 'test-mm-0001',
          MaintenanceTypeId: 3,
        },
      });
      expect(result.isError).toBe(true);
    });
  });
});
