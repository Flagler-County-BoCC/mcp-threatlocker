import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createTestClient,
  parseText,
  getText,
  type TestClient,
} from '../../../../tests/helpers/createTestClient.js';
import { registerComputerGroupTools } from '../computer-group.tool.js';
import { computerGroupService } from '../../../lib/container.js';
import { ExternalServiceError } from '../../../errors/index.js';

vi.mock('../../../lib/container.js');

describe('computer-group MCP tools', () => {
  let tc: TestClient;

  beforeEach(async () => {
    tc = await createTestClient(registerComputerGroupTools);
  });

  afterEach(async () => {
    await tc.cleanup();
  });

  describe('computer_group_get_by_id', () => {
    it('returns group on success', async () => {
      vi.mocked(computerGroupService.getById).mockResolvedValueOnce({
        id: 'test-group-0001',
        name: 'Workstations',
      });
      const result = await tc.client.callTool({
        name: 'computer_group_get_by_id',
        arguments: { computerGroupId: 'test-group-0001' },
      });
      expect(result.isError).toBeFalsy();
      expect(parseText(result)).toMatchObject({ id: 'test-group-0001' });
    });

    it('returns isError:true on ExternalServiceError', async () => {
      vi.mocked(computerGroupService.getById).mockRejectedValueOnce(
        new ExternalServiceError('ThreatLocker', 'Not Found', 404),
      );
      const result = await tc.client.callTool({
        name: 'computer_group_get_by_id',
        arguments: { computerGroupId: 'test-group-9999' },
      });
      expect(result.isError).toBe(true);
      expect(getText(result)).toMatch(/EXTERNAL_SERVICE_ERROR/);
    });

    it('returns isError:true when computerGroupId is missing', async () => {
      const result = await tc.client.callTool({ name: 'computer_group_get_by_id', arguments: {} });
      expect(result.isError).toBe(true);
    });
  });

  describe('computer_group_get_by_parameters', () => {
    it('returns paginated groups on success', async () => {
      vi.mocked(computerGroupService.getByParameters).mockResolvedValueOnce({
        items: [{ id: 'test-group-0001', name: 'Workstations' }],
        total: 1,
      });
      const result = await tc.client.callTool({
        name: 'computer_group_get_by_parameters',
        arguments: {},
      });
      expect(result.isError).toBeFalsy();
    });
  });

  describe('computer_group_get_group_and_computer', () => {
    it('returns combined list on success', async () => {
      vi.mocked(computerGroupService.getGroupAndComputer).mockResolvedValueOnce([]);
      const result = await tc.client.callTool({
        name: 'computer_group_get_group_and_computer',
        arguments: {},
      });
      expect(result.isError).toBeFalsy();
    });
  });
});
