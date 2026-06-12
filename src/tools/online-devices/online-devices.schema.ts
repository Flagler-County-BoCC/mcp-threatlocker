import { z } from 'zod';

export const OnlineDevicesGetByParametersSchema = z.object({
  managedOrganizationId: z.string().uuid().optional(),
  pageSize: z.coerce.number().int().min(1).max(10000).default(50),
  pageNumber: z.coerce.number().int().min(1).default(1),
});

export type OnlineDevicesGetByParametersInput = z.infer<typeof OnlineDevicesGetByParametersSchema>;
