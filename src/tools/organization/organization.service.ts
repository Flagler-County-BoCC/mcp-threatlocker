import type { AxiosInstance } from 'axios';
import { createLogger } from '../../lib/logger.js';
import { buildOrgHeaders } from '../../lib/http-client.js';
import type {
  OrganizationCreateChildInput,
  OrganizationGetAuthKeyInput,
  OrganizationGetChildOrganizationsInput,
  OrganizationGetForMoveComputersInput,
  OrganizationUpdateAuthKeyInput,
} from './organization.schema.js';

export class OrganizationService {
  private readonly log = createLogger({ module: 'organizationService' });

  constructor(private readonly http: AxiosInstance) {}

  async createChild(input: OrganizationCreateChildInput): Promise<unknown> {
    this.log.debug({ displayName: input.displayName }, 'createChild');
    const { managedOrganizationId, ...body } = input;
    const res = await this.http.post('/portalapi/Organization/OrganizationCreateChild', body, {
      headers: buildOrgHeaders(managedOrganizationId),
    });
    return res.data;
  }

  async getAuthKey(input: OrganizationGetAuthKeyInput): Promise<unknown> {
    this.log.debug({}, 'getAuthKey');
    const res = await this.http.get('/portalapi/Organization/OrganizationGetAuthKeyById', {
      headers: buildOrgHeaders(input.managedOrganizationId),
    });
    return res.data;
  }

  async getChildOrganizations(input: OrganizationGetChildOrganizationsInput): Promise<unknown> {
    this.log.debug({ pageNumber: input.pageNumber }, 'getChildOrganizations');
    const { managedOrganizationId, ...body } = input;
    const res = await this.http.post(
      '/portalapi/Organization/OrganizationGetChildOrganizationsByParameters',
      body,
      {
        headers: buildOrgHeaders(managedOrganizationId),
      },
    );
    return res.data;
  }

  async getForMoveComputers(input: OrganizationGetForMoveComputersInput): Promise<unknown> {
    this.log.debug({ searchText: input.searchText }, 'getForMoveComputers');
    const res = await this.http.get('/portalapi/Organization/OrganizationGetForMoveComputers', {
      params: { searchText: input.searchText },
    });
    return res.data;
  }

  async updateAuthKey(input: OrganizationUpdateAuthKeyInput): Promise<unknown> {
    this.log.debug({}, 'updateAuthKey');
    const res = await this.http.post(
      '/portalapi/Organization/OrganizationUpdateAuthKeyById',
      undefined,
      {
        headers: buildOrgHeaders(input.managedOrganizationId),
      },
    );
    return res.data;
  }
}
