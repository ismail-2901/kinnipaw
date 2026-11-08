import { z } from 'zod';

export const createLostFoundPostSchema = z.object({
  report_type: z.enum(['lost', 'found']),
  species_id: z.string().uuid('Invalid species ID'),
  animal_id: z.string().uuid().optional().nullable(),
  description: z.string().min(5, 'Description must be at least 5 characters').max(3000),
  last_seen_area_label: z.string().min(2, 'Area/neighborhood is required').max(100),
  incident_date: z.string().min(1, 'Incident date is required'),
  media_paths: z.array(z.string()).optional(),
});

export const updateLostFoundPostSchema = z.object({
  status: z.enum(['active', 'resolved', 'expired']).optional(),
  description: z.string().min(5).max(3000).optional(),
  last_seen_area_label: z.string().min(2).max(100).optional(),
});

export const createSightingSchema = z.object({
  lost_found_post_id: z.string().uuid('Invalid post ID'),
  sighting_area_label: z.string().min(2, 'Area is required').max(100),
  sighting_date: z.string().min(1, 'Date is required'),
  notes: z.string().max(2000).optional(),
  media_paths: z.array(z.string()).optional(),
});

export const createMatchSchema = z.object({
  lost_post_id: z.string().uuid('Invalid lost post ID'),
  found_post_id: z.string().uuid('Invalid found post ID'),
  notes: z.string().max(1000).optional(),
});

export const updateMatchSchema = z.object({
  match_status: z.enum(['confirmed', 'rejected']),
  notes: z.string().max(1000).optional(),
});

export type CreateLostFoundPostInput = z.infer<typeof createLostFoundPostSchema>;
export type UpdateLostFoundPostInput = z.infer<typeof updateLostFoundPostSchema>;
export type CreateSightingInput = z.infer<typeof createSightingSchema>;
export type CreateMatchInput = z.infer<typeof createMatchSchema>;
export type UpdateMatchInput = z.infer<typeof updateMatchSchema>;
