import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createTestClient,
  parseText,
  getText,
  type TestClient,
} from '../../../../tests/helpers/createTestClient.js';
import { registerComputerTools } from '../computer.tool.js';
import { computerService } from '../../../lib/container.js';
import { ExternalServiceError } from '../../../errors/index.js';

vi.mock('../../../lib/container.js');

describe('computer MCP tools', () => {
  let tc: TestClient;

  beforeEach(async () => {
    tc = await createTestClient(registerComputerTools);
  });

  afterEach(async () => {
    await tc.cleanup();
  });

  describe('computer_get_by_all_parameters', () => {
    it('returns paginated computers on success', async () => {
      vi.mocked(computerService.getByAllParameters).mockResolvedValueOnce({
        items: [{ id: 'test-computer-0001', name: 'WORKSTATION-01' }],
        total: 1,
      });
      const result = await tc.client.callTool({
        name: 'computer_get_by_all_parameters',
        arguments: { orderBy: 'computername', isAscending: true },
      });
      expect(result.isError).toBeFalsy();
      expect(parseText(result)).toMatchObject({ total: 1 });
    });

    it('returns isError:true on ExternalServiceError', async () => {
      vi.mocked(computerService.getByAllParameters).mockRejectedValueOnce(
        new ExternalServiceError('ThreatLocker', 'Unauthorized', 401),
      );
      const result = await tc.client.callTool({
        name: 'computer_get_by_all_parameters',
        arguments: { orderBy: 'computername', isAscending: true },
      });
      expect(result.isError).toBe(true);
      expect(getText(result)).toMatch(/EXTERNAL_SERVICE_ERROR/);
    });
  });

  describe('computer_get_for_edit_by_id', () => {
    it('returns computer details on success', async () => {
      vi.mocked(computerService.getForEditById).mockResolvedValueOnce({
        id: 'test-computer-0001',
        name: 'WORKSTATION-01',
      });
      const result = await tc.client.callTool({
        name: 'computer_get_for_edit_by_id',
        arguments: { computerId: 'test-computer-0001' },
      });
      expect(result.isError).toBeFalsy();
      expect(parseText(result)).toMatchObject({ id: 'test-computer-0001' });
    });

    it('returns isError:true when computerId is missing', async () => {
      const result = await tc.client.callTool({
        name: 'computer_get_for_edit_by_id',
        arguments: {},
      });
      expect(result.isError).toBe(true);
    });
  });

  describe('computer_get_for_new_computer', () => {
    it('returns install keys on success', async () => {
      vi.mocked(computerService.getForNewComputer).mockResolvedValueOnce([
        { groupName: 'Default', installKey: 'KEY-0001-0001-0001-0001-0001-01' },
      ]);
      const result = await tc.client.callTool({
        name: 'computer_get_for_new_computer',
        arguments: {},
      });
      expect(result.isError).toBeFalsy();
    });
  });

  describe('computer_delete_by_ids (write gate)', () => {
    it('returns isError:true on ExternalServiceError', async () => {
      vi.mocked(computerService.deleteByIds).mockRejectedValueOnce(
        new ExternalServiceError('ThreatLocker', 'Forbidden', 403),
      );
      const result = await tc.client.callTool({
        name: 'computer_delete_by_ids',
        arguments: { computers: [{ computerId: 'test-computer-0001' }] },
      });
      expect(result.isError).toBe(true);
    });
  });
});
