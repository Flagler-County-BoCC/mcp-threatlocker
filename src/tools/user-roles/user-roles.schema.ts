import { z } from 'zod';

export const UserRolesGetByParametersSchema = z.object({
  body: z.record(z.unknown()).optional(),
});

export type UserRolesGetByParametersInput = z.infer<typeof UserRolesGetByParametersSchema>;
