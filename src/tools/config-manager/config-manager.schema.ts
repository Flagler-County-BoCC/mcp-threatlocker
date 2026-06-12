import { z } from 'zod';

export const CmConfigurationGetEnabledSchema = z.object({});

export const CmPolicyGetByParametersSchema = z.object({
  managedOrganizationId: z.string().uuid().optional(),
  appliesTo: z.string().min(1),
  pageNumber: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(10000).default(50),
  status: z.coerce
    .number()
    .int()
    .refine((v) => [-1, 0, 1, 99].includes(v), {
      message: 'status must be -1=Not Configured, 0=Disabled, 1=Enabled, 99=All',
    }),
  searchText: z.string().optional(),
});

export type CmConfigurationGetEnabledInput = z.infer<typeof CmConfigurationGetEnabledSchema>;
export type CmPolicyGetByParametersInput = z.infer<typeof CmPolicyGetByParametersSchema>;
