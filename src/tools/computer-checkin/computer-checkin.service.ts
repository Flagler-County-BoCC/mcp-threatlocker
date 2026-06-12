import type { AxiosInstance } from 'axios';
import { createLogger } from '../../lib/logger.js';
import { buildOrgHeaders } from '../../lib/http-client.js';
import type { ComputerCheckinGetByParametersInput } from './computer-checkin.schema.js';

export class ComputerCheckinService {
  private readonly log = createLogger({ module: 'computerCheckinService' });

  constructor(private readonly http: AxiosInstance) {}

  async getByParameters(input: ComputerCheckinGetByParametersInput): Promise<unknown> {
    this.log.debug(
      { computerId: input.computerId, pageNumber: input.pageNumber },
      'getByParameters',
    );
    const { managedOrganizationId, ...body } = input;
    const res = await this.http.post(
      '/portalapi/ComputerCheckin/ComputerCheckinGetByParameters',
      body,
      {
        headers: buildOrgHeaders(managedOrganizationId),
      },
    );
    return res.data;
  }
}
