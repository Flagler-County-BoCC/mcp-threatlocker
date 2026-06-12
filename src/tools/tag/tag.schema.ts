import { z } from 'zod';

export const TagGetDropdownOptionsSchema = z.object({
  managedOrganizationId: z.string().uuid().optional(),
});

export type TagGetDropdownOptionsInput = z.infer<typeof TagGetDropdownOptionsSchema>;
