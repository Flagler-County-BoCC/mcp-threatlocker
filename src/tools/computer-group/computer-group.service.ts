import type { AxiosInstance } from 'axios';
import { createLogger } from '../../lib/logger.js';
import { buildOrgHeaders } from '../../lib/http-client.js';
import type {
  ComputerGroupGetByIdInput,
  ComputerGroupGetByParametersInput,
  ComputerGroupGetDropdownWithOrganizationInput,
  ComputerGroupGetDropdownByOrganizationIdInput,
  ComputerGroupGetForDownloadInput,
  ComputerGroupGetForPermitApplicationInput,
  ComputerGroupGetGroupAndComputerInput,
  ComputerGroupInsertInput,
  ComputerGroupUpdateByIdInput,
  ComputerGroupDeleteInput,
} from './computer-group.schema.js';

export class ComputerGroupService {
  private readonly log = createLogger({ module: 'computerGroupService' });

  constructor(private readonly http: AxiosInstance) {}

  async getById(input: ComputerGroupGetByIdInput): Promise<unknown> {
    this.log.debug({ computerGroupId: input.computerGroupId }, 'getById');
    const res = await this.http.get('/portalapi/ComputerGroup/ComputerGroupGetById', {
      params: { computerGroupId: input.computerGroupId },
      headers: buildOrgHeaders(input.managedOrganizationId),
    });
    return res.data;
  }

  async getByParameters(input: ComputerGroupGetByParametersInput): Promise<unknown> {
    this.log.debug({ pageNumber: input.pageNumber }, 'getByParameters');
    const { managedOrganizationId, ...body } = input;
    const res = await this.http.post(
      '/portalapi/ComputerGroup/ComputerGroupGetByParameters',
      body,
      {
        headers: buildOrgHeaders(managedOrganizationId),
      },
    );
    return res.data;
  }

  async getDropdownWithOrganization(
    input: ComputerGroupGetDropdownWithOrganizationInput,
  ): Promise<unknown> {
    this.log.debug({}, 'getDropdownWithOrganization');
    const res = await this.http.get(
      '/portalapi/ComputerGroup/ComputerGroupGetDropdownWithOrganization',
      {
        params: { includeAvailableOrganizations: input.includeAvailableOrganizations },
        headers: buildOrgHeaders(input.managedOrganizationId),
      },
    );
    return res.data;
  }

  async getDropdownByOrganizationId(
    input: ComputerGroupGetDropdownByOrganizationIdInput,
  ): Promise<unknown> {
    this.log.debug({}, 'getDropdownByOrganizationId');
    const res = await this.http.get(
      '/portalapi/ComputerGroup/ComputerGroupGetDropdownByOrganizationId',
      {
        params: {
          computerGroupOSTypeId: input.computerGroupOSTypeId,
          computerOSType: input.computerOSType,
        },
        headers: buildOrgHeaders(input.managedOrganizationId),
      },
    );
    return res.data;
  }

  async getForDownload(input: ComputerGroupGetForDownloadInput): Promise<unknown> {
    this.log.debug({}, 'getForDownload');
    const res = await this.http.get('/portalapi/ComputerGroup/ComputerGroupGetForDownload', {
      params: { installKey: input.installKey },
    });
    return res.data;
  }

  async getForPermitApplication(
    input: ComputerGroupGetForPermitApplicationInput,
  ): Promise<unknown> {
    this.log.debug({ osType: input.osType }, 'getForPermitApplication');
    const res = await this.http.get(
      '/portalapi/ComputerGroup/ComputerGroupGetForPermitApplication',
      {
        params: { osType: input.osType },
        headers: buildOrgHeaders(input.managedOrganizationId),
      },
    );
    return res.data;
  }

  async getGroupAndComputer(input: ComputerGroupGetGroupAndComputerInput): Promise<unknown> {
    this.log.debug({ OSType: input.OSType }, 'getGroupAndComputer');
    const res = await this.http.get('/portalapi/ComputerGroup/ComputerGroupGetGroupAndComputer', {
      params: {
        OSType: input.OSType,
        includeGlobal: input.includeGlobal,
        includeOrganizations: input.includeOrganizations,
        includeParentGroups: input.includeParentGroups,
        includeLoggedInObjects: input.includeLoggedInObjects,
      },
      headers: buildOrgHeaders(input.managedOrganizationId),
    });
    return res.data;
  }

  async insert(input: ComputerGroupInsertInput): Promise<unknown> {
    this.log.debug({ name: input.name }, 'insert');
    const { managedOrganizationId, ...body } = input;
    const res = await this.http.post('/portalapi/ComputerGroup/ComputerGroupInsert', body, {
      headers: buildOrgHeaders(managedOrganizationId),
    });
    return res.data;
  }

  async updateById(input: ComputerGroupUpdateByIdInput): Promise<unknown> {
    this.log.debug({ computerGroupId: input.computerGroupId }, 'updateById');
    const { managedOrganizationId, ...body } = input;
    const res = await this.http.post('/portalapi/ComputerGroup/ComputerGroupUpdateById', body, {
      headers: buildOrgHeaders(managedOrganizationId),
    });
    return res.data;
  }

  async delete(input: ComputerGroupDeleteInput): Promise<unknown> {
    this.log.debug({ count: input.groups.length }, 'delete');
    const { managedOrganizationId, groups } = input;
    const res = await this.http.post(
      '/portalapi/ComputerGroup/ComputerGroupUpdateForDelete',
      groups,
      {
        headers: buildOrgHeaders(managedOrganizationId),
      },
    );
    return res.data;
  }
}
