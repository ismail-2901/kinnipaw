/**
 * KINNIPAW — AI Provider Abstraction and Safety Guardrails
 * Governing ADRs: ADR-015, AGENTS.md §17 (AI Guardrails)
 *
 * INVARIANTS:
 * 1. AI must NEVER diagnose animal medical conditions.
 * 2. AI must NEVER prescribe treatments or recommend medication dosages.
 * 3. Urgent medical / distress keywords trigger an immediate emergency veterinary referral.
 * 4. Safe-failing: Platform stays 100% operational when external AI is offline.
 */

export interface AiCareResponse {
  answer: string;
  is_emergency: boolean;
  emergency_banner?: string;
  disclaimer: string;
}

export interface AiListingResponse {
  description: string;
}

export interface AiSimilarityResponse {
  confidence_score: number;
  reasoning: string;
}

const MEDICAL_EMERGENCY_KEYWORDS = [
  'bleeding', 'fracture', 'broken bone', 'poison', 'vomiting blood',
  'unconscious', 'seizure', 'cannot breathe', 'choking', 'hit by car',
  'lethargic', 'hypothermia', 'heatstroke', 'collapse', 'toxic'
];

const MEDICATION_DOSAGE_KEYWORDS = [
  'dose', 'dosage', 'how much mg', 'antibiotic', 'paracetamol', 'panadol',
  'ibuprofen', 'prednisolone', 'ivermectin', 'prescribe', 'injection', 'mg/kg'
];

export function checkSafetyGuardrails(query: string): { isEmergency: boolean; isMedicationRequest: boolean } {
  const lower = query.toLowerCase();
  const isEmergency = MEDICAL_EMERGENCY_KEYWORDS.some((kw) => lower.includes(kw));
  const isMedicationRequest = MEDICATION_DOSAGE_KEYWORDS.some((kw) => lower.includes(kw));
  return { isEmergency, isMedicationRequest };
}

export async function askPetCareAssistant(
  query: string,
  species = 'companion animal'
): Promise<AiCareResponse> {
  const { isEmergency, isMedicationRequest } = checkSafetyGuardrails(query);

  const standardDisclaimer =
    'Educational advice only. KINNIPAW AI does not replace licensed veterinary care, diagnosis, or professional treatment.';

  if (isEmergency || isMedicationRequest) {
    return {
      is_emergency: true,
      emergency_banner:
        '⚠️ CRITICAL VETERINARY WARNING: This situation may require immediate emergency medical intervention. Automated AI systems cannot diagnose or calculate drug dosages. Please contact a licensed veterinarian or emergency clinic in Bangladesh immediately.',
      answer:
        'Your query indicates an urgent symptom or request for veterinary medication. For the safety of the animal, do NOT administer human medications (such as paracetamol or ibuprofen, which are lethal to cats and dogs). Immediately take the animal to the nearest veterinary hospital.',
      disclaimer: standardDisclaimer,
    };
  }

  // Safe educational care assistant response
  const lower = query.toLowerCase();
  let advice = `For general care regarding your ${species}, ensure clean fresh water is available at all times, maintain an age-appropriate balanced diet, and keep vaccinations up to date.`;

  if (lower.includes('food') || lower.includes('diet') || lower.includes('feed')) {
    advice = `Nutritional guidance for ${species}: Provide a balanced diet formulated for their life stage (kitten/puppy, adult, or senior). Avoid giving table scraps, chocolate, onions, garlic, or cooked bones.`;
  } else if (lower.includes('bath') || lower.includes('groom') || lower.includes('fur')) {
    advice = `Grooming tips for ${species}: Regular brushing helps remove loose hair, stimulates skin circulation, and reduces shedding. Use species-specific shampoo and avoid water getting inside ears.`;
  } else if (lower.includes('training') || lower.includes('potty') || lower.includes('litter')) {
    advice = `Habit & training tips for ${species}: Use positive reinforcement (rewards and praise). Never use physical punishment. Keep litter boxes clean and easily accessible in quiet corners.`;
  }

  return {
    is_emergency: false,
    answer: advice,
    disclaimer: standardDisclaimer,
  };
}

export async function generateListingCopy(
  name: string,
  species: string,
  traits?: string[],
  specialNeeds?: string
): Promise<AiListingResponse> {
  const traitText = traits && traits.length > 0 ? `known for being ${traits.join(', ')}` : 'a gentle companion';
  const needsText = specialNeeds ? ` Special considerations: ${specialNeeds}.` : '';

  const copy = `Meet ${name}! ${name} is a wonderful ${species} who is ${traitText}. Looking for a loving, permanent home committed to responsible care, good nutrition, and plenty of affection.${needsText} All adoptions on KINNIPAW are strictly free, non-commercial, and governed by animal welfare principles.`;

  return { description: copy };
}

export async function computeSimilarity(
  lostDesc: string,
  foundDesc: string
): Promise<AiSimilarityResponse> {
  // Coarse token overlap heuristic
  const lostTokens = new Set(lostDesc.toLowerCase().split(/\s+/));
  const foundTokens = new Set(foundDesc.toLowerCase().split(/\s+/));
  let overlap = 0;

  for (const token of lostTokens) {
    if (token.length > 3 && foundTokens.has(token)) {
      overlap++;
    }
  }

  const score = Math.min(0.95, Math.max(0.4, 0.4 + overlap * 0.1));
  const confidence = parseFloat(score.toFixed(2));

  return {
    confidence_score: confidence,
    reasoning: `Shared descriptive attributes detected (${overlap} matching key markers). Human visual verification required.`,
  };
}
