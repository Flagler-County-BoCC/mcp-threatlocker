import axios, { type AxiosInstance } from 'axios';
import { config } from '../config/index.js';
import { createLogger } from './logger.js';
import { ExternalServiceError } from '../errors/index.js';

const log = createLogger({ module: 'httpClient' });

const ZERO_GUID = '00000000-0000-0000-0000-000000000000';

/** Returns per-request org-override headers when a managedOrganizationId is supplied. */
export function buildOrgHeaders(managedOrganizationId: string | undefined): Record<string, string> {
  if (managedOrganizationId !== undefined) {
    return { ManagedOrganizationId: managedOrganizationId };
  }
  return {};
}

export function createHttpClient(): AxiosInstance {
  const client = axios.create({
    baseURL: config.threatlocker.baseUrl,
    timeout: 30_000,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: config.threatlocker.apiKey,
      ManagedOrganizationId: ZERO_GUID,
      OverrideManagedOrganizationId: ZERO_GUID,
    },
  });

  client.interceptors.response.use(
    (res) => res,
    (err: unknown) => {
      const status = axios.isAxiosError(err) ? err.response?.status : undefined;
      const data = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string } | undefined)
        : undefined;
      const message = axios.isAxiosError(err) ? (data?.message ?? err.message) : String(err);
      log.warn({ status, message }, 'ThreatLocker API error');
      throw new ExternalServiceError('ThreatLocker', message, status);
    },
  );

  return client;
}
