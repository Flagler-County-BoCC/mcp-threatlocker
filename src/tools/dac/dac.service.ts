import type { AxiosInstance } from 'axios';
import { createLogger } from '../../lib/logger.js';
import { buildOrgHeaders } from '../../lib/http-client.js';
import type {
  DacAnalysisItemGetByIdInput,
  DacAnalysisResultsGetByParametersInput,
} from './dac.schema.js';

export class DacService {
  private readonly log = createLogger({ module: 'dacService' });

  constructor(private readonly http: AxiosInstance) {}

  async analysisItemGetById(input: DacAnalysisItemGetByIdInput): Promise<unknown> {
    this.log.debug({ analysisItemId: input.analysisItemId }, 'analysisItemGetById');
    const res = await this.http.get('/portalapi/DACAnalysisItem/DACAnalysisItemGetById', {
      params: { analysisItemId: input.analysisItemId },
    });
    return res.data;
  }

  async analysisResultsGetByParameters(
    input: DacAnalysisResultsGetByParametersInput,
  ): Promise<unknown> {
    this.log.debug({ pageNumber: input.pageNumber }, 'analysisResultsGetByParameters');
    const { managedOrganizationId, ...body } = input;
    const res = await this.http.post(
      '/portalapi/DACAnalysisResult/DACAnalysisResultsGetByParameters',
      body,
      {
        headers: buildOrgHeaders(managedOrganizationId),
      },
    );
    return res.data;
  }
}
