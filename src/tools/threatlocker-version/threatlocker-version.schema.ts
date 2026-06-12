import { z } from 'zod';

export const ThreatlockerVersionGetForDropdownSchema = z.object({});

export type ThreatlockerVersionGetForDropdownInput = z.infer<
  typeof ThreatlockerVersionGetForDropdownSchema
>;
