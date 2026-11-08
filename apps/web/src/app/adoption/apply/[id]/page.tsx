'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ApplyAdoptionPage() {
  const params = useParams();
  const listingId = params.id as string;
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [housingType, setHousingType] = useState('apartment');
  const [hasSecureOutdoorSpace, setHasSecureOutdoorSpace] = useState('yes');
  const [currentPets, setCurrentPets] = useState('');
  const [experience, setExperience] = useState('');
  const [phone, setPhone] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      setError('Please agree to the responsible care commitments.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        listing_id: listingId,
        answers: {
          housing_type: housingType,
          has_secure_outdoor_space: hasSecureOutdoorSpace,
          current_pets: currentPets,
          experience,
          phone,
        },
      };

      const res = await fetch('/api/v1/adoption/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error?.message || 'Failed to submit application');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/adoption/${listingId}`);
      }, 2500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Submission failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-12 px-6">
      <div className="mx-auto max-w-xl">
        <div className="mb-6">
          <Link href={`/adoption/${listingId}`} className="text-xs font-semibold text-[#245B45] hover:underline">
            ← Cancel and return to listing
          </Link>
          <h1 className="mt-2 text-2xl font-black text-[#252A27]">Adoption Application</h1>
          <p className="text-xs text-gray-500">
            Please answer honestly to help ensure a safe, lifelong match for this animal.
          </p>
        </div>

        {success ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
            <span className="text-4xl">🎉</span>
            <h2 className="mt-2 text-lg font-bold text-emerald-900">Application Submitted!</h2>
            <p className="mt-1 text-sm text-emerald-700">
              Your application has been received by the guardian. You will be redirected shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-[#E8E6E0] bg-white p-8 shadow-sm">
            {error && (
              <div className="rounded-lg bg-red-50 p-4 text-xs font-medium text-red-700">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="housingType" className="block text-xs font-bold text-[#252A27]">Housing Type</label>
              <select
                id="housingType"
                value={housingType}
                onChange={(e) => setHousingType(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[#D5D2CA] p-2.5 text-sm outline-none focus:border-[#245B45]"
              >
                <option value="apartment">Apartment / Flat</option>
                <option value="house_with_yard">Independent House with Yard</option>
                <option value="house_without_yard">House without Yard</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="hasSecureOutdoorSpace" className="block text-xs font-bold text-[#252A27]">
                Do you have secure balconies or fences to prevent accidents/escapes?
              </label>
              <select
                id="hasSecureOutdoorSpace"
                value={hasSecureOutdoorSpace}
                onChange={(e) => setHasSecureOutdoorSpace(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[#D5D2CA] p-2.5 text-sm outline-none focus:border-[#245B45]"
              >
                <option value="yes">Yes, fully secured</option>
                <option value="partially">Partially secured / Will secure before adoption</option>
                <option value="no">No</option>
              </select>
            </div>

            <div>
              <label htmlFor="currentPets" className="block text-xs font-bold text-[#252A27]">Other pets currently in your home</label>
              <input
                id="currentPets"
                type="text"
                placeholder="e.g. 1 vaccinated cat, 0 dogs"
                value={currentPets}
                onChange={(e) => setCurrentPets(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[#D5D2CA] p-2.5 text-sm outline-none focus:border-[#245B45]"
              />
            </div>

            <div>
              <label htmlFor="experience" className="block text-xs font-bold text-[#252A27]">Your experience caring for animals</label>
              <textarea
                id="experience"
                rows={3}
                placeholder="Briefly describe your past experience or how you plan to care for this companion..."
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                required
                className="mt-1.5 w-full rounded-lg border border-[#D5D2CA] p-2.5 text-sm outline-none focus:border-[#245B45]"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-xs font-bold text-[#252A27]">Contact Phone Number</label>
              <input
                id="phone"
                type="tel"
                placeholder="+880 1700-000000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="mt-1.5 w-full rounded-lg border border-[#D5D2CA] p-2.5 text-sm outline-none focus:border-[#245B45]"
              />
            </div>

            <div className="flex items-start gap-3 pt-2">
              <input
                type="checkbox"
                id="agree"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-[#245B45] focus:ring-[#245B45]"
              />
              <label htmlFor="agree" className="text-xs text-gray-600">
                I commit to providing lifelong care, proper nutrition, and routine veterinary vaccinations. I certify that this adoption is not for commercial breeding, resale, or illegal trade.
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#245B45] py-3 text-sm font-bold text-white shadow transition hover:bg-[#1B4736] disabled:opacity-50"
            >
              {loading ? 'Submitting Application...' : 'Submit Application'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
