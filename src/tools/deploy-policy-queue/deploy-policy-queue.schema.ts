import { z } from 'zod';

export const DeployPoliciesSchema = z.object({
  managedOrganizationId: z.string().uuid().optional(),
});

export const DeployPoliciesForComputerSchema = z.object({
  managedOrganizationId: z.string().uuid().optional(),
  computerId: z.string().min(1),
  computerName: z.string().min(1),
});

export type DeployPoliciesInput = z.infer<typeof DeployPoliciesSchema>;
export type DeployPoliciesForComputerInput = z.infer<typeof DeployPoliciesForComputerSchema>;
