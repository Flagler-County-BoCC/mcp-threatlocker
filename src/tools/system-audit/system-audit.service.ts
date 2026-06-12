import type { AxiosInstance } from 'axios';
import { createLogger } from '../../lib/logger.js';
import { buildOrgHeaders } from '../../lib/http-client.js';
import type {
  SystemAuditGetByParametersInput,
  SystemAuditGetForHealthCenterInput,
} from './system-audit.schema.js';

export class SystemAuditService {
  private readonly log = createLogger({ module: 'systemAuditService' });

  constructor(private readonly http: AxiosInstance) {}

  async getByParameters(input: SystemAuditGetByParametersInput): Promise<unknown> {
    this.log.debug({ pageNumber: input.pageNumber }, 'getByParameters');
    const { managedOrganizationId, ...body } = input;
    const res = await this.http.post('/portalapi/SystemAudit/SystemAuditGetByParameters', body, {
      headers: buildOrgHeaders(managedOrganizationId),
    });
    return res.data;
  }

  async getForHealthCenter(input: SystemAuditGetForHealthCenterInput): Promise<unknown> {
    this.log.debug({ days: input.days, isLoggedIn: input.isLoggedIn }, 'getForHealthCenter');
    const { managedOrganizationId, ...body } = input;
    const res = await this.http.post('/portalapi/SystemAudit/SystemAuditGetForHealthCenter', body, {
      headers: buildOrgHeaders(managedOrganizationId),
    });
    return res.data;
  }
}
