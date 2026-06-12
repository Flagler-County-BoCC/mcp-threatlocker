import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createTestClient,
  parseText,
  getText,
  type TestClient,
} from '../helpers/createTestClient.js';
import { registerComputerTools } from '../../src/tools/computer/computer.tool.js';
import { computerService } from '../../src/lib/container.js';
import { ExternalServiceError } from '../../src/errors/index.js';

vi.mock('../../src/lib/container.js');

describe('computer tools — integration', () => {
  let tc: TestClient;

  beforeEach(async () => {
    tc = await createTestClient(registerComputerTools);
  });

  afterEach(async () => {
    await tc.cleanup();
  });

  it('lists all 18 tools from computer module', async () => {
    const { tools } = await tc.client.listTools();
    const names = tools.map((t) => t.name);
    expect(names).toContain('computer_get_by_all_parameters');
    expect(names).toContain('computer_get_for_edit_by_id');
    expect(names).toContain('computer_get_for_new_computer');
    expect(names).toContain('computer_get_download');
    expect(names).toContain('computer_signed_script_download');
    expect(names).toContain('computer_sample_path_download');
    expect(names).toContain('computer_unsigned_script_download');
    expect(names).toContain('computer_update_for_edit');
    expect(names).toContain('computer_update_baseline_rescan');
    expect(names).toContain('computer_update_should_restart_by_ids');
    expect(names).toContain('computer_update_should_restart_by_organization');
    expect(names).toContain('computer_move_to_other_organization');
    expect(names).toContain('computer_enable_protection');
    expect(names).toContain('computer_disable_protection');
    expect(names).toContain('computer_remove_duplicate');
    expect(names).toContain('computer_update_maintenance_mode');
    expect(names).toContain('computer_update_threatlocker_version_by_ids');
    expect(names).toContain('computer_delete_by_ids');
    expect(tools).toHaveLength(18);
  });

  it('propagates managedOrganizationId via params', async () => {
    let capturedInput: unknown;
    vi.mocked(computerService.getByAllParameters).mockImplementationOnce(async (input) => {
      capturedInput = input;
      return { items: [], total: 0 };
    });
    await tc.client.callTool({
      name: 'computer_get_by_all_parameters',
      // use valid UUID format for managedOrganizationId
      arguments: {
        orderBy: 'computername',
        isAscending: true,
        managedOrganizationId: '00000000-0000-0000-0000-000000000001',
      },
    });
    expect(capturedInput).toMatchObject({
      managedOrganizationId: '00000000-0000-0000-0000-000000000001',
    });
  });

  it('returns isError:true and EXTERNAL_SERVICE_ERROR code for 401', async () => {
    vi.mocked(computerService.getByAllParameters).mockRejectedValueOnce(
      new ExternalServiceError('ThreatLocker', 'Unauthorized', 401),
    );
    const result = await tc.client.callTool({
      name: 'computer_get_by_all_parameters',
      arguments: { orderBy: 'computername', isAscending: true },
    });
    expect(result.isError).toBe(true);
    expect(getText(result)).toContain('EXTERNAL_SERVICE_ERROR');
  });

  it('returns isError:true for 500', async () => {
    vi.mocked(computerService.getByAllParameters).mockRejectedValueOnce(
      new ExternalServiceError('ThreatLocker', 'Internal Server Error', 500),
    );
    const result = await tc.client.callTool({
      name: 'computer_get_by_all_parameters',
      arguments: { orderBy: 'computername', isAscending: true },
    });
    expect(result.isError).toBe(true);
  });

  it('serialises result as pretty-printed JSON', async () => {
    const payload = { items: [{ id: 'test-computer-0001', name: 'WS-01' }], total: 1 };
    vi.mocked(computerService.getByAllParameters).mockResolvedValueOnce(payload);
    const result = await tc.client.callTool({
      name: 'computer_get_by_all_parameters',
      arguments: { orderBy: 'computername', isAscending: false },
    });
    expect(result.isError).toBeFalsy();
    const parsed = parseText(result);
    expect(parsed).toEqual(payload);
  });

  it('returns isError:true for unknown tool names (SDK resolves, does not throw)', async () => {
    const result = await tc.client.callTool({ name: 'computer_nonexistent', arguments: {} });
    expect(result.isError).toBe(true);
  });
});
