import { z } from 'zod';

export const createProviderProfileSchema = z.object({
  provider_type: z.enum(['veterinarian', 'groomer', 'trainer', 'boarding', 'clinic', 'other']),
  public_name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  public_address: z.string().max(255).optional(),
  description: z.string().max(2000).optional(),
  vet_credentials: z.record(z.unknown()).optional(),
});

export const createProviderServiceSchema = z.object({
  service_name: z.string().min(2, 'Service name must be at least 2 characters').max(100),
  description: z.string().max(1000).optional(),
  price_range_description: z.string().max(255).optional(),
});

export const createProviderReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  body: z.string().max(1000).optional(),
});

export const createAppointmentSchema = z.object({
  provider_profile_id: z.string().uuid('Invalid provider ID'),
  animal_id: z.string().uuid('Invalid animal ID'),
  requested_at: z.string().min(1, 'Requested date and time are required'),
  notes: z.string().max(1000).optional(),
});

export type CreateProviderProfileInput = z.infer<typeof createProviderProfileSchema>;
export type CreateProviderServiceInput = z.infer<typeof createProviderServiceSchema>;
export type CreateProviderReviewInput = z.infer<typeof createProviderReviewSchema>;
export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
