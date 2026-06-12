import type { AxiosInstance } from 'axios';
import { createLogger } from '../../lib/logger.js';
import type { UserGetAllTimezonesInput, UserInviteByUsernameInput } from './user.schema.js';

export class UserService {
  private readonly log = createLogger({ module: 'userService' });

  constructor(private readonly http: AxiosInstance) {}

  async getAllTimezones(_input: UserGetAllTimezonesInput): Promise<unknown> {
    this.log.debug({}, 'getAllTimezones');
    const res = await this.http.get('/portalapi/User/UserGetAllTimezones');
    return res.data;
  }

  async inviteByUsername(input: UserInviteByUsernameInput): Promise<unknown> {
    this.log.debug({ email: input.email }, 'inviteByUsername');
    const res = await this.http.post('/portalapi/User/UserInviteByUsername', {
      username: input.email,
    });
    return res.data;
  }
}
