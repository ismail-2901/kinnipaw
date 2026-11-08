import { describe, it, expect } from 'vitest';
import {
  isSpeciesEligibleForAdoption,
  validateContentReportTargets,
  hasAdminPermission,
} from '../index.js';
import { OFFICIAL_WILDLIFE_EMERGENCY_CONFIG } from '@kinnipaw/config';

describe('Domain Rules & Species Safety (Wildlife Conservation and Security Act, 2026)', () => {
  it('allows domestic species for adoption', () => {
    expect(isSpeciesEligibleForAdoption('Domestic Dog', false)).toBe(true);
    expect(isSpeciesEligibleForAdoption('Domestic Cat', false)).toBe(true);
    expect(isSpeciesEligibleForAdoption('Domestic Rabbit', false)).toBe(true);
  });

  it('strictly blocks protected wildlife species under Wildlife (Conservation and Security) Act, 2026 (Act No. 86 of 2026)', () => {
    expect(isSpeciesEligibleForAdoption('Bengal Tiger', false)).toBe(false);
    expect(isSpeciesEligibleForAdoption('Fishing Cat', false)).toBe(false);
    expect(isSpeciesEligibleForAdoption('Slow Loris', false)).toBe(false);
    expect(isSpeciesEligibleForAdoption('Indian Python', false)).toBe(false);
    expect(isSpeciesEligibleForAdoption('Spotted Deer', false)).toBe(false);
  });

  it('keeps uncertain or non-domestic classifications restricted by default pending verification', () => {
    expect(isSpeciesEligibleForAdoption('Asian Palm Civet', false)).toBe(false);
    expect(isSpeciesEligibleForAdoption('Peregrine Falcon', false)).toBe(false);
    expect(isSpeciesEligibleForAdoption('Common Myna', false)).toBe(false);
    expect(isSpeciesEligibleForAdoption('Smooth-coated Otter', false)).toBe(false);
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

describe('Emergency Contact Configuration & Source Verification', () => {
  it('contains verified Bangladesh Forest Department WCCU contact details', () => {
    expect(OFFICIAL_WILDLIFE_EMERGENCY_CONFIG.authority).toContain('Bangladesh Forest Department');
    expect(OFFICIAL_WILDLIFE_EMERGENCY_CONFIG.department).toContain('Wildlife Crime Control Unit');
    expect(OFFICIAL_WILDLIFE_EMERGENCY_CONFIG.hotlines).toContain('01999000095');
    expect(OFFICIAL_WILDLIFE_EMERGENCY_CONFIG.hotlines).toContain('01711159035');
    expect(OFFICIAL_WILDLIFE_EMERGENCY_CONFIG.hotlines).toContain('01916095643');
    expect(OFFICIAL_WILDLIFE_EMERGENCY_CONFIG.nationalHelpline).toBe('333-4');
    expect(OFFICIAL_WILDLIFE_EMERGENCY_CONFIG.email).toBe('dir-wccu@bforest.gov.bd');
  });

  it('records verified source portal and recent verification timestamp', () => {
    expect(OFFICIAL_WILDLIFE_EMERGENCY_CONFIG.sourceUrl).toBe('http://bforest.gov.bd');
    expect(OFFICIAL_WILDLIFE_EMERGENCY_CONFIG.lastVerifiedDate).toBe('2026-11-08');
  });

  it('ensures unverified hotline numbers (such as 10603) are strictly omitted', () => {
    const hotlinesStr = OFFICIAL_WILDLIFE_EMERGENCY_CONFIG.hotlines.join(' ');
    expect(hotlinesStr).not.toContain('10603');
    expect(OFFICIAL_WILDLIFE_EMERGENCY_CONFIG.nationalHelpline).not.toBe('10603');
  });
});
