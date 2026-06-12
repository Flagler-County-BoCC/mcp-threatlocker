import type { AxiosInstance } from 'axios';
import { createLogger } from '../../lib/logger.js';
import { buildOrgHeaders } from '../../lib/http-client.js';
import type {
  DeployPoliciesInput,
  DeployPoliciesForComputerInput,
} from './deploy-policy-queue.schema.js';

export class DeployPolicyQueueService {
  private readonly log = createLogger({ module: 'deployPolicyQueueService' });

  constructor(private readonly http: AxiosInstance) {}

  async deployPolicies(input: DeployPoliciesInput): Promise<unknown> {
    this.log.debug({}, 'deployPolicies');
    const res = await this.http.post('/portalapi/DeployPolicyQueue/DeployPolicies', undefined, {
      headers: buildOrgHeaders(input.managedOrganizationId),
    });
    return res.data;
  }

  async deployPoliciesForComputer(input: DeployPoliciesForComputerInput): Promise<unknown> {
    this.log.debug({ computerId: input.computerId }, 'deployPoliciesForComputer');
    const res = await this.http.post(
      '/portalapi/DeployPolicyQueue/DeployPoliciesForComputer',
      undefined,
      {
        params: { computerId: input.computerId, computerName: input.computerName },
        headers: buildOrgHeaders(input.managedOrganizationId),
      },
    );
    return res.data;
  }
}
