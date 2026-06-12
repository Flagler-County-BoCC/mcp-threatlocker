import { z } from 'zod';

export const ComputerCheckinGetByParametersSchema = z.object({
  managedOrganizationId: z.string().uuid().optional(),
  computerId: z.string().min(1),
  pageSize: z.coerce.number().int().min(1).max(10000).default(50),
  pageNumber: z.coerce.number().int().min(1).default(1),
  hideHeartbeat: z.coerce.boolean(),
});

export type ComputerCheckinGetByParametersInput = z.infer<
  typeof ComputerCheckinGetByParametersSchema
>;
