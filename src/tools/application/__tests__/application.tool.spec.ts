import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createTestClient,
  parseText,
  getText,
  type TestClient,
} from '../../../../tests/helpers/createTestClient.js';
import { registerApplicationTools } from '../application.tool.js';
import { applicationService } from '../../../lib/container.js';
import { ExternalServiceError } from '../../../errors/index.js';

vi.mock('../../../lib/container.js');

describe('application MCP tools', () => {
  let tc: TestClient;

  beforeEach(async () => {
    tc = await createTestClient(registerApplicationTools);
  });

  afterEach(async () => {
    await tc.cleanup();
  });

  describe('application_get_by_id', () => {
    it('returns application data on success', async () => {
      vi.mocked(applicationService.getById).mockResolvedValueOnce({
        id: 'test-app-0001',
        name: 'Chrome',
      });
      const result = await tc.client.callTool({
        name: 'application_get_by_id',
        arguments: { applicationId: 'test-app-0001' },
      });
      expect(result.isError).toBeFalsy();
      expect(parseText(result)).toMatchObject({ id: 'test-app-0001' });
    });

    it('returns isError:true on ExternalServiceError', async () => {
      vi.mocked(applicationService.getById).mockRejectedValueOnce(
        new ExternalServiceError('ThreatLocker', 'Not Found', 404),
      );
      const result = await tc.client.callTool({
        name: 'application_get_by_id',
        arguments: { applicationId: 'test-app-9999' },
      });
      expect(result.isError).toBe(true);
      expect(getText(result)).toMatch(/EXTERNAL_SERVICE_ERROR/);
    });

    it('returns isError:true when applicationId is missing', async () => {
      const result = await tc.client.callTool({ name: 'application_get_by_id', arguments: {} });
      expect(result.isError).toBe(true);
    });
  });

  describe('application_get_by_parameters', () => {
    it('returns paginated list on success', async () => {
      vi.mocked(applicationService.getByParameters).mockResolvedValueOnce({
        items: [{ id: 'test-app-0001' }],
        total: 1,
      });
      const result = await tc.client.callTool({
        name: 'application_get_by_parameters',
        arguments: { orderBy: 'name', searchBy: 'app' },
      });
      expect(result.isError).toBeFalsy();
      expect(parseText(result)).toMatchObject({ total: 1 });
    });

    it('returns isError:true on ExternalServiceError', async () => {
      vi.mocked(applicationService.getByParameters).mockRejectedValueOnce(
        new ExternalServiceError('ThreatLocker', 'Server Error', 500),
      );
      const result = await tc.client.callTool({
        name: 'application_get_by_parameters',
        arguments: { orderBy: 'name', searchBy: 'app' },
      });
      expect(result.isError).toBe(true);
    });
  });

  describe('application_get_research_details_by_id', () => {
    it('returns research details on success', async () => {
      vi.mocked(applicationService.getResearchDetailsById).mockResolvedValueOnce({
        riskRating: 2,
        categories: [],
      });
      const result = await tc.client.callTool({
        name: 'application_get_research_details_by_id',
        arguments: { applicationId: 'test-app-0001' },
      });
      expect(result.isError).toBeFalsy();
      expect(parseText(result)).toMatchObject({ riskRating: 2 });
    });
  });
});
