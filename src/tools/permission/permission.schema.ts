import { z } from 'zod';

export const PermissionGetForAdministratorSchema = z.object({});

export type PermissionGetForAdministratorInput = z.infer<
  typeof PermissionGetForAdministratorSchema
>;
