import { z } from 'zod';

export const ActionLogGetByParametersSchema = z.object({
  managedOrganizationId: z.string().uuid().optional(),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  pageNumber: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(10000).default(50),
  paramsFieldsDto: z.array(z.record(z.unknown())).optional().default([]),
  actionId: z.coerce
    .number()
    .int()
    .refine((v) => [1, 2, 3, 6, 99].includes(v), {
      message: 'actionId must be 1=Permit, 2=Deny, 3=Deny w/Request, 6=Ringfenced, or 99=Any Deny',
    })
    .optional(),
  actionType: z
    .enum([
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
    ])
    .optional(),
  exportMode: z.coerce.boolean().optional(),
  fullPath: z.string().optional(),
  groupBys: z.array(z.coerce.number().int()).optional(),
  hostname: z.string().optional(),
  onlyTrueDenies: z.coerce.boolean().optional(),
  showChildOrganizations: z.coerce.boolean().optional(),
  showTotalCount: z.coerce.boolean().optional(),
  simulateDeny: z.coerce.boolean().optional(),
  totalRows: z.coerce.number().int().optional(),
});

export type ActionLogGetByParametersInput = z.infer<typeof ActionLogGetByParametersSchema>;
