import { z } from 'zod';

export const createPostSchema = z.object({
  body: z.string().min(1, 'Post content cannot be empty').max(5000, 'Post content too long'),
  post_type: z.enum(['general', 'update', 'story', 'question']).default('general'),
  visibility: z.enum(['public', 'group', 'private']).default('public'),
  group_id: z.string().uuid().optional().nullable(),
});

export const createCommentSchema = z.object({
  post_id: z.string().uuid('Invalid post ID'),
  body: z.string().min(1, 'Comment cannot be empty').max(2000, 'Comment too long'),
  parent_id: z.string().uuid().optional().nullable(),
});

export const createContentReportSchema = z.object({
  post_id: z.string().uuid().optional().nullable(),
  comment_id: z.string().uuid().optional().nullable(),
  profile_id: z.string().uuid().optional().nullable(),
  listing_id: z.string().uuid().optional().nullable(),
  rescue_case_id: z.string().uuid().optional().nullable(),
  lost_found_post_id: z.string().uuid().optional().nullable(),
  reason: z.enum(['spam', 'harassment', 'misinformation', 'animal_cruelty', 'illegal_trade', 'other']),
  details: z.string().max(2000).optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type CreateContentReportInput = z.infer<typeof createContentReportSchema>;
