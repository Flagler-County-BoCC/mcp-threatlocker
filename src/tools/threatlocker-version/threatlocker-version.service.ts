import type { AxiosInstance } from 'axios';
import { createLogger } from '../../lib/logger.js';
import type { ThreatlockerVersionGetForDropdownInput } from './threatlocker-version.schema.js';

export class ThreatlockerVersionService {
  private readonly log = createLogger({ module: 'threatlockerVersionService' });

  constructor(private readonly http: AxiosInstance) {}

  async getForDropdown(_input: ThreatlockerVersionGetForDropdownInput): Promise<unknown> {
    this.log.debug({}, 'getForDropdown');
    const res = await this.http.get(
      '/portalapi/ThreatLockerVersion/ThreatLockerVersionGetForDropdownList',
    );
    return res.data;
  }
}
