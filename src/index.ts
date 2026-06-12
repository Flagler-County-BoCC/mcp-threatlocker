#!/usr/bin/env node
import { config } from './config/index.js';
import { handleToolError } from './lib/tool-error-handler.js';
import { ExternalServiceError } from './errors/index.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

const API_KEY = config.threatlocker.apiKey;
const BASE_URL = config.threatlocker.baseUrl;

async function callApi(
  method: string,
  path: string,
  params?: Record<string, unknown>,
  body?: unknown,
  extraHeaders?: Record<string, string | undefined>,
): Promise<unknown> {
  let url = `${BASE_URL}${path}`;
  if (params && Object.keys(params).length > 0) {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null) qs.set(k, String(v));
    }
    url += `?${qs.toString()}`;
  }

  const ZERO_GUID = '00000000-0000-0000-0000-000000000000';
  const headers: Record<string, string> = {
    authorization: API_KEY,
    'Content-Type': 'application/json',
    ManagedOrganizationId: ZERO_GUID,
    OverrideManagedOrganizationId: ZERO_GUID,
  };
  for (const [k, v] of Object.entries(extraHeaders ?? {})) {
    if (v !== undefined) headers[k] = v;
  }

  const res = await fetch(url, {
    method,
    headers,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new ExternalServiceError('ThreatLocker', text || `HTTP ${res.status}`, res.status);
  }

  const contentType = res.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    return res.json();
  }
  return res.text();
}

