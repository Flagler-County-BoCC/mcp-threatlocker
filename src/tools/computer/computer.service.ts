import type { AxiosInstance } from 'axios';
import { createLogger } from '../../lib/logger.js';
import { buildOrgHeaders } from '../../lib/http-client.js';
import type {
  ComputerGetByAllParametersInput,
  ComputerGetForEditByIdInput,
  ComputerGetForNewComputerInput,
  ComputerGetDownloadInput,
  ComputerSignedScriptDownloadInput,
  ComputerSamplePathDownloadInput,
  ComputerUnsignedScriptDownloadInput,
  ComputerUpdateForEditInput,
  ComputerUpdateBaselineRescanInput,
  ComputerUpdateShouldRestartByIdsInput,
  ComputerUpdateShouldRestartByOrganizationInput,
  ComputerMoveToOtherOrganizationInput,
  ComputerEnableProtectionInput,
  ComputerDisableProtectionInput,
  ComputerRemoveDuplicateInput,
  ComputerUpdateMaintenanceModeInput,
  ComputerUpdateThreatlockerVersionByIdsInput,
  ComputerDeleteByIdsInput,
} from './computer.schema.js';

export class ComputerService {
  private readonly log = createLogger({ module: 'computerService' });

  constructor(private readonly http: AxiosInstance) {}

  async getByAllParameters(input: ComputerGetByAllParametersInput): Promise<unknown> {
    this.log.debug({ pageNumber: input.pageNumber }, 'getByAllParameters');
    const { managedOrganizationId, ...body } = input;
    const res = await this.http.post('/portalapi/Computer/ComputerGetByAllParameters', body, {
      headers: buildOrgHeaders(managedOrganizationId),
    });
    return res.data;
  }

  async getForEditById(input: ComputerGetForEditByIdInput): Promise<unknown> {
    this.log.debug({ computerId: input.computerId }, 'getForEditById');
    const res = await this.http.get('/portalapi/Computer/ComputerGetForEditById', {
      params: { computerId: input.computerId },
      headers: buildOrgHeaders(input.managedOrganizationId),
    });
    return res.data;
  }

  async getForNewComputer(input: ComputerGetForNewComputerInput): Promise<unknown> {
    this.log.debug({}, 'getForNewComputer');
    const res = await this.http.get('/portalapi/Computer/ComputerGetForNewComputer', {
      headers: buildOrgHeaders(input.managedOrganizationId),
    });
    return res.data;
  }

  async getDownload(input: ComputerGetDownloadInput): Promise<unknown> {
    this.log.debug({ fileType: input.fileType }, 'getDownload');
    const res = await this.http.post('/portalapi/Computer/ComputerGetDownload', input);
    return res.data;
  }

  async signedScriptDownload(input: ComputerSignedScriptDownloadInput): Promise<unknown> {
    this.log.debug({ brand: input.brand }, 'signedScriptDownload');
    const res = await this.http.get('/portalapi/Computer/ComputerSignedScriptDownload', {
      params: { brand: input.brand },
    });
    return res.data;
  }

  async samplePathDownload(input: ComputerSamplePathDownloadInput): Promise<unknown> {
    this.log.debug({ brand: input.brand }, 'samplePathDownload');
    const res = await this.http.get('/portalapi/Computer/ComputerSamplePathDownload', {
      params: { brand: input.brand, authKey: input.authKey },
    });
    return res.data;
  }

  async unsignedScriptDownload(input: ComputerUnsignedScriptDownloadInput): Promise<unknown> {
    this.log.debug({ brand: input.brand }, 'unsignedScriptDownload');
    const res = await this.http.get('/portalapi/Computer/ComputerUnSignedScriptDownload', {
      params: { brand: input.brand },
    });
    return res.data;
  }

