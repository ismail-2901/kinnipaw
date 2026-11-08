import { describe, it, expect } from 'vitest';
import {
  createSuccessResponse,
  createErrorResponse,
  createPostSchema,
  createCommentSchema,
  createLostFoundPostSchema,
  createAdoptionListingSchema,
  createContentReportSchema,
} from '../index.js';

describe('Standardized API Response Envelopes', () => {
  it('formats success responses according to canonical schema', () => {
    const res = createSuccessResponse({ id: 'abc-123', name: 'Milo' }, 'req-999', 'cursor-2');
    expect(res.data).toEqual({ id: 'abc-123', name: 'Milo' });
    expect(res.meta.requestId).toBe('req-999');
    expect(res.meta.nextCursor).toBe('cursor-2');
    expect(res.error).toBeNull();
  });

  it('formats error responses according to canonical schema', () => {
    const res = createErrorResponse('FORBIDDEN', 'Access denied to sensitive records', 'req-888', {
      requiredRole: 'admin',
    });
    expect(res.data).toBeNull();
    expect(res.meta.requestId).toBe('req-888');
    expect(res.error).toEqual({
      code: 'FORBIDDEN',
      message: 'Access denied to sensitive records',
      details: { requiredRole: 'admin' },
    });
  });
});

describe('Zod Contracts & Input Validation', () => {
  it('validates community post payload correctly', () => {
    const valid = createPostSchema.safeParse({
      body: 'Looking for a playful companion for my rescued puppy!',
      post_type: 'general',
      visibility: 'public',
    });
    expect(valid.success).toBe(true);

    const empty = createPostSchema.safeParse({
      body: '',
      post_type: 'general',
      visibility: 'public',
    });
    expect(empty.success).toBe(false);
  });

  it('validates comment schema with mandatory body', () => {
    const valid = createCommentSchema.safeParse({
      post_id: '11111111-1111-1111-1111-111111111111',
      body: 'Happy to support this rescue effort!',
    });
    expect(valid.success).toBe(true);

    const invalid = createCommentSchema.safeParse({
      post_id: 'invalid-uuid',
      body: '',
    });
    expect(invalid.success).toBe(false);
  });

  it('validates lost-found post schema with required coarse location', () => {
    const valid = createLostFoundPostSchema.safeParse({
      species_id: '11111111-1111-1111-1111-111111111111',
      report_type: 'lost',
      description: 'Tabby cat lost near Dhanmondi Lake with red collar.',
      last_seen_area_label: 'Dhanmondi, Dhaka',
      incident_date: '2026-11-08T12:00:00Z',
    });
    expect(valid.success).toBe(true);

    // Reject missing area label (privacy-first requirement)
    const missingArea = createLostFoundPostSchema.safeParse({
      species_id: '11111111-1111-1111-1111-111111111111',
      report_type: 'lost',
      description: 'Missing animal',
      incident_date: '2026-11-08T12:00:00Z',
    });
    expect(missingArea.success).toBe(false);
  });

  it('validates adoption listing schema', () => {
    const valid = createAdoptionListingSchema.safeParse({
      animal_id: '22222222-2222-2222-2222-222222222222',
      description: 'Gentle domestic cat looking for caring family.',
      adoption_requirements: 'Indoor only, home visit required.',
      listing_status: 'active',
    });
    expect(valid.success).toBe(true);

    const invalidId = createAdoptionListingSchema.safeParse({
      animal_id: 'not-a-valid-uuid',
      description: 'test',
    });
    expect(invalidId.success).toBe(false);
  });

  it('validates content report schema', () => {
    const valid = createContentReportSchema.safeParse({
      post_id: '11111111-1111-1111-1111-111111111111',
      reason: 'animal_cruelty',
      details: 'Suspicious cruelty footage observed.',
    });
    expect(valid.success).toBe(true);
  });
});
