import type { AxiosInstance } from 'axios';
import { createLogger } from '../../lib/logger.js';
import type { PermissionGetForAdministratorInput } from './permission.schema.js';

export class PermissionService {
  private readonly log = createLogger({ module: 'permissionService' });

  constructor(private readonly http: AxiosInstance) {}

  async getForAdministrator(_input: PermissionGetForAdministratorInput): Promise<unknown> {
    this.log.debug({}, 'getForAdministrator');
    const res = await this.http.post('/portalapi/Permission/PermissionGetForAdministrator', {});
    return res.data;
  }
}
