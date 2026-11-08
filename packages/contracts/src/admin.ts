import { z } from 'zod';

export const updateContentReportSchema = z.object({
  report_status: z.enum(['under_review', 'resolved', 'dismissed']),
  action: z.enum(['none', 'delete_content', 'suspend_user']).default('none'),
  notes: z.string().max(1000).optional(),
});

export const updateUserStatusSchema = z.object({
  account_status: z.enum(['active', 'suspended', 'deactivated']),
  reason: z.string().min(3, 'Reason is required').max(500),
});

export const assignUserRoleSchema = z.object({
  role_id: z.string().uuid('Invalid role ID'),
});

export const createSpeciesSchema = z.object({
  common_name: z.string().min(2, 'Common name is required').max(100),
  scientific_name: z.string().max(100).optional(),
  is_domestic: z.boolean().default(true),
});

export type UpdateContentReportInput = z.infer<typeof updateContentReportSchema>;
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
export type AssignUserRoleInput = z.infer<typeof assignUserRoleSchema>;
export type CreateSpeciesInput = z.infer<typeof createSpeciesSchema>;