const tools = [
  // ── ActionLog ──────────────────────────────────────────────────────────────
  {
    name: 'action_log_get_by_parameters',
    description:
      'Get unified audit log entries (paginated). Retrieves audit log entries with filtering, grouping, and optional CSV export.',
    inputSchema: {
      type: 'object',
      properties: {
        managedOrganizationId: {
          type: 'string',
          description: 'Organization GUID for cross-org calls',
        },
        startDate: { type: 'string', description: 'Start datetime (ISO 8601 UTC)' },
        endDate: { type: 'string', description: 'End datetime (ISO 8601 UTC)' },
        pageNumber: { type: 'integer', description: 'Page number (1-based)' },
        pageSize: { type: 'integer', description: 'Page size (max 10000)' },
        paramsFieldsDto: {
          type: 'array',
          items: { type: 'object' },
          description: 'Search filter objects; can be empty array',
        },
        actionId: {
          type: 'integer',
          description: '1=Permit, 2=Deny, 3=Deny w/Request, 6=Ringfenced, 99=Any Deny',
          enum: [1, 2, 3, 6, 99],
        },
        actionType: {
          type: 'string',
          description: 'Filter by action type',
          enum: [
            'execute',
            'install',
            'network',
            'registry',
            'read',
            'write',
            'move',
            'delete',
            'baseline',
            'powershell',
            'elevate',
            'configuration',
            'dns',
          ],
        },
        exportMode: { type: 'boolean', description: 'When true returns CSV' },
        fullPath: { type: 'string', description: 'File/process path filter; supports wildcards' },
        groupBys: {
          type: 'array',
          items: { type: 'integer' },
          description: 'Group results by 1-2 options (e.g. 9=Action Type, 77=Activity)',
        },
        hostname: { type: 'string', description: 'Filter by hostname; supports wildcards' },
        onlyTrueDenies: {
          type: 'boolean',
          description: 'Show only true denies; requires actionId=99',
        },
        showChildOrganizations: { type: 'boolean' },
        showTotalCount: { type: 'boolean', description: 'Adds total count to response headers' },
        simulateDeny: {
          type: 'boolean',
          description: 'Show only simulated denies; requires actionId=99',
        },
        totalRows: { type: 'integer', description: 'Total log count across all pages' },
      },
      required: ['startDate', 'endDate', 'pageNumber', 'pageSize'],
    },
  },

  // ── Application ────────────────────────────────────────────────────────────
  {
    name: 'application_get_by_id',
    description: 'Get an application by ID.',
    inputSchema: {
      type: 'object',
      properties: {
        managedOrganizationId: { type: 'string' },
        applicationId: { type: 'string', description: 'Application GUID' },
      },
      required: ['applicationId'],
    },
  },
  {
    name: 'application_get_by_parameters',
    description: 'Get applications by parameters (paginated list with filtering and sorting).',
    inputSchema: {
      type: 'object',
      properties: {
        managedOrganizationId: { type: 'string' },
        orderBy: {
          type: 'string',
          enum: ['name', 'date-created', 'review-rating', 'computer-count', 'policy'],
        },
        pageNumber: { type: 'integer' },
        pageSize: { type: 'integer' },
        searchBy: {
          type: 'string',
          enum: ['app', 'full', 'process', 'hash', 'cert', 'created', 'categories', 'countries'],
        },
        categories: { type: 'array', items: { type: 'string' } },
        category: {
          type: 'integer',
          description: '0=All, 1=Custom, 2=Built-In, 4=Patch Supported',
          enum: [0, 1, 2, 4],
        },
        countries: {
          type: 'array',
          items: { type: 'string' },
          description: 'Two-letter country codes',
        },
        includeChildOrganizations: { type: 'boolean' },
        isAscending: { type: 'boolean' },
        isHidden: { type: 'boolean' },
        osType: {
          type: 'integer',
          description: '1=Windows, 2=MAC, 3=Linux, 5=Windows XP',
          enum: [1, 2, 3, 5],
        },
        permittedApplications: { type: 'boolean' },
        searchText: { type: 'string' },
      },
      required: ['orderBy', 'pageNumber', 'pageSize', 'searchBy'],
    },
  },
  {
    name: 'application_get_for_maintenance_mode',
    description: 'Get applications available for maintenance mode assignment.',
    inputSchema: {
      type: 'object',
      properties: {
        managedOrganizationId: { type: 'string' },
        osType: {
          type: 'integer',
          description: '1=Windows, 2=MAC, 3=Linux, 5=Windows XP',
          enum: [1, 2, 3, 5],
        },
      },
    },
  },
  {
    name: 'application_get_matching_list',
    description:
      'Get applications matching file characteristics (hash, path, cert). Used during approval request processing.',
    inputSchema: {
      type: 'object',
      properties: {
        managedOrganizationId: { type: 'string' },
        certs: {
          type: 'array',
          items: { type: 'object' },
          description: 'Certificate objects with sha, subject, validCert',
        },
        createdBys: { type: 'array', items: { type: 'string' } },
        hash: { type: 'string', description: 'ThreatLocker hash' },
        osType: { type: 'integer', enum: [1, 2, 3, 5] },
        path: { type: 'string', description: 'Use \\\\\\\\ for path slashes' },
        processPath: { type: 'string' },
        sha256: { type: 'string' },
      },
    },
  },
  {
    name: 'application_get_research_details_by_id',
    description:
      'Get research details for an application (risk ratings, categories, countries, access levels).',
    inputSchema: {
      type: 'object',
      properties: {
        managedOrganizationId: { type: 'string' },
        applicationId: { type: 'string' },
      },
      required: ['applicationId'],
    },
  },
  {
    name: 'application_insert',
    description: '⚠️ WRITE: Create a new custom application.',
    inputSchema: {
      type: 'object',
      properties: {
        managedOrganizationId: { type: 'string' },
        name: { type: 'string' },
        osType: { type: 'integer', enum: [1, 2, 3, 5] },
        description: { type: 'string' },
        applicationFileUpdates: { type: 'array', items: { type: 'object' } },
      },
      required: ['name', 'osType'],
    },
  },
  {
    name: 'application_update_by_id',
    description: '⚠️ WRITE: Update an existing application name/description.',
    inputSchema: {
      type: 'object',
      properties: {
        managedOrganizationId: { type: 'string' },
        applicationId: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string' },
        osType: { type: 'integer', enum: [1, 2, 3, 5] },
      },
      required: ['applicationId', 'name', 'osType'],
    },
  },
  {
    name: 'application_delete',
    description: '⚠️ WRITE/DELETE: Delete applications without attached policies.',
    inputSchema: {
      type: 'object',
      properties: {
        managedOrganizationId: { type: 'string' },
        applications: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              applicationId: { type: 'string' },
              name: { type: 'string' },
              organizationId: { type: 'string' },
              osType: { type: 'integer' },
            },
          },
        },
      },
      required: ['applications'],
    },
  },
  {
    name: 'application_confirm_delete',
    description: '⚠️ WRITE/DELETE: Delete applications that have attached policies.',
    inputSchema: {
      type: 'object',
      properties: {
        managedOrganizationId: { type: 'string' },
        applications: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              applicationId: { type: 'string' },
              name: { type: 'string' },
              organizationId: { type: 'string' },
              osType: { type: 'integer' },
            },
          },
        },
      },
      required: ['applications'],
    },
  },

  // ── ApplicationFile ────────────────────────────────────────────────────────
  {
    name: 'application_file_get_by_application_id',
    description: 'Get application file rules by application ID (paginated).',
    inputSchema: {
      type: 'object',
      properties: {
        managedOrganizationId: { type: 'string' },
        applicationId: { type: 'string' },
        pageNumber: { type: 'integer' },
        pageSize: { type: 'integer' },
        hashOnly: { type: 'boolean', description: 'Return only hash-only rules' },
        isCustomRule: { type: 'boolean', description: 'Return only custom (non-hash) rules' },
        searchText: { type: 'string' },
      },
      required: ['applicationId', 'pageNumber', 'pageSize'],
    },
  },
  {
    name: 'application_file_insert',
    description: '⚠️ WRITE: Add a new application file rule to a custom application.',
    inputSchema: {
      type: 'object',
      properties: {
        managedOrganizationId: { type: 'string' },
        applicationId: { type: 'string' },
        applicationName: { type: 'string' },
        osType: { type: 'integer', enum: [1, 2, 3, 5] },
        isHashOnly: { type: 'boolean' },
        notes: { type: 'string' },
        cert: { type: 'string' },
        fullPath: { type: 'string' },
        hash: { type: 'string' },
        installedBy: { type: 'string' },
        processPath: { type: 'string' },
      },
      required: ['applicationId', 'applicationName', 'osType'],
    },
  },
  {
    name: 'application_file_update',
    description: '⚠️ WRITE: Update an existing application file rule.',
    inputSchema: {
      type: 'object',
      properties: {
        managedOrganizationId: { type: 'string' },
        applicationFileId: { type: 'integer' },
        applicationId: { type: 'string' },
        osType: { type: 'integer', enum: [1, 2, 3, 5] },
        isHashOnly: { type: 'boolean' },
        notes: { type: 'string' },
        cert: { type: 'string' },
        fullPath: { type: 'string' },
        hash: { type: 'string' },
        installedBy: { type: 'string' },
        processPath: { type: 'string' },
      },
      required: ['applicationFileId', 'applicationId', 'osType'],
    },
  },
  {
    name: 'application_file_delete_by_id',
    description: '⚠️ WRITE/DELETE: Delete a single application file rule.',
    inputSchema: {
      type: 'object',
      properties: {
        managedOrganizationId: { type: 'string' },
        applicationFileId: { type: 'integer' },
        applicationId: { type: 'string' },
        applicationName: { type: 'string' },
        osType: { type: 'integer', enum: [1, 2, 3, 5] },
        cert: { type: 'string' },
        fullPath: { type: 'string' },
        hash: { type: 'string' },
        installedBy: { type: 'string' },
        processPath: { type: 'string' },
      },
      required: ['applicationFileId', 'applicationId', 'applicationName', 'osType'],
    },
  },

  // ── ApprovalRequest ────────────────────────────────────────────────────────
  {
    name: 'approval_request_get_by_parameters',
    description: 'Get approval requests by parameters (paginated, filtered by status).',
    inputSchema: {
      type: 'object',
      properties: {
        managedOrganizationId: { type: 'string' },
        statusId: {
          type: 'integer',
          description:
            '1=Pending, 4=Approved, 6=Not Learned, 10=Ignored/Rejected, 12=Added to Application, 13=Escalated, 16=Self-Approved',
          enum: [1, 4, 6, 10, 12, 13, 16],
        },
        pageNumber: { type: 'integer' },
        pageSize: { type: 'integer' },
        searchText: { type: 'string' },
        showChildOrganizations: { type: 'boolean' },
        orderBy: {
          type: 'string',
          enum: ['username', 'devicetype', 'actiontype', 'path', 'actiondate', 'datetime'],
        },
        isAscending: { type: 'boolean' },
      },
      required: ['statusId', 'pageNumber', 'pageSize'],
    },
  },
  {
    name: 'approval_request_get_count',
    description: 'Get count of pending approval requests.',
    inputSchema: {
      type: 'object',
      properties: {
        managedOrganizationId: { type: 'string' },
        includeChildOrganizations: { type: 'boolean' },
      },
      required: ['includeChildOrganizations'],
    },
  },
  {
    name: 'approval_request_get_file_download_details',
    description: 'Get file download details (filename and fileUrl) for an approval request.',
    inputSchema: {
      type: 'object',
      properties: {
        managedOrganizationId: { type: 'string' },
        approvalRequestId: { type: 'string' },
      },
      required: ['approvalRequestId'],
    },
  },
  {
    name: 'approval_request_get_permit_application_by_id',
    description:
      'Get full approval request information by ID including pre-formatted JSON for permit processing.',
    inputSchema: {
      type: 'object',
      properties: {
        managedOrganizationId: { type: 'string' },
        approvalRequestId: { type: 'string' },
      },
      required: ['approvalRequestId'],
    },
  },
  {
    name: 'approval_request_authorize_for_permit',
    description: '⚠️ WRITE: Authorize Cyber Hero Team to permit an approval request.',
    inputSchema: {
      type: 'object',
      properties: {
        managedOrganizationId: { type: 'string' },
        approvalRequestId: { type: 'string' },
        message: { type: 'string' },
      },
      required: ['approvalRequestId'],
    },
  },
  {
    name: 'approval_request_permit_application',
    description:
      '⚠️ WRITE: Process an Application Control approval request (Execute or Elevate action types).',
    inputSchema: {
      type: 'object',
      properties: {
        managedOrganizationId: { type: 'string' },
        approvalRequest: { type: 'object' },
        computerId: { type: 'string' },
        computerGroupId: { type: 'string' },
        fileDetails: { type: 'object' },
        matchingApplications: { type: 'object' },
        organizationHasElevation: { type: 'boolean' },
        organizationId: { type: 'string' },
        organizationIds: { type: 'array', items: { type: 'string' } },
        osType: { type: 'integer', enum: [1, 2, 3, 5] },
        policyConditions: { type: 'object' },
        policyLevel: { type: 'object' },
        ringfenceActionId: { type: 'integer' },
        elevationExpiration: { type: 'integer' },
        elevationStatus: { type: 'integer', enum: [0, 1, 2] },
        networkExclusions: { type: 'array', items: { type: 'object' } },
        policyExpirationDate: { type: 'string' },
        ringfencingOptions: { type: 'object' },
      },
      required: [
        'approvalRequest',
        'computerId',
        'computerGroupId',
        'fileDetails',
        'matchingApplications',
        'organizationHasElevation',
        'organizationId',
        'organizationIds',
        'osType',
        'policyConditions',
        'policyLevel',
        'ringfenceActionId',
      ],
    },
  },

  // ── ConfigManager ──────────────────────────────────────────────────────────
  {
    name: 'cm_configuration_get_enabled',
    description: 'Get all enabled Config Manager configurations (assignable to CM policies).',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'cm_policy_get_by_parameters',
    description: 'Get Config Manager policies by parameters.',
    inputSchema: {
      type: 'object',
      properties: {
        managedOrganizationId: { type: 'string' },
        appliesTo: {
          type: 'string',
          description: 'Organization, computer group, or computer ID (all-zeros GUID for all)',
        },
        pageNumber: { type: 'integer' },
        pageSize: { type: 'integer' },
        status: {
          type: 'integer',
          description: '-1=Not Configured, 0=Disabled, 1=Enabled, 99=All',
          enum: [-1, 0, 1, 99],
        },
        searchText: { type: 'string' },
      },
      required: ['appliesTo', 'pageNumber', 'pageSize', 'status'],
    },
  },

  // ── Computer ───────────────────────────────────────────────────────────────
  {
    name: 'computer_get_by_all_parameters',
    description: 'Get computers with filtering and sorting (paginated).',
    inputSchema: {
      type: 'object',
      properties: {
        managedOrganizationId: { type: 'string' },
        orderBy: {
          type: 'string',
          enum: [
            'computername',
            'group',
            'action',
            'lastcheckin',
            'computerinstalldate',
            'deniedcountthreedays',
            'threatlockerversion',
          ],
        },
        pageNumber: { type: 'integer' },
        pageSize: { type: 'integer' },
        action: { type: 'string' },
        childOrganizations: { type: 'boolean' },
        computerGroup: { type: 'string', description: 'Computer group GUID' },
        computerId: { type: 'string' },
        isAscending: { type: 'boolean' },
        kindOfAction: {
          type: 'string',
          enum: [
            'Computer Mode',
            'TamperProtectionDisabled',
            'NeedsReview',
            'ReadyToSecure',
            'BaselineNotUploaded',
            'Update Channel',
          ],
        },
        searchBy: {
          type: 'integer',
          description:
            '1=Computer/Asset Name, 2=Username, 3=Computer Group Name, 4=Last Check-in IP, 5=Organization Name',
          enum: [1, 2, 3, 4, 5],
        },
        searchText: { type: 'string' },
      },
      required: ['orderBy', 'pageNumber', 'pageSize'],
    },
  },
  {
    name: 'computer_get_for_edit_by_id',
    description: 'Get computer details for editing.',
    inputSchema: {
      type: 'object',
      properties: {
        managedOrganizationId: { type: 'string' },
        computerId: { type: 'string' },
      },
      required: ['computerId'],
    },
  },
  {
    name: 'computer_get_for_new_computer',
    description:
      'Get computer group info for new computer installation (returns install keys per group).',
    inputSchema: {
      type: 'object',
      properties: {
        managedOrganizationId: { type: 'string' },
      },
    },
  },
  {
    name: 'computer_get_download',
    description: 'Get download URL for ThreatLocker installer.',
    inputSchema: {
      type: 'object',
      properties: {
        platform: { type: 'string', description: 'x64, x86, or empty string' },
        brand: { type: 'string', description: 'e.g. ThreatLocker' },
        apiKey: { type: 'string', description: 'Install key' },
        fileType: {
          type: 'string',
          enum: [
            'stub',
            'windows',
            'pssscript',
            'mac',
            'debian',
            'redhat',
            'windowsxp',
            'remediation',
          ],
        },
      },
      required: ['platform', 'brand', 'apiKey', 'fileType'],
    },
  },
  {
    name: 'computer_signed_script_download',
    description: 'Download signed ThreatLockerVerifier.exe (returns binary).',
    inputSchema: {
      type: 'object',
      properties: {
        brand: { type: 'string', description: 'e.g. ThreatLocker' },
      },
      required: ['brand'],
    },
  },
  {
    name: 'computer_sample_path_download',
    description: 'Download sample.bat logon script.',
    inputSchema: {
      type: 'object',
      properties: {
        brand: { type: 'string' },
        authKey: { type: 'string', description: 'Organization authKey' },
      },
      required: ['brand', 'authKey'],
    },
  },
  {
    name: 'computer_unsigned_script_download',
    description: 'Download unsigned ThreatLockerVerifier-Unsigned.exe.',
    inputSchema: {
      type: 'object',
      properties: {
        brand: { type: 'string' },
      },
      required: ['brand'],
    },
  },
  {
    name: 'computer_update_for_edit',
    description: '⚠️ WRITE: Update computer settings (name, group, proxy config, options).',
    inputSchema: {
      type: 'object',
      properties: {
        managedOrganizationId: { type: 'string' },
        computerId: { type: 'string' },
        computerGroupId: { type: 'string' },
        name: { type: 'string' },
        useProxyServer: { type: 'boolean' },
        proxyServerOption: { type: 'string' },
        proxyUrlEntry: { type: 'string' },
        proxyURL: { type: 'string' },
        options: { type: 'array', items: { type: 'string' } },
      },
      required: [
        'computerId',
        'computerGroupId',
        'name',
        'useProxyServer',
        'proxyServerOption',
        'proxyUrlEntry',
        'proxyURL',
        'options',
      ],
    },
  },
  {
    name: 'computer_update_baseline_rescan',
    description: '⚠️ WRITE: Queue computers for baseline rescan.',
    inputSchema: {
      type: 'object',
      properties: {
        managedOrganizationId: { type: 'string' },
        computerDetailDtos: { type: 'array', items: { type: 'object' } },
        enableLearning: { type: 'boolean' },
      },
      required: ['computerDetailDtos', 'enableLearning'],
    },
  },
  {
    name: 'computer_update_should_restart_by_ids',
    description: '⚠️ WRITE: Flag specific computers for restart.',
    inputSchema: {
      type: 'object',
      properties: {
        computers: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              computerId: { type: 'string' },
              organizationId: { type: 'string' },
            },
          },
        },
      },
      required: ['computers'],
    },
  },
  {
    name: 'computer_update_should_restart_by_organization',
    description: '⚠️ WRITE: Flag all computers in the organization for restart.',
    inputSchema: {
      type: 'object',
      properties: {
        value: { type: 'boolean' },
      },
      required: ['value'],
    },
  },
  {
    name: 'computer_move_to_other_organization',
    description: '⚠️ WRITE: Move computers to another organization.',
    inputSchema: {
      type: 'object',
      properties: {
        computerDetailDtos: { type: 'array', items: { type: 'object' } },
        enableLearningRescan: { type: 'boolean' },
        targetComputerGroupId: { type: 'string' },
        targetOrganizationId: { type: 'string' },
      },
      required: [
        'computerDetailDtos',
        'enableLearningRescan',
        'targetComputerGroupId',
        'targetOrganizationId',
      ],
    },
  },
  {
    name: 'computer_enable_protection',
    description: '⚠️ WRITE: Enable protection on computers.',
    inputSchema: {
      type: 'object',
      properties: {
        computerDetailDtos: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              computerId: { type: 'string' },
              organizationId: { type: 'string' },
            },
          },
        },
      },
      required: ['computerDetailDtos'],
    },
  },
  {
    name: 'computer_disable_protection',
    description: '⚠️ WRITE: Disable protection on computers (puts into maintenance mode).',
    inputSchema: {
      type: 'object',
      properties: {
        computerDetailDtos: { type: 'array', items: { type: 'object' } },
        endDate: { type: 'string' },
        startDate: { type: 'string' },
        maintenanceModeType: {
          type: 'integer',
          description: '1=Monitor Only, 3=Learning Mode, 6=Disable Tamper Protection',
          enum: [1, 3, 6],
        },
        permitEnd: { type: 'boolean' },
        applicationId: { type: 'string' },
      },
      required: ['computerDetailDtos', 'endDate', 'startDate', 'maintenanceModeType', 'permitEnd'],
    },
  },
  {
    name: 'computer_remove_duplicate',
    description: '⚠️ WRITE/DELETE: Remove duplicate computer records.',
    inputSchema: {
      type: 'object',
      properties: {
        value: { type: 'boolean' },
      },
      required: ['value'],
    },
  },
  {
    name: 'computer_update_maintenance_mode',
    description: '⚠️ WRITE: Update maintenance mode for a computer.',
    inputSchema: {
      type: 'object',
      properties: {
        applicationId: { type: 'string', description: 'GUID, autocomp, autogroup, or autosystem' },
        computerDetailDto: {
          type: 'object',
          properties: {
            computerId: { type: 'string' },
            organizationId: { type: 'string' },
            maintenanceTypeId: { type: 'integer', enum: [1, 2, 3, 8, 17, 18] },
            maintenanceEndDate: { type: 'string' },
            startDateTime: { type: 'string' },
          },
        },
      },
      required: ['applicationId', 'computerDetailDto'],
    },
  },
  {
    name: 'computer_update_threatlocker_version_by_ids',
    description:
      '⚠️ WRITE (DEPRECATED): Update ThreatLocker agent version on computers. Use scheduled_agent_action_create for agents ≥10.7.3.',
    inputSchema: {
      type: 'object',
      properties: {
        threatLockerVersion: { type: 'string' },
        threatLockerVersionId: { type: 'string' },
        computerDetailDtos: { type: 'array', items: { type: 'object' } },
      },
      required: ['threatLockerVersion', 'threatLockerVersionId', 'computerDetailDtos'],
    },
  },
  {
    name: 'computer_delete_by_ids',
    description: '⚠️ WRITE/DELETE: Remove computers from the portal (does not uninstall agent).',
    inputSchema: {
      type: 'object',
      properties: {
        computers: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              computerId: { type: 'string' },
              computerName: { type: 'string' },
              organizationId: { type: 'string' },
            },
          },
        },
      },
      required: ['computers'],
    },
  },

  // ── ComputerCheckin ────────────────────────────────────────────────────────
  {
    name: 'computer_checkin_get_by_parameters',
    description: 'Get computer check-in history for a specific computer.',
    inputSchema: {
      type: 'object',
      properties: {
        managedOrganizationId: { type: 'string' },
        computerId: { type: 'string' },
        pageSize: { type: 'integer' },
        pageNumber: { type: 'integer' },
        hideHeartbeat: {
          type: 'boolean',
          description: 'When true hides heartbeat check-ins; shows only full check-ins',
        },
      },
      required: ['computerId', 'pageSize', 'pageNumber', 'hideHeartbeat'],
    },
  },

  // ── ComputerGroup ──────────────────────────────────────────────────────────
  {
    name: 'computer_group_get_by_id',
    description: 'Get a computer group by ID.',
    inputSchema: {
      type: 'object',
      properties: {
        managedOrganizationId: { type: 'string' },
        computerGroupId: { type: 'string' },
      },
      required: ['computerGroupId'],
    },
  },
  {
    name: 'computer_group_get_by_parameters',
    description: 'Get computer groups by parameters (paginated).',
    inputSchema: {
      type: 'object',
      properties: {
        managedOrganizationId: { type: 'string' },
        pageNumber: { type: 'integer' },
        pageSize: { type: 'integer' },
        osType: {
          type: 'integer',
          description: '0=All, 1=Windows, 2=MAC, 3=Linux, 5=XP, 6=Ingester, 10=iOS, 11=Android',
          enum: [0, 1, 2, 3, 5, 6, 10, 11],
        },
        searchText: { type: 'string' },
        showAllGroups: { type: 'boolean' },
      },
      required: ['pageNumber', 'pageSize'],
    },
  },
  {
    name: 'computer_group_get_dropdown_with_organization',
    description: 'Get computer groups dropdown list with organization context.',
    inputSchema: {
      type: 'object',
      properties: {
        managedOrganizationId: { type: 'string' },
        includeAvailableOrganizations: { type: 'boolean' },
      },
    },
  },
  {
    name: 'computer_group_get_dropdown_by_organization_id',
    description: 'Get computer groups dropdown filtered by organization and OS type.',
    inputSchema: {
      type: 'object',
      properties: {
        managedOrganizationId: { type: 'string' },
        computerGroupOSTypeId: { type: 'integer', enum: [1, 2, 3, 5] },
        computerOSType: { type: 'string', enum: ['windows', 'mac', 'linux', 'windows xp'] },
      },
    },
  },
  {
    name: 'computer_group_get_for_download',
    description: 'Get computer group info for download using install key.',
    inputSchema: {
      type: 'object',
      properties: {
        installKey: { type: 'string', description: '24-character install key' },
      },
      required: ['installKey'],
    },
  },
  {
    name: 'computer_group_get_for_permit_application',
    description: 'Get computer groups available for permit application.',
    inputSchema: {
      type: 'object',
      properties: {
        managedOrganizationId: { type: 'string' },
        osType: { type: 'integer', enum: [1, 2, 3, 5] },
      },
    },
  },
  {
    name: 'computer_group_get_group_and_computer',
    description: 'Get combined list of computer groups and computers.',
    inputSchema: {
      type: 'object',
      properties: {
        managedOrganizationId: { type: 'string' },
        OSType: { type: 'integer', enum: [0, 1, 2, 3, 5] },
        includeGlobal: { type: 'boolean' },
        includeOrganizations: { type: 'boolean' },
        includeParentGroups: { type: 'boolean' },
        includeLoggedInObjects: { type: 'boolean' },
      },
    },
  },
  {
    name: 'computer_group_insert',
    description: '⚠️ WRITE: Create a new computer group.',
    inputSchema: {
      type: 'object',
      properties: {
        managedOrganizationId: { type: 'string' },
        name: { type: 'string' },
        osType: { type: 'integer', enum: [1, 2, 3, 5] },
        autoCreatePolicies: { type: 'integer', enum: [0, 1, 2, 3] },
        baselineAllPaths: { type: 'boolean' },
        baselineOptions: { type: 'array', items: { type: 'string' } },
        cyberHeroUseOrgSettings: { type: 'boolean' },
        exclusions: { type: 'array', items: { type: 'object' } },
        initialMonitorModeHours: { type: 'integer' },
        options: { type: 'array', items: { type: 'string' } },
        policyRefreshIntervalSeconds: { type: 'integer' },
        tlInstructions: { type: 'string' },
      },
      required: ['name', 'osType'],
    },
  },
  {
    name: 'computer_group_update_by_id',
    description: '⚠️ WRITE: Update an existing computer group.',
    inputSchema: {
      type: 'object',
      properties: {
        managedOrganizationId: { type: 'string' },
        computerGroupId: { type: 'string' },
        name: { type: 'string' },
        osType: { type: 'integer', enum: [1, 2, 3, 5] },
        autoCreatePolicies: { type: 'integer', enum: [0, 1, 2, 3] },
        baselineAllPaths: { type: 'boolean' },
        baselineOptions: { type: 'array', items: { type: 'string' } },
        cyberHeroUseOrgSettings: { type: 'boolean' },
        exclusions: { type: 'array', items: { type: 'object' } },
        initialMonitorModeHours: { type: 'integer' },
        options: { type: 'array', items: { type: 'string' } },
        policyRefreshIntervalSeconds: { type: 'integer' },
        tlInstructions: { type: 'string' },
      },
      required: ['computerGroupId', 'name', 'osType'],
    },
  },
  {
    name: 'computer_group_delete',
    description: '⚠️ WRITE/DELETE: Delete computer groups.',
    inputSchema: {
      type: 'object',
      properties: {
        managedOrganizationId: { type: 'string' },
        groups: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              computerGroupId: { type: 'string' },
              name: { type: 'string' },
              organizationId: { type: 'string' },
            },
          },
        },
      },
      required: ['groups'],
    },
  },

  // ── DAC ────────────────────────────────────────────────────────────────────
  {
    name: 'dac_analysis_item_get_by_id',
    description:
      'Get DAC analysis item details including associated risks and suggested resolutions.',
    inputSchema: {
      type: 'object',
      properties: {
        analysisItemId: {
          type: 'integer',
          description: 'Obtained from dac_analysis_results_get_by_parameters',
        },
      },
      required: ['analysisItemId'],
    },
  },
  {
    name: 'dac_analysis_results_get_by_parameters',
    description: 'Get DAC analysis results from the Health Center page.',
    inputSchema: {
      type: 'object',
      properties: {
        managedOrganizationId: { type: 'string' },
        pageNumber: { type: 'integer' },
        pageSize: { type: 'integer' },
        appliesToId: {
          type: 'string',
          description: 'Organization, computer group, or computer ID',
        },
        categoryId: {
          type: 'integer',
          description:
            '1=Network Policy, 2=Storage Policy, 3=App Control, 4=Registry Policy, 6=Group Policy, 7=Account/Auth, 8=Advanced Audit, 9=Local Security, 10=Patch Mgmt, 11=Remote Desktop, 12=User Rights, 13=Detect and Response',
          enum: [1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 13],
        },
        criticalityId: {
          type: 'integer',
          description: '1=Low, 2=Moderate, 3=High, 4=Critical',
          enum: [1, 2, 3, 4],
        },
        entityTypeId: {
          type: 'integer',
          description: '1=organization, 2=computer group, 3=computer',
          enum: [1, 2, 3],
        },
        includeChildOrgs: { type: 'boolean' },
        searchText: { type: 'string' },
        sortBy: { type: 'string', enum: ['category', 'combined-impact', 'criticality'] },
      },
      required: ['pageNumber', 'pageSize'],
    },
  },

  // ── DeployPolicyQueue ──────────────────────────────────────────────────────
  {
    name: 'deploy_policies',
    description: '⚠️ WRITE: Deploy policy changes to all computers in the organization.',
    inputSchema: {
      type: 'object',
      properties: {
        managedOrganizationId: { type: 'string' },
      },
    },
  },
  {
    name: 'deploy_policies_for_computer',
    description: '⚠️ WRITE: Deploy policy changes to a single computer.',
    inputSchema: {
      type: 'object',
      properties: {
        managedOrganizationId: { type: 'string' },
        computerId: { type: 'string' },
        computerName: { type: 'string' },
      },
      required: ['computerId', 'computerName'],
    },
  },

  // ── MaintenanceMode ────────────────────────────────────────────────────────
  {
    name: 'maintenance_mode_get_by_computer_id',
    description: 'Get maintenance mode history for a computer (paginated).',
    inputSchema: {
      type: 'object',
      properties: {
        managedOrganizationId: { type: 'string' },
        computerId: { type: 'string' },
        pageNumber: { type: 'integer' },
        pageSize: { type: 'integer' },
      },
      required: ['computerId', 'pageNumber', 'pageSize'],
    },
  },
  {
    name: 'maintenance_mode_insert',
    description: '⚠️ WRITE: Create a new maintenance mode entry for a computer.',
    inputSchema: {
      type: 'object',
      properties: {
        managedOrganizationId: { type: 'string' },
        allUsers: { type: 'boolean' },
        automaticApplication: { type: 'boolean' },
        automaticApplicationType: {
          type: 'integer',
          description: '0=empty, 1=Computer, 2=Group, 3=System',
          enum: [0, 1, 2, 3],
        },
        computerDateTime: { type: 'string' },
        computerId: { type: 'string' },
        createNewApplication: { type: 'boolean' },
        endDateTime: { type: 'string' },
        existingApplication: { type: 'object' },
        maintenanceTypeId: {
          type: 'integer',
          description:
            '1=AppControlMonitorOnly, 2=InstallationMode, 3=Learning, 4=Elevation, 6=TamperProtectionDisabled, 14=Isolation, 15=Lockdown, 16=DisableOpsAlerts, 17=NetworkControlMonitorOnly, 18=StorageControlMonitorOnly',
          enum: [1, 2, 3, 4, 6, 14, 15, 16, 17, 18],
        },
        newApplication: { type: 'object' },
        permitEnd: { type: 'boolean' },
        startDateTime: { type: 'string' },
        useExistingApplication: { type: 'boolean' },
      },
      required: [
        'allUsers',
        'automaticApplication',
        'automaticApplicationType',
        'computerDateTime',
        'computerId',
        'createNewApplication',
        'endDateTime',
        'maintenanceTypeId',
        'permitEnd',
        'startDateTime',
        'useExistingApplication',
      ],
    },
  },
  {
    name: 'maintenance_mode_end_by_id',
    description: '⚠️ WRITE: End a specific maintenance mode by ID.',
    inputSchema: {
      type: 'object',
      properties: {
        ComputerID: { type: 'string' },
        MaintenanceModeId: { type: 'string' },
        MaintenanceTypeId: { type: 'integer' },
      },
      required: ['ComputerID', 'MaintenanceModeId', 'MaintenanceTypeId'],
    },
  },
  {
    name: 'maintenance_mode_update_end_date',
    description: '⚠️ WRITE: Update the end date/time of a maintenance mode.',
    inputSchema: {
      type: 'object',
      properties: {
        computerId: { type: 'string' },
        maintenanceEndDate: { type: 'string' },
        maintenanceTypeId: { type: 'integer', enum: [1, 2, 3, 4, 6, 14, 15, 16, 17, 18] },
      },
      required: ['computerId', 'maintenanceEndDate', 'maintenanceTypeId'],
    },
  },

  // ── NetworkAccessPolicy ────────────────────────────────────────────────────
  {
    name: 'network_access_policy_insert',
    description: '⚠️ WRITE: Create a network access policy.',
    inputSchema: {
      type: 'object',
      properties: {
        managedOrganizationId: { type: 'string' },
        allDestinations: { type: 'boolean' },
        allPorts: { type: 'boolean' },
        allSources: { type: 'boolean' },
        computerGroupId: { type: 'string' },
        description: { type: 'string' },
        destinationLocations: { type: 'array', items: { type: 'object' } },
        direction: { type: 'integer', description: '1=Inbound, 2=Outbound', enum: [1, 2] },
        endDate: { type: 'string' },
        name: { type: 'string' },
        networkAccessRulePortDtos: { type: 'array', items: { type: 'object' } },
        policyActionId: { type: 'integer', description: '1=Permit, 2=Deny', enum: [1, 2] },
        policyScheduleStatus: { type: 'integer', enum: [0, 1, 2] },
        policySchedules: { type: 'array', items: { type: 'object' } },
        protocol: { type: 'integer', description: '1=TCP, 2=UDP, 3=Both', enum: [1, 2, 3] },
        sourceLocations: { type: 'array', items: { type: 'object' } },
        status: { type: 'integer', description: '1=Active, 3=Inactive', enum: [1, 3] },
      },
      required: [
        'allDestinations',
        'allPorts',
        'allSources',
        'computerGroupId',
        'direction',
        'name',
        'policyActionId',
        'policyScheduleStatus',
        'protocol',
        'status',
      ],
    },
  },

  // ── OnlineDevices ──────────────────────────────────────────────────────────
  {
    name: 'online_devices_get_by_parameters',
    description: 'Get online devices (computers on the network without ThreatLocker installed).',
    inputSchema: {
      type: 'object',
      properties: {
        managedOrganizationId: { type: 'string' },
        pageSize: { type: 'integer' },
        pageNumber: { type: 'integer' },
      },
    },
  },

  // ── Organization ───────────────────────────────────────────────────────────
  {
    name: 'organization_create_child',
    description: '⚠️ WRITE: Create a child organization.',
    inputSchema: {
      type: 'object',
      properties: {
        managedOrganizationId: { type: 'string' },
        displayName: { type: 'string' },
        timezoneId: { type: 'string', description: 'Retrieved from user_get_all_timezones' },
        domains: { type: 'array', items: { type: 'string' } },
        elevationDefaultHours: { type: 'integer', enum: [0, 1, 2, 6, 12, 24] },
        hasDisabledEmailNotifications: { type: 'boolean' },
        itarCompliant: { type: 'boolean' },
        name: { type: 'string' },
        options: { type: 'array', items: { type: 'string' } },
        proxyServerOption: { type: 'string', enum: ['http://', 'https://'] },
        proxyUrlEntry: { type: 'string' },
        timeoutOnLogin: { type: 'integer', enum: [15, 30, 60, 120, 240, 480, 1440] },
        useProxyServer: { type: 'boolean' },
      },
      required: ['displayName', 'timezoneId'],
    },
  },
  {
    name: 'organization_get_auth_key',
    description: 'Get organization auth key (returns null if not yet generated).',
    inputSchema: {
      type: 'object',
      properties: {
        managedOrganizationId: { type: 'string' },
      },
    },
  },
  {
    name: 'organization_get_child_organizations',
    description: 'Get child organizations by parameters (paginated).',
    inputSchema: {
      type: 'object',
      properties: {
        managedOrganizationId: { type: 'string' },
        pageNumber: { type: 'integer' },
        pageSize: { type: 'integer' },
        includeAllChildren: { type: 'boolean', description: 'Returns all descendants when true' },
        isAscending: { type: 'boolean' },
        orderBy: {
          type: 'string',
          enum: ['billingMethod', 'businessClassificationName', 'dateAdded', 'name'],
        },
        searchText: { type: 'string' },
      },
      required: ['pageNumber', 'pageSize'],
    },
  },
  {
    name: 'organization_get_for_move_computers',
    description: 'Get organizations available for computer relocation.',
    inputSchema: {
      type: 'object',
      properties: {
        searchText: { type: 'string', description: 'Filter by organization name' },
      },
    },
  },
  {
    name: 'organization_update_auth_key',
    description: '⚠️ WRITE: Generate a new organization auth key (errors if one already exists).',
    inputSchema: {
      type: 'object',
      properties: {
        managedOrganizationId: { type: 'string' },
      },
    },
  },

  // ── Permission ─────────────────────────────────────────────────────────────
  {
    name: 'permission_get_for_administrator',
    description: 'Get available permissions for administrator assignment.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },

  // ── Policy ─────────────────────────────────────────────────────────────────
  {
    name: 'policy_get_by_id',
    description: 'Get a policy by ID.',
    inputSchema: {
      type: 'object',
      properties: {
        managedOrganizationId: { type: 'string' },
        policyId: { type: 'string' },
      },
      required: ['policyId'],
    },
  },
  {
    name: 'policy_get_by_parameters',
    description: 'Get policies by parameters (paginated, filtered by group/OS/etc).',
    inputSchema: {
      type: 'object',
      properties: {
        managedOrganizationId: { type: 'string' },
        filter: {
          type: 'string',
          enum: [
            '',
            'nomatch',
            'match',
            'over6weeks',
            'ringfence',
            'noringfence',
            'elevation',
            'permitonly',
          ],
        },
        pageNumber: { type: 'integer' },
        pageSize: { type: 'integer' },
        activeOnly: { type: 'boolean' },
        computerGroupId: { type: 'string' },
        osType: { type: 'integer', enum: [1, 2, 3, 5] },
        searchText: { type: 'string' },
        showAllPolicies: { type: 'boolean' },
      },
      required: ['filter', 'pageNumber', 'pageSize'],
    },
  },
  {
    name: 'policy_get_for_view_by_application_id',
    description: 'Get policies associated with a specific application.',
    inputSchema: {
      type: 'object',
      properties: {
        managedOrganizationId: { type: 'string' },
        applicationId: { type: 'string' },
        organizationId: { type: 'string' },
        pageNumber: { type: 'integer' },
        pageSize: { type: 'integer' },
        appliesToId: { type: 'string' },
        includeDenies: { type: 'boolean' },
      },
      required: ['applicationId', 'organizationId', 'pageNumber', 'pageSize'],
    },
  },
  {
    name: 'policy_insert',
    description: '⚠️ WRITE: Create a new application control policy.',
    inputSchema: {
      type: 'object',
      properties: {
        managedOrganizationId: { type: 'string' },
        applicationIdList: { type: 'array', items: { type: 'string' } },
        computerGroupId: { type: 'string' },
        name: { type: 'string' },
        osType: { type: 'integer', enum: [1, 2, 3, 5] },
        policyActionId: {
          type: 'integer',
          description: '1=Permit, 2=Deny, 6=Permit with Ringfence',
          enum: [1, 2, 6],
        },
        allDevices: { type: 'boolean' },
        allUserGroups: { type: 'boolean' },
        allowRequest: { type: 'boolean' },
        comments: { type: 'string' },
        description: { type: 'string' },
        elevationEndDate: { type: 'string' },
        elevationStatus: { type: 'integer', enum: [0, 1, 2] },
        endDate: { type: 'string' },
        isEnabled: { type: 'boolean' },
        killRunningProcesses: { type: 'boolean' },
        logAction: { type: 'boolean' },
        monitorMode: { type: 'boolean' },
        networkExclusions: { type: 'array', items: { type: 'object' } },
        notifyOnRequest: { type: 'boolean' },
        orderBefore: { type: 'string' },
        parentProcessIdList: { type: 'array', items: { type: 'string' } },
        parentRestrictionEnabled: { type: 'boolean' },
        policyScheduleStatus: { type: 'integer', enum: [0, 1, 2] },
        policySchedules: { type: 'array', items: { type: 'object' } },
        requestEmailAddressesList: { type: 'array', items: { type: 'string' } },
        requestor: { type: 'string' },
        ringfencingOptions: { type: 'object' },
        ticketInfo: { type: 'object' },
        userGroups: { type: 'array', items: { type: 'object' } },
      },
      required: ['applicationIdList', 'computerGroupId', 'name', 'osType', 'policyActionId'],
    },
  },
  {
    name: 'policy_insert_for_copy',
    description: '⚠️ WRITE: Copy policies to target locations (organizations/groups/computers).',
    inputSchema: {
      type: 'object',
      properties: {
        managedOrganizationId: { type: 'string' },
        osType: { type: 'integer', enum: [1, 2, 3, 5] },
        policies: { type: 'array', items: { type: 'object' } },
        sourceAppliesToId: { type: 'string' },
        sourceOrganizationId: { type: 'string' },
        targetAppliesToIds: { type: 'array', items: { type: 'string' } },
      },
      required: [
        'osType',
        'policies',
        'sourceAppliesToId',
        'sourceOrganizationId',
        'targetAppliesToIds',
      ],
    },
  },
  {
    name: 'policy_update_by_id',
    description: '⚠️ WRITE: Update a policy by ID.',
    inputSchema: {
      type: 'object',
      properties: {
        managedOrganizationId: { type: 'string' },
        policyId: { type: 'string' },
        applicationIdList: { type: 'array', items: { type: 'string' } },
        computerGroupId: { type: 'string' },
        name: { type: 'string' },
        osType: { type: 'integer', enum: [1, 2, 3, 5] },
        policyActionId: { type: 'integer', enum: [1, 2, 6] },
        allDevices: { type: 'boolean' },
        allUserGroups: { type: 'boolean' },
        allowRequest: { type: 'boolean' },
        comments: { type: 'string' },
        description: { type: 'string' },
        elevationStatus: { type: 'integer', enum: [0, 1, 2] },
        endDate: { type: 'string' },
        isEnabled: { type: 'boolean' },
        killRunningProcesses: { type: 'boolean' },
        logAction: { type: 'boolean' },
        monitorMode: { type: 'boolean' },
        networkExclusions: { type: 'array', items: { type: 'object' } },
        notifyOnRequest: { type: 'boolean' },
        parentProcessIdList: { type: 'array', items: { type: 'string' } },
        parentRestrictionEnabled: { type: 'boolean' },
        policyScheduleStatus: { type: 'integer', enum: [0, 1, 2] },
        policySchedules: { type: 'array', items: { type: 'object' } },
        requestEmailAddressesList: { type: 'array', items: { type: 'string' } },
        ringfencingOptions: { type: 'object' },
        ticketInfo: { type: 'object' },
        userGroups: { type: 'array', items: { type: 'object' } },
      },
      required: [
        'policyId',
        'applicationIdList',
        'computerGroupId',
        'name',
        'osType',
        'policyActionId',
      ],
    },
  },
  {
    name: 'policy_delete_by_ids',
    description: '⚠️ WRITE/DELETE: Delete policies by IDs.',
    inputSchema: {
      type: 'object',
      properties: {
        managedOrganizationId: { type: 'string' },
        policies: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              organizationId: { type: 'string' },
              policyId: { type: 'string' },
              name: { type: 'string' },
            },
          },
        },
      },
      required: ['policies'],
    },
  },

  // ── Report ─────────────────────────────────────────────────────────────────
  {
    name: 'report_get_by_organization_id',
    description:
      'Get available reports for the organization (with metadata flags for required parameters).',
    inputSchema: {
      type: 'object',
      properties: {
        managedOrganizationId: { type: 'string' },
      },
    },
  },
  {
    name: 'report_get_dynamic_data',
    description: 'Get dynamic report data for a specific report.',
    inputSchema: {
      type: 'object',
      properties: {
        managedOrganizationId: { type: 'string' },
        reportId: { type: 'string' },
        data: {
          type: 'string',
          description: 'Report-specific data value (required when dateOption is true)',
        },
        startDate: { type: 'string' },
        endDate: { type: 'string' },
        id: { type: 'string' },
      },
      required: ['reportId'],
    },
  },

  // ── ResearchInformation ────────────────────────────────────────────────────
  {
    name: 'research_information_get_all_categories',
    description:
      'Get all research information categories (optionally including ThreatLocker Store categories).',
    inputSchema: {
      type: 'object',
      properties: {
        getStoreCategories: {
          type: 'boolean',
          description: 'Include additional categories from the ThreatLocker Store',
        },
      },
    },
  },

  // ── ScheduledAgentAction ───────────────────────────────────────────────────
  {
    name: 'scheduled_agent_action_create',
    description:
      '⚠️ WRITE: Create a scheduled agent action (e.g., version update). Requires Windows 10.7.4+ or Mac 6.1+.',
    inputSchema: {
      type: 'object',
      properties: {
        managedOrganizationId: { type: 'string' },
        appliesTo: { type: 'array', items: { type: 'object' } },
        scheduledType: { type: 'integer', description: '1=Version Update', enum: [1] },
        scheduledTypePayload: {
          type: 'string',
          description: 'JSON string payload, e.g. {"targetVersionId": "GUID"}',
        },
        batchAmount: { type: 'integer', enum: [25, 50, 100, 250, 500] },
        startDate: { type: 'string' },
        windowStartTime: { type: 'string', description: 'HH:MM (24-hour)' },
        windowEndTime: { type: 'string', description: 'HH:MM (24-hour)' },
      },
      required: ['appliesTo', 'scheduledType', 'scheduledTypePayload'],
    },
  },
  {
    name: 'scheduled_agent_action_abort',
    description: '⚠️ WRITE: Abort a scheduled agent action.',
    inputSchema: {
      type: 'object',
      properties: {
        managedOrganizationId: { type: 'string' },
        abortAll: { type: 'boolean' },
        appliesTo: { type: 'array', items: { type: 'object' } },
        scheduledId: { type: 'string' },
      },
      required: ['abortAll', 'appliesTo', 'scheduledId'],
    },
  },
  {
    name: 'scheduled_agent_action_applies_to',
    description:
      'Get available targets for scheduled agent actions (organizations, groups, computers).',
    inputSchema: {
      type: 'object',
      properties: {
        managedOrganizationId: { type: 'string' },
        osType: {
          type: 'integer',
          description: '1=Windows, 2=MAC, 3=Linux, 7=Red Hat Enterprise Linux 6',
          enum: [1, 2, 3, 7],
        },
        includeChildren: { type: 'boolean' },
        searchText: { type: 'string' },
      },
      required: ['osType'],
    },
  },
  {
    name: 'scheduled_agent_action_get_by_parameters',
    description: 'Get scheduled agent action results and progress by parameters.',
    inputSchema: {
      type: 'object',
      properties: {
        managedOrganizationId: { type: 'string' },
        scheduledId: { type: 'string' },
        computerGroupIds: { type: 'array', items: { type: 'string' } },
        organizationIds: { type: 'array', items: { type: 'string' } },
        isAscending: { type: 'boolean' },
        orderBy: {
          type: 'string',
          enum: ['scheduleddatetime', 'computername', 'computergroupname', 'organizationname'],
        },
        pageNumber: { type: 'integer' },
        pageSize: { type: 'integer' },
        searchText: { type: 'string' },
      },
      required: ['scheduledId'],
    },
  },
  {
    name: 'scheduled_agent_action_get_for_hydration',
    description: 'Get scheduled agent action details and progress by ID.',
    inputSchema: {
      type: 'object',
      properties: {
        scheduledId: { type: 'string' },
      },
      required: ['scheduledId'],
    },
  },
  {
    name: 'scheduled_agent_action_list',
    description: 'List all scheduled agent actions in the organization.',
    inputSchema: {
      type: 'object',
      properties: {
        managedOrganizationId: { type: 'string' },
        scheduledType: { type: 'integer', description: '1=Version Update', enum: [1] },
        includeChildren: { type: 'boolean' },
      },
      required: ['scheduledType'],
    },
  },

  // ── SystemAudit ────────────────────────────────────────────────────────────
  {
    name: 'system_audit_get_by_parameters',
    description: 'Get system audit log entries (portal-level admin activity).',
    inputSchema: {
      type: 'object',
      properties: {
        managedOrganizationId: { type: 'string' },
        endDate: { type: 'string' },
        pageNumber: { type: 'integer' },
        pageSize: { type: 'integer' },
        startDate: { type: 'string' },
        actions: {
          type: 'array',
          items: { type: 'string', enum: ['Create', 'Delete', 'Logon', 'Modify', 'Read'] },
        },
        afterKeys: {
          type: 'object',
          description: 'Integer key-value pairs for pagination beyond 10 pages',
        },
        details: { type: 'string', description: 'Partial text search on audit details' },
        effectiveAction: { type: 'string', enum: ['Denied', 'Permitted'] },
        emailAddress: { type: 'string', description: 'Search by username/email' },
        iPAddress: { type: 'string' },
        objectId: { type: 'string' },
        viewChildOrganizations: { type: 'boolean' },
      },
      required: ['endDate', 'pageNumber', 'pageSize', 'startDate'],
    },
  },
  {
    name: 'system_audit_get_for_health_center',
    description: 'Get login audit data for the health center (successful/denied logins).',
    inputSchema: {
      type: 'object',
      properties: {
        managedOrganizationId: { type: 'string' },
        days: { type: 'integer', description: 'Number of days back to search' },
        isLoggedIn: {
          type: 'boolean',
          description: 'true for successful logins, false for denied logins',
        },
        pageNumber: { type: 'integer' },
        pageSize: { type: 'integer' },
      },
      required: ['days', 'isLoggedIn', 'pageNumber', 'pageSize'],
    },
  },

  // ── Tag ────────────────────────────────────────────────────────────────────
  {
    name: 'tag_get_dropdown_options',
    description: 'Get tag dropdown options for the organization.',
    inputSchema: {
      type: 'object',
      properties: {
        managedOrganizationId: { type: 'string' },
      },
    },
  },

  // ── ThreatLockerVersion ────────────────────────────────────────────────────
  {
    name: 'threatlocker_version_get_for_dropdown',
    description: 'Get available ThreatLocker agent versions for the dropdown list.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },

  // ── User ───────────────────────────────────────────────────────────────────
  {
    name: 'user_get_all_timezones',
    description: 'Get all available timezones (used when creating organizations).',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'user_invite_by_username',
    description: '⚠️ WRITE: Invite a user by email address.',
    inputSchema: {
      type: 'object',
      properties: {
        email: { type: 'string', description: 'Email address of the user to invite' },
      },
      required: ['email'],
    },
  },

  // ── UserRoles ──────────────────────────────────────────────────────────────
  {
    name: 'user_roles_get_by_parameters',
    description: 'Get user roles by parameters.',
    inputSchema: {
      type: 'object',
      properties: {
        body: { type: 'object', description: 'Filter parameters (varies by organization setup)' },
      },
    },
  },
];

