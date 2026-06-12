import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createTestClient,
  parseText,
  getText,
  type TestClient,
} from '../../../../tests/helpers/createTestClient.js';
import { registerPermissionTools } from '../permission.tool.js';
import { permissionService } from '../../../lib/container.js';
import { ExternalServiceError } from '../../../errors/index.js';

vi.mock('../../../lib/container.js');

describe('permission MCP tools', () => {
  let tc: TestClient;

  beforeEach(async () => {
    tc = await createTestClient(registerPermissionTools);
  });

  afterEach(async () => {
    await tc.cleanup();
  });

  describe('permission_get_for_administrator', () => {
    it('returns permissions on success', async () => {
      vi.mocked(permissionService.getForAdministrator).mockResolvedValueOnce({
        canViewComputers: true,
        canEditPolicies: false,
      });
      const result = await tc.client.callTool({
        name: 'permission_get_for_administrator',
        arguments: {},
      });
      expect(result.isError).toBeFalsy();
      expect(parseText(result)).toMatchObject({ canViewComputers: true });
    });

    it('returns isError:true on ExternalServiceError', async () => {
      vi.mocked(permissionService.getForAdministrator).mockRejectedValueOnce(
        new ExternalServiceError('ThreatLocker', 'Unauthorized', 401),
      );
      const result = await tc.client.callTool({
        name: 'permission_get_for_administrator',
        arguments: {},
      });
      expect(result.isError).toBe(true);
      expect(getText(result)).toMatch(/EXTERNAL_SERVICE_ERROR/);
    });
  });
});
