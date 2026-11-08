/**
 * Administrator-Maintained Emergency Contacts Configuration
 *
 * Source: Official Portal of the Bangladesh Forest Department (bforest.gov.bd)
 * Wildlife Crime Control Unit (WCCU), Bana Bhaban, Agargaon, Dhaka
 * Last Verified: 2026-11-08
 *
 * Note: KINNIPAW is an independent platform and does not claim an official partnership
 * or agency relationship with the Bangladesh Forest Department. Statutory wildlife
 * emergencies must be referred directly to the official hotlines below.
 */

export interface EmergencyContactEntry {
  authority: string;
  department: string;
  description: string;
  hotlines: string[];
  nationalHelpline: string;
  email: string;
  headquarters: string;
  sourceUrl: string;
  lastVerifiedDate: string;
  verificationNotes: string;
}

export const OFFICIAL_WILDLIFE_EMERGENCY_CONFIG: EmergencyContactEntry = {
  authority: 'Bangladesh Forest Department (BFD)',
  department: 'Wildlife Crime Control Unit (WCCU)',
  description: 'Official statutory authority for reporting injured wildlife, wildlife rescue, and wildlife offenses in Bangladesh under the Wildlife (Conservation and Security) Act, 2026.',
  hotlines: ['01999000095', '01711159035', '01916095643'],
  nationalHelpline: '333-4',
  email: 'dir-wccu@bforest.gov.bd',
  headquarters: 'Bana Bhaban, Agargaon, Sher-e-Bangla Nagar, Dhaka-1207, Bangladesh',
  sourceUrl: 'http://bforest.gov.bd',
  lastVerifiedDate: '2026-11-08',
  verificationNotes: 'Verified against official Bangladesh Forest Department / WCCU directory. Hotline 10603 was unverified and decommissioned.',
};
