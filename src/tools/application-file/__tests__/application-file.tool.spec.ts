import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createTestClient,
  parseText,
  getText,
  type TestClient,
} from '../../../../tests/helpers/createTestClient.js';
import { registerApplicationFileTools } from '../application-file.tool.js';
import { applicationFileService } from '../../../lib/container.js';
import { ExternalServiceError } from '../../../errors/index.js';

vi.mock('../../../lib/container.js');

describe('application-file MCP tools', () => {
  let tc: TestClient;

  beforeEach(async () => {
    tc = await createTestClient(registerApplicationFileTools);
  });

  afterEach(async () => {
    await tc.cleanup();
  });

  describe('application_file_get_by_application_id', () => {
    it('returns file rules on success', async () => {
      vi.mocked(applicationFileService.getByApplicationId).mockResolvedValueOnce({
        items: [{ id: 1, hash: 'abc123' }],
        total: 1,
      });
      const result = await tc.client.callTool({
        name: 'application_file_get_by_application_id',
        arguments: { applicationId: 'test-app-0001' },
      });
      expect(result.isError).toBeFalsy();
      expect(parseText(result)).toMatchObject({ total: 1 });
    });

    it('returns isError:true on ExternalServiceError', async () => {
      vi.mocked(applicationFileService.getByApplicationId).mockRejectedValueOnce(
        new ExternalServiceError('ThreatLocker', 'Forbidden', 403),
      );
      const result = await tc.client.callTool({
        name: 'application_file_get_by_application_id',
        arguments: { applicationId: 'test-app-0001' },
      });
      expect(result.isError).toBe(true);
      expect(getText(result)).toMatch(/EXTERNAL_SERVICE_ERROR/);
    });

    it('returns isError:true when applicationId is missing', async () => {
      const result = await tc.client.callTool({
        name: 'application_file_get_by_application_id',
        arguments: {},
      });
      expect(result.isError).toBe(true);
    });
  });
});
