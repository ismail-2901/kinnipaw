'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface SpeciesOption {
  id: string;
  common_name: string;
}

export default function NewLostFoundReportPage() {
  const router = useRouter();
  const [speciesList, setSpeciesList] = useState<SpeciesOption[]>([]);
  const [reportType, setReportType] = useState<'lost' | 'found'>('lost');
  const [speciesId, setSpeciesId] = useState('');
  const [areaLabel, setAreaLabel] = useState('');
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().split('T')[0]);
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
        report_type: reportType,
        species_id: speciesId,
        last_seen_area_label: areaLabel,
        incident_date: incidentDate,
        description,
      };

      const res = await fetch('/api/v1/lost-found', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error?.message || 'Failed to submit report');
      }

      router.push(`/lost-found/${json.data.id}`);
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
          <Link href="/lost-found" className="text-xs font-semibold text-[#245B45] hover:underline">
            ← Back to Lost & Found
          </Link>
          <h1 className="mt-2 text-2xl font-black text-[#252A27]">
            Report a Lost or Found Animal
          </h1>
          <p className="text-xs text-gray-500">
            Submit essential details to help community members and rescuers identify the animal.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-[#E8E6E0] bg-white p-8 shadow-sm">
          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-xs font-medium text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#252A27]">Report Type</label>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setReportType('lost')}
                className={`py-2.5 rounded-lg text-xs font-bold border transition ${
                  reportType === 'lost'
                    ? 'border-[#D98769] bg-[#D98769] text-white'
                    : 'border-[#E8E6E0] bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Missing / Lost Pet
              </button>
              <button
                type="button"
                onClick={() => setReportType('found')}
                className={`py-2.5 rounded-lg text-xs font-bold border transition ${
                  reportType === 'found'
                    ? 'border-[#245B45] bg-[#245B45] text-white'
                    : 'border-[#E8E6E0] bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Found / Sighted Animal
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="speciesSelect" className="block text-xs font-bold text-[#252A27]">Animal Species</label>
            <select
              id="speciesSelect"
              value={speciesId}
              onChange={(e) => setSpeciesId(e.target.value)}
              required
              className="mt-1.5 w-full rounded-lg border border-[#D5D2CA] p-2.5 text-sm outline-none focus:border-[#245B45]"
            >
              {speciesList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.common_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="incidentDate" className="block text-xs font-bold text-[#252A27]">Date of Incident</label>
            <input
              id="incidentDate"
              type="date"
              value={incidentDate}
              onChange={(e) => setIncidentDate(e.target.value)}
              required
              className="mt-1.5 w-full rounded-lg border border-[#D5D2CA] p-2.5 text-sm outline-none focus:border-[#245B45]"
            />
          </div>

          <div>
            <label htmlFor="areaLabel" className="block text-xs font-bold text-[#252A27]">Coarse Location / Neighborhood</label>
            <input
              id="areaLabel"
              type="text"
              placeholder="e.g. Dhanmondi 8A, Mirpur-2, Banani, Uttara Sector 4"
              value={areaLabel}
              onChange={(e) => setAreaLabel(e.target.value)}
              required
              className="mt-1.5 w-full rounded-lg border border-[#D5D2CA] p-2.5 text-sm outline-none focus:border-[#245B45]"
            />
            <p className="mt-1 text-[11px] text-gray-400">
              🔒 Privacy Protection: Do NOT enter exact apartment numbers or private residence addresses.
            </p>
          </div>

          <div>
            <label htmlFor="desc" className="block text-xs font-bold text-[#252A27]">
              Description & Identifying Marks
            </label>
            <textarea
              id="desc"
              rows={4}
              placeholder="Color, collar/tags, fur pattern, unique markings, demeanor (friendly/scared)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="mt-1.5 w-full rounded-lg border border-[#D5D2CA] p-2.5 text-sm outline-none focus:border-[#245B45]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#245B45] py-3 text-sm font-bold text-white shadow transition hover:bg-[#1B4736] disabled:opacity-50"
          >
            {loading ? 'Submitting Report...' : 'Publish Report'}
          </button>
        </form>
      </div>
    </div>
  );
}
