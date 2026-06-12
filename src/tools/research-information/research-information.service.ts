import type { AxiosInstance } from 'axios';
import { createLogger } from '../../lib/logger.js';
import type { ResearchInformationGetAllCategoriesInput } from './research-information.schema.js';

export class ResearchInformationService {
  private readonly log = createLogger({ module: 'researchInformationService' });

  constructor(private readonly http: AxiosInstance) {}

  async getAllCategories(input: ResearchInformationGetAllCategoriesInput): Promise<unknown> {
    this.log.debug({ getStoreCategories: input.getStoreCategories }, 'getAllCategories');
    const res = await this.http.get(
      '/portalapi/ResearchInformation/ResearchInformationGetAllCategories',
      {
        params: { getStoreCategories: input.getStoreCategories },
      },
    );
    return res.data;
  }
}
