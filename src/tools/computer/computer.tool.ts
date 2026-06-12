import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { validate } from '../../lib/validate.js';
import { handleToolError } from '../../lib/tool-error-handler.js';
import {
  ComputerGetByAllParametersSchema,
  ComputerGetForEditByIdSchema,
  ComputerGetForNewComputerSchema,
  ComputerGetDownloadSchema,
  ComputerSignedScriptDownloadSchema,
  ComputerSamplePathDownloadSchema,
  ComputerUnsignedScriptDownloadSchema,
  ComputerUpdateForEditSchema,
  ComputerUpdateBaselineRescanSchema,
  ComputerUpdateShouldRestartByIdsSchema,
  ComputerUpdateShouldRestartByOrganizationSchema,
  ComputerMoveToOtherOrganizationSchema,
  ComputerEnableProtectionSchema,
  ComputerDisableProtectionSchema,
  ComputerRemoveDuplicateSchema,
  ComputerUpdateMaintenanceModeSchema,
  ComputerUpdateThreatlockerVersionByIdsSchema,
  ComputerDeleteByIdsSchema,
} from './computer.schema.js';
import { computerService } from '../../lib/container.js';
import { createLogger } from '../../lib/logger.js';

const log = createLogger({ module: 'computerTool' });

export function registerComputerTools(server: McpServer): void {
  server.tool(
    'computer_get_by_all_parameters',
    'Get computers with filtering and sorting (paginated).',
    ComputerGetByAllParametersSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(ComputerGetByAllParametersSchema, params);
      log.debug({ pageNumber: input.pageNumber }, 'computer_get_by_all_parameters called');
      try {
        const result = await computerService.getByAllParameters(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'computer_get_by_all_parameters');
      }
    },
  );

  server.tool(
    'computer_get_for_edit_by_id',
    'Get computer details for editing.',
    ComputerGetForEditByIdSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(ComputerGetForEditByIdSchema, params);
      log.debug({ computerId: input.computerId }, 'computer_get_for_edit_by_id called');
      try {
        const result = await computerService.getForEditById(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'computer_get_for_edit_by_id');
      }
    },
  );

  server.tool(
    'computer_get_for_new_computer',
    'Get computer group info for new computer installation (returns install keys per group).',
    ComputerGetForNewComputerSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(ComputerGetForNewComputerSchema, params);
      log.debug({}, 'computer_get_for_new_computer called');
      try {
        const result = await computerService.getForNewComputer(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'computer_get_for_new_computer');
      }
    },
  );

  server.tool(
    'computer_get_download',
    'Get download URL for ThreatLocker installer.',
    ComputerGetDownloadSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(ComputerGetDownloadSchema, params);
      log.debug({ fileType: input.fileType }, 'computer_get_download called');
      try {
        const result = await computerService.getDownload(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'computer_get_download');
      }
    },
  );

  server.tool(
    'computer_signed_script_download',
    'Download signed ThreatLockerVerifier.exe (returns binary).',
    ComputerSignedScriptDownloadSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(ComputerSignedScriptDownloadSchema, params);
      log.debug({ brand: input.brand }, 'computer_signed_script_download called');
      try {
        const result = await computerService.signedScriptDownload(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'computer_signed_script_download');
      }
    },
  );

  server.tool(
    'computer_sample_path_download',
    'Download sample.bat logon script.',
    ComputerSamplePathDownloadSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(ComputerSamplePathDownloadSchema, params);
      log.debug({ brand: input.brand }, 'computer_sample_path_download called');
      try {
        const result = await computerService.samplePathDownload(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'computer_sample_path_download');
      }
    },
  );

  server.tool(
    'computer_unsigned_script_download',
    'Download unsigned ThreatLockerVerifier-Unsigned.exe.',
    ComputerUnsignedScriptDownloadSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(ComputerUnsignedScriptDownloadSchema, params);
      log.debug({ brand: input.brand }, 'computer_unsigned_script_download called');
      try {
        const result = await computerService.unsignedScriptDownload(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'computer_unsigned_script_download');
      }
    },
  );

  server.tool(
    'computer_update_for_edit',
    '⚠️ WRITE: Update computer settings (name, group, proxy config, options).',
    ComputerUpdateForEditSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(ComputerUpdateForEditSchema, params);
      log.debug({ computerId: input.computerId }, 'computer_update_for_edit called');
      try {
        const result = await computerService.updateForEdit(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'computer_update_for_edit');
      }
    },
  );

  server.tool(
    'computer_update_baseline_rescan',
    '⚠️ WRITE: Queue computers for baseline rescan.',
    ComputerUpdateBaselineRescanSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(ComputerUpdateBaselineRescanSchema, params);
      log.debug({ enableLearning: input.enableLearning }, 'computer_update_baseline_rescan called');
      try {
        const result = await computerService.updateBaselineRescan(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'computer_update_baseline_rescan');
      }
    },
  );

  server.tool(
    'computer_update_should_restart_by_ids',
    '⚠️ WRITE: Flag specific computers for restart.',
    ComputerUpdateShouldRestartByIdsSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(ComputerUpdateShouldRestartByIdsSchema, params);
      log.debug({ count: input.computers.length }, 'computer_update_should_restart_by_ids called');
      try {
        const result = await computerService.updateShouldRestartByIds(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'computer_update_should_restart_by_ids');
      }
    },
  );

  server.tool(
    'computer_update_should_restart_by_organization',
    '⚠️ WRITE: Flag all computers in the organization for restart.',
    ComputerUpdateShouldRestartByOrganizationSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(ComputerUpdateShouldRestartByOrganizationSchema, params);
      log.debug({ value: input.value }, 'computer_update_should_restart_by_organization called');
      try {
        const result = await computerService.updateShouldRestartByOrganization(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'computer_update_should_restart_by_organization');
      }
    },
  );

  server.tool(
    'computer_move_to_other_organization',
    '⚠️ WRITE: Move computers to another organization.',
    ComputerMoveToOtherOrganizationSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(ComputerMoveToOtherOrganizationSchema, params);
      log.debug(
        { targetOrganizationId: input.targetOrganizationId },
        'computer_move_to_other_organization called',
      );
      try {
        const result = await computerService.moveToOtherOrganization(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'computer_move_to_other_organization');
      }
    },
  );

  server.tool(
    'computer_enable_protection',
    '⚠️ WRITE: Enable protection on computers.',
    ComputerEnableProtectionSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(ComputerEnableProtectionSchema, params);
      log.debug({ count: input.computerDetailDtos.length }, 'computer_enable_protection called');
      try {
        const result = await computerService.enableProtection(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'computer_enable_protection');
      }
    },
  );

  server.tool(
    'computer_disable_protection',
    '⚠️ WRITE: Disable protection on computers (puts into maintenance mode).',
    ComputerDisableProtectionSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(ComputerDisableProtectionSchema, params);
      log.debug(
        { maintenanceModeType: input.maintenanceModeType },
        'computer_disable_protection called',
      );
      try {
        const result = await computerService.disableProtection(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'computer_disable_protection');
      }
    },
  );

  server.tool(
    'computer_remove_duplicate',
    '⚠️ WRITE/DELETE: Remove duplicate computer records.',
    ComputerRemoveDuplicateSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(ComputerRemoveDuplicateSchema, params);
      log.debug({ value: input.value }, 'computer_remove_duplicate called');
      try {
        const result = await computerService.removeDuplicate(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'computer_remove_duplicate');
      }
    },
  );

  server.tool(
    'computer_update_maintenance_mode',
    '⚠️ WRITE: Update maintenance mode for a computer.',
    ComputerUpdateMaintenanceModeSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(ComputerUpdateMaintenanceModeSchema, params);
      log.debug({ applicationId: input.applicationId }, 'computer_update_maintenance_mode called');
      try {
        const result = await computerService.updateMaintenanceMode(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'computer_update_maintenance_mode');
      }
    },
  );

  server.tool(
    'computer_update_threatlocker_version_by_ids',
    '⚠️ WRITE (DEPRECATED): Update ThreatLocker agent version on computers. Use scheduled_agent_action_create for agents ≥10.7.3.',
    ComputerUpdateThreatlockerVersionByIdsSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(ComputerUpdateThreatlockerVersionByIdsSchema, params);
      log.debug(
        { threatLockerVersion: input.threatLockerVersion },
        'computer_update_threatlocker_version_by_ids called',
      );
      try {
        const result = await computerService.updateThreatlockerVersionByIds(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'computer_update_threatlocker_version_by_ids');
      }
    },
  );

  server.tool(
    'computer_delete_by_ids',
    '⚠️ WRITE/DELETE: Remove computers from the portal (does not uninstall agent).',
    ComputerDeleteByIdsSchema.shape,
    async (params): Promise<CallToolResult> => {
      const input = validate(ComputerDeleteByIdsSchema, params);
      log.debug({ count: input.computers.length }, 'computer_delete_by_ids called');
      try {
        const result = await computerService.deleteByIds(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err, 'computer_delete_by_ids');
      }
    },
  );
}
