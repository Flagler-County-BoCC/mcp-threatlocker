import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
export interface TestClient {
  client: Client;
  cleanup: () => Promise<void>;
}
export declare function createTestClient(
  registerFn: (server: McpServer) => void,
): Promise<TestClient>;
export declare function parseText(result: Awaited<ReturnType<Client['callTool']>>): unknown;
export declare function getText(result: Awaited<ReturnType<Client['callTool']>>): string;
//# sourceMappingURL=createTestClient.d.ts.map
