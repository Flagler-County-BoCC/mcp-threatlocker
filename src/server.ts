import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { config } from './config/index.js';
import { createLogger } from './lib/logger.js';
import { WRITE_TOOL_NAMES, isToolAllowedForProfile, blockedResult } from './lib/profile.js';
import { registerActionLogTools } from './tools/action-log/action-log.tool.js';
import { registerApplicationTools } from './tools/application/application.tool.js';
import { registerApplicationFileTools } from './tools/application-file/application-file.tool.js';
import { registerApprovalRequestTools } from './tools/approval-request/approval-request.tool.js';
import { registerComputerTools } from './tools/computer/computer.tool.js';
import { registerComputerCheckinTools } from './tools/computer-checkin/computer-checkin.tool.js';
import { registerComputerGroupTools } from './tools/computer-group/computer-group.tool.js';
import { registerConfigManagerTools } from './tools/config-manager/config-manager.tool.js';
import { registerDacTools } from './tools/dac/dac.tool.js';
import { registerDeployPolicyQueueTools } from './tools/deploy-policy-queue/deploy-policy-queue.tool.js';
import { registerMaintenanceModeTools } from './tools/maintenance-mode/maintenance-mode.tool.js';
import { registerNetworkAccessPolicyTools } from './tools/network-access-policy/network-access-policy.tool.js';
import { registerOnlineDevicesTools } from './tools/online-devices/online-devices.tool.js';
import { registerOrganizationTools } from './tools/organization/organization.tool.js';
import { registerPermissionTools } from './tools/permission/permission.tool.js';
import { registerPolicyTools } from './tools/policy/policy.tool.js';
import { registerReportTools } from './tools/report/report.tool.js';
import { registerResearchInformationTools } from './tools/research-information/research-information.tool.js';
import { registerScheduledAgentActionTools } from './tools/scheduled-agent-action/scheduled-agent-action.tool.js';
import { registerSystemAuditTools } from './tools/system-audit/system-audit.tool.js';
import { registerTagTools } from './tools/tag/tag.tool.js';
import { registerThreatlockerVersionTools } from './tools/threatlocker-version/threatlocker-version.tool.js';
import { registerUserTools } from './tools/user/user.tool.js';
import { registerUserRolesTools } from './tools/user-roles/user-roles.tool.js';

const log = createLogger({ module: 'server' });

/**
 * Wraps an McpServer so that every write tool handler (identified by WRITE_TOOL_NAMES)
 * is gated behind isToolAllowedForProfile() before executing. The underlying server
 * instance is unchanged — only registration is intercepted.
 */
function applyWriteGate(server: McpServer): McpServer {
  // Cache the bound tool() method so the correct `this` is always used.
  const boundTool = server.tool.bind(server) as (...a: unknown[]) => unknown;

  const proxy = new Proxy(server, {
    get(target: McpServer, prop: string | symbol): unknown {
      if (prop !== 'tool') return Reflect.get(target, prop, target);

      return function (name: string, ...rest: unknown[]) {
        if (WRITE_TOOL_NAMES.has(name)) {
          const originalCb = rest[rest.length - 1] as (
            ...args: unknown[]
          ) => Promise<CallToolResult>;
          const guardedCb = async (...args: unknown[]): Promise<CallToolResult> => {
            if (!isToolAllowedForProfile(name)) return blockedResult(name);
            if (config.mcp.requireConfirm) {
              log.warn({ toolName: name }, 'WRITE OPERATION EXECUTED');
            }
            return originalCb(...args);
          };
          return boundTool(name, ...[...rest.slice(0, -1), guardedCb]);
        }
        return boundTool(name, ...rest);
      };
    },
  });
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  return proxy as unknown as McpServer;
}

export function createServer(): McpServer {
  const rawServer = new McpServer({
    name: 'mcp-threatlocker',
    version: process.env['npm_package_version'] ?? '1.0.0',
  });

  const server = applyWriteGate(rawServer);

  registerActionLogTools(server);
  registerApplicationTools(server);
  registerApplicationFileTools(server);
  registerApprovalRequestTools(server);
  registerComputerTools(server);
  registerComputerCheckinTools(server);
  registerComputerGroupTools(server);
  registerConfigManagerTools(server);
  registerDacTools(server);
  registerDeployPolicyQueueTools(server);
  registerMaintenanceModeTools(server);
  registerNetworkAccessPolicyTools(server);
  registerOnlineDevicesTools(server);
  registerOrganizationTools(server);
  registerPermissionTools(server);
  registerPolicyTools(server);
  registerReportTools(server);
  registerResearchInformationTools(server);
  registerScheduledAgentActionTools(server);
  registerSystemAuditTools(server);
  registerTagTools(server);
  registerThreatlockerVersionTools(server);
  registerUserTools(server);
  registerUserRolesTools(server);

  return rawServer;
}
