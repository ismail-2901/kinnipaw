import { z } from 'zod';

export const createRescueCaseSchema = z.object({
  species_id: z.string().uuid('Invalid species ID'),
  description: z.string().min(5, 'Description must be at least 5 characters').max(3000),
  location_area_label: z.string().min(2, 'Location is required').max(100),
  urgency: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  is_wildlife: z.boolean().default(false),
  media_paths: z.array(z.string()).optional(),
});

export const updateRescueCaseSchema = z.object({
  case_status: z.enum(['open', 'assigned', 'in_progress', 'resolved', 'closed']).optional(),
  urgency: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  notes: z.string().max(1000).optional(),
});

export const createRescueAssignmentSchema = z.object({
  rescue_case_id: z.string().uuid('Invalid rescue case ID'),
  notes: z.string().max(1000).optional(),
});

export type CreateRescueCaseInput = z.infer<typeof createRescueCaseSchema>;
export type UpdateRescueCaseInput = z.infer<typeof updateRescueCaseSchema>;
export type CreateRescueAssignmentInput = z.infer<typeof createRescueAssignmentSchema>;
