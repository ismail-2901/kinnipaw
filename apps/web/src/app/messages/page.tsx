import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function MessagesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let conversations: any[] = [];

  if (user) {
    const { data: memberRows } = await supabase
      .from('conversation_members')
      .select('conversation_id')
      .eq('user_id', user.id);

    if (memberRows && memberRows.length > 0) {
      const convIds = memberRows.map((m) => m.conversation_id);
      const { data } = await supabase
        .from('conversations')
        .select(`
          id,
          conversation_type,
          title,
          updated_at,
          members:conversation_members(
            user_id,
            profile:profiles(id, display_name, username, avatar_path)
          ),
          messages:messages(id, body, sent_at, sender_id)
        `)
        .in('id', convIds)
        .order('updated_at', { ascending: false });

      conversations = data || [];
    }
  }

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
              <Link href="/rescue" className="hover:text-[#245B45]">Rescue</Link>
              <Link href="/providers" className="hover:text-[#245B45]">Providers</Link>
            </nav>
          </div>
          <Link
            href="/notifications"
            className="text-sm font-semibold text-[#252A27] hover:text-[#245B45]"
          >
            🔔 Notifications
          </Link>
        </div>
      </header>

      {/* Main Inbox View */}
      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-[#252A27]">Messages</h1>
            <p className="text-xs text-gray-500">
              Private and secure conversations between adopters, guardians, and rescuers.
            </p>
          </div>
        </div>

        {conversations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#D5D2CA] bg-white p-12 text-center">
            <span className="text-4xl">💬</span>
            <h2 className="mt-3 text-lg font-bold text-[#252A27]">No active conversations</h2>
            <p className="mt-1 text-xs text-gray-500 max-w-sm mx-auto">
              When you message an animal guardian, adopter, or rescue coordinator, your conversations will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-[#E8E6E0] bg-white divide-y divide-[#E8E6E0] shadow-sm">
            {conversations.map((conv) => {
              const otherMember = conv.members?.find((m: { user_id: string }) => m.user_id !== user?.id)?.profile;
              const lastMessage = conv.messages?.[conv.messages.length - 1];

              return (
                <Link
                  key={conv.id}
                  href={`/messages/${conv.id}`}
                  className="flex items-center gap-4 p-5 transition hover:bg-[#FAF9F6]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#245B45] text-lg font-bold text-white">
                    {otherMember?.display_name?.[0] || 'U'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-[#252A27] truncate">
                        {otherMember?.display_name || 'Community Member'}
                      </h3>
                      {lastMessage && (
                        <span className="text-[11px] text-gray-400">
                          {new Date(lastMessage.sent_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-gray-500 truncate">
                      {lastMessage?.body || 'No messages yet in this conversation'}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
