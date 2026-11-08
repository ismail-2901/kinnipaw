'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface SpeciesOption {
  id: string;
  common_name: string;
  is_domestic: boolean;
}

export default function NewRescueCasePage() {
  const router = useRouter();
  const [speciesList, setSpeciesList] = useState<SpeciesOption[]>([]);
  const [speciesId, setSpeciesId] = useState('');
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high' | 'critical'>('high');
  const [locationAreaLabel, setLocationAreaLabel] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSpecies() {
      const res = await fetch('/api/v1/taxonomy/species');
      const json = await res.json();
      if (json.data && json.data.length > 0) {
        setSpeciesList(json.data);
        setSpeciesId(json.data[0].id);
      }
    }
    fetchSpecies();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        species_id: speciesId,
        urgency,
        location_area_label: locationAreaLabel,
        description,
      };

      const res = await fetch('/api/v1/rescue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error?.message || 'Failed to submit rescue case');
      }

      router.push(`/rescue/${json.data.id}`);
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
          <Link href="/rescue" className="text-xs font-semibold text-[#245B45] hover:underline">
            ← Back to Rescue Dashboard
          </Link>
          <h1 className="mt-2 text-2xl font-black text-[#252A27]">
            Report Animal Rescue Emergency
          </h1>
          <p className="text-xs text-gray-500">
            Alert nearby volunteers, animal welfare groups, and rescuers to provide urgent aid.
          </p>
        </div>

        {/* Emergency Medical Disclaimer (AGENTS.md §17) */}
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-900 leading-relaxed">
          <strong>⚠️ Critical Veterinary Notice:</strong> KINNIPAW does not provide automated veterinary diagnosis or medication prescriptions. For immediate life-threatening injuries, contact a licensed veterinarian or emergency animal clinic immediately.
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-[#E8E6E0] bg-white p-8 shadow-sm">
          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-xs font-medium text-red-700">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="urgencyLevel" className="block text-xs font-bold text-[#252A27]">Urgency Level</label>
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['low', 'medium', 'high', 'critical'] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setUrgency(level)}
                  className={`py-2 rounded-lg text-xs font-bold capitalize border transition ${
                    urgency === level
                      ? level === 'critical'
                        ? 'border-red-600 bg-red-600 text-white'
                        : level === 'high'
                        ? 'border-orange-500 bg-orange-500 text-white'
                        : 'border-[#245B45] bg-[#245B45] text-white'
                      : 'border-[#E8E6E0] bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="speciesSelect" className="block text-xs font-bold text-[#252A27]">Species Involved</label>
            <select
              id="speciesSelect"
              value={speciesId}
              onChange={(e) => setSpeciesId(e.target.value)}
              required
              className="mt-1.5 w-full rounded-lg border border-[#D5D2CA] p-2.5 text-sm outline-none focus:border-[#245B45]"
            >
              {speciesList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.common_name} {!s.is_domestic ? '(Wildlife / Protected)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="locationArea" className="block text-xs font-bold text-[#252A27]">Incident Location / Area</label>
            <input
              id="locationArea"
              type="text"
              placeholder="e.g. Dhanmondi Lake side, Mirpur 12 Bus Stand, Gulshan-1 Circle"
              value={locationAreaLabel}
              onChange={(e) => setLocationAreaLabel(e.target.value)}
              required
              className="mt-1.5 w-full rounded-lg border border-[#D5D2CA] p-2.5 text-sm outline-none focus:border-[#245B45]"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-xs font-bold text-[#252A27]">
              Observed Condition & Rescue Details
            </label>
            <textarea
              id="description"
              rows={4}
              placeholder="Describe apparent injuries (e.g. fractured leg, bleeding, severe dehydration), physical condition, and surrounding hazards..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="mt-1.5 w-full rounded-lg border border-[#D5D2CA] p-2.5 text-sm outline-none focus:border-[#245B45]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-red-600 py-3 text-sm font-bold text-white shadow transition hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Dispatching Rescue Alert...' : 'Dispatch Rescue Alert'}
          </button>
        </form>
      </div>
    </div>
  );
}
