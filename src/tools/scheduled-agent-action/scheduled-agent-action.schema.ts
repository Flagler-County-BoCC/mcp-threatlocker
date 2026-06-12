import { z } from 'zod';

export const ScheduledAgentActionCreateSchema = z.object({
  managedOrganizationId: z.string().uuid().optional(),
  appliesTo: z.array(z.record(z.unknown())),
  scheduledType: z.coerce
    .number()
    .int()
    .refine((v) => v === 1, { message: 'scheduledType must be 1=Version Update' }),
  scheduledTypePayload: z.string().min(1),
  batchAmount: z.coerce
    .number()
    .int()
    .refine((v) => [25, 50, 100, 250, 500].includes(v))
    .optional(),
  startDate: z.string().optional(),
  windowStartTime: z.string().optional(),
  windowEndTime: z.string().optional(),
});

export const ScheduledAgentActionAbortSchema = z.object({
  managedOrganizationId: z.string().uuid().optional(),
  abortAll: z.coerce.boolean(),
  appliesTo: z.array(z.record(z.unknown())),
  scheduledId: z.string().min(1),
});

export const ScheduledAgentActionAppliesToSchema = z.object({
  managedOrganizationId: z.string().uuid().optional(),
  osType: z.coerce
    .number()
    .int()
    .refine((v) => [1, 2, 3, 7].includes(v), {
      message: 'osType: 1=Windows, 2=MAC, 3=Linux, 7=Red Hat Enterprise Linux 6',
    }),
  includeChildren: z.coerce.boolean().optional(),
  searchText: z.string().optional(),
});

export const ScheduledAgentActionGetByParametersSchema = z.object({
  managedOrganizationId: z.string().uuid().optional(),
  scheduledId: z.string().min(1),
  computerGroupIds: z.array(z.string()).optional(),
  organizationIds: z.array(z.string()).optional(),
  isAscending: z.coerce.boolean().optional(),
  orderBy: z
    .enum(['scheduleddatetime', 'computername', 'computergroupname', 'organizationname'])
    .optional(),
  pageNumber: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(10000).default(50),
  searchText: z.string().optional(),
});

export const ScheduledAgentActionGetForHydrationSchema = z.object({
  scheduledId: z.string().min(1),
});

export const ScheduledAgentActionListSchema = z.object({
  managedOrganizationId: z.string().uuid().optional(),
  scheduledType: z.coerce
    .number()
    .int()
    .refine((v) => v === 1, { message: 'scheduledType must be 1=Version Update' }),
  includeChildren: z.coerce.boolean().optional(),
});

export type ScheduledAgentActionCreateInput = z.infer<typeof ScheduledAgentActionCreateSchema>;
export type ScheduledAgentActionAbortInput = z.infer<typeof ScheduledAgentActionAbortSchema>;
export type ScheduledAgentActionAppliesToInput = z.infer<
  typeof ScheduledAgentActionAppliesToSchema
>;
export type ScheduledAgentActionGetByParametersInput = z.infer<
  typeof ScheduledAgentActionGetByParametersSchema
>;
export type ScheduledAgentActionGetForHydrationInput = z.infer<
  typeof ScheduledAgentActionGetForHydrationSchema
>;
export type ScheduledAgentActionListInput = z.infer<typeof ScheduledAgentActionListSchema>;
