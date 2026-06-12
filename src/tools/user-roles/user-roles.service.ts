import type { AxiosInstance } from 'axios';
import { createLogger } from '../../lib/logger.js';
import type { UserRolesGetByParametersInput } from './user-roles.schema.js';

export class UserRolesService {
  private readonly log = createLogger({ module: 'userRolesService' });

  constructor(private readonly http: AxiosInstance) {}

  async getByParameters(input: UserRolesGetByParametersInput): Promise<unknown> {
    this.log.debug({}, 'getByParameters');
    const res = await this.http.post(
      '/portalapi/UserRoles/UserRolesGetByParameters',
      input.body ?? {},
    );
    return res.data;
  }
}
