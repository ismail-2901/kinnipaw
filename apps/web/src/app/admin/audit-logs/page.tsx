import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function AdminAuditLogsPage() {
  const supabase = await createClient();

  const { data: logs } = await supabase
    .from('audit_logs')
    .select(`
      id,
      action,
      subject_type,
      subject_id,
      payload,
      created_at,
      actor:profiles!actor_id(username, display_name)
    `)
    .order('created_at', { ascending: false })
    .limit(50);

  const items = logs || [];

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* Header */}
      <header className="border-b border-[#E8E6E0] bg-white px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="text-2xl font-black text-[#245B45]">
              KINNIPAW
            </Link>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-gray-800">
              Immutable Platform Audit Log
            </span>
          </div>
          <Link href="/admin" className="text-sm font-semibold text-gray-600 hover:text-[#245B45]">
            ← Back to Operations
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-[#252A27]">Security & Moderation Audit Trail</h1>
            <p className="text-xs text-gray-500">
              Append-only immutable record of administrative actions, moderation resolutions, and account restrictions.
            </p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#D5D2CA] bg-white p-12 text-center">
            <span className="text-4xl">📜</span>
            <h2 className="mt-3 text-lg font-bold text-[#252A27]">No audit logs recorded yet</h2>
            <p className="mt-1 text-xs text-gray-500">
              Audit logs will be permanently captured when staff take administrative or moderation actions.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-[#E8E6E0] bg-white divide-y divide-[#E8E6E0] shadow-sm">
            {items.map((log) => {
              const actorObj = Array.isArray(log.actor) ? log.actor[0] : log.actor;

              return (
                <div key={log.id} className="p-5 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-mono font-bold text-gray-800">
                        {log.action}
                      </span>
                      <span className="text-xs text-gray-400">
                        Target: {log.subject_type || 'System'} ({log.subject_id?.slice(0, 8) || 'N/A'})
                      </span>
                    </div>

                    <p className="mt-2 text-xs text-gray-600">
                      Actor: <strong>@{actorObj?.username || 'system'}</strong>
                    </p>

                    {log.payload && (
                      <pre className="mt-2 rounded bg-gray-50 p-2 text-[11px] font-mono text-gray-700 max-w-xl overflow-x-auto">
                        {JSON.stringify(log.payload, null, 2)}
                      </pre>
                    )}
                  </div>

                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
