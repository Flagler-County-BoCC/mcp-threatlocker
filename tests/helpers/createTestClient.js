import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
export async function createTestClient(registerFn) {
  const server = new McpServer({ name: 'test-server', version: '0.0.0' });
  registerFn(server);
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);
  const client = new Client({ name: 'test-client', version: '0.0.0' });
  await client.connect(clientTransport);
  return { client, cleanup: async () => client.close() };
}
export function parseText(result) {
  const first = result.content[0];
  if (!first || first.type !== 'text') throw new Error('Expected text content');
  return JSON.parse(first.text);
}
export function getText(result) {
  const first = result.content[0];
  if (!first || first.type !== 'text') throw new Error('Expected text content');
  return first.text;
}
//# sourceMappingURL=createTestClient.js.map
