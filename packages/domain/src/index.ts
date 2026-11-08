export type UserRole = 'user' | 'moderator' | 'admin' | 'super_admin';

export type OrganizationRole = 'owner' | 'manager' | 'rescuer' | 'staff' | 'volunteer';

export type GroupRole = 'owner' | 'admin' | 'member';

export type AnimalStatus = 'active' | 'lost' | 'found' | 'adopted' | 'deceased';

export type LostFoundStatus = 'active' | 'resolved' | 'expired';

export type RescueUrgency = 'low' | 'medium' | 'high' | 'critical';

export type RescueCaseStatus = 'open' | 'assigned' | 'in_progress' | 'resolved' | 'closed';

export type AdoptionListingStatus = 'draft' | 'active' | 'paused' | 'closed' | 'adopted';

export type AdoptionApplicationStatus = 'submitted' | 'under_review' | 'approved' | 'rejected' | 'withdrawn';

export type ContentReportReason =
  | 'spam'
  | 'harassment'
  | 'misinformation'
  | 'animal_cruelty'
  | 'illegal_trade'
  | 'other';

export type ContentReportStatus = 'pending' | 'under_review' | 'resolved' | 'dismissed';

/**
 * Bangladesh Wildlife (Preservation and Security) Act, 2012 Safeguards
 * Prohibits listing, trading, or domestic transfers of protected wildlife species.
 */
export const PROTECTED_WILDLIFE_COMMON_NAMES = [
  'Bengal Tiger',
  'Fishing Cat',
  'Leopard Cat',
  'Slow Loris',
  'Hoolock Gibbon',
  'Capped Langur',
  'Asian Elephant',
  'Indian Pangolin',
  'Ganges River Dolphin',
  'Spotted Deer',
  'Barking Deer',
  'Python',
  'King Cobra',
  'Mugger Crocodile',
  'Saltwater Crocodile',
];

export const PERMITTED_DOMESTIC_SPECIES = [
  'Domestic Dog',
  'Domestic Cat',
  'Domestic Rabbit',
  'Guinea Pig',
  'Hamster',
  'Domestic Bird',
  'Domestic Farm Animal',
];

export function isSpeciesEligibleForAdoption(speciesName: string, isWildlife = false): boolean {
  if (isWildlife) return false;
  const normalized = speciesName.trim().toLowerCase();
  for (const protectedSpecies of PROTECTED_WILDLIFE_COMMON_NAMES) {
    if (normalized.includes(protectedSpecies.toLowerCase())) {
      return false;
    }
  }
  return true;
}

/**
 * Nullable Foreign Key Invariant Verification (ADR-023)
 * Exactly one target must be populated per content report.
 */
export function validateContentReportTargets(targets: {
  post_id?: string | null;
  comment_id?: string | null;
  profile_id?: string | null;
  listing_id?: string | null;
  rescue_case_id?: string | null;
  lost_found_post_id?: string | null;
}): { valid: boolean; count: number } {
  const activeTargets = Object.values(targets).filter((v) => v !== null && v !== undefined && v !== '');
  return {
    valid: activeTargets.length === 1,
    count: activeTargets.length,
  };
}

/**
 * RBAC Permission Check
 */
export function hasAdminPermission(role: UserRole, requiredLevel: 'moderator' | 'admin' | 'super_admin'): boolean {
  const hierarchy: Record<UserRole, number> = {
    user: 0,
    moderator: 1,
    admin: 2,
    super_admin: 3,
  };
  const requiredScore: Record<'moderator' | 'admin' | 'super_admin', number> = {
    moderator: 1,
    admin: 2,
    super_admin: 3,
  };

  return (hierarchy[role] ?? 0) >= requiredScore[requiredLevel];
}
