import type { AxiosInstance } from 'axios';
import { createLogger } from '../../lib/logger.js';
import { buildOrgHeaders } from '../../lib/http-client.js';
import type {
  PolicyGetByIdInput,
  PolicyGetByParametersInput,
  PolicyGetForViewByApplicationIdInput,
  PolicyInsertInput,
  PolicyInsertForCopyInput,
  PolicyUpdateByIdInput,
  PolicyDeleteByIdsInput,
} from './policy.schema.js';

export class PolicyService {
  private readonly log = createLogger({ module: 'policyService' });

  constructor(private readonly http: AxiosInstance) {}

  async getById(input: PolicyGetByIdInput): Promise<unknown> {
    this.log.debug({ policyId: input.policyId }, 'getById');
    const res = await this.http.get('/portalapi/Policy/PolicyGetById', {
      params: { policyId: input.policyId },
      headers: buildOrgHeaders(input.managedOrganizationId),
    });
    return res.data;
  }

  async getByParameters(input: PolicyGetByParametersInput): Promise<unknown> {
    this.log.debug({ pageNumber: input.pageNumber, filter: input.filter }, 'getByParameters');
    const { managedOrganizationId, ...body } = input;
    const res = await this.http.post('/portalapi/Policy/PolicyGetByParameters', body, {
      headers: buildOrgHeaders(managedOrganizationId),
    });
    return res.data;
  }

  async getForViewByApplicationId(input: PolicyGetForViewByApplicationIdInput): Promise<unknown> {
    this.log.debug({ applicationId: input.applicationId }, 'getForViewByApplicationId');
    const { managedOrganizationId, ...body } = input;
    const res = await this.http.post(
      '/portalapi/Policy/PolicyGetForViewPoliciesByApplicationId',
      body,
      {
        headers: buildOrgHeaders(managedOrganizationId),
      },
    );
    return res.data;
  }

  async insert(input: PolicyInsertInput): Promise<unknown> {
    this.log.debug({ name: input.name, policyActionId: input.policyActionId }, 'insert');
    const { managedOrganizationId, ...body } = input;
    const res = await this.http.post('/portalapi/Policy/PolicyInsert', body, {
      headers: buildOrgHeaders(managedOrganizationId),
    });
    return res.data;
  }

  async insertForCopy(input: PolicyInsertForCopyInput): Promise<unknown> {
    this.log.debug({ count: input.policies.length }, 'insertForCopy');
    const { managedOrganizationId, ...body } = input;
    const res = await this.http.post('/portalapi/Policy/PolicyInsertForCopyPolicies', body, {
      headers: buildOrgHeaders(managedOrganizationId),
    });
    return res.data;
  }

  async updateById(input: PolicyUpdateByIdInput): Promise<unknown> {
    this.log.debug({ policyId: input.policyId }, 'updateById');
    const { managedOrganizationId, ...body } = input;
    const res = await this.http.put('/portalapi/Policy/PolicyUpdateById', body, {
      headers: buildOrgHeaders(managedOrganizationId),
    });
    return res.data;
  }

  async deleteByIds(input: PolicyDeleteByIdsInput): Promise<unknown> {
    this.log.debug({ count: input.policies.length }, 'deleteByIds');
    const { managedOrganizationId, policies } = input;
    const res = await this.http.put('/portalapi/Policy/PolicyUpdateForDeleteByIds', policies, {
      headers: buildOrgHeaders(managedOrganizationId),
    });
    return res.data;
  }
}
