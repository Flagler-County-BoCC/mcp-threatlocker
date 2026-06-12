import type { AxiosInstance } from 'axios';
import { createLogger } from '../../lib/logger.js';
import { buildOrgHeaders } from '../../lib/http-client.js';
import type {
  ScheduledAgentActionCreateInput,
  ScheduledAgentActionAbortInput,
  ScheduledAgentActionAppliesToInput,
  ScheduledAgentActionGetByParametersInput,
  ScheduledAgentActionGetForHydrationInput,
  ScheduledAgentActionListInput,
} from './scheduled-agent-action.schema.js';

export class ScheduledAgentActionService {
  private readonly log = createLogger({ module: 'scheduledAgentActionService' });

  constructor(private readonly http: AxiosInstance) {}

  async create(input: ScheduledAgentActionCreateInput): Promise<unknown> {
    this.log.debug({ scheduledType: input.scheduledType }, 'create');
    const { managedOrganizationId, ...body } = input;
    const res = await this.http.post('/portalapi/ScheduledAgentAction', body, {
      headers: buildOrgHeaders(managedOrganizationId),
    });
    return res.data;
  }

  async abort(input: ScheduledAgentActionAbortInput): Promise<unknown> {
    this.log.debug({ scheduledId: input.scheduledId, abortAll: input.abortAll }, 'abort');
    const { managedOrganizationId, ...body } = input;
    const res = await this.http.post('/portalapi/ScheduledAgentAction/Abort', body, {
      headers: buildOrgHeaders(managedOrganizationId),
    });
    return res.data;
  }

  async appliesTo(input: ScheduledAgentActionAppliesToInput): Promise<unknown> {
    this.log.debug({ osType: input.osType }, 'appliesTo');
    const res = await this.http.get('/portalapi/ScheduledAgentAction/AppliesTo', {
      params: {
        osType: input.osType,
        includeChildren: input.includeChildren,
        searchText: input.searchText,
      },
      headers: buildOrgHeaders(input.managedOrganizationId),
    });
    return res.data;
  }

  async getByParameters(input: ScheduledAgentActionGetByParametersInput): Promise<unknown> {
    this.log.debug(
      { scheduledId: input.scheduledId, pageNumber: input.pageNumber },
      'getByParameters',
    );
    const { managedOrganizationId, ...body } = input;
    const res = await this.http.post('/portalapi/ScheduledAgentAction/GetByParameters', body, {
      headers: buildOrgHeaders(managedOrganizationId),
    });
    return res.data;
  }

  async getForHydration(input: ScheduledAgentActionGetForHydrationInput): Promise<unknown> {
    this.log.debug({ scheduledId: input.scheduledId }, 'getForHydration');
    const res = await this.http.get('/portalapi/ScheduledAgentAction/GetForHydration', {
      params: { scheduledId: input.scheduledId },
    });
    return res.data;
  }

  async list(input: ScheduledAgentActionListInput): Promise<unknown> {
    this.log.debug({ scheduledType: input.scheduledType }, 'list');
    const res = await this.http.get('/portalapi/ScheduledAgentAction/List', {
      params: { scheduledType: input.scheduledType, includeChildren: input.includeChildren },
      headers: buildOrgHeaders(input.managedOrganizationId),
    });
    return res.data;
  }
}
