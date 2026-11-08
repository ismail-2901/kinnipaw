import { z } from 'zod';

export const metaSchema = z.object({
  requestId: z.string(),
  nextCursor: z.string().nullable().optional(),
});

export const apiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.unknown().nullable().optional(),
});

export type Meta = z.infer<typeof metaSchema>;
export type ApiError = z.infer<typeof apiErrorSchema>;

export interface ApiResponse<T> {
  data: T | null;
  meta: Meta;
  error: ApiError | null;
}

export function createSuccessResponse<T>(
  data: T,
  requestId: string,
  nextCursor?: string | null
): ApiResponse<T> {
  return {
    data,
    meta: {
      requestId,
      nextCursor: nextCursor ?? null,
    },
    error: null,
  };
}

export function createErrorResponse(
  code: string,
  message: string,
  requestId: string,
  details: unknown = null
): ApiResponse<null> {
  return {
    data: null,
    meta: {
      requestId,
      nextCursor: null,
    },
    error: {
      code,
      message,
      details,
    },
  };
}
