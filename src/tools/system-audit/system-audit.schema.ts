import { z } from 'zod';

export const SystemAuditGetByParametersSchema = z.object({
  managedOrganizationId: z.string().uuid().optional(),
  endDate: z.string().min(1),
  pageNumber: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(10000).default(50),
  startDate: z.string().min(1),
  actions: z.array(z.enum(['Create', 'Delete', 'Logon', 'Modify', 'Read'])).optional(),
  afterKeys: z.record(z.number()).optional(),
  details: z.string().optional(),
  effectiveAction: z.enum(['Denied', 'Permitted']).optional(),
  emailAddress: z.string().optional(),
  iPAddress: z.string().optional(),
  objectId: z.string().optional(),
  viewChildOrganizations: z.coerce.boolean().optional(),
});

export const SystemAuditGetForHealthCenterSchema = z.object({
  managedOrganizationId: z.string().uuid().optional(),
  days: z.coerce.number().int().min(1),
  isLoggedIn: z.coerce.boolean(),
  pageNumber: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(10000).default(50),
});

export type SystemAuditGetByParametersInput = z.infer<typeof SystemAuditGetByParametersSchema>;
export type SystemAuditGetForHealthCenterInput = z.infer<
  typeof SystemAuditGetForHealthCenterSchema
>;
