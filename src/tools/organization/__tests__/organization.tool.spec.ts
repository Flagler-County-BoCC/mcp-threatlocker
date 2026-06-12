import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createTestClient,
  parseText,
  getText,
  type TestClient,
} from '../../../../tests/helpers/createTestClient.js';
import { registerOrganizationTools } from '../organization.tool.js';
import { organizationService } from '../../../lib/container.js';
import { ExternalServiceError } from '../../../errors/index.js';

vi.mock('../../../lib/container.js');

describe('organization MCP tools', () => {
  let tc: TestClient;

  beforeEach(async () => {
    tc = await createTestClient(registerOrganizationTools);
  });

  afterEach(async () => {
    await tc.cleanup();
  });

  describe('organization_get_child_organizations', () => {
    it('returns paginated organizations on success', async () => {
      vi.mocked(organizationService.getChildOrganizations).mockResolvedValueOnce({
        items: [{ id: 'test-org-0001', name: 'Acme Corp' }],
        total: 1,
      });
      const result = await tc.client.callTool({
        name: 'organization_get_child_organizations',
        arguments: {},
      });
      expect(result.isError).toBeFalsy();
      expect(parseText(result)).toMatchObject({ total: 1 });
    });

    it('returns isError:true on ExternalServiceError', async () => {
      vi.mocked(organizationService.getChildOrganizations).mockRejectedValueOnce(
        new ExternalServiceError('ThreatLocker', 'Unauthorized', 401),
      );
      const result = await tc.client.callTool({
        name: 'organization_get_child_organizations',
        arguments: {},
      });
      expect(result.isError).toBe(true);
      expect(getText(result)).toMatch(/EXTERNAL_SERVICE_ERROR/);
    });
  });

  describe('organization_get_auth_key', () => {
    it('returns auth key on success', async () => {
      vi.mocked(organizationService.getAuthKey).mockResolvedValueOnce({ authKey: 'test-key-0001' });
      const result = await tc.client.callTool({
        name: 'organization_get_auth_key',
        arguments: {},
      });
      expect(result.isError).toBeFalsy();
      expect(parseText(result)).toMatchObject({ authKey: 'test-key-0001' });
    });
  });

  describe('organization_get_for_move_computers', () => {
    it('returns organizations for move on success', async () => {
      vi.mocked(organizationService.getForMoveComputers).mockResolvedValueOnce([
        { id: 'test-org-0001', name: 'Acme Corp' },
      ]);
      const result = await tc.client.callTool({
        name: 'organization_get_for_move_computers',
        arguments: {},
      });
      expect(result.isError).toBeFalsy();
    });
  });
});
