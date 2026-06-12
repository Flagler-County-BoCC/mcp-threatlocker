import { z } from 'zod';

export const ReportGetByOrganizationIdSchema = z.object({
  managedOrganizationId: z.string().uuid().optional(),
});

export const ReportGetDynamicDataSchema = z.object({
  managedOrganizationId: z.string().uuid().optional(),
  reportId: z.string().min(1),
  data: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  id: z.string().optional(),
});

export type ReportGetByOrganizationIdInput = z.infer<typeof ReportGetByOrganizationIdSchema>;
export type ReportGetDynamicDataInput = z.infer<typeof ReportGetDynamicDataSchema>;
