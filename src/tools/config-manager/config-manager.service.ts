import type { AxiosInstance } from 'axios';
import { createLogger } from '../../lib/logger.js';
import { buildOrgHeaders } from '../../lib/http-client.js';
import type {
  CmConfigurationGetEnabledInput,
  CmPolicyGetByParametersInput,
} from './config-manager.schema.js';

export class ConfigManagerService {
  private readonly log = createLogger({ module: 'configManagerService' });

  constructor(private readonly http: AxiosInstance) {}

  async configurationGetEnabled(_input: CmConfigurationGetEnabledInput): Promise<unknown> {
    this.log.debug({}, 'configurationGetEnabled');
    const res = await this.http.get(
      '/portalapi/CMConfiguration/CMConfigurationGetWithCategoryByIsEnabled',
    );
    return res.data;
  }

  async policyGetByParameters(input: CmPolicyGetByParametersInput): Promise<unknown> {
    this.log.debug({ pageNumber: input.pageNumber }, 'policyGetByParameters');
    const { managedOrganizationId, ...body } = input;
    const res = await this.http.post('/portalapi/CMPolicy/CMPolicyGetbyParameters', body, {
      headers: buildOrgHeaders(managedOrganizationId),
    });
    return res.data;
  }
}
