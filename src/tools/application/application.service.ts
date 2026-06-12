import type { AxiosInstance } from 'axios';
import { createLogger } from '../../lib/logger.js';
import { buildOrgHeaders } from '../../lib/http-client.js';
import type {
  ApplicationGetByIdInput,
  ApplicationGetByParametersInput,
  ApplicationGetForMaintenanceModeInput,
  ApplicationGetMatchingListInput,
  ApplicationGetResearchDetailsByIdInput,
  ApplicationInsertInput,
  ApplicationUpdateByIdInput,
  ApplicationDeleteInput,
  ApplicationConfirmDeleteInput,
} from './application.schema.js';

export class ApplicationService {
  private readonly log = createLogger({ module: 'applicationService' });

  constructor(private readonly http: AxiosInstance) {}

  async getById(input: ApplicationGetByIdInput): Promise<unknown> {
    this.log.debug({ applicationId: input.applicationId }, 'getById');
    const res = await this.http.get('/portalapi/Application/ApplicationGetById', {
      params: { applicationId: input.applicationId },
      headers: buildOrgHeaders(input.managedOrganizationId),
    });
    return res.data;
  }

  async getByParameters(input: ApplicationGetByParametersInput): Promise<unknown> {
    this.log.debug({ pageNumber: input.pageNumber }, 'getByParameters');
    const { managedOrganizationId, ...body } = input;
    const res = await this.http.post('/portalapi/Application/ApplicationGetByParameters', body, {
      headers: buildOrgHeaders(managedOrganizationId),
    });
    return res.data;
  }

  async getForMaintenanceMode(input: ApplicationGetForMaintenanceModeInput): Promise<unknown> {
    this.log.debug({}, 'getForMaintenanceMode');
    const res = await this.http.get('/portalapi/Application/ApplicationGetForMaintenanceMode', {
      params: { osType: input.osType },
      headers: buildOrgHeaders(input.managedOrganizationId),
    });
    return res.data;
  }

  async getMatchingList(input: ApplicationGetMatchingListInput): Promise<unknown> {
    this.log.debug({}, 'getMatchingList');
    const { managedOrganizationId, ...body } = input;
    const res = await this.http.post('/portalapi/Application/ApplicationGetMatchingList', body, {
      headers: buildOrgHeaders(managedOrganizationId),
    });
    return res.data;
  }

  async getResearchDetailsById(input: ApplicationGetResearchDetailsByIdInput): Promise<unknown> {
    this.log.debug({ applicationId: input.applicationId }, 'getResearchDetailsById');
    const res = await this.http.get('/portalapi/Application/ApplicationGetResearchDetailsById', {
      params: { applicationId: input.applicationId },
      headers: buildOrgHeaders(input.managedOrganizationId),
    });
    return res.data;
  }

  async insert(input: ApplicationInsertInput): Promise<unknown> {
    this.log.debug({ name: input.name }, 'insert');
    const { managedOrganizationId, ...body } = input;
    const res = await this.http.post('/portalapi/Application/ApplicationInsert', body, {
      headers: buildOrgHeaders(managedOrganizationId),
    });
    return res.data;
  }

  async updateById(input: ApplicationUpdateByIdInput): Promise<unknown> {
    this.log.debug({ applicationId: input.applicationId }, 'updateById');
    const { managedOrganizationId, ...body } = input;
    const res = await this.http.put('/portalapi/Application/ApplicationUpdateById', body, {
      headers: buildOrgHeaders(managedOrganizationId),
    });
    return res.data;
  }

  async delete(input: ApplicationDeleteInput): Promise<unknown> {
    this.log.debug({ count: input.applications.length }, 'delete');
    const { managedOrganizationId, ...body } = input;
    const res = await this.http.post('/portalapi/Application/ApplicationUpdateForDelete', body, {
      headers: buildOrgHeaders(managedOrganizationId),
    });
    return res.data;
  }

  async confirmDelete(input: ApplicationConfirmDeleteInput): Promise<unknown> {
    this.log.debug({ count: input.applications.length }, 'confirmDelete');
    const { managedOrganizationId, ...body } = input;
    const res = await this.http.post(
      '/portalapi/Application/ApplicationConfirmUpdateForDelete',
      body,
      {
        headers: buildOrgHeaders(managedOrganizationId),
      },
    );
    return res.data;
  }
}
