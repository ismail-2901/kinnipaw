import { z } from 'zod';

export const createAdoptionListingSchema = z.object({
  animal_id: z.string().uuid('Invalid animal ID'),
  description: z.string().max(2000).optional(),
  adoption_requirements: z.string().max(2000).optional(),
  fee_description: z.string().max(500).optional(),
  listing_status: z.enum(['draft', 'active']).default('active'),
});

export const updateAdoptionListingSchema = z.object({
  listing_status: z.enum(['draft', 'active', 'paused', 'closed', 'adopted']).optional(),
  description: z.string().max(2000).optional(),
  adoption_requirements: z.string().max(2000).optional(),
  fee_description: z.string().max(500).optional(),
});

export const createAdoptionApplicationSchema = z.object({
  listing_id: z.string().uuid('Invalid listing ID'),
  answers: z.record(z.unknown()).default({}),
});

export const updateAdoptionApplicationSchema = z.object({
  application_status: z.enum(['under_review', 'approved', 'rejected', 'withdrawn']),
  notes: z.string().max(1000).optional(),
});

export type CreateAdoptionListingInput = z.infer<typeof createAdoptionListingSchema>;
export type UpdateAdoptionListingInput = z.infer<typeof updateAdoptionListingSchema>;
export type CreateAdoptionApplicationInput = z.infer<typeof createAdoptionApplicationSchema>;
export type UpdateAdoptionApplicationInput = z.infer<typeof updateAdoptionApplicationSchema>;
