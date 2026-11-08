import React from 'react';
import Link from 'next/link';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-[#E8E6E0] p-8 md:p-12">
        <div className="border-b border-[#E8E6E0] pb-6 mb-8">
          <Link href="/" className="text-sm font-semibold text-[#245B45] hover:underline mb-4 inline-block">
            ← Back to KINNIPAW Home
          </Link>
          <h1 className="text-3xl font-extrabold text-[#245B45]">Terms of Service</h1>
          <p className="text-sm text-[#66856C] mt-1">Effective Date: November 8, 2026 • Version 1.0</p>
        </div>

        <div className="space-y-8 text-[#252A27] text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-[#245B45] mb-2">1. Our Ecosystem Mission</h2>
            <p>
              KINNIPAW is an animal-welfare community, responsible care, lawful adoption, lost-and-found reunion,
              and rescue coordination platform operating in Bangladesh. By accessing or using KINNIPAW (web or mobile),
              you agree to be bound by these Terms of Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#245B45] mb-2">2. Compliance with Bangladesh Wildlife Protection Laws</h2>
            <p>
              Users must strictly comply with the <strong>Wildlife (Conservation and Security) Act, 2026 (Act No. 86 of 2026)</strong>,
              the Cruelty to Animals Act, and all applicable animal welfare legislation. KINNIPAW strictly prohibits:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-[#4B5563]">
              <li>Listing, transferring, selling, or buying protected wild animals, endangered species, or CITES-listed fauna.</li>
              <li>Unauthorized commercial animal trade or unlicensed mass breeding facilities.</li>
              <li>Content depicting, encouraging, or facilitating animal cruelty, neglect, or animal fighting.</li>
              <li>Adoption transfers of uncertain or non-domestic species; all non-domestic fauna remain restricted by default pending statutory review.</li>
            </ul>
            <p className="mt-2 text-xs text-[#991B1B] bg-red-50 p-3 rounded-lg border border-red-200">
              Any sighting or distress of wild fauna must be reported directly to the Bangladesh Forest Department / Wildlife Crime Control Unit (Hotlines: 01999000095 / 01711159035, National Helpline: 333-4, Source: bforest.gov.bd, verified November 2026). KINNIPAW is an independent platform and does not claim an official partnership with statutory authorities.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#245B45] mb-2">3. Non-Diagnostic AI Assistant Disclaimer</h2>
            <p>
              The KINNIPAW Care Assistant is an educational and wellness companion only. It <strong>never</strong> provides
              medical diagnoses, prescribes pharmaceuticals, or calculates drug dosages. AI guidance does not replace
              qualified veterinary examination. In a medical crisis, users must immediately contact a licensed veterinary clinic.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#245B45] mb-2">4. Lawful Adoption & Rehoming Standards</h2>
            <p>
              Adoption listings are limited to domestic companion animals. Rescuers and shelters agree to conduct honest
              disclosures regarding animal health and temperament. Commercial transaction fees disguised as adoption
              are strictly banned.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#245B45] mb-2">5. Community Moderation & Account Termination</h2>
            <p>
              We reserve the right to review content, suspend accounts, and cooperate with law enforcement in instances of
              animal abuse, harassment, fraud, or violations of Bangladeshi law.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
