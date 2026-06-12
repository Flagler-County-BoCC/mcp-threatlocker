import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createTestClient,
  parseText,
  getText,
  type TestClient,
} from '../../../../tests/helpers/createTestClient.js';
import { registerThreatlockerVersionTools } from '../threatlocker-version.tool.js';
import { threatlockerVersionService } from '../../../lib/container.js';
import { ExternalServiceError } from '../../../errors/index.js';

vi.mock('../../../lib/container.js');

describe('threatlocker-version MCP tools', () => {
  let tc: TestClient;

  beforeEach(async () => {
    tc = await createTestClient(registerThreatlockerVersionTools);
  });

  afterEach(async () => {
    await tc.cleanup();
  });

  describe('threatlocker_version_get_for_dropdown', () => {
    it('returns versions on success', async () => {
      vi.mocked(threatlockerVersionService.getForDropdown).mockResolvedValueOnce([
        { version: '10.7.3', label: '10.7.3 (Latest)' },
        { version: '10.7.2', label: '10.7.2' },
      ]);
      const result = await tc.client.callTool({
        name: 'threatlocker_version_get_for_dropdown',
        arguments: {},
      });
      expect(result.isError).toBeFalsy();
      const parsed = parseText(result) as unknown[];
      expect(parsed).toHaveLength(2);
    });

    it('returns isError:true on ExternalServiceError', async () => {
      vi.mocked(threatlockerVersionService.getForDropdown).mockRejectedValueOnce(
        new ExternalServiceError('ThreatLocker', 'Unauthorized', 401),
      );
      const result = await tc.client.callTool({
        name: 'threatlocker_version_get_for_dropdown',
        arguments: {},
      });
      expect(result.isError).toBe(true);
      expect(getText(result)).toMatch(/EXTERNAL_SERVICE_ERROR/);
    });
  });
});
