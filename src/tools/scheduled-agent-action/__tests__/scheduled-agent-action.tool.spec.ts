import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createTestClient,
  parseText,
  getText,
  type TestClient,
} from '../../../../tests/helpers/createTestClient.js';
import { registerScheduledAgentActionTools } from '../scheduled-agent-action.tool.js';
import { scheduledAgentActionService } from '../../../lib/container.js';
import { ExternalServiceError } from '../../../errors/index.js';

vi.mock('../../../lib/container.js');

describe('scheduled-agent-action MCP tools', () => {
  let tc: TestClient;

  beforeEach(async () => {
    tc = await createTestClient(registerScheduledAgentActionTools);
  });

  afterEach(async () => {
    await tc.cleanup();
  });

  describe('scheduled_agent_action_list', () => {
    it('returns list of scheduled actions on success', async () => {
      vi.mocked(scheduledAgentActionService.list).mockResolvedValueOnce([
        { id: 'test-saa-0001', scheduledType: 1 },
      ]);
      const result = await tc.client.callTool({
        name: 'scheduled_agent_action_list',
        arguments: { scheduledType: 1 },
      });
      expect(result.isError).toBeFalsy();
      const parsed = parseText(result) as unknown[];
      expect(parsed).toHaveLength(1);
    });

    it('returns isError:true on ExternalServiceError', async () => {
      vi.mocked(scheduledAgentActionService.list).mockRejectedValueOnce(
        new ExternalServiceError('ThreatLocker', 'Unauthorized', 401),
      );
      const result = await tc.client.callTool({
        name: 'scheduled_agent_action_list',
        arguments: { scheduledType: 1 },
      });
      expect(result.isError).toBe(true);
      expect(getText(result)).toMatch(/EXTERNAL_SERVICE_ERROR/);
    });

    it('returns isError:true when scheduledType is missing', async () => {
      const result = await tc.client.callTool({
        name: 'scheduled_agent_action_list',
        arguments: {},
      });
      expect(result.isError).toBe(true);
    });
  });

  describe('scheduled_agent_action_get_by_parameters', () => {
    it('returns paginated details on success', async () => {
      vi.mocked(scheduledAgentActionService.getByParameters).mockResolvedValueOnce({
        items: [{ id: 'test-saa-0001', computerName: 'WORKSTATION-01' }],
        total: 1,
      });
      const result = await tc.client.callTool({
        name: 'scheduled_agent_action_get_by_parameters',
        arguments: { scheduledId: 'test-saa-0001' },
      });
      expect(result.isError).toBeFalsy();
      expect(parseText(result)).toMatchObject({ total: 1 });
    });
  });

  describe('scheduled_agent_action_applies_to', () => {
    it('returns targets on success', async () => {
      vi.mocked(scheduledAgentActionService.appliesTo).mockResolvedValueOnce([
        { id: 'test-group-0001', name: 'Workstations' },
      ]);
      const result = await tc.client.callTool({
        name: 'scheduled_agent_action_applies_to',
        arguments: { osType: 1 },
      });
      expect(result.isError).toBeFalsy();
    });
  });
});
