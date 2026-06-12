import type { AxiosInstance } from 'axios';
import { createLogger } from '../../lib/logger.js';
import { buildOrgHeaders } from '../../lib/http-client.js';
import type { ActionLogGetByParametersInput } from './action-log.schema.js';

export class ActionLogService {
  private readonly log = createLogger({ module: 'actionLogService' });

  constructor(private readonly http: AxiosInstance) {}

  async getByParameters(input: ActionLogGetByParametersInput): Promise<unknown> {
    this.log.debug({ pageNumber: input.pageNumber }, 'getByParameters');
    const { managedOrganizationId, ...body } = input;
    const res = await this.http.post('/portalapi/ActionLog/ActionLogGetByParametersV2', body, {
      headers: { usenewsearch: 'true', ...buildOrgHeaders(managedOrganizationId) },
    });
    return res.data;
  }
}
