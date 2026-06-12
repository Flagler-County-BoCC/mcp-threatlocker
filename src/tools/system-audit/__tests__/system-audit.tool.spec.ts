import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createTestClient,
  parseText,
  getText,
  type TestClient,
} from '../../../../tests/helpers/createTestClient.js';
import { registerSystemAuditTools } from '../system-audit.tool.js';
import { systemAuditService } from '../../../lib/container.js';
import { ExternalServiceError } from '../../../errors/index.js';

vi.mock('../../../lib/container.js');

describe('system-audit MCP tools', () => {
  let tc: TestClient;

  beforeEach(async () => {
    tc = await createTestClient(registerSystemAuditTools);
  });

  afterEach(async () => {
    await tc.cleanup();
  });

  describe('system_audit_get_by_parameters', () => {
    it('returns audit logs on success', async () => {
      vi.mocked(systemAuditService.getByParameters).mockResolvedValueOnce({
        items: [{ id: 'test-audit-0001', action: 'Logon', emailAddress: 'admin@test.com' }],
        total: 1,
      });
      const result = await tc.client.callTool({
        name: 'system_audit_get_by_parameters',
        arguments: { startDate: '2024-01-01', endDate: '2024-01-31' },
      });
      expect(result.isError).toBeFalsy();
      expect(parseText(result)).toMatchObject({ total: 1 });
    });

    it('returns isError:true on ExternalServiceError', async () => {
      vi.mocked(systemAuditService.getByParameters).mockRejectedValueOnce(
        new ExternalServiceError('ThreatLocker', 'Unauthorized', 401),
      );
      const result = await tc.client.callTool({
        name: 'system_audit_get_by_parameters',
        arguments: { startDate: '2024-01-01', endDate: '2024-01-31' },
      });
      expect(result.isError).toBe(true);
      expect(getText(result)).toMatch(/EXTERNAL_SERVICE_ERROR/);
    });

    it('returns isError:true when date fields are missing', async () => {
      const result = await tc.client.callTool({
        name: 'system_audit_get_by_parameters',
        arguments: {},
      });
      expect(result.isError).toBe(true);
    });
  });

  describe('system_audit_get_for_health_center', () => {
    it('returns health center audit data on success', async () => {
      vi.mocked(systemAuditService.getForHealthCenter).mockResolvedValueOnce({
        items: [],
        total: 0,
      });
      const result = await tc.client.callTool({
        name: 'system_audit_get_for_health_center',
        arguments: { days: 7, isLoggedIn: true },
      });
      expect(result.isError).toBeFalsy();
    });

    it('returns isError:true when required fields are missing', async () => {
      const result = await tc.client.callTool({
        name: 'system_audit_get_for_health_center',
        arguments: {},
      });
      expect(result.isError).toBe(true);
    });
  });
});
