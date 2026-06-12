import { z } from 'zod';

const OsTypeSchema = z.coerce
  .number()
  .int()
  .refine((v) => [1, 2, 3, 5].includes(v), {
    message: 'osType must be 1=Windows, 2=MAC, 3=Linux, 5=Windows XP',
  });

export const ComputerGroupGetByIdSchema = z.object({
  managedOrganizationId: z.string().uuid().optional(),
  computerGroupId: z.string().min(1),
});

export const ComputerGroupGetByParametersSchema = z.object({
  managedOrganizationId: z.string().uuid().optional(),
  pageNumber: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(10000).default(50),
  osType: z.coerce
    .number()
    .int()
    .refine((v) => [0, 1, 2, 3, 5, 6, 10, 11].includes(v), {
      message:
        'osType must be 0=All, 1=Windows, 2=MAC, 3=Linux, 5=XP, 6=Ingester, 10=iOS, 11=Android',
    })
    .optional(),
  searchText: z.string().optional(),
  showAllGroups: z.coerce.boolean().optional(),
});

export const ComputerGroupGetDropdownWithOrganizationSchema = z.object({
  managedOrganizationId: z.string().uuid().optional(),
  includeAvailableOrganizations: z.coerce.boolean().optional(),
});

export const ComputerGroupGetDropdownByOrganizationIdSchema = z.object({
  managedOrganizationId: z.string().uuid().optional(),
  computerGroupOSTypeId: OsTypeSchema.optional(),
  computerOSType: z.enum(['windows', 'mac', 'linux', 'windows xp']).optional(),
});

export const ComputerGroupGetForDownloadSchema = z.object({
  installKey: z.string().min(24).max(24),
});

export const ComputerGroupGetForPermitApplicationSchema = z.object({
  managedOrganizationId: z.string().uuid().optional(),
  osType: OsTypeSchema.optional(),
});

export const ComputerGroupGetGroupAndComputerSchema = z.object({
  managedOrganizationId: z.string().uuid().optional(),
  OSType: z.coerce
    .number()
    .int()
    .refine((v) => [0, 1, 2, 3, 5].includes(v))
    .optional(),
  includeGlobal: z.coerce.boolean().optional(),
  includeOrganizations: z.coerce.boolean().optional(),
  includeParentGroups: z.coerce.boolean().optional(),
  includeLoggedInObjects: z.coerce.boolean().optional(),
});

const AutoCreatePoliciesSchema = z.coerce
  .number()
  .int()
  .refine((v) => [0, 1, 2, 3].includes(v));

export const ComputerGroupInsertSchema = z.object({
  managedOrganizationId: z.string().uuid().optional(),
  name: z.string().min(1),
  osType: OsTypeSchema,
  autoCreatePolicies: AutoCreatePoliciesSchema.optional(),
  baselineAllPaths: z.coerce.boolean().optional(),
  baselineOptions: z.array(z.string()).optional(),
  cyberHeroUseOrgSettings: z.coerce.boolean().optional(),
  exclusions: z.array(z.record(z.unknown())).optional(),
  initialMonitorModeHours: z.coerce.number().int().optional(),
  options: z.array(z.string()).optional(),
  policyRefreshIntervalSeconds: z.coerce.number().int().optional(),
  tlInstructions: z.string().optional(),
});

export const ComputerGroupUpdateByIdSchema = z.object({
  managedOrganizationId: z.string().uuid().optional(),
  computerGroupId: z.string().min(1),
  name: z.string().min(1),
  osType: OsTypeSchema,
  autoCreatePolicies: AutoCreatePoliciesSchema.optional(),
  baselineAllPaths: z.coerce.boolean().optional(),
  baselineOptions: z.array(z.string()).optional(),
  cyberHeroUseOrgSettings: z.coerce.boolean().optional(),
  exclusions: z.array(z.record(z.unknown())).optional(),
  initialMonitorModeHours: z.coerce.number().int().optional(),
  options: z.array(z.string()).optional(),
  policyRefreshIntervalSeconds: z.coerce.number().int().optional(),
  tlInstructions: z.string().optional(),
});

export const ComputerGroupDeleteSchema = z.object({
  managedOrganizationId: z.string().uuid().optional(),
  groups: z.array(
    z.object({
      computerGroupId: z.string().min(1),
      name: z.string().optional(),
      organizationId: z.string().optional(),
    }),
  ),
});

export type ComputerGroupGetByIdInput = z.infer<typeof ComputerGroupGetByIdSchema>;
export type ComputerGroupGetByParametersInput = z.infer<typeof ComputerGroupGetByParametersSchema>;
export type ComputerGroupGetDropdownWithOrganizationInput = z.infer<
  typeof ComputerGroupGetDropdownWithOrganizationSchema
>;
export type ComputerGroupGetDropdownByOrganizationIdInput = z.infer<
  typeof ComputerGroupGetDropdownByOrganizationIdSchema
>;
export type ComputerGroupGetForDownloadInput = z.infer<typeof ComputerGroupGetForDownloadSchema>;
export type ComputerGroupGetForPermitApplicationInput = z.infer<
  typeof ComputerGroupGetForPermitApplicationSchema
>;
export type ComputerGroupGetGroupAndComputerInput = z.infer<
  typeof ComputerGroupGetGroupAndComputerSchema
>;
export type ComputerGroupInsertInput = z.infer<typeof ComputerGroupInsertSchema>;
export type ComputerGroupUpdateByIdInput = z.infer<typeof ComputerGroupUpdateByIdSchema>;
export type ComputerGroupDeleteInput = z.infer<typeof ComputerGroupDeleteSchema>;
