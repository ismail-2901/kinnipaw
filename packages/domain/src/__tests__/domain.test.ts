import { describe, it, expect } from 'vitest';
import {
  isSpeciesEligibleForAdoption,
  validateContentReportTargets,
  hasAdminPermission,
} from '../index.js';

describe('Domain Rules & Species Safety (Bangladesh Wildlife Act 2012)', () => {
  it('allows domestic species for adoption', () => {
    expect(isSpeciesEligibleForAdoption('Domestic Dog', false)).toBe(true);
    expect(isSpeciesEligibleForAdoption('Domestic Cat', false)).toBe(true);
    expect(isSpeciesEligibleForAdoption('Domestic Rabbit', false)).toBe(true);
  });

  it('strictly blocks protected wildlife species under Bangladesh Wildlife Act 2012', () => {
    expect(isSpeciesEligibleForAdoption('Bengal Tiger', false)).toBe(false);
    expect(isSpeciesEligibleForAdoption('Fishing Cat', false)).toBe(false);
    expect(isSpeciesEligibleForAdoption('Slow Loris', false)).toBe(false);
    expect(isSpeciesEligibleForAdoption('Indian Python', false)).toBe(false);
    expect(isSpeciesEligibleForAdoption('Spotted Deer', false)).toBe(false);
  });

  it('rejects any species explicitly tagged as wildlife', () => {
    expect(isSpeciesEligibleForAdoption('Domestic Dog', true)).toBe(false);
  });
});

describe('ADR-023: Nullable FK Target Invariant (Content Reports)', () => {
  it('validates report with exactly one target', () => {
    const postReport = validateContentReportTargets({
      post_id: '11111111-1111-1111-1111-111111111111',
      comment_id: null,
      profile_id: null,
      listing_id: null,
      rescue_case_id: null,
      lost_found_post_id: null,
    });
    expect(postReport.valid).toBe(true);
    expect(postReport.count).toBe(1);

    const listingReport = validateContentReportTargets({
      post_id: null,
      comment_id: null,
      profile_id: null,
      listing_id: '22222222-2222-2222-2222-222222222222',
      rescue_case_id: null,
      lost_found_post_id: null,
    });
    expect(listingReport.valid).toBe(true);
    expect(listingReport.count).toBe(1);
  });

  it('rejects report with zero targets', () => {
    const emptyReport = validateContentReportTargets({
      post_id: null,
      comment_id: null,
      profile_id: null,
      listing_id: null,
      rescue_case_id: null,
      lost_found_post_id: null,
    });
    expect(emptyReport.valid).toBe(false);
    expect(emptyReport.count).toBe(0);
  });

  it('rejects report with multiple targets', () => {
    const multiReport = validateContentReportTargets({
      post_id: '11111111-1111-1111-1111-111111111111',
      comment_id: '33333333-3333-3333-3333-333333333333',
      profile_id: null,
      listing_id: null,
      rescue_case_id: null,
      lost_found_post_id: null,
    });
    expect(multiReport.valid).toBe(false);
    expect(multiReport.count).toBe(2);
  });
});

describe('RBAC Hierarchy Authorization', () => {
  it('enforces privilege tiers accurately', () => {
    // Normal user
    expect(hasAdminPermission('user', 'moderator')).toBe(false);
    expect(hasAdminPermission('user', 'admin')).toBe(false);
    expect(hasAdminPermission('user', 'super_admin')).toBe(false);

    // Moderator
    expect(hasAdminPermission('moderator', 'moderator')).toBe(true);
    expect(hasAdminPermission('moderator', 'admin')).toBe(false);
    expect(hasAdminPermission('moderator', 'super_admin')).toBe(false);

    // Admin
    expect(hasAdminPermission('admin', 'moderator')).toBe(true);
    expect(hasAdminPermission('admin', 'admin')).toBe(true);
    expect(hasAdminPermission('admin', 'super_admin')).toBe(false);

    // Super Admin
    expect(hasAdminPermission('super_admin', 'moderator')).toBe(true);
    expect(hasAdminPermission('super_admin', 'admin')).toBe(true);
    expect(hasAdminPermission('super_admin', 'super_admin')).toBe(true);
  });
});
