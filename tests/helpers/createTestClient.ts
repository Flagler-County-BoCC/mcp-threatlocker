import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';

export interface TestClient {
  client: Client;
  cleanup: () => Promise<void>;
}

export async function createTestClient(
  registerFn: (server: McpServer) => void,
): Promise<TestClient> {
  const server = new McpServer({ name: 'test-server', version: '0.0.0' });
  registerFn(server);
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);
  const client = new Client({ name: 'test-client', version: '0.0.0' });
  await client.connect(clientTransport);
  return { client, cleanup: async () => client.close() };
}

type ToolCallResult = {
  content: Array<{ type: string; [key: string]: unknown }>;
  isError?: boolean;
};

function asResult(raw: unknown): ToolCallResult {
  return raw as ToolCallResult;
}

export function parseText(result: unknown): unknown {
  const r = asResult(result);
  const first = r.content[0];
  if (!first || first['type'] !== 'text') throw new Error('Expected text content');
  return JSON.parse(first['text'] as string);
}

export function getText(result: unknown): string {
  const r = asResult(result);
  const first = r.content[0];
  if (!first || first['type'] !== 'text') throw new Error('Expected text content');
  return first['text'] as string;
}
