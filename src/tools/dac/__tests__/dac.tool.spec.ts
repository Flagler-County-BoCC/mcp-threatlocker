import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createTestClient,
  parseText,
  getText,
  type TestClient,
} from '../../../../tests/helpers/createTestClient.js';
import { registerDacTools } from '../dac.tool.js';
import { dacService } from '../../../lib/container.js';
import { ExternalServiceError } from '../../../errors/index.js';

vi.mock('../../../lib/container.js');

describe('dac MCP tools', () => {
  let tc: TestClient;

  beforeEach(async () => {
    tc = await createTestClient(registerDacTools);
  });

  afterEach(async () => {
    await tc.cleanup();
  });

  describe('dac_analysis_item_get_by_id', () => {
    it('returns analysis item on success', async () => {
      vi.mocked(dacService.analysisItemGetById).mockResolvedValueOnce({
        id: 1,
        title: 'Suspicious Process',
      });
      const result = await tc.client.callTool({
        name: 'dac_analysis_item_get_by_id',
        arguments: { analysisItemId: 1 },
      });
      expect(result.isError).toBeFalsy();
      expect(parseText(result)).toMatchObject({ id: 1 });
    });

    it('returns isError:true on ExternalServiceError', async () => {
      vi.mocked(dacService.analysisItemGetById).mockRejectedValueOnce(
        new ExternalServiceError('ThreatLocker', 'Not Found', 404),
      );
      const result = await tc.client.callTool({
        name: 'dac_analysis_item_get_by_id',
        arguments: { analysisItemId: 9999 },
      });
      expect(result.isError).toBe(true);
      expect(getText(result)).toMatch(/EXTERNAL_SERVICE_ERROR/);
    });

    it('returns isError:true when analysisItemId is missing', async () => {
      const result = await tc.client.callTool({
        name: 'dac_analysis_item_get_by_id',
        arguments: {},
      });
      expect(result.isError).toBe(true);
    });
  });

  describe('dac_analysis_results_get_by_parameters', () => {
    it('returns analysis results on success', async () => {
      vi.mocked(dacService.analysisResultsGetByParameters).mockResolvedValueOnce({
        items: [{ id: 'test-dac-result-0001', criticality: 'High' }],
        total: 1,
      });
      const result = await tc.client.callTool({
        name: 'dac_analysis_results_get_by_parameters',
        arguments: {},
      });
      expect(result.isError).toBeFalsy();
      expect(parseText(result)).toMatchObject({ total: 1 });
    });
  });
});
