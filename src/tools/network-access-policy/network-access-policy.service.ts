import type { AxiosInstance } from 'axios';
import { createLogger } from '../../lib/logger.js';
import { buildOrgHeaders } from '../../lib/http-client.js';
import type { NetworkAccessPolicyInsertInput } from './network-access-policy.schema.js';

export class NetworkAccessPolicyService {
  private readonly log = createLogger({ module: 'networkAccessPolicyService' });

  constructor(private readonly http: AxiosInstance) {}

  async insert(input: NetworkAccessPolicyInsertInput): Promise<unknown> {
    this.log.debug({ name: input.name, computerGroupId: input.computerGroupId }, 'insert');
    const { managedOrganizationId, ...body } = input;
    const res = await this.http.post(
      '/portalapi/NetworkAccessPolicy/NetworkAccessPolicyInsert',
      body,
      {
        headers: buildOrgHeaders(managedOrganizationId),
      },
    );
    return res.data;
  }
}
