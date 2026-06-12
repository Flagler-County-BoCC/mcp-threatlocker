import { z } from 'zod';

const MaintenanceTypeIdSchema = z.coerce
  .number()
  .int()
  .refine((v) => [1, 2, 3, 4, 6, 14, 15, 16, 17, 18].includes(v), {
    message:
      'maintenanceTypeId: 1=AppControlMonitorOnly, 2=InstallationMode, 3=Learning, 4=Elevation, 6=TamperProtectionDisabled, 14=Isolation, 15=Lockdown, 16=DisableOpsAlerts, 17=NetworkControlMonitorOnly, 18=StorageControlMonitorOnly',
  });

export const MaintenanceModeGetByComputerIdSchema = z.object({
  managedOrganizationId: z.string().uuid().optional(),
  computerId: z.string().min(1),
  pageNumber: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(10000).default(50),
});

export const MaintenanceModeInsertSchema = z.object({
  managedOrganizationId: z.string().uuid().optional(),
  allUsers: z.coerce.boolean(),
  automaticApplication: z.coerce.boolean(),
  automaticApplicationType: z.coerce
    .number()
    .int()
    .refine((v) => [0, 1, 2, 3].includes(v), {
      message: 'automaticApplicationType: 0=empty, 1=Computer, 2=Group, 3=System',
    }),
  computerDateTime: z.string().min(1),
  computerId: z.string().min(1),
  createNewApplication: z.coerce.boolean(),
  endDateTime: z.string().min(1),
  existingApplication: z.record(z.unknown()).optional(),
  maintenanceTypeId: MaintenanceTypeIdSchema,
  newApplication: z.record(z.unknown()).optional(),
  permitEnd: z.coerce.boolean(),
  startDateTime: z.string().min(1),
  useExistingApplication: z.coerce.boolean(),
});

export const MaintenanceModeEndByIdSchema = z.object({
  ComputerID: z.string().min(1),
  MaintenanceModeId: z.string().min(1),
  MaintenanceTypeId: z.coerce.number().int(),
});

export const MaintenanceModeUpdateEndDateSchema = z.object({
  computerId: z.string().min(1),
  maintenanceEndDate: z.string().min(1),
  maintenanceTypeId: MaintenanceTypeIdSchema,
});

export type MaintenanceModeGetByComputerIdInput = z.infer<
  typeof MaintenanceModeGetByComputerIdSchema
>;
export type MaintenanceModeInsertInput = z.infer<typeof MaintenanceModeInsertSchema>;
export type MaintenanceModeEndByIdInput = z.infer<typeof MaintenanceModeEndByIdSchema>;
export type MaintenanceModeUpdateEndDateInput = z.infer<typeof MaintenanceModeUpdateEndDateSchema>;
