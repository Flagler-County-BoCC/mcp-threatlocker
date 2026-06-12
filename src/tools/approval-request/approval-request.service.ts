import type { AxiosInstance } from 'axios';
import { createLogger } from '../../lib/logger.js';
import { buildOrgHeaders } from '../../lib/http-client.js';
import type {
  ApprovalRequestGetByParametersInput,
  ApprovalRequestGetCountInput,
  ApprovalRequestGetFileDownloadDetailsInput,
  ApprovalRequestGetPermitApplicationByIdInput,
  ApprovalRequestAuthorizeForPermitInput,
  ApprovalRequestPermitApplicationInput,
} from './approval-request.schema.js';

export class ApprovalRequestService {
  private readonly log = createLogger({ module: 'approvalRequestService' });

  constructor(private readonly http: AxiosInstance) {}

  async getByParameters(input: ApprovalRequestGetByParametersInput): Promise<unknown> {
    this.log.debug({ statusId: input.statusId, pageNumber: input.pageNumber }, 'getByParameters');
    const { managedOrganizationId, ...body } = input;
    const res = await this.http.post(
      '/portalapi/ApprovalRequest/ApprovalRequestGetByParameters',
      body,
      {
        headers: buildOrgHeaders(managedOrganizationId),
      },
    );
    return res.data;
  }

  async getCount(input: ApprovalRequestGetCountInput): Promise<unknown> {
    this.log.debug({ includeChildOrganizations: input.includeChildOrganizations }, 'getCount');
    const res = await this.http.get('/portalapi/ApprovalRequest/ApprovalRequestGetCount', {
      params: { includeChildOrganizations: input.includeChildOrganizations },
      headers: buildOrgHeaders(input.managedOrganizationId),
    });
    return res.data;
  }

  async getFileDownloadDetails(
    input: ApprovalRequestGetFileDownloadDetailsInput,
  ): Promise<unknown> {
    this.log.debug({ approvalRequestId: input.approvalRequestId }, 'getFileDownloadDetails');
    const res = await this.http.get(
      '/portalapi/ApprovalRequest/ApprovalRequestGetFileDownloadDetailsById',
      {
        params: { approvalRequestId: input.approvalRequestId },
        headers: buildOrgHeaders(input.managedOrganizationId),
      },
    );
    return res.data;
  }

  async getPermitApplicationById(
    input: ApprovalRequestGetPermitApplicationByIdInput,
  ): Promise<unknown> {
    this.log.debug({ approvalRequestId: input.approvalRequestId }, 'getPermitApplicationById');
    const res = await this.http.get(
      '/portalapi/ApprovalRequest/ApprovalRequestGetPermitApplicationById',
      {
        params: { approvalRequestId: input.approvalRequestId },
        headers: buildOrgHeaders(input.managedOrganizationId),
      },
    );
    return res.data;
  }

  async authorizeForPermit(input: ApprovalRequestAuthorizeForPermitInput): Promise<unknown> {
    this.log.debug({ approvalRequestId: input.approvalRequestId }, 'authorizeForPermit');
    const { managedOrganizationId, ...body } = input;
    const res = await this.http.post(
      '/portalapi/ApprovalRequest/ApprovalRequestAuthorizeForPermitById',
      body,
      {
        headers: buildOrgHeaders(managedOrganizationId),
      },
    );
    return res.data;
  }

  async permitApplication(input: ApprovalRequestPermitApplicationInput): Promise<unknown> {
    this.log.debug({ computerId: input.computerId }, 'permitApplication');
    const { managedOrganizationId, ...body } = input;
    const res = await this.http.post(
      '/portalapi/ApprovalRequest/ApprovalRequestPermitApplication',
      body,
      {
        headers: buildOrgHeaders(managedOrganizationId),
      },
    );
    return res.data;
  }
}
