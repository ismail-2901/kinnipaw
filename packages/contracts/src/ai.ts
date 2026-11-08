import { z } from 'zod';

export const aiCareAssistantSchema = z.object({
  query: z.string().min(3, 'Query must be at least 3 characters').max(1000),
  species: z.string().optional(),
});

export const aiListingAssistSchema = z.object({
  name: z.string().min(1).max(50),
  species: z.string().min(1).max(50),
  breed: z.string().optional(),
  traits: z.array(z.string()).optional(),
  special_needs: z.string().optional(),
});

export const aiSimilarityCheckSchema = z.object({
  lost_post_id: z.string().uuid(),
  candidate_post_id: z.string().uuid(),
});

export type AiCareAssistantInput = z.infer<typeof aiCareAssistantSchema>;
export type AiListingAssistInput = z.infer<typeof aiListingAssistSchema>;
export type AiSimilarityCheckInput = z.infer<typeof aiSimilarityCheckSchema>;
