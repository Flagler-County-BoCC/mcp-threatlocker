import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createTestClient,
  parseText,
  getText,
  type TestClient,
} from '../../../../tests/helpers/createTestClient.js';
import { registerUserTools } from '../user.tool.js';
import { userService } from '../../../lib/container.js';
import { ExternalServiceError } from '../../../errors/index.js';

vi.mock('../../../lib/container.js');

describe('user MCP tools', () => {
  let tc: TestClient;

  beforeEach(async () => {
    tc = await createTestClient(registerUserTools);
  });

  afterEach(async () => {
    await tc.cleanup();
  });

  describe('user_get_all_timezones', () => {
    it('returns timezones on success', async () => {
      vi.mocked(userService.getAllTimezones).mockResolvedValueOnce([
        { id: 'America/New_York', displayName: 'Eastern Time' },
        { id: 'America/Chicago', displayName: 'Central Time' },
      ]);
      const result = await tc.client.callTool({
        name: 'user_get_all_timezones',
        arguments: {},
      });
      expect(result.isError).toBeFalsy();
      const parsed = parseText(result) as unknown[];
      expect(parsed).toHaveLength(2);
    });

    it('returns isError:true on ExternalServiceError', async () => {
      vi.mocked(userService.getAllTimezones).mockRejectedValueOnce(
        new ExternalServiceError('ThreatLocker', 'Unauthorized', 401),
      );
      const result = await tc.client.callTool({
        name: 'user_get_all_timezones',
        arguments: {},
      });
      expect(result.isError).toBe(true);
      expect(getText(result)).toMatch(/EXTERNAL_SERVICE_ERROR/);
    });
  });

  describe('user_invite_by_username', () => {
    it('returns success on valid invite', async () => {
      vi.mocked(userService.inviteByUsername).mockResolvedValueOnce({ invited: true });
      const result = await tc.client.callTool({
        name: 'user_invite_by_username',
        arguments: { email: 'test-user-0001@example.com' },
      });
      expect(result.isError).toBeFalsy();
    });

    it('returns isError:true on ExternalServiceError', async () => {
      vi.mocked(userService.inviteByUsername).mockRejectedValueOnce(
        new ExternalServiceError('ThreatLocker', 'Conflict', 409),
      );
      const result = await tc.client.callTool({
        name: 'user_invite_by_username',
        arguments: { email: 'test-user-0001@example.com' },
      });
      expect(result.isError).toBe(true);
    });

    it('returns isError:true for invalid email format', async () => {
      const result = await tc.client.callTool({
        name: 'user_invite_by_username',
        arguments: { email: 'not-an-email' },
      });
      expect(result.isError).toBe(true);
    });
  });
});
