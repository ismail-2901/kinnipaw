import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let notifications: any[] = [];

  if (user) {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('recipient_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    notifications = data || [];
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* Header */}
      <header className="border-b border-[#E8E6E0] bg-white px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link href="/" className="text-2xl font-black text-[#245B45]">
            KINNIPAW
          </Link>
          <div className="flex items-center gap-4 text-sm font-semibold">
            <Link href="/feed" className="text-[#252A27] hover:text-[#245B45]">
              Feed
            </Link>
            <Link href="/messages" className="text-[#252A27] hover:text-[#245B45]">
              Messages
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-[#252A27]">Notifications</h1>
            <p className="text-xs text-gray-500">
              Stay updated on your adoption applications, sightings, and rescue cases.
            </p>
          </div>
        </div>

        {notifications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#D5D2CA] bg-white p-12 text-center">
            <span className="text-4xl">🔔</span>
            <h2 className="mt-3 text-lg font-bold text-[#252A27]">No notifications yet</h2>
            <p className="mt-1 text-xs text-gray-500">
              You are all caught up! Updates regarding your animals and posts will show here.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-[#E8E6E0] bg-white divide-y divide-[#E8E6E0] shadow-sm">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`p-5 flex items-start justify-between gap-4 transition ${
                  !n.is_read ? 'bg-emerald-50/40' : 'bg-white'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl">🐾</span>
                  <div>
                    <h3 className="text-sm font-bold text-[#252A27] capitalize">
                      {n.notification_type.replace(/_/g, ' ')}
                    </h3>
                    {n.payload?.message && (
                      <p className="mt-0.5 text-xs text-gray-600">
                        {n.payload.message}
                      </p>
                    )}
                    <span className="mt-1 block text-[11px] text-gray-400">
                      {new Date(n.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                {!n.is_read && (
                  <span className="h-2.5 w-2.5 rounded-full bg-[#245B45] mt-1.5" />
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
