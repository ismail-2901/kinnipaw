import React from 'react';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-[#E8E6E0] p-8 md:p-12">
        <div className="border-b border-[#E8E6E0] pb-6 mb-8">
          <Link href="/" className="text-sm font-semibold text-[#245B45] hover:underline mb-4 inline-block">
            ← Back to KINNIPAW Home
          </Link>
          <h1 className="text-3xl font-extrabold text-[#245B45]">Privacy Policy</h1>
          <p className="text-sm text-[#66856C] mt-1">Effective Date: November 8, 2026 • Version 1.0</p>
        </div>

        <div className="space-y-8 text-[#252A27] text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-[#245B45] mb-2">1. Privacy by Design in Animal Welfare</h2>
            <p>
              At KINNIPAW, privacy is a fundamental human and animal welfare safeguard. We protect guardian identity,
              sensitive medical histories, and exact geographic coordinates to prevent theft, harassment, or retaliation.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#245B45] mb-2">2. Location Privacy & Coarse Area Labels</h2>
            <p>
              We <strong>never</strong> publicly disclose your exact home street address or precise GPS coordinates.
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-[#4B5563]">
              <li>Public lost-and-found and rescue posts display coarse area labels (e.g., &quot;Gulshan-2, Dhaka&quot;) only.</li>
              <li>Coordinate points are programmatically fuzzified (~2 decimal places, ~1km resolution) before public display.</li>
              <li>Continuous background location tracking is never performed.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#245B45] mb-2">3. Automatic EXIF & GPS Metadata Stripping</h2>
            <p>
              When you upload photos of animals or sighting locations, KINNIPAW automatically parses and removes all
              EXIF metadata (including embedded GPS latitude/longitude, camera serial numbers, and device details)
              on the server before storage or public CDN delivery.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#245B45] mb-2">4. Health Records & Confidential Inquiries</h2>
            <p>
              Private health records, vaccination schedules, adoption questionnaires, and direct messages are encrypted
              and strictly protected by Row-Level Security (RLS). They are accessible only to the guardian and authorized
              care partners.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#245B45] mb-2">5. User Rights & Account Deletion</h2>
            <p>
              You have the right to request access to your personal data, rectify inaccuracies, or delete your account.
              You may initiate self-service account deletion directly in your profile settings or by contacting privacy@kinnipaw.org.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
