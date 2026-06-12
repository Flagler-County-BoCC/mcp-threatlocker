import type { AxiosInstance } from 'axios';
import { createLogger } from '../../lib/logger.js';
import { buildOrgHeaders } from '../../lib/http-client.js';
import type { TagGetDropdownOptionsInput } from './tag.schema.js';

export class TagService {
  private readonly log = createLogger({ module: 'tagService' });

  constructor(private readonly http: AxiosInstance) {}

  async getDropdownOptions(input: TagGetDropdownOptionsInput): Promise<unknown> {
    this.log.debug({}, 'getDropdownOptions');
    const res = await this.http.get('/portalapi/Tag/TagGetDowndownOptionsByOrganizationId', {
      headers: buildOrgHeaders(input.managedOrganizationId),
    });
    return res.data;
  }
}
