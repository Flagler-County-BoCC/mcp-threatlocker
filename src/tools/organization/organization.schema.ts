import { z } from 'zod';

export const OrganizationCreateChildSchema = z.object({
  managedOrganizationId: z.string().uuid().optional(),
  displayName: z.string().min(1),
  timezoneId: z.string().min(1),
  domains: z.array(z.string()).optional(),
  elevationDefaultHours: z.coerce
    .number()
    .int()
    .refine((v) => [0, 1, 2, 6, 12, 24].includes(v))
    .optional(),
  hasDisabledEmailNotifications: z.coerce.boolean().optional(),
  itarCompliant: z.coerce.boolean().optional(),
  name: z.string().optional(),
  options: z.array(z.string()).optional(),
  proxyServerOption: z.enum(['http://', 'https://']).optional(),
  proxyUrlEntry: z.string().optional(),
  timeoutOnLogin: z.coerce
    .number()
    .int()
    .refine((v) => [15, 30, 60, 120, 240, 480, 1440].includes(v))
    .optional(),
  useProxyServer: z.coerce.boolean().optional(),
});

export const OrganizationGetAuthKeySchema = z.object({
  managedOrganizationId: z.string().uuid().optional(),
});

export const OrganizationGetChildOrganizationsSchema = z.object({
  managedOrganizationId: z.string().uuid().optional(),
  pageNumber: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(10000).default(50),
  includeAllChildren: z.coerce.boolean().optional(),
  isAscending: z.coerce.boolean().optional(),
  orderBy: z.enum(['billingMethod', 'businessClassificationName', 'dateAdded', 'name']).optional(),
  searchText: z.string().optional(),
});

export const OrganizationGetForMoveComputersSchema = z.object({
  searchText: z.string().optional(),
});

export const OrganizationUpdateAuthKeySchema = z.object({
  managedOrganizationId: z.string().uuid().optional(),
});

export type OrganizationCreateChildInput = z.infer<typeof OrganizationCreateChildSchema>;
export type OrganizationGetAuthKeyInput = z.infer<typeof OrganizationGetAuthKeySchema>;
export type OrganizationGetChildOrganizationsInput = z.infer<
  typeof OrganizationGetChildOrganizationsSchema
>;
export type OrganizationGetForMoveComputersInput = z.infer<
  typeof OrganizationGetForMoveComputersSchema
>;
export type OrganizationUpdateAuthKeyInput = z.infer<typeof OrganizationUpdateAuthKeySchema>;
