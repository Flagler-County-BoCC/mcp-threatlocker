import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createTestClient,
  parseText,
  getText,
  type TestClient,
} from '../../../../tests/helpers/createTestClient.js';
import { registerReportTools } from '../report.tool.js';
import { reportService } from '../../../lib/container.js';
import { ExternalServiceError } from '../../../errors/index.js';

vi.mock('../../../lib/container.js');

describe('report MCP tools', () => {
  let tc: TestClient;

  beforeEach(async () => {
    tc = await createTestClient(registerReportTools);
  });

  afterEach(async () => {
    await tc.cleanup();
  });

  describe('report_get_by_organization_id', () => {
    it('returns reports on success', async () => {
      vi.mocked(reportService.getByOrganizationId).mockResolvedValueOnce([
        { id: 'test-report-0001', name: 'Monthly Audit' },
      ]);
      const result = await tc.client.callTool({
        name: 'report_get_by_organization_id',
        arguments: {},
      });
      expect(result.isError).toBeFalsy();
      const parsed = parseText(result) as unknown[];
      expect(parsed).toHaveLength(1);
    });

    it('returns isError:true on ExternalServiceError', async () => {
      vi.mocked(reportService.getByOrganizationId).mockRejectedValueOnce(
        new ExternalServiceError('ThreatLocker', 'Unauthorized', 401),
      );
      const result = await tc.client.callTool({
        name: 'report_get_by_organization_id',
        arguments: {},
      });
      expect(result.isError).toBe(true);
      expect(getText(result)).toMatch(/EXTERNAL_SERVICE_ERROR/);
    });
  });

  describe('report_get_dynamic_data', () => {
    it('returns dynamic data on success', async () => {
      vi.mocked(reportService.getDynamicData).mockResolvedValueOnce({ rows: [], columns: [] });
      const result = await tc.client.callTool({
        name: 'report_get_dynamic_data',
        arguments: { reportId: 'test-report-0001' },
      });
      expect(result.isError).toBeFalsy();
      expect(parseText(result)).toMatchObject({ rows: [] });
    });

    it('returns isError:true when reportId is missing', async () => {
      const result = await tc.client.callTool({ name: 'report_get_dynamic_data', arguments: {} });
      expect(result.isError).toBe(true);
    });
  });
});
