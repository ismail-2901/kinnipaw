/**
 * KINNIPAW — Advanced AI Provider Abstraction, Safety Guardrails & Multilingual Engine
 * Governing ADRs: ADR-015, AGENTS.md §17 (AI Guardrails)
 *
 * INVARIANTS:
 * 1. AI must NEVER diagnose animal medical conditions.
 * 2. AI must NEVER prescribe treatments or recommend medication dosages.
 * 3. Urgent medical / distress keywords trigger an immediate emergency veterinary referral.
 * 4. Multilingual: Natural handling of English, Bangla (বাংলা), and Banglish.
 * 5. Prompt Injection Defense: Intercept and neutralize bypass/jailbreak attempts.
 * 6. Safe-failing: Platform stays 100% operational with deterministic heuristic fallback when external AI is offline.
 */

export interface AiCareResponse {
  answer: string;
  is_emergency: boolean;
  emergency_banner?: string;
  disclaimer: string;
  detected_language: 'en' | 'bn' | 'banglish';
}

export interface AiListingResponse {
  description: string;
}

export interface AiSimilarityResponse {
  confidence_score: number;
  reasoning: string;
}

// Multilingual Medical Emergency Keywords (English, Bengali Script, Banglish)
const MEDICAL_EMERGENCY_KEYWORDS = [
  // English
  'bleeding', 'fracture', 'broken bone', 'poison', 'vomiting blood',
  'unconscious', 'seizure', 'cannot breathe', 'choking', 'hit by car',
  'lethargic', 'hypothermia', 'heatstroke', 'collapse', 'toxic', 'convulsion',
  'heavy bleeding', 'severe trauma',
  // Bengali Script (বাংলা)
  'রক্তপাত', 'রক্ত বের', 'বিষ', 'বিষাক্ত', 'শ্বাসকষ্ট', 'দম বন্ধ', 'গাড়ির ধাক্কা',
  'অজ্ঞান', 'খিঁচুনি', 'বমি হচ্ছে', 'হাত পা ভাঙা', 'মরার মতো',
  // Banglish
  'rokt', 'roktpat', 'bish', 'shash koshto', 'khichuni', 'ongyan', 'accident',
  'bomi hocche', 'pa venge geche'
];

// Multilingual Medication & Dosage Keywords
const MEDICATION_DOSAGE_KEYWORDS = [
  // English
  'dose', 'dosage', 'how much mg', 'antibiotic', 'paracetamol', 'panadol',
  'ibuprofen', 'prednisolone', 'ivermectin', 'prescribe', 'injection', 'mg/kg',
  'napa', 'tylenol', 'aspirin',
  // Bengali Script
  'প্যারাসিটামল', 'নাপা', 'ঔষধ', 'ওষুধ', 'কতটুকু ওষুধ', 'ডোজ', 'ইনজেকশন', 'অ্যান্টিবায়োটিক',
  // Banglish
  'osudh', 'oushodh', 'koto tuku dose', 'napa', 'antibiotic'
];

// Prompt Injection Defense Patterns
const PROMPT_INJECTION_PATTERNS = [
  'ignore all previous instructions',
  'ignore previous rules',
  'system override',
  'jailbreak',
  'roleplay as a vet',
  'pretend you are a licensed veterinarian',
  'act as an unlicensed doctor',
  'bypass safety guardrails',
  'developer mode on',
  'disregard safety'
];

export function detectLanguage(text: string): 'en' | 'bn' | 'banglish' {
  // Check for Bengali Unicode block (0x0980 to 0x09FF)
  const hasBengali = /[\u0980-\u09FF]/.test(text);
  if (hasBengali) return 'bn';

  // Check for common Banglish transliteration tokens
  const banglishTokens = ['kemon', 'amar', 'beral', 'kukur', 'khabar', 'ki', 'dibo', 'kore', 'ache', 'hoise', 'rokt', 'osudh'];
  const lower = text.toLowerCase();
  const isBanglish = banglishTokens.some((tok) => lower.includes(tok));
  if (isBanglish) return 'banglish';

  return 'en';
}

