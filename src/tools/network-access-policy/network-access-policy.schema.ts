import { z } from 'zod';

export const NetworkAccessPolicyInsertSchema = z.object({
  managedOrganizationId: z.string().uuid().optional(),
  allDestinations: z.coerce.boolean(),
  allPorts: z.coerce.boolean(),
  allSources: z.coerce.boolean(),
  computerGroupId: z.string().min(1),
  description: z.string().optional(),
  destinationLocations: z.array(z.record(z.unknown())).optional(),
  direction: z.coerce
    .number()
    .int()
    .refine((v) => [1, 2].includes(v), { message: 'direction: 1=Inbound, 2=Outbound' }),
  endDate: z.string().optional(),
  name: z.string().min(1),
  networkAccessRulePortDtos: z.array(z.record(z.unknown())).optional(),
  policyActionId: z.coerce
    .number()
    .int()
    .refine((v) => [1, 2].includes(v), { message: 'policyActionId: 1=Permit, 2=Deny' }),
  policyScheduleStatus: z.coerce
    .number()
    .int()
    .refine((v) => [0, 1, 2].includes(v)),
  policySchedules: z.array(z.record(z.unknown())).optional(),
  protocol: z.coerce
    .number()
    .int()
    .refine((v) => [1, 2, 3].includes(v), { message: 'protocol: 1=TCP, 2=UDP, 3=Both' }),
  sourceLocations: z.array(z.record(z.unknown())).optional(),
  status: z.coerce
    .number()
    .int()
    .refine((v) => [1, 3].includes(v), { message: 'status: 1=Active, 3=Inactive' }),
});

export type NetworkAccessPolicyInsertInput = z.infer<typeof NetworkAccessPolicyInsertSchema>;