async function handleTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const org = args.managedOrganizationId as string | undefined;
  const orgHeader = org ? { managedOrganizationId: org } : {};

  switch (name) {
    // ActionLog
    case 'action_log_get_by_parameters': {
      const { managedOrganizationId: _o, ...body } = args;
      return callApi('POST', '/portalapi/ActionLog/ActionLogGetByParametersV2', undefined, body, {
        usenewsearch: 'true',
        ...orgHeader,
      });
    }

    // Application
    case 'application_get_by_id':
      return callApi(
        'GET',
        '/portalapi/Application/ApplicationGetById',
        { applicationId: args.applicationId },
        undefined,
        orgHeader,
      );
    case 'application_get_by_parameters': {
      const { managedOrganizationId: _o, ...body } = args;
      return callApi(
        'POST',
        '/portalapi/Application/ApplicationGetByParameters',
        undefined,
        body,
        orgHeader,
      );
    }
    case 'application_get_for_maintenance_mode':
      return callApi(
        'GET',
        '/portalapi/Application/ApplicationGetForMaintenanceMode',
        { osType: args.osType },
        undefined,
        orgHeader,
      );
    case 'application_get_matching_list': {
      const { managedOrganizationId: _o, ...body } = args;
      return callApi(
        'POST',
        '/portalapi/Application/ApplicationGetMatchingList',
        undefined,
        body,
        orgHeader,
      );
    }
    case 'application_get_research_details_by_id':
      return callApi(
        'GET',
        '/portalapi/Application/ApplicationGetResearchDetailsById',
        { applicationId: args.applicationId },
        undefined,
        orgHeader,
      );
    case 'application_insert': {
      const { managedOrganizationId: _o, ...body } = args;
      return callApi(
        'POST',
        '/portalapi/Application/ApplicationInsert',
        undefined,
        body,
        orgHeader,
      );
    }
    case 'application_update_by_id': {
      const { managedOrganizationId: _o, ...body } = args;
      return callApi(
        'PUT',
        '/portalapi/Application/ApplicationUpdateById',
        undefined,
        body,
        orgHeader,
      );
    }
    case 'application_delete': {
      const { managedOrganizationId: _o, ...body } = args;
      return callApi(
        'POST',
        '/portalapi/Application/ApplicationUpdateForDelete',
        undefined,
        body,
        orgHeader,
      );
    }
    case 'application_confirm_delete': {
      const { managedOrganizationId: _o, ...body } = args;
      return callApi(
        'POST',
        '/portalapi/Application/ApplicationConfirmUpdateForDelete',
        undefined,
        body,
        orgHeader,
      );
    }

    // ApplicationFile
    case 'application_file_get_by_application_id': {
      const {
        managedOrganizationId: _o,
        applicationId,
        pageNumber,
        pageSize,
        hashOnly,
        isCustomRule,
        searchText,
      } = args;
      return callApi(
        'GET',
        '/portalapi/ApplicationFile/ApplicationFileGetByApplicationId',
        { applicationId, pageNumber, pageSize, hashOnly, isCustomRule, searchText },
        undefined,
        orgHeader,
      );
    }
    case 'application_file_insert': {
      const { managedOrganizationId: _o, ...body } = args;
      return callApi(
        'POST',
        '/portalapi/ApplicationFile/ApplicationFileInsert',
        undefined,
        body,
        orgHeader,
      );
    }
    case 'application_file_update': {
      const { managedOrganizationId: _o, ...body } = args;
      return callApi(
        'POST',
        '/portalapi/ApplicationFile/ApplicationFileUpdate',
        undefined,
        body,
        orgHeader,
      );
    }
    case 'application_file_delete_by_id': {
      const { managedOrganizationId: _o, ...body } = args;
      return callApi(
        'POST',
        '/portalapi/ApplicationFile/ApplicationFileDeleteById',
        undefined,
        body,
        orgHeader,
      );
    }

    // ApprovalRequest
    case 'approval_request_get_by_parameters': {
      const { managedOrganizationId: _o, ...body } = args;
      return callApi(
        'POST',
        '/portalapi/ApprovalRequest/ApprovalRequestGetByParameters',
        undefined,
        body,
        orgHeader,
      );
    }
    case 'approval_request_get_count':
      return callApi(
        'GET',
        '/portalapi/ApprovalRequest/ApprovalRequestGetCount',
        { includeChildOrganizations: args.includeChildOrganizations },
        undefined,
        orgHeader,
      );
    case 'approval_request_get_file_download_details':
      return callApi(
        'GET',
        '/portalapi/ApprovalRequest/ApprovalRequestGetFileDownloadDetailsById',
        { approvalRequestId: args.approvalRequestId },
        undefined,
        orgHeader,
      );
    case 'approval_request_get_permit_application_by_id':
      return callApi(
        'GET',
        '/portalapi/ApprovalRequest/ApprovalRequestGetPermitApplicationById',
        { approvalRequestId: args.approvalRequestId },
        undefined,
        orgHeader,
      );
    case 'approval_request_authorize_for_permit': {
      const { managedOrganizationId: _o, ...body } = args;
      return callApi(
        'POST',
        '/portalapi/ApprovalRequest/ApprovalRequestAuthorizeForPermitById',
        undefined,
        body,
        orgHeader,
      );
    }
    case 'approval_request_permit_application': {
      const { managedOrganizationId: _o, ...body } = args;
      return callApi(
        'POST',
        '/portalapi/ApprovalRequest/ApprovalRequestPermitApplication',
        undefined,
        body,
        orgHeader,
      );
    }

    // ConfigManager
    case 'cm_configuration_get_enabled':
      return callApi('GET', '/portalapi/CMConfiguration/CMConfigurationGetWithCategoryByIsEnabled');
    case 'cm_policy_get_by_parameters': {
      const { managedOrganizationId: _o, ...body } = args;
      return callApi(
        'POST',
        '/portalapi/CMPolicy/CMPolicyGetbyParameters',
        undefined,
        body,
        orgHeader,
      );
    }

    // Computer
    case 'computer_get_by_all_parameters': {
      const { managedOrganizationId: _o, ...body } = args;
      return callApi(
        'POST',
        '/portalapi/Computer/ComputerGetByAllParameters',
        undefined,
        body,
        orgHeader,
      );
    }
    case 'computer_get_for_edit_by_id':
      return callApi(
        'GET',
        '/portalapi/Computer/ComputerGetForEditById',
        { computerId: args.computerId },
        undefined,
        orgHeader,
      );
    case 'computer_get_for_new_computer':
      return callApi(
        'GET',
        '/portalapi/Computer/ComputerGetForNewComputer',
        undefined,
        undefined,
        orgHeader,
      );
    case 'computer_get_download': {
      const { managedOrganizationId: _o, ...body } = args;
      return callApi('POST', '/portalapi/Computer/ComputerGetDownload', undefined, body);
    }
    case 'computer_signed_script_download':
      return callApi('GET', '/portalapi/Computer/ComputerSignedScriptDownload', {
        brand: args.brand,
      });
    case 'computer_sample_path_download':
      return callApi('GET', '/portalapi/Computer/ComputerSamplePathDownload', {
        brand: args.brand,
        authKey: args.authKey,
      });
    case 'computer_unsigned_script_download':
      return callApi('GET', '/portalapi/Computer/ComputerUnSignedScriptDownload', {
        brand: args.brand,
      });
    case 'computer_update_for_edit': {
      const { managedOrganizationId: _o, ...body } = args;
      return callApi(
        'PATCH',
        '/portalapi/Computer/ComputerUpdateForEdit',
        undefined,
        body,
        orgHeader,
      );
    }
    case 'computer_update_baseline_rescan': {
      const { managedOrganizationId: _o, ...body } = args;
      return callApi(
        'POST',
        '/portalapi/Computer/ComputerUpdateBaselineRescan',
        undefined,
        body,
        orgHeader,
      );
    }
    case 'computer_update_should_restart_by_ids':
      return callApi(
        'POST',
        '/portalapi/Computer/ComputerUpdateShouldRestartByIds',
        undefined,
        args.computers,
      );
    case 'computer_update_should_restart_by_organization':
      return callApi(
        'POST',
        '/portalapi/Computer/ComputerUpdateShouldRestartByOrganization',
        undefined,
        args.value,
      );
    case 'computer_move_to_other_organization':
      return callApi(
        'POST',
        '/portalapi/Computer/ComputerMoveToOtherOrganization',
        undefined,
        args,
      );
    case 'computer_enable_protection':
      return callApi('POST', '/portalapi/Computer/ComputerEnableProtection', undefined, {
        computerDetailDtos: args.computerDetailDtos,
      });
    case 'computer_disable_protection': {
      const { managedOrganizationId: _o, ...body } = args;
      return callApi('POST', '/portalapi/Computer/ComputerDisableProtection', undefined, body);
    }
    case 'computer_remove_duplicate':
      return callApi('POST', '/portalapi/Computer/ComputerRemoveDuplicate', undefined, args.value);
    case 'computer_update_maintenance_mode':
      return callApi('POST', '/portalapi/Computer/ComputerUpdateMaintenanceMode', undefined, args);
    case 'computer_update_threatlocker_version_by_ids':
      return callApi(
        'POST',
        '/portalapi/Computer/ComputerUpdateThreatlockerVersionByIds',
        undefined,
        args,
      );
    case 'computer_delete_by_ids':
      return callApi(
        'POST',
        '/portalapi/Computer/ComputerUpdateForDeleteByIds',
        undefined,
        args.computers,
      );

    // ComputerCheckin
    case 'computer_checkin_get_by_parameters': {
      const { managedOrganizationId: _o, ...body } = args;
      return callApi(
        'POST',
        '/portalapi/ComputerCheckin/ComputerCheckinGetByParameters',
        undefined,
        body,
        orgHeader,
      );
    }

    // ComputerGroup
    case 'computer_group_get_by_id':
      return callApi(
        'GET',
        '/portalapi/ComputerGroup/ComputerGroupGetById',
        { computerGroupId: args.computerGroupId },
        undefined,
        orgHeader,
      );
    case 'computer_group_get_by_parameters': {
      const { managedOrganizationId: _o, ...body } = args;
      return callApi(
        'POST',
        '/portalapi/ComputerGroup/ComputerGroupGetByParameters',
        undefined,
        body,
        orgHeader,
      );
    }
    case 'computer_group_get_dropdown_with_organization':
      return callApi(
        'GET',
        '/portalapi/ComputerGroup/ComputerGroupGetDropdownWithOrganization',
        { includeAvailableOrganizations: args.includeAvailableOrganizations },
        undefined,
        orgHeader,
      );
    case 'computer_group_get_dropdown_by_organization_id':
      return callApi(
        'GET',
        '/portalapi/ComputerGroup/ComputerGroupGetDropdownByOrganizationId',
        { computerGroupOSTypeId: args.computerGroupOSTypeId, computerOSType: args.computerOSType },
        undefined,
        orgHeader,
      );
    case 'computer_group_get_for_download':
      return callApi('GET', '/portalapi/ComputerGroup/ComputerGroupGetForDownload', {
        installKey: args.installKey,
      });
    case 'computer_group_get_for_permit_application':
      return callApi(
        'GET',
        '/portalapi/ComputerGroup/ComputerGroupGetForPermitApplication',
        { osType: args.osType },
        undefined,
        orgHeader,
      );
    case 'computer_group_get_group_and_computer':
      return callApi(
        'GET',
        '/portalapi/ComputerGroup/ComputerGroupGetGroupAndComputer',
        {
          OSType: args.OSType,
          includeGlobal: args.includeGlobal,
          includeOrganizations: args.includeOrganizations,
          includeParentGroups: args.includeParentGroups,
          includeLoggedInObjects: args.includeLoggedInObjects,
        },
        undefined,
        orgHeader,
      );
    case 'computer_group_insert': {
      const { managedOrganizationId: _o, ...body } = args;
      return callApi(
        'POST',
        '/portalapi/ComputerGroup/ComputerGroupInsert',
        undefined,
        body,
        orgHeader,
      );
    }
    case 'computer_group_update_by_id': {
      const { managedOrganizationId: _o, ...body } = args;
      return callApi(
        'POST',
        '/portalapi/ComputerGroup/ComputerGroupUpdateById',
        undefined,
        body,
        orgHeader,
      );
    }
    case 'computer_group_delete': {
      const { managedOrganizationId: _o, groups } = args;
      return callApi(
        'POST',
        '/portalapi/ComputerGroup/ComputerGroupUpdateForDelete',
        undefined,
        groups,
        orgHeader,
      );
    }

    // DAC
    case 'dac_analysis_item_get_by_id':
      return callApi('GET', '/portalapi/DACAnalysisItem/DACAnalysisItemGetById', {
        analysisItemId: args.analysisItemId,
      });
    case 'dac_analysis_results_get_by_parameters': {
      const { managedOrganizationId: _o, ...body } = args;
      return callApi(
        'POST',
        '/portalapi/DACAnalysisResult/DACAnalysisResultsGetByParameters',
        undefined,
        body,
        orgHeader,
      );
    }

    // DeployPolicyQueue
    case 'deploy_policies':
      return callApi(
        'POST',
        '/portalapi/DeployPolicyQueue/DeployPolicies',
        undefined,
        undefined,
        orgHeader,
      );
    case 'deploy_policies_for_computer':
      return callApi(
        'POST',
        '/portalapi/DeployPolicyQueue/DeployPoliciesForComputer',
        { computerId: args.computerId, computerName: args.computerName },
        undefined,
        orgHeader,
      );

    // MaintenanceMode
    case 'maintenance_mode_get_by_computer_id':
      return callApi(
        'GET',
        '/portalapi/MaintenanceMode/MaintenanceModeGetByComputerIdV2',
        { computerId: args.computerId, pageNumber: args.pageNumber, pageSize: args.pageSize },
        undefined,
        orgHeader,
      );
    case 'maintenance_mode_insert': {
      const { managedOrganizationId: _o, ...body } = args;
      return callApi(
        'POST',
        '/portalapi/MaintenanceMode/MaintenanceModeInsert',
        undefined,
        body,
        orgHeader,
      );
    }
    case 'maintenance_mode_end_by_id':
      return callApi('PATCH', '/portalapi/MaintenanceMode/MaintenanceModeEndById', undefined, args);
    case 'maintenance_mode_update_end_date':
      return callApi(
        'POST',
        '/portalapi/MaintenanceMode/MaintenanceModeUpdateEndDateTimeForSpecificDate',
        undefined,
        args,
      );

    // NetworkAccessPolicy
    case 'network_access_policy_insert': {
      const { managedOrganizationId: _o, ...body } = args;
      return callApi(
        'POST',
        '/portalapi/NetworkAccessPolicy/NetworkAccessPolicyInsert',
        undefined,
        body,
        orgHeader,
      );
    }

    // OnlineDevices
    case 'online_devices_get_by_parameters':
      return callApi(
        'GET',
        '/portalapi/OnlineDevices/OnlineDevicesGetByParameters',
        { pageSize: args.pageSize, pageNumber: args.pageNumber },
        undefined,
        orgHeader,
      );

    // Organization
    case 'organization_create_child': {
      const { managedOrganizationId: _o, ...body } = args;
      return callApi(
        'POST',
        '/portalapi/Organization/OrganizationCreateChild',
        undefined,
        body,
        orgHeader,
      );
    }
    case 'organization_get_auth_key':
      return callApi(
        'GET',
        '/portalapi/Organization/OrganizationGetAuthKeyById',
        undefined,
        undefined,
        orgHeader,
      );
    case 'organization_get_child_organizations': {
      const { managedOrganizationId: _o, ...body } = args;
      return callApi(
        'POST',
        '/portalapi/Organization/OrganizationGetChildOrganizationsByParameters',
        undefined,
        body,
        orgHeader,
      );
    }
    case 'organization_get_for_move_computers':
      return callApi('GET', '/portalapi/Organization/OrganizationGetForMoveComputers', {
        searchText: args.searchText,
      });
    case 'organization_update_auth_key':
      return callApi(
        'POST',
        '/portalapi/Organization/OrganizationUpdateAuthKeyById',
        undefined,
        undefined,
        orgHeader,
      );

    // Permission
    case 'permission_get_for_administrator':
      return callApi('POST', '/portalapi/Permission/PermissionGetForAdministrator', undefined, {});

    // Policy
    case 'policy_get_by_id':
      return callApi(
        'GET',
        '/portalapi/Policy/PolicyGetById',
        { policyId: args.policyId },
        undefined,
        orgHeader,
      );
    case 'policy_get_by_parameters': {
      const { managedOrganizationId: _o, ...body } = args;
      return callApi('POST', '/portalapi/Policy/PolicyGetByParameters', undefined, body, orgHeader);
    }
    case 'policy_get_for_view_by_application_id': {
      const { managedOrganizationId: _o, ...body } = args;
      return callApi(
        'POST',
        '/portalapi/Policy/PolicyGetForViewPoliciesByApplicationId',
        undefined,
        body,
        orgHeader,
      );
    }
    case 'policy_insert': {
      const { managedOrganizationId: _o, ...body } = args;
      return callApi('POST', '/portalapi/Policy/PolicyInsert', undefined, body, orgHeader);
    }
    case 'policy_insert_for_copy': {
      const { managedOrganizationId: _o, ...body } = args;
      return callApi(
        'POST',
        '/portalapi/Policy/PolicyInsertForCopyPolicies',
        undefined,
        body,
        orgHeader,
      );
    }
    case 'policy_update_by_id': {
      const { managedOrganizationId: _o, ...body } = args;
      return callApi('PUT', '/portalapi/Policy/PolicyUpdateById', undefined, body, orgHeader);
    }
    case 'policy_delete_by_ids': {
      const { managedOrganizationId: _o, policies } = args;
      return callApi(
        'PUT',
        '/portalapi/Policy/PolicyUpdateForDeleteByIds',
        undefined,
        policies,
        orgHeader,
      );
    }

    // Report
    case 'report_get_by_organization_id':
      return callApi(
        'GET',
        '/portalapi/Report/ReportGetByOrganizationId',
        undefined,
        undefined,
        orgHeader,
      );
    case 'report_get_dynamic_data': {
      const { managedOrganizationId: _o, ...body } = args;
      return callApi('POST', '/portalapi/Report/ReportGetDynamicData', undefined, body, orgHeader);
    }

    // ResearchInformation
    case 'research_information_get_all_categories':
      return callApi('GET', '/portalapi/ResearchInformation/ResearchInformationGetAllCategories', {
        getStoreCategories: args.getStoreCategories,
      });

    // ScheduledAgentAction
    case 'scheduled_agent_action_create': {
      const { managedOrganizationId: _o, ...body } = args;
      return callApi('POST', '/portalapi/ScheduledAgentAction', undefined, body, orgHeader);
    }
    case 'scheduled_agent_action_abort': {
      const { managedOrganizationId: _o, ...body } = args;
      return callApi('POST', '/portalapi/ScheduledAgentAction/Abort', undefined, body, orgHeader);
    }
    case 'scheduled_agent_action_applies_to':
      return callApi(
        'GET',
        '/portalapi/ScheduledAgentAction/AppliesTo',
        { osType: args.osType, includeChildren: args.includeChildren, searchText: args.searchText },
        undefined,
        orgHeader,
      );
    case 'scheduled_agent_action_get_by_parameters': {
      const { managedOrganizationId: _o, ...body } = args;
      return callApi(
        'POST',
        '/portalapi/ScheduledAgentAction/GetByParameters',
        undefined,
        body,
        orgHeader,
      );
    }
    case 'scheduled_agent_action_get_for_hydration':
      return callApi('GET', '/portalapi/ScheduledAgentAction/GetForHydration', {
        scheduledId: args.scheduledId,
      });
    case 'scheduled_agent_action_list':
      return callApi(
        'GET',
        '/portalapi/ScheduledAgentAction/List',
        { scheduledType: args.scheduledType, includeChildren: args.includeChildren },
        undefined,
        orgHeader,
      );

    // SystemAudit
    case 'system_audit_get_by_parameters': {
      const { managedOrganizationId: _o, ...body } = args;
      return callApi(
        'POST',
        '/portalapi/SystemAudit/SystemAuditGetByParameters',
        undefined,
        body,
        orgHeader,
      );
    }
    case 'system_audit_get_for_health_center': {
      const { managedOrganizationId: _o, ...body } = args;
      return callApi(
        'POST',
        '/portalapi/SystemAudit/SystemAuditGetForHealthCenter',
        undefined,
        body,
        orgHeader,
      );
    }

    // Tag
    case 'tag_get_dropdown_options':
      return callApi(
        'GET',
        '/portalapi/Tag/TagGetDowndownOptionsByOrganizationId',
        undefined,
        undefined,
        orgHeader,
      );

    // ThreatLockerVersion
    case 'threatlocker_version_get_for_dropdown':
      return callApi('GET', '/portalapi/ThreatLockerVersion/ThreatLockerVersionGetForDropdownList');

    // User
    case 'user_get_all_timezones':
      return callApi('GET', '/portalapi/User/UserGetAllTimezones');
    case 'user_invite_by_username':
      return callApi('POST', '/portalapi/User/UserInviteByUsername', undefined, {
        username: args.email,
      });

    // UserRoles
    case 'user_roles_get_by_parameters':
      return callApi(
        'POST',
        '/portalapi/UserRoles/UserRolesGetByParameters',
        undefined,
        args.body ?? {},
      );

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

const server = new Server(
  { name: 'mcp-threatlocker', version: '1.0.0' },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  try {
    const result = await handleTool(name, (args ?? {}) as Record<string, unknown>);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  } catch (err) {
    return handleToolError(err, name);
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
