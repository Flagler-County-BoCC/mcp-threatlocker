import type { AxiosInstance } from 'axios';
import { createLogger } from '../../lib/logger.js';
import { buildOrgHeaders } from '../../lib/http-client.js';
import type {
  MaintenanceModeGetByComputerIdInput,
  MaintenanceModeInsertInput,
  MaintenanceModeEndByIdInput,
  MaintenanceModeUpdateEndDateInput,
} from './maintenance-mode.schema.js';

export class MaintenanceModeService {
  private readonly log = createLogger({ module: 'maintenanceModeService' });

  constructor(private readonly http: AxiosInstance) {}

  async getByComputerId(input: MaintenanceModeGetByComputerIdInput): Promise<unknown> {
    this.log.debug(
      { computerId: input.computerId, pageNumber: input.pageNumber },
      'getByComputerId',
    );
    const res = await this.http.get('/portalapi/MaintenanceMode/MaintenanceModeGetByComputerIdV2', {
      params: {
        computerId: input.computerId,
        pageNumber: input.pageNumber,
        pageSize: input.pageSize,
      },
      headers: buildOrgHeaders(input.managedOrganizationId),
    });
    return res.data;
  }

  async insert(input: MaintenanceModeInsertInput): Promise<unknown> {
    this.log.debug(
      { computerId: input.computerId, maintenanceTypeId: input.maintenanceTypeId },
      'insert',
    );
    const { managedOrganizationId, ...body } = input;
    const res = await this.http.post('/portalapi/MaintenanceMode/MaintenanceModeInsert', body, {
      headers: buildOrgHeaders(managedOrganizationId),
    });
    return res.data;
  }

  async endById(input: MaintenanceModeEndByIdInput): Promise<unknown> {
    this.log.debug(
      { ComputerID: input.ComputerID, MaintenanceModeId: input.MaintenanceModeId },
      'endById',
    );
    const res = await this.http.patch('/portalapi/MaintenanceMode/MaintenanceModeEndById', input);
    return res.data;
  }

  async updateEndDate(input: MaintenanceModeUpdateEndDateInput): Promise<unknown> {
    this.log.debug({ computerId: input.computerId }, 'updateEndDate');
    const res = await this.http.post(
      '/portalapi/MaintenanceMode/MaintenanceModeUpdateEndDateTimeForSpecificDate',
      input,
    );
    return res.data;
  }
}
