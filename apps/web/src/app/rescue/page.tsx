import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { OFFICIAL_WILDLIFE_EMERGENCY_CONFIG } from '@kinnipaw/config';

interface RescuePageProps {
  searchParams: Promise<{ status?: string; urgency?: string }>;
}

export default async function RescueCoordinationPage({ searchParams }: RescuePageProps) {
  const { status = 'open', urgency } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from('rescue_cases')
    .select(`
      id,
      description,
      location_area_label,
      case_status,
      urgency,
      is_wildlife,
      created_at,
      reporter:profiles!rescue_cases_reported_by_fkey(display_name, city, area_label),
      species:species(common_name, is_domestic),
      assignments:rescue_assignments(id, assigned_to_profile:profiles!rescue_assignments_assigned_to_fkey(display_name))
    `)
    .order('created_at', { ascending: false });

  if (status !== 'all') {
    query = query.eq('case_status', status);
  }

  if (urgency) {
    query = query.eq('urgency', urgency);
  }

  const { data: cases } = await query;
  const items = cases || [];

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* Header */}
      <header className="border-b border-[#E8E6E0] bg-white px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-2xl font-black text-[#245B45]">
              KINNIPAW
            </Link>
            <nav className="hidden md:flex items-center gap-4 text-sm font-medium text-[#252A27]">
              <Link href="/feed" className="hover:text-[#245B45]">Feed</Link>
              <Link href="/adoption" className="hover:text-[#245B45]">Adopt</Link>
              <Link href="/lost-found" className="hover:text-[#245B45]">Lost & Found</Link>
              <Link href="/rescue" className="text-[#245B45] font-bold">Rescue</Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/rescue/new"
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 transition shadow-sm"
            >
              🚨 Report Distress / Rescue
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="bg-[#1C2826] text-white px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <span className="inline-block rounded-full bg-red-500/20 text-red-300 border border-red-500/30 px-3 py-1 text-xs font-bold uppercase tracking-wider">
            Community Emergency Network
          </span>
          <h1 className="mt-3 text-3xl font-black sm:text-4xl">
            Animal Rescue Coordination
          </h1>
          <p className="mt-2 max-w-2xl text-gray-300 text-sm">
            Coordinate volunteers, rescuers, and veterinary clinics for injured, abandoned, or distressed animals across Bangladesh.
          </p>
        </div>
      </div>

      {/* Wildlife Notice */}
      <div className="bg-emerald-950 text-emerald-100 px-6 py-4 border-y border-emerald-900 text-xs">
        <div className="mx-auto max-w-6xl flex flex-col md:flex-row md:items-center justify-between gap-2">
          <span>
            🌿 <strong>Wildlife Rescue Protocol:</strong> Under the Wildlife (Conservation and Security) Act, 2026 (Act No. 86 of 2026), wild or endangered fauna must be reported directly to the {OFFICIAL_WILDLIFE_EMERGENCY_CONFIG.authority} / {OFFICIAL_WILDLIFE_EMERGENCY_CONFIG.department}.
            Hotlines: <strong>{OFFICIAL_WILDLIFE_EMERGENCY_CONFIG.hotlines[0]}</strong> / <strong>{OFFICIAL_WILDLIFE_EMERGENCY_CONFIG.hotlines[1]}</strong> | Helpline: <strong>{OFFICIAL_WILDLIFE_EMERGENCY_CONFIG.nationalHelpline}</strong>
          </span>
          <span className="text-emerald-400 text-[11px] whitespace-nowrap">
            Source: {OFFICIAL_WILDLIFE_EMERGENCY_CONFIG.sourceUrl} (Verified {OFFICIAL_WILDLIFE_EMERGENCY_CONFIG.lastVerifiedDate}) • Independent community directory
          </span>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Status Filters */}
        <div className="mb-6 flex flex-wrap gap-2 border-b border-[#E8E6E0] pb-4">
          <Link
            href="/rescue?status=open"
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
              status === 'open'
                ? 'bg-red-600 text-white'
                : 'bg-white text-gray-700 border border-[#E8E6E0] hover:bg-gray-50'
            }`}
          >
            Open Emergencies
          </Link>
          <Link
            href="/rescue?status=assigned"
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
              status === 'assigned'
                ? 'bg-[#245B45] text-white'
                : 'bg-white text-gray-700 border border-[#E8E6E0] hover:bg-gray-50'
            }`}
          >
            Assigned / Responding
          </Link>
          <Link
            href="/rescue?status=all"
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
              status === 'all'
                ? 'bg-gray-800 text-white'
                : 'bg-white text-gray-700 border border-[#E8E6E0] hover:bg-gray-50'
            }`}
          >
            All Cases
          </Link>
        </div>

        {/* Cases Grid */}
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#D5D2CA] bg-white p-12 text-center">
            <span className="text-4xl">🚑</span>
            <h2 className="mt-3 text-xl font-bold text-[#252A27]">
              No active rescue cases in this category
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              There are currently no distress cases requiring immediate response.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((c) => {
              const sp = Array.isArray(c.species) ? c.species[0] : c.species;
              const urgencyColor =
                c.urgency === 'critical'
                  ? 'bg-red-100 text-red-800 border-red-300'
                  : c.urgency === 'high'
                  ? 'bg-orange-100 text-orange-800 border-orange-300'
                  : 'bg-yellow-100 text-yellow-800 border-yellow-300';

              return (
                <div
                  key={c.id}
                  className="flex flex-col overflow-hidden rounded-xl border border-[#E8E6E0] bg-white shadow-sm transition hover:shadow-md"
                >
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center justify-between">
                      <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${urgencyColor}`}>
                        {c.urgency} Urgency
                      </span>
                      <span className="text-xs text-gray-400 capitalize">
                        {c.case_status}
                      </span>
                    </div>

                    <h2 className="mt-3 text-base font-bold text-[#252A27]">
                      {sp?.common_name || 'Animal'} Distress Call
                    </h2>
                    <p className="text-xs font-semibold text-gray-600 mt-1">
                      📍 {c.location_area_label}
                    </p>

                    <p className="mt-3 line-clamp-3 text-sm text-gray-600 leading-relaxed">
                      {c.description}
                    </p>

                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-[#F3F4F6]">
                      <span className="text-xs text-gray-400">
                        {c.assignments?.length ? 'Volunteer assigned' : 'Needs responder'}
                      </span>
                      <Link
                        href={`/rescue/${c.id}`}
                        className="rounded-lg bg-[#245B45] px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-[#1B4736]"
                      >
                        Respond & Coordinate
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
