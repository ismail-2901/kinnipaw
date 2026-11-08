import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

interface AdminReportsPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminReportsQueuePage({ searchParams }: AdminReportsPageProps) {
  const { status = 'pending' } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from('content_reports')
    .select(`
      id,
      reason,
      details,
      report_status,
      created_at,
      reviewed_at,
      post_id,
      comment_id,
      profile_id,
      listing_id,
      rescue_case_id,
      lost_found_post_id,
      reporter:profiles!reporter_id(username, display_name)
    `)
    .order('created_at', { ascending: false });

  if (status !== 'all') {
    query = query.eq('report_status', status as any);
  }

  const { data: reports } = await query;
  const items = reports || [];

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* Header */}
      <header className="border-b border-[#E8E6E0] bg-white px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="text-2xl font-black text-[#245B45]">
              KINNIPAW
            </Link>
            <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-rose-800">
              Moderation Review Queue
            </span>
          </div>
          <Link href="/admin" className="text-sm font-semibold text-gray-600 hover:text-[#245B45]">
            ← Back to Operations
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-6 flex flex-wrap gap-2 border-b border-[#E8E6E0] pb-4">
          <Link
            href="/admin/reports?status=pending"
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
              status === 'pending'
                ? 'bg-rose-600 text-white'
                : 'bg-white text-gray-700 border border-[#E8E6E0] hover:bg-gray-50'
            }`}
          >
            Pending Review
          </Link>
          <Link
            href="/admin/reports?status=under_review"
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
              status === 'under_review'
                ? 'bg-amber-600 text-white'
                : 'bg-white text-gray-700 border border-[#E8E6E0] hover:bg-gray-50'
            }`}
          >
            Under Investigation
          </Link>
          <Link
            href="/admin/reports?status=resolved"
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
              status === 'resolved'
                ? 'bg-emerald-700 text-white'
                : 'bg-white text-gray-700 border border-[#E8E6E0] hover:bg-gray-50'
            }`}
          >
            Resolved
          </Link>
          <Link
            href="/admin/reports?status=all"
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
              status === 'all'
                ? 'bg-gray-800 text-white'
                : 'bg-white text-gray-700 border border-[#E8E6E0] hover:bg-gray-50'
            }`}
          >
            All Reports
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#D5D2CA] bg-white p-12 text-center">
            <span className="text-4xl">✨</span>
            <h2 className="mt-3 text-lg font-bold text-[#252A27]">Queue is clear</h2>
            <p className="mt-1 text-xs text-gray-500">
              No reports currently matching the filter &quot;{status}&quot;.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-[#E8E6E0] bg-white divide-y divide-[#E8E6E0] shadow-sm">
            {items.map((r) => {
              const reporterObj = Array.isArray(r.reporter) ? r.reporter[0] : r.reporter;
              const reasonBadge =
                r.reason === 'animal_cruelty' || r.reason === 'illegal_trade'
                  ? 'bg-red-100 text-red-800 border-red-300'
                  : 'bg-amber-100 text-amber-800 border-amber-300';

              return (
                <div key={r.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${reasonBadge}`}>
                        {r.reason.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-gray-400 capitalize">
                        Status: <strong>{r.report_status}</strong>
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(r.created_at).toLocaleString()}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-[#252A27] font-medium">
                      {r.details || 'No additional details provided by reporter.'}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
                      <span>Reporter: <strong>@{reporterObj?.username || 'member'}</strong></span>
                      {r.post_id && <span>Target: Post ({r.post_id.slice(0, 8)}...)</span>}
                      {r.listing_id && <span>Target: Adoption Listing ({r.listing_id.slice(0, 8)}...)</span>}
                      {r.rescue_case_id && <span>Target: Rescue Case ({r.rescue_case_id.slice(0, 8)}...)</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="rounded-lg bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 transition"
                    >
                      Resolve
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-gray-300 px-3.5 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
                    >
                      Dismiss
                    </button>
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
