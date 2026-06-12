import { z } from 'zod';

export const DacAnalysisItemGetByIdSchema = z.object({
  analysisItemId: z.coerce.number().int(),
});

export const DacAnalysisResultsGetByParametersSchema = z.object({
  managedOrganizationId: z.string().uuid().optional(),
  pageNumber: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(10000).default(50),
  appliesToId: z.string().optional(),
  categoryId: z.coerce
    .number()
    .int()
    .refine((v) => [1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 13].includes(v), {
      message:
        'categoryId: 1=Network Policy, 2=Storage Policy, 3=App Control, 4=Registry Policy, 6=Group Policy, 7=Account/Auth, 8=Advanced Audit, 9=Local Security, 10=Patch Mgmt, 11=Remote Desktop, 12=User Rights, 13=Detect and Response',
    })
    .optional(),
  criticalityId: z.coerce
    .number()
    .int()
    .refine((v) => [1, 2, 3, 4].includes(v), {
      message: 'criticalityId: 1=Low, 2=Moderate, 3=High, 4=Critical',
    })
    .optional(),
  entityTypeId: z.coerce
    .number()
    .int()
    .refine((v) => [1, 2, 3].includes(v), {
      message: 'entityTypeId: 1=organization, 2=computer group, 3=computer',
    })
    .optional(),
  includeChildOrgs: z.coerce.boolean().optional(),
  searchText: z.string().optional(),
  sortBy: z.enum(['category', 'combined-impact', 'criticality']).optional(),
});

export type DacAnalysisItemGetByIdInput = z.infer<typeof DacAnalysisItemGetByIdSchema>;
export type DacAnalysisResultsGetByParametersInput = z.infer<
  typeof DacAnalysisResultsGetByParametersSchema
>;