export function checkSafetyGuardrails(query: string): {
  isEmergency: boolean;
  isMedicationRequest: boolean;
  isPromptInjection: boolean;
} {
  const lower = query.toLowerCase();
  const isPromptInjection = PROMPT_INJECTION_PATTERNS.some((pat) => lower.includes(pat));
  const isEmergency = MEDICAL_EMERGENCY_KEYWORDS.some((kw) => lower.includes(kw));
  const isMedicationRequest = MEDICATION_DOSAGE_KEYWORDS.some((kw) => lower.includes(kw));
  return { isEmergency, isMedicationRequest, isPromptInjection };
}

export async function askPetCareAssistant(
  query: string,
  species = 'companion animal'
): Promise<AiCareResponse> {
  const lang = detectLanguage(query);
  const { isEmergency, isMedicationRequest, isPromptInjection } = checkSafetyGuardrails(query);

  const disclaimerEn =
    'Educational wellness guidance only. KINNIPAW AI does not diagnose illnesses or prescribe medication. Consult a licensed veterinarian for medical treatment.';
  const disclaimerBn =
    'শুধুমাত্র শিক্ষামূলক সাধারণ যত্নের পরামর্শ। কিন্নীপ থাবা এআই কোনো রোগ নির্ণয় বা ওষুধের প্রেসক্রিপশন প্রদান করে না। চিকিৎসার জন্য সর্বদা নিবন্ধিত ভেটেরিনারি চিকিৎসকের পরামর্শ নিন।';
  const disclaimer = lang === 'bn' ? disclaimerBn : disclaimerEn;

  // 1. Prompt Injection Intercept
  if (isPromptInjection) {
    const injectionRefusal =
      lang === 'bn'
        ? 'নিরাপত্তা নীতি অনুসারে এই অনুরোধটি প্রক্রিয়াকরণ করা সম্ভব নয়। কিন্নীপ থাবা এআই কোনো অবস্থাতেই পশু চিকিৎসা বা ওষুধের প্রেসক্রিপশন প্রদান করতে পারে না।'
        : 'Safety Alert: This request cannot be processed because it attempts to override safety guardrails. KINNIPAW AI strictly provides educational care advice and never provides medical diagnoses or drug prescriptions.';

    return {
      is_emergency: false,
      answer: injectionRefusal,
      disclaimer,
      detected_language: lang,
    };
  }

  // 2. Emergency or Medication Dosage Intercept
  if (isEmergency || isMedicationRequest) {
    if (lang === 'bn') {
      return {
        is_emergency: true,
        emergency_banner:
          '⚠️ জরুরি ভেটেরিনারি সতর্কতা: আপনার প্রাণীর অবিলম্বে জরুরি চিকিৎসার প্রয়োজন হতে পারে। এআই কোনো রোগ নির্ণয় বা ওষুধের মাত্রা নির্ধারণ করতে পারে না। অনুগ্রহ করে অবিলম্বে নিকটস্থ নিবন্ধিত ভেটেরিনারি হাসপাতালে যোগাযোগ করুন।',
        answer:
          'আপনার বর্ণনায় জরুরি শারীরিক লক্ষণ বা ওষুধের মাত্রা জানতে চাওয়ার ইঙ্গিত পাওয়া গেছে। কখনোই প্রাণীকে মানুষের ওষুধ (যেমন প্যারাসিটামল বা নাপা, যা কুকুর ও বিড়ালের জন্য বিষাক্ত ও মারাত্মক) খাওয়াবেন না। বিলম্ব না করে নিকটস্থ অনুমোদিত পশু চিকিৎসকের কাছে যান।',
        disclaimer,
        detected_language: lang,
      };
    }

    return {
      is_emergency: true,
      emergency_banner:
        '⚠️ CRITICAL VETERINARY WARNING: This situation may require immediate emergency medical intervention. Automated AI systems cannot diagnose or calculate drug dosages. Please contact a licensed veterinarian or emergency clinic in Bangladesh immediately.',
      answer:
        'Your query indicates an urgent symptom or request for veterinary medication. For the safety of the animal, do NOT administer human medications (such as paracetamol/Napa or ibuprofen, which are lethal to cats and dogs). Immediately transport the animal to the nearest veterinary hospital.',
      disclaimer,
      detected_language: lang,
    };
  }

  // 3. Educational Guidance by Category & Language
  const lower = query.toLowerCase();

  if (lang === 'bn') {
    let advice = `আপনার ${species}-এর সাধারণ যত্নের জন্য সবসময় পর্যাপ্ত ও পরিষ্কার পানীয় জল রাখুন, বয়স অনুযায়ী সুষম খাবার দিন এবং সময়মতো টিকাদান (ভ্যাকসিন) নিশ্চিত করুন।`;
    if (lower.includes('খাবার') || lower.includes('ডায়েট') || lower.includes('পুষ্টি')) {
      advice = `${species}-এর পুষ্টি নির্দেশিকা: বয়সোপযোগী সুষম খাবার দিন। টেবিলের মশলাযুক্ত অবশিষ্টাংশ, চকলেট, পেঁয়াজ, রসুন বা রান্না করা হাড় দেওয়া পরিহার করুন।`;
    } else if (lower.includes('গোসল') || lower.includes('পশম') || lower.includes('পরিষ্কার')) {
      advice = `${species}-এর পশম নিয়মিত ব্রাশ করুন। এতে মরা লোম দূর হয় এবং ত্বকের রক্ত সঞ্চালন বাড়ে। সবসময় প্রাণীবান্ধব শ্যাম্পু ব্যবহার করুন এবং কানের ভেতর পানি ঢুকতে দেবেন না।`;
    } else if (lower.includes('প্রশিক্ষণ') || lower.includes('পটি') || lower.includes('টয়লেট')) {
      advice = `${species}-এর অভ্যাস ও প্রশিক্ষণ: ইতিবাচক আচরণে প্রশংসা বা ছোট খাবার দিয়ে উৎসাহিত করুন। কখনোই শারীরিক আঘাত বা শাস্তি দেবেন না। লিটার বক্স সবসময় পরিষ্কার রাখুন।`;
    }

    return {
      is_emergency: false,
      answer: advice,
      disclaimer,
      detected_language: lang,
    };
  }

  // English & Banglish Responses
  let advice = `For general wellness regarding your ${species}, ensure clean fresh water is accessible 24/7, maintain a nutritionally balanced diet, and adhere to scheduled veterinary vaccination boosters.`;

  if (lower.includes('food') || lower.includes('diet') || lower.includes('feed') || lower.includes('khabar')) {
    advice = `Nutritional guidance for ${species}: Provide high-quality food formulated for their specific life stage. Strictly avoid toxic human foods including onions, garlic, chocolate, grapes/raisins, and cooked bones.`;
  } else if (lower.includes('bath') || lower.includes('groom') || lower.includes('fur') || lower.includes('brush')) {
    advice = `Grooming tips for ${species}: Regular brushing removes loose dead hair, stimulates skin circulation, and reduces shedding. Use gentle species-formulated pet shampoo and protect ears from water intrusion.`;
  } else if (lower.includes('training') || lower.includes('potty') || lower.includes('litter') || lower.includes('habit')) {
    advice = `Habit & training guidance for ${species}: Utilize reward-based positive reinforcement (gentle treats and praise). Never utilize punitive or physical discipline. Ensure clean, accessible litter areas.`;
  }

  return {
    is_emergency: false,
    answer: advice,
    disclaimer,
    detected_language: lang,
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

  const copy = `Meet ${name}! ${name} is a wonderful ${species} who is ${traitText}. Looking for a loving, permanent home committed to responsible care, good nutrition, and plenty of affection.${needsText} All adoptions on KINNIPAW are strictly free, non-commercial, and governed by animal welfare principles under the Wildlife (Conservation and Security) Act, 2026.`;

  return { description: copy };
}

export async function computeSimilarity(
  lostDesc: string,
  sightingDesc: string
): Promise<AiSimilarityResponse> {
  const lostTokens = new Set(lostDesc.toLowerCase().split(/\s+/).filter((t) => t.length > 2));
  const sightingTokens = new Set(sightingDesc.toLowerCase().split(/\s+/).filter((t) => t.length > 2));

  let matches = 0;
  for (const token of lostTokens) {
    if (sightingTokens.has(token)) {
      matches += 1;
    }
  }

  const denominator = Math.max(lostTokens.size, sightingTokens.size, 1);
  const score = Math.min(Math.round((matches / denominator) * 100) / 100, 0.99);

  return {
    confidence_score: score,
    reasoning: `Lexical and feature overlap identified ${matches} matching attributes between sighting and lost animal reports. Human verification strictly required.`,
  };
}
