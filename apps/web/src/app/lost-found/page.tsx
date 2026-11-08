import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

interface LostFoundPageProps {
  searchParams: Promise<{ type?: string; species?: string; area?: string }>;
}

export default async function LostFoundPage({ searchParams }: LostFoundPageProps) {
  const { type = 'lost', species, area } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from('lost_found_posts')
    .select(`
      id,
      report_type,
      description,
      last_seen_area_label,
      incident_date,
      status,
      media_paths,
      created_at,
      reporter:profiles(display_name, city, area_label),
      species:species(common_name),
      animal:animals(name, sex, breeds(name))
    `)
    .eq('report_type', type)
    .order('created_at', { ascending: false });

  if (area) {
    query = query.ilike('last_seen_area_label', `%${area}%`);
  }

  const { data: posts } = await query;
  const rawPosts = (posts as any[]) || [];

  // Filter by species if requested
  const items = rawPosts.filter((p) => {
    if (!species || species === 'all') return true;
    const sp = Array.isArray(p.species) ? p.species[0] : p.species;
    return sp?.common_name?.toLowerCase() === species.toLowerCase();
  });

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
              <Link href="/lost-found" className="text-[#245B45] font-bold">Lost & Found</Link>
              <Link href="/rescue" className="hover:text-[#245B45]">Rescue</Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/lost-found/new"
              className="rounded-lg bg-[#D98769] px-4 py-2 text-sm font-bold text-white hover:bg-[#C27357] transition shadow-sm"
            >
              + Report Lost or Found
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="bg-[#252A27] text-white px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <span className="inline-block rounded-full bg-[#D98769] px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
            Community Reunion Network
          </span>
          <h1 className="mt-3 text-3xl font-black sm:text-4xl">
            Lost & Found Animals
          </h1>
          <p className="mt-2 max-w-2xl text-gray-300 text-sm">
            Quickly reunite separated companions with their families. Strict location privacy: coarse neighborhood labels only, never exact private addresses.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Toggle Lost vs Found */}
        <div className="mb-6 flex border-b border-[#E8E6E0]">
          <Link
            href={`/lost-found?type=lost${species ? `&species=${species}` : ''}`}
            className={`pb-3 px-6 text-sm font-bold border-b-2 transition ${
              type === 'lost'
                ? 'border-[#D98769] text-[#D98769]'
                : 'border-transparent text-gray-500 hover:text-[#252A27]'
            }`}
          >
            Lost Animals (Missing)
          </Link>
          <Link
            href={`/lost-found?type=found${species ? `&species=${species}` : ''}`}
            className={`pb-3 px-6 text-sm font-bold border-b-2 transition ${
              type === 'found'
                ? 'border-[#245B45] text-[#245B45]'
                : 'border-transparent text-gray-500 hover:text-[#252A27]'
            }`}
          >
            Found Animals (Spotted / Sheltered)
          </Link>
        </div>

        {/* Posts Grid */}
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#D5D2CA] bg-white p-12 text-center">
            <span className="text-4xl">🔍</span>
            <h2 className="mt-3 text-xl font-bold text-[#252A27]">
              No {type === 'lost' ? 'lost' : 'found'} reports found
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              There are currently no active reports in this category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((post) => {
              const sp = Array.isArray(post.species) ? post.species[0] : post.species;
              const an = Array.isArray(post.animal) ? post.animal[0] : post.animal;

              return (
                <div
                  key={post.id}
                  className="flex flex-col overflow-hidden rounded-xl border border-[#E8E6E0] bg-white shadow-sm transition hover:shadow-md"
                >
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center justify-between">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                          post.report_type === 'lost'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {post.report_type}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(post.incident_date).toLocaleDateString()}
                      </span>
                    </div>

                    <h2 className="mt-3 text-lg font-bold text-[#252A27]">
                      {an?.name || `${sp?.common_name || 'Animal'} reported`}
                    </h2>
                    <p className="text-xs font-semibold text-gray-600">
                      📍 {post.last_seen_area_label || 'Coarse Area'}
                    </p>

                    <p className="mt-3 line-clamp-3 text-sm text-gray-600 leading-relaxed">
                      {post.description}
                    </p>

                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-[#F3F4F6]">
                      <span className="text-xs text-gray-400 capitalize">
                        Status: {post.status}
                      </span>
                      <Link
                        href={`/lost-found/${post.id}`}
                        className="rounded-lg bg-[#245B45] px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-[#1B4736]"
                      >
                        View Report & Sightings
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
