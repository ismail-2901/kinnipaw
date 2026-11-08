import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function FeedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: posts } = await supabase
    .from('posts')
    .select('*, author:profiles(id, username, display_name), comments(count), reactions(reaction_type, user_id)')
    .eq('is_published', true)
    .eq('visibility', 'public')
    .order('created_at', { ascending: false })
    .limit(20);

  const feedItems = posts || [];

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* Top Navbar */}
      <header className="border-b border-[#E8E6E0] bg-white px-6 py-4 sticky top-0 z-10">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link href="/" className="text-2xl font-black text-[#245B45]">
            KINNIPAW
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/animals" className="text-sm font-semibold text-[#252A27] hover:text-[#245B45]">
              My Animals
            </Link>
            <Link href="/profile" className="text-sm font-semibold text-[#252A27] hover:text-[#245B45]">
              Profile
            </Link>
          </div>
        </div>
      </header>

      {/* Main Feed Container */}
      <main className="mx-auto max-w-2xl px-4 py-8">
        {/* Post Creation Box */}
        {user ? (
          <div className="mb-8 rounded-2xl border border-[#E8E6E0] bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-[#252A27] mb-2">Share an animal care update or story</h2>
            <form action="/api/v1/posts" method="POST" className="space-y-4">
              <textarea
                name="body"
                required
                rows={3}
                placeholder="Share advice, a rescue moment, or ask the community..."
                className="w-full rounded-lg border border-[#E8E6E0] p-3 text-sm focus:border-[#245B45] focus:outline-none"
              />
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-[#66856C]">Public Community Feed</span>
                <button
                  type="submit"
                  className="rounded-lg bg-[#245B45] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1B4736]"
                >
                  Publish Post
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="mb-8 rounded-2xl border border-[#CCD8D0] bg-[#E0EDE6]/50 p-6 text-center">
            <h3 className="text-base font-bold text-[#245B45]">Join the KINNIPAW Community</h3>
            <p className="mt-1 text-sm text-[#252A27]/80">
              Sign in to share care updates, ask questions, or connect with rescuers across Bangladesh.
            </p>
            <div className="mt-4 flex justify-center gap-3">
              <Link
                href="/sign-in"
                className="rounded-lg bg-[#245B45] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1B4736]"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="rounded-lg border border-[#245B45] px-4 py-2 text-sm font-semibold text-[#245B45] hover:bg-white"
              >
                Register
              </Link>
            </div>
          </div>
        )}

        {/* Feed List */}
        <div className="space-y-6">
          {feedItems.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#CCD8D0] bg-white p-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#E0EDE6] text-xl text-[#245B45]">
                🐾
              </div>
              <h3 className="mt-3 text-base font-bold text-[#252A27]">No community posts yet</h3>
              <p className="mt-1 text-xs text-[#66856C]">
                Be the first guardian or rescuer to share a story with the ecosystem.
              </p>
            </div>
          ) : (
            feedItems.map((post: any) => (
              <article
                key={post.id}
                className="rounded-2xl border border-[#E8E6E0] bg-white p-6 shadow-sm transition hover:border-[#CCD8D0]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E0EDE6] font-bold text-[#245B45]">
                      {post.author?.display_name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#252A27]">
                        {post.author?.display_name || post.author?.username || 'Community Member'}
                      </h4>
                      <p className="text-[11px] text-[#66856C]">
                        {new Date(post.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full bg-[#F0F6F3] px-2.5 py-0.5 text-xs font-semibold text-[#245B45] capitalize">
                    {post.post_type}
                  </span>
                </div>

                <p className="mt-4 text-sm text-[#252A27]/90 leading-relaxed whitespace-pre-wrap">
                  {post.body}
                </p>

                <div className="mt-5 flex items-center justify-between border-t border-[#F0F6F3] pt-3 text-xs text-[#66856C]">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1 font-medium text-[#245B45]">
                      ❤️ {post.reactions?.length || 0} reactions
                    </span>
                    <span className="flex items-center gap-1 font-medium">
                      💬 {post.comments?.[0]?.count || 0} comments
                    </span>
                  </div>
                  <span className="text-[11px] text-[#252A27]/40">Safe &amp; Verified Community</span>
                </div>
              </article>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
