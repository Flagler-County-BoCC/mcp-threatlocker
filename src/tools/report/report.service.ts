import type { AxiosInstance } from 'axios';
import { createLogger } from '../../lib/logger.js';
import { buildOrgHeaders } from '../../lib/http-client.js';
import type { ReportGetByOrganizationIdInput, ReportGetDynamicDataInput } from './report.schema.js';

export class ReportService {
  private readonly log = createLogger({ module: 'reportService' });

  constructor(private readonly http: AxiosInstance) {}

  async getByOrganizationId(input: ReportGetByOrganizationIdInput): Promise<unknown> {
    this.log.debug({}, 'getByOrganizationId');
    const res = await this.http.get('/portalapi/Report/ReportGetByOrganizationId', {
      headers: buildOrgHeaders(input.managedOrganizationId),
    });
    return res.data;
  }

  async getDynamicData(input: ReportGetDynamicDataInput): Promise<unknown> {
    this.log.debug({ reportId: input.reportId }, 'getDynamicData');
    const { managedOrganizationId, ...body } = input;
    const res = await this.http.post('/portalapi/Report/ReportGetDynamicData', body, {
      headers: buildOrgHeaders(managedOrganizationId),
    });
    return res.data;
  }
}
