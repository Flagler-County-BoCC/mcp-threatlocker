import type { AxiosInstance } from 'axios';
import { createLogger } from '../../lib/logger.js';
import { buildOrgHeaders } from '../../lib/http-client.js';
import type {
  ApplicationFileGetByApplicationIdInput,
  ApplicationFileInsertInput,
  ApplicationFileUpdateInput,
  ApplicationFileDeleteByIdInput,
} from './application-file.schema.js';

export class ApplicationFileService {
  private readonly log = createLogger({ module: 'applicationFileService' });

  constructor(private readonly http: AxiosInstance) {}

  async getByApplicationId(input: ApplicationFileGetByApplicationIdInput): Promise<unknown> {
    this.log.debug({ applicationId: input.applicationId }, 'getByApplicationId');
    const res = await this.http.get(
      '/portalapi/ApplicationFile/ApplicationFileGetByApplicationId',
      {
        params: {
          applicationId: input.applicationId,
          pageNumber: input.pageNumber,
          pageSize: input.pageSize,
          hashOnly: input.hashOnly,
          isCustomRule: input.isCustomRule,
          searchText: input.searchText,
        },
        headers: buildOrgHeaders(input.managedOrganizationId),
      },
    );
    return res.data;
  }

  async insert(input: ApplicationFileInsertInput): Promise<unknown> {
    this.log.debug({ applicationId: input.applicationId }, 'insert');
    const { managedOrganizationId, ...body } = input;
    const res = await this.http.post('/portalapi/ApplicationFile/ApplicationFileInsert', body, {
      headers: buildOrgHeaders(managedOrganizationId),
    });
    return res.data;
  }

  async update(input: ApplicationFileUpdateInput): Promise<unknown> {
    this.log.debug({ applicationFileId: input.applicationFileId }, 'update');
    const { managedOrganizationId, ...body } = input;
    const res = await this.http.post('/portalapi/ApplicationFile/ApplicationFileUpdate', body, {
      headers: buildOrgHeaders(managedOrganizationId),
    });
    return res.data;
  }

  async deleteById(input: ApplicationFileDeleteByIdInput): Promise<unknown> {
    this.log.debug({ applicationFileId: input.applicationFileId }, 'deleteById');
    const { managedOrganizationId, ...body } = input;
    const res = await this.http.post('/portalapi/ApplicationFile/ApplicationFileDeleteById', body, {
      headers: buildOrgHeaders(managedOrganizationId),
    });
    return res.data;
  }
}
