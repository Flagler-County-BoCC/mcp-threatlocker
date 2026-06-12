import { z } from 'zod';

const StatusIdSchema = z.coerce
  .number()
  .int()
  .refine((v) => [1, 4, 6, 10, 12, 13, 16].includes(v), {
    message:
      'statusId must be 1=Pending, 4=Approved, 6=Not Learned, 10=Ignored/Rejected, 12=Added to Application, 13=Escalated, 16=Self-Approved',
  });

export const ApprovalRequestGetByParametersSchema = z.object({
  managedOrganizationId: z.string().uuid().optional(),
  statusId: StatusIdSchema,
  pageNumber: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(10000).default(50),
  searchText: z.string().optional(),
  showChildOrganizations: z.coerce.boolean().optional(),
  orderBy: z
    .enum(['username', 'devicetype', 'actiontype', 'path', 'actiondate', 'datetime'])
    .optional(),
  isAscending: z.coerce.boolean().optional(),
});

export const ApprovalRequestGetCountSchema = z.object({
  managedOrganizationId: z.string().uuid().optional(),
  includeChildOrganizations: z.coerce.boolean(),
});

export const ApprovalRequestGetFileDownloadDetailsSchema = z.object({
  managedOrganizationId: z.string().uuid().optional(),
  approvalRequestId: z.string().min(1),
});

export const ApprovalRequestGetPermitApplicationByIdSchema = z.object({
  managedOrganizationId: z.string().uuid().optional(),
  approvalRequestId: z.string().min(1),
});

export const ApprovalRequestAuthorizeForPermitSchema = z.object({
  managedOrganizationId: z.string().uuid().optional(),
  approvalRequestId: z.string().min(1),
  message: z.string().optional(),
});

export const ApprovalRequestPermitApplicationSchema = z.object({
  managedOrganizationId: z.string().uuid().optional(),
  approvalRequest: z.record(z.unknown()),
  computerId: z.string().min(1),
  computerGroupId: z.string().min(1),
  fileDetails: z.record(z.unknown()),
  matchingApplications: z.record(z.unknown()),
  organizationHasElevation: z.coerce.boolean(),
  organizationId: z.string().min(1),
  organizationIds: z.array(z.string()),
  osType: z.coerce
    .number()
    .int()
    .refine((v) => [1, 2, 3, 5].includes(v), {
      message: 'osType must be 1=Windows, 2=MAC, 3=Linux, 5=Windows XP',
    }),
  policyConditions: z.record(z.unknown()),
  policyLevel: z.record(z.unknown()),
  ringfenceActionId: z.coerce.number().int(),
  elevationExpiration: z.coerce.number().int().optional(),
  elevationStatus: z.coerce
    .number()
    .int()
    .refine((v) => [0, 1, 2].includes(v))
    .optional(),
  networkExclusions: z.array(z.record(z.unknown())).optional(),
  policyExpirationDate: z.string().optional(),
  ringfencingOptions: z.record(z.unknown()).optional(),
});

export type ApprovalRequestGetByParametersInput = z.infer<
  typeof ApprovalRequestGetByParametersSchema
>;
export type ApprovalRequestGetCountInput = z.infer<typeof ApprovalRequestGetCountSchema>;
export type ApprovalRequestGetFileDownloadDetailsInput = z.infer<
  typeof ApprovalRequestGetFileDownloadDetailsSchema
>;
export type ApprovalRequestGetPermitApplicationByIdInput = z.infer<
  typeof ApprovalRequestGetPermitApplicationByIdSchema
>;
export type ApprovalRequestAuthorizeForPermitInput = z.infer<
  typeof ApprovalRequestAuthorizeForPermitSchema
>;
export type ApprovalRequestPermitApplicationInput = z.infer<
  typeof ApprovalRequestPermitApplicationSchema
>;
