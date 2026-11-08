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
