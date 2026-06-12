import { z } from 'zod';

const _OsTypeSchema = z.coerce
  .number()
  .int()
  .refine((v) => [1, 2, 3, 5].includes(v), {
    message: 'osType must be 1=Windows, 2=MAC, 3=Linux, 5=Windows XP',
  });

const MaintenanceModeTypeSchema = z.coerce
  .number()
  .int()
  .refine((v) => [1, 3, 6].includes(v), {
    message:
      'maintenanceModeType must be 1=Monitor Only, 3=Learning Mode, 6=Disable Tamper Protection',
  });

const ComputerDetailDtoSchema = z.object({
  computerId: z.string().min(1),
  organizationId: z.string().optional(),
});

export const ComputerGetByAllParametersSchema = z.object({
  managedOrganizationId: z.string().uuid().optional(),
  orderBy: z.enum([
    'computername',
    'group',
    'action',
    'lastcheckin',
    'computerinstalldate',
    'deniedcountthreedays',
    'threatlockerversion',
  ]),
  pageNumber: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(10000).default(50),
  action: z.string().optional(),
  childOrganizations: z.coerce.boolean().optional(),
  computerGroup: z.string().optional(),
  computerId: z.string().optional(),
  isAscending: z.coerce.boolean().optional(),
  kindOfAction: z
    .enum([
      'Computer Mode',
      'TamperProtectionDisabled',
      'NeedsReview',
      'ReadyToSecure',
      'BaselineNotUploaded',
      'Update Channel',
    ])
    .optional(),
  searchBy: z.coerce
    .number()
    .int()
    .refine((v) => [1, 2, 3, 4, 5].includes(v), {
      message:
        'searchBy: 1=Computer/Asset Name, 2=Username, 3=Computer Group Name, 4=Last Check-in IP, 5=Organization Name',
    })
    .optional(),
  searchText: z.string().optional(),
});

export const ComputerGetForEditByIdSchema = z.object({
  managedOrganizationId: z.string().uuid().optional(),
  computerId: z.string().min(1),
});

export const ComputerGetForNewComputerSchema = z.object({
  managedOrganizationId: z.string().uuid().optional(),
});

export const ComputerGetDownloadSchema = z.object({
  platform: z.string(),
  brand: z.string().min(1),
  apiKey: z.string().min(1),
  fileType: z.enum([
    'stub',
    'windows',
    'pssscript',
    'mac',
    'debian',
    'redhat',
    'windowsxp',
    'remediation',
  ]),
});

export const ComputerSignedScriptDownloadSchema = z.object({
  brand: z.string().min(1),
});

export const ComputerSamplePathDownloadSchema = z.object({
  brand: z.string().min(1),
  authKey: z.string().min(1),
});

export const ComputerUnsignedScriptDownloadSchema = z.object({
  brand: z.string().min(1),
});

export const ComputerUpdateForEditSchema = z.object({
  managedOrganizationId: z.string().uuid().optional(),
  computerId: z.string().min(1),
  computerGroupId: z.string().min(1),
  name: z.string().min(1),
  useProxyServer: z.coerce.boolean(),
  proxyServerOption: z.string(),
  proxyUrlEntry: z.string(),
  proxyURL: z.string(),
  options: z.array(z.string()),
});

export const ComputerUpdateBaselineRescanSchema = z.object({
  managedOrganizationId: z.string().uuid().optional(),
  computerDetailDtos: z.array(z.record(z.unknown())),
  enableLearning: z.coerce.boolean(),
});

export const ComputerUpdateShouldRestartByIdsSchema = z.object({
  computers: z.array(
    z.object({
      computerId: z.string().min(1),
      organizationId: z.string().optional(),
    }),
  ),
});

export const ComputerUpdateShouldRestartByOrganizationSchema = z.object({
  value: z.coerce.boolean(),
});