  async updateForEdit(input: ComputerUpdateForEditInput): Promise<unknown> {
    this.log.debug({ computerId: input.computerId }, 'updateForEdit');
    const { managedOrganizationId, ...body } = input;
    const res = await this.http.patch('/portalapi/Computer/ComputerUpdateForEdit', body, {
      headers: buildOrgHeaders(managedOrganizationId),
    });
    return res.data;
  }

  async updateBaselineRescan(input: ComputerUpdateBaselineRescanInput): Promise<unknown> {
    this.log.debug({ enableLearning: input.enableLearning }, 'updateBaselineRescan');
    const { managedOrganizationId, ...body } = input;
    const res = await this.http.post('/portalapi/Computer/ComputerUpdateBaselineRescan', body, {
      headers: buildOrgHeaders(managedOrganizationId),
    });
    return res.data;
  }

  async updateShouldRestartByIds(input: ComputerUpdateShouldRestartByIdsInput): Promise<unknown> {
    this.log.debug({ count: input.computers.length }, 'updateShouldRestartByIds');
    const res = await this.http.post(
      '/portalapi/Computer/ComputerUpdateShouldRestartByIds',
      input.computers,
    );
    return res.data;
  }

  async updateShouldRestartByOrganization(
    input: ComputerUpdateShouldRestartByOrganizationInput,
  ): Promise<unknown> {
    this.log.debug({ value: input.value }, 'updateShouldRestartByOrganization');
    const res = await this.http.post(
      '/portalapi/Computer/ComputerUpdateShouldRestartByOrganization',
      input.value,
    );
    return res.data;
  }

  async moveToOtherOrganization(input: ComputerMoveToOtherOrganizationInput): Promise<unknown> {
    this.log.debug({ targetOrganizationId: input.targetOrganizationId }, 'moveToOtherOrganization');
    const res = await this.http.post('/portalapi/Computer/ComputerMoveToOtherOrganization', input);
    return res.data;
  }

  async enableProtection(input: ComputerEnableProtectionInput): Promise<unknown> {
    this.log.debug({ count: input.computerDetailDtos.length }, 'enableProtection');
    const res = await this.http.post('/portalapi/Computer/ComputerEnableProtection', {
      computerDetailDtos: input.computerDetailDtos,
    });
    return res.data;
  }

  async disableProtection(input: ComputerDisableProtectionInput): Promise<unknown> {
    this.log.debug({ maintenanceModeType: input.maintenanceModeType }, 'disableProtection');
    const { managedOrganizationId: _managedOrg, ...body } = input;
    const res = await this.http.post('/portalapi/Computer/ComputerDisableProtection', body);
    return res.data;
  }

  async removeDuplicate(input: ComputerRemoveDuplicateInput): Promise<unknown> {
    this.log.debug({ value: input.value }, 'removeDuplicate');
    const res = await this.http.post('/portalapi/Computer/ComputerRemoveDuplicate', input.value);
    return res.data;
  }

  async updateMaintenanceMode(input: ComputerUpdateMaintenanceModeInput): Promise<unknown> {
    this.log.debug({ applicationId: input.applicationId }, 'updateMaintenanceMode');
    const res = await this.http.post('/portalapi/Computer/ComputerUpdateMaintenanceMode', input);
    return res.data;
  }

  async updateThreatlockerVersionByIds(
    input: ComputerUpdateThreatlockerVersionByIdsInput,
  ): Promise<unknown> {
    this.log.debug(
      { threatLockerVersion: input.threatLockerVersion },
      'updateThreatlockerVersionByIds',
    );
    const res = await this.http.post(
      '/portalapi/Computer/ComputerUpdateThreatlockerVersionByIds',
      input,
    );
    return res.data;
  }

  async deleteByIds(input: ComputerDeleteByIdsInput): Promise<unknown> {
    this.log.debug({ count: input.computers.length }, 'deleteByIds');
    const res = await this.http.post(
      '/portalapi/Computer/ComputerUpdateForDeleteByIds',
      input.computers,
    );
    return res.data;
  }
}
