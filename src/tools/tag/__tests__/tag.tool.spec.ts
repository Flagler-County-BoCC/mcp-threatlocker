import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createTestClient,
  parseText,
  getText,
  type TestClient,
} from '../../../../tests/helpers/createTestClient.js';
import { registerTagTools } from '../tag.tool.js';
import { tagService } from '../../../lib/container.js';
import { ExternalServiceError } from '../../../errors/index.js';

vi.mock('../../../lib/container.js');

describe('tag MCP tools', () => {
  let tc: TestClient;

  beforeEach(async () => {
    tc = await createTestClient(registerTagTools);
  });

  afterEach(async () => {
    await tc.cleanup();
  });

  describe('tag_get_dropdown_options', () => {
    it('returns tag options on success', async () => {
      vi.mocked(tagService.getDropdownOptions).mockResolvedValueOnce([
        { id: 'test-tag-0001', name: 'Critical' },
        { id: 'test-tag-0002', name: 'Development' },
      ]);
      const result = await tc.client.callTool({
        name: 'tag_get_dropdown_options',
        arguments: {},
      });
      expect(result.isError).toBeFalsy();
      const parsed = parseText(result) as unknown[];
      expect(parsed).toHaveLength(2);
    });

    it('returns isError:true on ExternalServiceError', async () => {
      vi.mocked(tagService.getDropdownOptions).mockRejectedValueOnce(
        new ExternalServiceError('ThreatLocker', 'Unauthorized', 401),
      );
      const result = await tc.client.callTool({
        name: 'tag_get_dropdown_options',
        arguments: {},
      });
      expect(result.isError).toBe(true);
      expect(getText(result)).toMatch(/EXTERNAL_SERVICE_ERROR/);
    });
  });
});
