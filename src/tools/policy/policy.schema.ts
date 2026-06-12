import { z } from 'zod';

const OsTypeSchema = z.coerce
  .number()
  .int()
  .refine((v) => [1, 2, 3, 5].includes(v), {
    message: 'osType must be 1=Windows, 2=MAC, 3=Linux, 5=Windows XP',
  });

const PolicyActionIdSchema = z.coerce
  .number()
  .int()
  .refine((v) => [1, 2, 6].includes(v), {
    message: 'policyActionId: 1=Permit, 2=Deny, 6=Permit with Ringfence',
  });

export const PolicyGetByIdSchema = z.object({
  managedOrganizationId: z.string().uuid().optional(),
  policyId: z.string().min(1),
});

export const PolicyGetByParametersSchema = z.object({
  managedOrganizationId: z.string().uuid().optional(),
  filter: z.enum([
    '',
    'nomatch',
    'match',
    'over6weeks',
    'ringfence',
    'noringfence',
    'elevation',
    'permitonly',
  ]),
  pageNumber: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(10000).default(50),
  activeOnly: z.coerce.boolean().optional(),
  computerGroupId: z.string().optional(),
  osType: OsTypeSchema.optional(),
  searchText: z.string().optional(),
  showAllPolicies: z.coerce.boolean().optional(),
});

export const PolicyGetForViewByApplicationIdSchema = z.object({
  managedOrganizationId: z.string().uuid().optional(),
  applicationId: z.string().min(1),
  organizationId: z.string().min(1),
  pageNumber: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(10000).default(50),
  appliesToId: z.string().optional(),
  includeDenies: z.coerce.boolean().optional(),
});

export const PolicyInsertSchema = z.object({
  managedOrganizationId: z.string().uuid().optional(),
  applicationIdList: z.array(z.string()),
  computerGroupId: z.string().min(1),
  name: z.string().min(1),
  osType: OsTypeSchema,
  policyActionId: PolicyActionIdSchema,
  allDevices: z.coerce.boolean().optional(),
  allUserGroups: z.coerce.boolean().optional(),
  allowRequest: z.coerce.boolean().optional(),
  comments: z.string().optional(),
  description: z.string().optional(),
  elevationEndDate: z.string().optional(),
  elevationStatus: z.coerce
    .number()
    .int()
    .refine((v) => [0, 1, 2].includes(v))
    .optional(),
  endDate: z.string().optional(),
  isEnabled: z.coerce.boolean().optional(),
  killRunningProcesses: z.coerce.boolean().optional(),
  logAction: z.coerce.boolean().optional(),
  monitorMode: z.coerce.boolean().optional(),
  networkExclusions: z.array(z.record(z.unknown())).optional(),
  notifyOnRequest: z.coerce.boolean().optional(),
  orderBefore: z.string().optional(),
  parentProcessIdList: z.array(z.string()).optional(),
  parentRestrictionEnabled: z.coerce.boolean().optional(),
  policyScheduleStatus: z.coerce
    .number()
    .int()
    .refine((v) => [0, 1, 2].includes(v))
    .optional(),
  policySchedules: z.array(z.record(z.unknown())).optional(),
  requestEmailAddressesList: z.array(z.string()).optional(),
  requestor: z.string().optional(),
  ringfencingOptions: z.record(z.unknown()).optional(),
  ticketInfo: z.record(z.unknown()).optional(),
  userGroups: z.array(z.record(z.unknown())).optional(),
});

export const PolicyInsertForCopySchema = z.object({
  managedOrganizationId: z.string().uuid().optional(),
  osType: OsTypeSchema,
  policies: z.array(z.record(z.unknown())),
  sourceAppliesToId: z.string().min(1),
  sourceOrganizationId: z.string().min(1),
  targetAppliesToIds: z.array(z.string()),
});

export const PolicyUpdateByIdSchema = z.object({
  managedOrganizationId: z.string().uuid().optional(),
  policyId: z.string().min(1),
  applicationIdList: z.array(z.string()),
  computerGroupId: z.string().min(1),
  name: z.string().min(1),
  osType: OsTypeSchema,
  policyActionId: PolicyActionIdSchema,
  allDevices: z.coerce.boolean().optional(),
  allUserGroups: z.coerce.boolean().optional(),
  allowRequest: z.coerce.boolean().optional(),
  comments: z.string().optional(),
  description: z.string().optional(),
  elevationStatus: z.coerce
    .number()
    .int()
    .refine((v) => [0, 1, 2].includes(v))
    .optional(),
  endDate: z.string().optional(),
  isEnabled: z.coerce.boolean().optional(),
  killRunningProcesses: z.coerce.boolean().optional(),
  logAction: z.coerce.boolean().optional(),
  monitorMode: z.coerce.boolean().optional(),
  networkExclusions: z.array(z.record(z.unknown())).optional(),
  notifyOnRequest: z.coerce.boolean().optional(),
  parentProcessIdList: z.array(z.string()).optional(),
  parentRestrictionEnabled: z.coerce.boolean().optional(),
  policyScheduleStatus: z.coerce
    .number()
    .int()
    .refine((v) => [0, 1, 2].includes(v))
    .optional(),
  policySchedules: z.array(z.record(z.unknown())).optional(),
  requestEmailAddressesList: z.array(z.string()).optional(),
  ringfencingOptions: z.record(z.unknown()).optional(),
  ticketInfo: z.record(z.unknown()).optional(),
  userGroups: z.array(z.record(z.unknown())).optional(),
});

export const PolicyDeleteByIdsSchema = z.object({
  managedOrganizationId: z.string().uuid().optional(),
  policies: z.array(
    z.object({
      organizationId: z.string().optional(),
      policyId: z.string().min(1),
      name: z.string().optional(),
    }),
  ),
});

export type PolicyGetByIdInput = z.infer<typeof PolicyGetByIdSchema>;
export type PolicyGetByParametersInput = z.infer<typeof PolicyGetByParametersSchema>;
export type PolicyGetForViewByApplicationIdInput = z.infer<
  typeof PolicyGetForViewByApplicationIdSchema
>;
export type PolicyInsertInput = z.infer<typeof PolicyInsertSchema>;
export type PolicyInsertForCopyInput = z.infer<typeof PolicyInsertForCopySchema>;
export type PolicyUpdateByIdInput = z.infer<typeof PolicyUpdateByIdSchema>;
export type PolicyDeleteByIdsInput = z.infer<typeof PolicyDeleteByIdsSchema>;
