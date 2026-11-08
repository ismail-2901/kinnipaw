import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { OFFICIAL_WILDLIFE_EMERGENCY_CONFIG } from '@kinnipaw/config';

interface RescueCaseDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function RescueCaseDetailPage({ params }: RescueCaseDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: rescueCase, error } = await supabase
    .from('rescue_cases')
    .select(`
      *,
      reporter:profiles(id, username, display_name),
      species:species(common_name, is_domestic),
      assignments:rescue_assignments(
        id,
        assignment_status,
        assigned_at,
        notes,
        assigned_to_profile:profiles!assigned_to(id, display_name, username)
      )
    `)
    .eq('id', id)
    .single();

  if (error || !rescueCase) {
    notFound();
  }

  // Fetch status timeline
  const { data: events } = await supabase
    .from('rescue_status_events')
    .select('*, changed_by_profile:profiles!changed_by(display_name)')
    .eq('rescue_case_id', id)
    .order('changed_at', { ascending: true });

  const urgencyBadgeStyle =
    rescueCase.urgency === 'critical'
      ? 'bg-red-100 text-red-800 border-red-300'
      : rescueCase.urgency === 'high'
      ? 'bg-orange-100 text-orange-800 border-orange-300'
      : 'bg-yellow-100 text-yellow-800 border-yellow-300';

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* Header */}
      <header className="border-b border-[#E8E6E0] bg-white px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="text-2xl font-black text-[#245B45]">
            KINNIPAW
          </Link>
          <Link href="/rescue" className="text-sm font-semibold text-[#252A27] hover:text-[#245B45]">
            ← Back to Rescue Dashboard
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Case Info */}
          <div className="md:col-span-2 space-y-6">
            <div className="rounded-2xl border border-[#E8E6E0] bg-white p-8 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#E8E6E0] pb-4">
                <div className="flex items-center gap-3">
                  <span className={`rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wider ${urgencyBadgeStyle}`}>
                    {rescueCase.urgency} Urgency
                  </span>
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                    {rescueCase.species?.common_name || 'Animal'}
                  </span>
                </div>
                <span className="text-xs font-bold capitalize text-gray-600">
                  Status: <strong>{rescueCase.case_status}</strong>
                </span>
              </div>

              {rescueCase.is_wildlife && (
                <div className="mt-4 rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-xs text-emerald-900 leading-relaxed">
                  🌿 <strong>Protected Wildlife Alert:</strong> This animal belongs to protected native wildlife. In compliance with the Wildlife (Conservation and Security) Act, 2026 (Act No. 86 of 2026), rescue coordination must involve authorized statutory authorities: {OFFICIAL_WILDLIFE_EMERGENCY_CONFIG.authority} (Hotlines: {OFFICIAL_WILDLIFE_EMERGENCY_CONFIG.hotlines[0]} / {OFFICIAL_WILDLIFE_EMERGENCY_CONFIG.hotlines[1]}, Helpline: {OFFICIAL_WILDLIFE_EMERGENCY_CONFIG.nationalHelpline}). Source: {OFFICIAL_WILDLIFE_EMERGENCY_CONFIG.sourceUrl} (Verified {OFFICIAL_WILDLIFE_EMERGENCY_CONFIG.lastVerifiedDate}).
                </div>
              )}

              <h1 className="mt-4 text-2xl font-black text-[#252A27]">
                Rescue Case: {rescueCase.species?.common_name || 'Animal'} at {rescueCase.location_area_label}
              </h1>

              <div className="mt-2 flex gap-4 text-xs text-gray-500">
                <span>📍 Location: <strong>{rescueCase.location_area_label}</strong></span>
                <span>📅 Reported: <strong>{new Date(rescueCase.created_at).toLocaleDateString()}</strong></span>
              </div>

              <div className="mt-6 border-t border-[#E8E6E0] pt-6">
                <h2 className="text-sm font-bold text-[#252A27]">Reported Situation & Condition</h2>
                <p className="mt-2 text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                  {rescueCase.description}
                </p>
              </div>

              <div className="mt-6 rounded-xl bg-[#FAF9F6] p-4 border border-[#E8E6E0] text-xs text-gray-600">
                Reported by <strong>{rescueCase.reporter?.display_name || rescueCase.reporter?.username || 'Community Member'}</strong>
              </div>
            </div>

            {/* Case Status Events Timeline */}
            <div className="rounded-2xl border border-[#E8E6E0] bg-white p-8 shadow-sm">
              <h2 className="text-lg font-bold text-[#252A27]">
                Rescue Coordination Timeline ({events?.length || 0})
              </h2>

              {(!events || events.length === 0) ? (
                <p className="mt-4 text-xs text-gray-400">No status updates recorded yet.</p>
              ) : (
                <div className="mt-6 space-y-4">
                  {events.map((ev) => (
                    <div key={ev.id} className="relative pl-6 pb-4 border-l-2 border-[#245B45]">
                      <div className="absolute -left-1.5 top-0 h-3 w-3 rounded-full bg-[#245B45]" />
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-[#252A27] capitalize">
                          Status updated to: {ev.to_status}
                        </span>
                        <span className="text-gray-400">
                          {new Date(ev.changed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {ev.notes && (
                        <p className="mt-1 text-xs text-gray-600">
                          {ev.notes}
                        </p>
                      )}
                      <p className="mt-1 text-[11px] text-gray-400">
                        by {ev.changed_by_profile?.display_name || 'Member'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar / Assigned Responders */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-[#E8E6E0] bg-white p-6 shadow-sm">
              <h2 className="text-base font-bold text-[#252A27]">
                Assigned Volunteers ({rescueCase.assignments?.length || 0})
              </h2>

              {(!rescueCase.assignments || rescueCase.assignments.length === 0) ? (
                <div className="mt-4 rounded-xl border border-dashed border-[#E8E6E0] p-4 text-center">
                  <p className="text-xs text-gray-500 mb-3">No responders currently assigned.</p>
                  <button
                    type="button"
                    className="w-full rounded-xl bg-[#245B45] py-2.5 text-xs font-bold text-white transition hover:bg-[#1B4736]"
                  >
                    🙋 Volunteer to Help
                  </button>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {rescueCase.assignments.map((a: { id: string; assigned_to_profile: { display_name: string; username: string }; assignment_status: string; notes?: string }) => (
                    <div key={a.id} className="rounded-xl border border-[#E8E6E0] p-3 bg-[#FAF9F6] text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[#252A27]">
                          {a.assigned_to_profile?.display_name || 'Responder'}
                        </span>
                        <span className="text-emerald-700 capitalize text-[11px] font-semibold">
                          {a.assignment_status}
                        </span>
                      </div>
                      {a.notes && <p className="mt-1 text-gray-500">{a.notes}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-red-900">
                Urgent First Aid Guidance
              </h3>
              <p className="mt-2 text-xs text-red-800 leading-relaxed">
                Do not attempt invasive procedures. Secure the animal in a quiet, ventilated carrier away from traffic and crowd stress. Transport immediately to an accredited veterinary clinic.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
