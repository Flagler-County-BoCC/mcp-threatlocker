import type { AxiosInstance } from 'axios';
import { createLogger } from '../../lib/logger.js';
import { buildOrgHeaders } from '../../lib/http-client.js';
import type { OnlineDevicesGetByParametersInput } from './online-devices.schema.js';

export class OnlineDevicesService {
  private readonly log = createLogger({ module: 'onlineDevicesService' });

  constructor(private readonly http: AxiosInstance) {}

  async getByParameters(input: OnlineDevicesGetByParametersInput): Promise<unknown> {
    this.log.debug({ pageNumber: input.pageNumber }, 'getByParameters');
    const res = await this.http.get('/portalapi/OnlineDevices/OnlineDevicesGetByParameters', {
      params: { pageSize: input.pageSize, pageNumber: input.pageNumber },
      headers: buildOrgHeaders(input.managedOrganizationId),
    });
    return res.data;
  }
}
