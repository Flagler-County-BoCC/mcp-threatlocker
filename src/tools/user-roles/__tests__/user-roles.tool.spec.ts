import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createTestClient,
  parseText,
  getText,
  type TestClient,
} from '../../../../tests/helpers/createTestClient.js';
import { registerUserRolesTools } from '../user-roles.tool.js';
import { userRolesService } from '../../../lib/container.js';
import { ExternalServiceError } from '../../../errors/index.js';

vi.mock('../../../lib/container.js');

describe('user-roles MCP tools', () => {
  let tc: TestClient;

  beforeEach(async () => {
    tc = await createTestClient(registerUserRolesTools);
  });

  afterEach(async () => {
    await tc.cleanup();
  });

  describe('user_roles_get_by_parameters', () => {
    it('returns user roles on success', async () => {
      vi.mocked(userRolesService.getByParameters).mockResolvedValueOnce([
        { id: 'test-role-0001', name: 'Administrator' },
        { id: 'test-role-0002', name: 'Viewer' },
      ]);
      const result = await tc.client.callTool({
        name: 'user_roles_get_by_parameters',
        arguments: {},
      });
      expect(result.isError).toBeFalsy();
      const parsed = parseText(result) as unknown[];
      expect(parsed).toHaveLength(2);
    });

    it('returns isError:true on ExternalServiceError', async () => {
      vi.mocked(userRolesService.getByParameters).mockRejectedValueOnce(
        new ExternalServiceError('ThreatLocker', 'Unauthorized', 401),
      );
      const result = await tc.client.callTool({
        name: 'user_roles_get_by_parameters',
        arguments: {},
      });
      expect(result.isError).toBe(true);
      expect(getText(result)).toMatch(/EXTERNAL_SERVICE_ERROR/);
    });
  });
});
