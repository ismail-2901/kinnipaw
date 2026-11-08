'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NewAnimalPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [speciesId, setSpeciesId] = useState('c0000000-0000-0000-0000-000000000001'); // Default Dog
  const [sex, setSex] = useState<'male' | 'female' | 'unknown'>('unknown');
  const [sizeCategory, setSizeCategory] = useState<'tiny' | 'small' | 'medium' | 'large' | 'extra_large'>('medium');
  const [colorDescription, setColorDescription] = useState('');
  const [bio, setBio] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/v1/animals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          species_id: speciesId,
          sex,
          size_category: sizeCategory,
          color_description: colorDescription || undefined,
          bio: bio || undefined,
          visibility,
        }),
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        setErrorMsg(json.error?.message || 'Failed to register animal profile');
        setLoading(false);
      } else {
        router.push('/animals');
        router.refresh();
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Network error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-10 px-4">
      <div className="mx-auto max-w-2xl rounded-2xl border border-[#E8E6E0] bg-white p-8 shadow-sm">
        <div className="mb-6 border-b border-[#F0F6F3] pb-4">
          <Link href="/animals" className="text-sm font-semibold text-[#245B45] hover:underline">
            ← Back to My Animals
          </Link>
          <h1 className="mt-2 text-2xl font-extrabold text-[#252A27]">Register New Animal</h1>
          <p className="text-sm text-[#66856C]">
            Add a companion, domestic animal, or rescued animal profile
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#252A27]">Animal Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#E8E6E0] px-3 py-2 text-sm focus:border-[#245B45] focus:outline-none"
              placeholder="e.g. Bagha, Mini, Tommy"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-[#252A27]">Species *</label>
              <select
                value={speciesId}
                onChange={(e) => setSpeciesId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#E8E6E0] px-3 py-2 text-sm focus:border-[#245B45] focus:outline-none"
              >
                <option value="c0000000-0000-0000-0000-000000000001">Dog</option>
                <option value="c0000000-0000-0000-0000-000000000002">Cat</option>
                <option value="c0000000-0000-0000-0000-000000000003">Bird (Domestic)</option>
                <option value="c0000000-0000-0000-0000-000000000004">Rabbit</option>
                <option value="c0000000-0000-0000-0000-000000000005">Small Mammal</option>
                <option value="c0000000-0000-0000-0000-000000000006">Fish</option>
                <option value="c0000000-0000-0000-0000-000000000007">Reptile (Domestic)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#252A27]">Sex</label>
              <select
                value={sex}
                onChange={(e) => setSex(e.target.value as any)}
                className="mt-1 w-full rounded-lg border border-[#E8E6E0] px-3 py-2 text-sm focus:border-[#245B45] focus:outline-none"
              >
                <option value="unknown">Unknown / Not Specified</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-[#252A27]">Size Category</label>
              <select
                value={sizeCategory}
                onChange={(e) => setSizeCategory(e.target.value as any)}
                className="mt-1 w-full rounded-lg border border-[#E8E6E0] px-3 py-2 text-sm focus:border-[#245B45] focus:outline-none"
              >
                <option value="tiny">Tiny (under 2 kg)</option>
                <option value="small">Small (2 - 10 kg)</option>
                <option value="medium">Medium (10 - 25 kg)</option>
                <option value="large">Large (25 - 45 kg)</option>
                <option value="extra_large">Extra Large (45+ kg)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#252A27]">Color / Markings</label>
              <input
                type="text"
                value={colorDescription}
                onChange={(e) => setColorDescription(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#E8E6E0] px-3 py-2 text-sm focus:border-[#245B45] focus:outline-none"
                placeholder="e.g. Golden brown, white chest"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#252A27]">Bio &amp; Story</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#E8E6E0] px-3 py-2 text-sm focus:border-[#245B45] focus:outline-none"
              placeholder="Tell us about your animal's background, rescue story, or quirks..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#252A27]">Privacy &amp; Visibility</label>
            <div className="mt-2 space-y-2">
              <label className="flex items-center gap-3 text-sm text-[#252A27]">
                <input
                  type="radio"
                  name="visibility"
                  value="public"
                  checked={visibility === 'public'}
                  onChange={() => setVisibility('public')}
                  className="text-[#245B45]"
                />
                <span>
                  <strong>Public:</strong> Profile is visible in the animal community and sharable
                </span>
              </label>
              <label className="flex items-center gap-3 text-sm text-[#252A27]">
                <input
                  type="radio"
                  name="visibility"
                  value="private"
                  checked={visibility === 'private'}
                  onChange={() => setVisibility('private')}
                  className="text-[#245B45]"
                />
                <span>
                  <strong>Private:</strong> Strictly visible only to you as the verified guardian
                </span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Link
              href="/animals"
              className="rounded-lg border border-[#CCD8D0] px-4 py-2 text-sm font-semibold text-[#252A27] hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-[#245B45] px-6 py-2 text-sm font-semibold text-white hover:bg-[#1B4736] disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Save Animal Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
