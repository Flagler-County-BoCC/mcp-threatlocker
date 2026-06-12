import { describe, it, expect, vi } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer } from '../../src/server.js';

vi.mock('../../src/lib/container.js');

describe('server — all tools registered', () => {
  it('registers exactly 90 tools', async () => {
    const server = createServer();
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await server.connect(serverTransport);
    const client = new Client({ name: 'test-client', version: '0.0.0' });
    await client.connect(clientTransport);

    const { tools } = await client.listTools();
    await client.close();

    expect(tools).toHaveLength(90);
  });

  it('registers tools from every module', async () => {
    const server = createServer();
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await server.connect(serverTransport);
    const client = new Client({ name: 'test-client', version: '0.0.0' });
    await client.connect(clientTransport);

    const { tools } = await client.listTools();
    await client.close();

    const names = new Set(tools.map((t) => t.name));

    // Spot-check one tool per module
    expect(names.has('action_log_get_by_parameters')).toBe(true);
    expect(names.has('application_get_by_id')).toBe(true);
    expect(names.has('application_file_get_by_application_id')).toBe(true);
    expect(names.has('approval_request_get_by_parameters')).toBe(true);
    expect(names.has('computer_get_by_all_parameters')).toBe(true);
    expect(names.has('computer_checkin_get_by_parameters')).toBe(true);
    expect(names.has('computer_group_get_by_id')).toBe(true);
    expect(names.has('cm_configuration_get_enabled')).toBe(true);
    expect(names.has('dac_analysis_item_get_by_id')).toBe(true);
    expect(names.has('deploy_policies')).toBe(true);
    expect(names.has('maintenance_mode_get_by_computer_id')).toBe(true);
    expect(names.has('network_access_policy_insert')).toBe(true);
    expect(names.has('online_devices_get_by_parameters')).toBe(true);
    expect(names.has('organization_get_child_organizations')).toBe(true);
    expect(names.has('permission_get_for_administrator')).toBe(true);
    expect(names.has('policy_get_by_id')).toBe(true);
    expect(names.has('report_get_by_organization_id')).toBe(true);
    expect(names.has('research_information_get_all_categories')).toBe(true);
    expect(names.has('scheduled_agent_action_list')).toBe(true);
    expect(names.has('system_audit_get_by_parameters')).toBe(true);
    expect(names.has('tag_get_dropdown_options')).toBe(true);
    expect(names.has('threatlocker_version_get_for_dropdown')).toBe(true);
    expect(names.has('user_get_all_timezones')).toBe(true);
    expect(names.has('user_roles_get_by_parameters')).toBe(true);
  });

  it('all tool descriptions are non-empty strings', async () => {
    const server = createServer();
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await server.connect(serverTransport);
    const client = new Client({ name: 'test-client', version: '0.0.0' });
    await client.connect(clientTransport);

    const { tools } = await client.listTools();
    await client.close();

    for (const tool of tools) {
      expect(typeof tool.description).toBe('string');
      expect(tool.description!.length).toBeGreaterThan(0);
    }
  });

  it('all tool names follow snake_case convention', async () => {
    const server = createServer();
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await server.connect(serverTransport);
    const client = new Client({ name: 'test-client', version: '0.0.0' });
    await client.connect(clientTransport);

    const { tools } = await client.listTools();
    await client.close();

    for (const tool of tools) {
      expect(tool.name).toMatch(/^[a-z][a-z0-9_]*$/);
    }
  });
});