export const ComputerMoveToOtherOrganizationSchema = z.object({
  computerDetailDtos: z.array(z.record(z.unknown())),
  enableLearningRescan: z.coerce.boolean(),
  targetComputerGroupId: z.string().min(1),
  targetOrganizationId: z.string().min(1),
});

export const ComputerEnableProtectionSchema = z.object({
  computerDetailDtos: z.array(ComputerDetailDtoSchema),
});

export const ComputerDisableProtectionSchema = z.object({
  managedOrganizationId: z.string().uuid().optional(),
  computerDetailDtos: z.array(z.record(z.unknown())),
  endDate: z.string().min(1),
  startDate: z.string().min(1),
  maintenanceModeType: MaintenanceModeTypeSchema,
  permitEnd: z.coerce.boolean(),
  applicationId: z.string().optional(),
});

export const ComputerRemoveDuplicateSchema = z.object({
  value: z.coerce.boolean(),
});

export const ComputerUpdateMaintenanceModeSchema = z.object({
  applicationId: z.string().min(1),
  computerDetailDto: z.object({
    computerId: z.string().min(1),
    organizationId: z.string().optional(),
    maintenanceTypeId: z.coerce
      .number()
      .int()
      .refine((v) => [1, 2, 3, 8, 17, 18].includes(v))
      .optional(),
    maintenanceEndDate: z.string().optional(),
    startDateTime: z.string().optional(),
  }),
});

export const ComputerUpdateThreatlockerVersionByIdsSchema = z.object({
  threatLockerVersion: z.string().min(1),
  threatLockerVersionId: z.string().min(1),
  computerDetailDtos: z.array(z.record(z.unknown())),
});

export const ComputerDeleteByIdsSchema = z.object({
  computers: z.array(
    z.object({
      computerId: z.string().min(1),
      computerName: z.string().optional(),
      organizationId: z.string().optional(),
    }),
  ),
});

export type ComputerGetByAllParametersInput = z.infer<typeof ComputerGetByAllParametersSchema>;
export type ComputerGetForEditByIdInput = z.infer<typeof ComputerGetForEditByIdSchema>;
export type ComputerGetForNewComputerInput = z.infer<typeof ComputerGetForNewComputerSchema>;
export type ComputerGetDownloadInput = z.infer<typeof ComputerGetDownloadSchema>;
export type ComputerSignedScriptDownloadInput = z.infer<typeof ComputerSignedScriptDownloadSchema>;
export type ComputerSamplePathDownloadInput = z.infer<typeof ComputerSamplePathDownloadSchema>;
export type ComputerUnsignedScriptDownloadInput = z.infer<
  typeof ComputerUnsignedScriptDownloadSchema
>;
export type ComputerUpdateForEditInput = z.infer<typeof ComputerUpdateForEditSchema>;
export type ComputerUpdateBaselineRescanInput = z.infer<typeof ComputerUpdateBaselineRescanSchema>;
export type ComputerUpdateShouldRestartByIdsInput = z.infer<
  typeof ComputerUpdateShouldRestartByIdsSchema
>;
export type ComputerUpdateShouldRestartByOrganizationInput = z.infer<
  typeof ComputerUpdateShouldRestartByOrganizationSchema
>;
export type ComputerMoveToOtherOrganizationInput = z.infer<
  typeof ComputerMoveToOtherOrganizationSchema
>;
export type ComputerEnableProtectionInput = z.infer<typeof ComputerEnableProtectionSchema>;
export type ComputerDisableProtectionInput = z.infer<typeof ComputerDisableProtectionSchema>;
export type ComputerRemoveDuplicateInput = z.infer<typeof ComputerRemoveDuplicateSchema>;
export type ComputerUpdateMaintenanceModeInput = z.infer<
  typeof ComputerUpdateMaintenanceModeSchema
>;
export type ComputerUpdateThreatlockerVersionByIdsInput = z.infer<
  typeof ComputerUpdateThreatlockerVersionByIdsSchema
>;
export type ComputerDeleteByIdsInput = z.infer<typeof ComputerDeleteByIdsSchema>;
