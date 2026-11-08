import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

interface LostFoundDetailProps {
  params: Promise<{ id: string }>;
}

export default async function LostFoundDetailPage({ params }: LostFoundDetailProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: post, error } = await supabase
    .from('lost_found_posts')
    .select(`
      *,
      reporter:profiles(id, username, display_name, avatar_path),
      species:species(common_name),
      animal:animals(name, sex, breeds(name))
    `)
    .eq('id', id)
    .single();

  if (error || !post) {
    notFound();
  }

  // Fetch sightings
  const { data: sightings } = await supabase
    .from('lost_found_sightings')
    .select('*, reporter:profiles(display_name, username)')
    .eq('lost_found_post_id', id)
    .order('sighting_date', { ascending: false });

  // Fetch matches
  const { data: matches } = await supabase
    .from('lost_found_matches')
    .select(`
      *,
      lost_post:lost_found_posts!lost_post_id(id, description, last_seen_area_label, incident_date),
      found_post:lost_found_posts!found_post_id(id, description, last_seen_area_label, incident_date)
    `)
    .or(`lost_post_id.eq.${id},found_post_id.eq.${id}`)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* Header */}
      <header className="border-b border-[#E8E6E0] bg-white px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="text-2xl font-black text-[#245B45]">
            KINNIPAW
          </Link>
          <Link href="/lost-found" className="text-sm font-semibold text-[#252A27] hover:text-[#245B45]">
            ← Back to Lost & Found
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Report Column */}
          <div className="md:col-span-2 space-y-6">
            <div className="rounded-2xl border border-[#E8E6E0] bg-white p-8 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#E8E6E0] pb-4">
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider ${
                      post.report_type === 'lost'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {post.report_type} Animal
                  </span>
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                    {post.species?.common_name || 'Companion'}
                  </span>
                </div>
                <span className="text-xs font-medium text-gray-500 capitalize">
                  Status: <strong>{post.status}</strong>
                </span>
              </div>

              <h1 className="mt-4 text-2xl font-black text-[#252A27]">
                {post.animal?.name || `${post.species?.common_name || 'Animal'} Missing/Found`}
              </h1>

              <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500">
                <span>📍 Location: <strong>{post.last_seen_area_label}</strong></span>
                <span>📅 Date: <strong>{new Date(post.incident_date).toLocaleDateString()}</strong></span>
              </div>

              <div className="mt-6 border-t border-[#E8E6E0] pt-6">
                <h2 className="text-sm font-bold text-[#252A27]">Description & Distinguishing Features</h2>
                <p className="mt-2 text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                  {post.description}
                </p>
              </div>

              <div className="mt-6 rounded-xl bg-[#FAF9F6] p-4 border border-[#E8E6E0] text-xs text-gray-600">
                Reported by <strong>{post.reporter?.display_name || post.reporter?.username || 'Community Member'}</strong>
              </div>
            </div>

            {/* Sightings Section */}
            <div className="rounded-2xl border border-[#E8E6E0] bg-white p-8 shadow-sm">
              <h2 className="text-lg font-bold text-[#252A27]">
                Community Sightings ({sightings?.length || 0})
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Sightings submitted by neighborhood members who may have spotted this animal.
              </p>

              {(!sightings || sightings.length === 0) ? (
                <div className="mt-6 rounded-xl border border-dashed border-[#E8E6E0] p-6 text-center text-xs text-gray-500">
                  No sightings reported yet. If you have seen this animal, report a sighting below.
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {sightings.map((s) => (
                    <div key={s.id} className="rounded-xl border border-[#E8E6E0] p-4 bg-[#FAF9F6]">
                      <div className="flex justify-between items-center text-xs font-semibold text-gray-700">
                        <span>📍 {s.sighting_area_label}</span>
                        <span className="text-gray-400">{new Date(s.sighting_date).toLocaleDateString()}</span>
                      </div>
                      {s.notes && (
                        <p className="mt-2 text-xs text-gray-600 leading-relaxed">
                          {s.notes}
                        </p>
                      )}
                      <p className="mt-2 text-[11px] text-gray-400">
                        Reported by @{s.reporter?.username || 'member'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar / Match Candidate Column */}
          <div className="space-y-6">
            {/* Matches Card */}
            <div className="rounded-2xl border border-[#E8E6E0] bg-white p-6 shadow-sm">
              <h2 className="text-base font-bold text-[#252A27]">
                Potential Matches ({matches?.length || 0})
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Deterministic rule & AI candidate suggestions. Human verification required before confirmation.
              </p>

              {(!matches || matches.length === 0) ? (
                <div className="mt-4 rounded-xl border border-dashed border-[#E8E6E0] p-4 text-center text-xs text-gray-400">
                  No match candidates identified yet.
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {matches.map((m) => {
                    const otherPost = m.lost_post_id === id ? m.found_post : m.lost_post;
                    return (
                      <div key={m.id} className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-emerald-900">
                            Confidence: {Math.round((m.confidence_score || 0.6) * 100)}%
                          </span>
                          <span className="text-emerald-700 capitalize text-[11px] font-semibold">
                            {m.match_status}
                          </span>
                        </div>
                        <p className="mt-2 text-xs text-gray-700 line-clamp-2">
                          {otherPost?.description || m.notes || 'Matching animal report'}
                        </p>
                        <p className="mt-1 text-[11px] text-gray-500">
                          📍 {otherPost?.last_seen_area_label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Safety & Protocol Card */}
            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                Safe Reunion Guidelines
              </h3>
              <ul className="mt-3 space-y-2 text-xs text-amber-800 list-disc list-inside">
                <li>Meet only in safe, public daylight locations.</li>
                <li>Ask for distinct verification photos or vaccination cards.</li>
                <li>Never send money for recovery or transport. KINNIPAW is 100% free.</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
