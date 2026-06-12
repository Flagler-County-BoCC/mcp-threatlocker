import { z } from 'zod';

const OsTypeSchema = z.coerce
  .number()
  .int()
  .refine((v) => [1, 2, 3, 5].includes(v), {
    message: 'osType must be 1=Windows, 2=MAC, 3=Linux, 5=Windows XP',
  });

export const ApplicationGetByIdSchema = z.object({
  managedOrganizationId: z.string().uuid().optional(),
  applicationId: z.string().min(1),
});

export const ApplicationGetByParametersSchema = z.object({
  managedOrganizationId: z.string().uuid().optional(),
  orderBy: z.enum(['name', 'date-created', 'review-rating', 'computer-count', 'policy']),
  pageNumber: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(10000).default(50),
  searchBy: z.enum([
    'app',
    'full',
    'process',
    'hash',
    'cert',
    'created',
    'categories',
    'countries',
  ]),
  categories: z.array(z.string()).optional(),
  category: z.coerce
    .number()
    .int()
    .refine((v) => [0, 1, 2, 4].includes(v), {
      message: 'category must be 0=All, 1=Custom, 2=Built-In, 4=Patch Supported',
    })
    .optional(),
  countries: z.array(z.string().length(2)).optional(),
  includeChildOrganizations: z.coerce.boolean().optional(),
  isAscending: z.coerce.boolean().optional(),
  isHidden: z.coerce.boolean().optional(),
  osType: OsTypeSchema.optional(),
  permittedApplications: z.coerce.boolean().optional(),
  searchText: z.string().optional(),
});

export const ApplicationGetForMaintenanceModeSchema = z.object({
  managedOrganizationId: z.string().uuid().optional(),
  osType: OsTypeSchema.optional(),
});

export const ApplicationGetMatchingListSchema = z.object({
  managedOrganizationId: z.string().uuid().optional(),
  certs: z.array(z.record(z.unknown())).optional(),
  createdBys: z.array(z.string()).optional(),
  hash: z.string().optional(),
  osType: OsTypeSchema.optional(),
  path: z.string().optional(),
  processPath: z.string().optional(),
  sha256: z.string().optional(),
});

export const ApplicationGetResearchDetailsByIdSchema = z.object({
  managedOrganizationId: z.string().uuid().optional(),
  applicationId: z.string().min(1),
});

export const ApplicationInsertSchema = z.object({
  managedOrganizationId: z.string().uuid().optional(),
  name: z.string().min(1),
  osType: OsTypeSchema,
  description: z.string().optional(),
  applicationFileUpdates: z.array(z.record(z.unknown())).optional(),
});

export const ApplicationUpdateByIdSchema = z.object({
  managedOrganizationId: z.string().uuid().optional(),
  applicationId: z.string().min(1),
  name: z.string().min(1),
  osType: OsTypeSchema,
  description: z.string().optional(),
});

const ApplicationRefSchema = z.object({
  applicationId: z.string().min(1),
  name: z.string().optional(),
  organizationId: z.string().optional(),
  osType: z.coerce.number().int().optional(),
});

export const ApplicationDeleteSchema = z.object({
  managedOrganizationId: z.string().uuid().optional(),
  applications: z.array(ApplicationRefSchema),
});

export const ApplicationConfirmDeleteSchema = z.object({
  managedOrganizationId: z.string().uuid().optional(),
  applications: z.array(ApplicationRefSchema),
});

export type ApplicationGetByIdInput = z.infer<typeof ApplicationGetByIdSchema>;
export type ApplicationGetByParametersInput = z.infer<typeof ApplicationGetByParametersSchema>;
export type ApplicationGetForMaintenanceModeInput = z.infer<
  typeof ApplicationGetForMaintenanceModeSchema
>;
export type ApplicationGetMatchingListInput = z.infer<typeof ApplicationGetMatchingListSchema>;
export type ApplicationGetResearchDetailsByIdInput = z.infer<
  typeof ApplicationGetResearchDetailsByIdSchema
>;
export type ApplicationInsertInput = z.infer<typeof ApplicationInsertSchema>;
export type ApplicationUpdateByIdInput = z.infer<typeof ApplicationUpdateByIdSchema>;
export type ApplicationDeleteInput = z.infer<typeof ApplicationDeleteSchema>;
export type ApplicationConfirmDeleteInput = z.infer<typeof ApplicationConfirmDeleteSchema>;
