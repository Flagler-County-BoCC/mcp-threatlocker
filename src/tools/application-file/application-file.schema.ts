import { z } from 'zod';

const OsTypeSchema = z.coerce
  .number()
  .int()
  .refine((v) => [1, 2, 3, 5].includes(v), {
    message: 'osType must be 1=Windows, 2=MAC, 3=Linux, 5=Windows XP',
  });

export const ApplicationFileGetByApplicationIdSchema = z.object({
  managedOrganizationId: z.string().uuid().optional(),
  applicationId: z.string().min(1),
  pageNumber: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(10000).default(50),
  hashOnly: z.coerce.boolean().optional(),
  isCustomRule: z.coerce.boolean().optional(),
  searchText: z.string().optional(),
});

export const ApplicationFileInsertSchema = z.object({
  managedOrganizationId: z.string().uuid().optional(),
  applicationId: z.string().min(1),
  applicationName: z.string().min(1),
  osType: OsTypeSchema,
  isHashOnly: z.coerce.boolean().optional(),
  notes: z.string().optional(),
  cert: z.string().optional(),
  fullPath: z.string().optional(),
  hash: z.string().optional(),
  installedBy: z.string().optional(),
  processPath: z.string().optional(),
});

export const ApplicationFileUpdateSchema = z.object({
  managedOrganizationId: z.string().uuid().optional(),
  applicationFileId: z.coerce.number().int(),
  applicationId: z.string().min(1),
  osType: OsTypeSchema,
  isHashOnly: z.coerce.boolean().optional(),
  notes: z.string().optional(),
  cert: z.string().optional(),
  fullPath: z.string().optional(),
  hash: z.string().optional(),
  installedBy: z.string().optional(),
  processPath: z.string().optional(),
});

export const ApplicationFileDeleteByIdSchema = z.object({
  managedOrganizationId: z.string().uuid().optional(),
  applicationFileId: z.coerce.number().int(),
  applicationId: z.string().min(1),
  applicationName: z.string().min(1),
  osType: OsTypeSchema,
  cert: z.string().optional(),
  fullPath: z.string().optional(),
  hash: z.string().optional(),
  installedBy: z.string().optional(),
  processPath: z.string().optional(),
});

export type ApplicationFileGetByApplicationIdInput = z.infer<
  typeof ApplicationFileGetByApplicationIdSchema
>;
export type ApplicationFileInsertInput = z.infer<typeof ApplicationFileInsertSchema>;
export type ApplicationFileUpdateInput = z.infer<typeof ApplicationFileUpdateSchema>;
export type ApplicationFileDeleteByIdInput = z.infer<typeof ApplicationFileDeleteByIdSchema>;
