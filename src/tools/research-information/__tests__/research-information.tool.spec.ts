import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createTestClient,
  parseText,
  getText,
  type TestClient,
} from '../../../../tests/helpers/createTestClient.js';
import { registerResearchInformationTools } from '../research-information.tool.js';
import { researchInformationService } from '../../../lib/container.js';
import { ExternalServiceError } from '../../../errors/index.js';

vi.mock('../../../lib/container.js');

describe('research-information MCP tools', () => {
  let tc: TestClient;

  beforeEach(async () => {
    tc = await createTestClient(registerResearchInformationTools);
  });

  afterEach(async () => {
    await tc.cleanup();
  });

  describe('research_information_get_all_categories', () => {
    it('returns categories on success', async () => {
      vi.mocked(researchInformationService.getAllCategories).mockResolvedValueOnce([
        { id: 1, name: 'Security' },
        { id: 2, name: 'Productivity' },
      ]);
      const result = await tc.client.callTool({
        name: 'research_information_get_all_categories',
        arguments: {},
      });
      expect(result.isError).toBeFalsy();
      const parsed = parseText(result) as unknown[];
      expect(parsed).toHaveLength(2);
    });

    it('returns isError:true on ExternalServiceError', async () => {
      vi.mocked(researchInformationService.getAllCategories).mockRejectedValueOnce(
        new ExternalServiceError('ThreatLocker', 'Unauthorized', 401),
      );
      const result = await tc.client.callTool({
        name: 'research_information_get_all_categories',
        arguments: {},
      });
      expect(result.isError).toBe(true);
      expect(getText(result)).toMatch(/EXTERNAL_SERVICE_ERROR/);
    });
  });
});
