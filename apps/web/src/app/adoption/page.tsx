import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

interface AdoptionPageProps {
  searchParams: Promise<{ species?: string }>;
}

export default async function AdoptionPage({ searchParams }: AdoptionPageProps) {
  const { species } = await searchParams;
  const supabase = await createClient();

  const query = supabase
    .from('adoption_listings')
    .select(`
      id,
      description,
      adoption_requirements,
      fee_description,
      listing_status,
      created_at,
      lister:profiles(display_name, city, area_label),
      animal:animals(
        id,
        name,
        sex,
        size_category,
        species:species(common_name),
        breed:breeds(name),
        media:animal_media(media_url, is_primary)
      )
    `)
    .eq('listing_status', 'active')
    .order('created_at', { ascending: false });

  const { data: listings } = await query;

  let filteredListings = (listings as any[]) || [];
  if (species && species !== 'all') {
    filteredListings = filteredListings.filter(
      (l) => l.animal?.species?.common_name?.toLowerCase() === species.toLowerCase()
    );
  }

  const speciesFilters = [
    { label: 'All Animals', value: 'all' },
    { label: 'Dogs', value: 'dog' },
    { label: 'Cats', value: 'cat' },
    { label: 'Birds', value: 'bird' },
    { label: 'Rabbits', value: 'rabbit' },
  ];

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
              <Link href="/animals" className="hover:text-[#245B45]">My Animals</Link>
              <Link href="/adoption" className="text-[#245B45] font-bold">Adopt</Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/animals"
              className="rounded-lg border border-[#245B45] px-4 py-2 text-sm font-semibold text-[#245B45] hover:bg-[#F0F5F2]"
            >
              List an Animal
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="bg-[#245B45] text-white px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <span className="inline-block rounded-full bg-[#34785D] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-100">
            Responsible & Lawful Rehoming
          </span>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
            Find Your Forever Companion
          </h1>
          <p className="mt-2 max-w-2xl text-emerald-100">
            Every animal deserves a loving, safe home. Strict anti-wildlife trade safeguards
            and transparent adoption screening.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Filters */}
        <div className="mb-8 flex flex-wrap items-center gap-2 border-b border-[#E8E6E0] pb-4">
          <span className="text-sm font-medium text-gray-500 mr-2">Species:</span>
          {speciesFilters.map((sf) => {
            const active = (!species && sf.value === 'all') || species === sf.value;
            return (
              <Link
                key={sf.value}
                href={sf.value === 'all' ? '/adoption' : `/adoption?species=${sf.value}`}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                  active
                    ? 'bg-[#245B45] text-white'
                    : 'bg-white text-[#252A27] border border-[#E8E6E0] hover:bg-gray-50'
                }`}
              >
                {sf.label}
              </Link>
            );
          })}
        </div>

        {/* Listings Grid */}
        {filteredListings.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#D5D2CA] bg-white p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#F0F5F2] text-2xl text-[#245B45]">
              🐾
            </div>
            <h2 className="text-xl font-bold text-[#252A27]">No animals currently listed</h2>
            <p className="mt-2 text-sm text-gray-600 max-w-md mx-auto">
              Check back soon or adjust your species filter to view available companions looking for homes.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredListings.map((listing) => {
              const primaryMedia = listing.animal?.media?.find((m: { is_primary: boolean }) => m.is_primary)
                || listing.animal?.media?.[0];

              return (
                <div
                  key={listing.id}
                  className="flex flex-col overflow-hidden rounded-xl border border-[#E8E6E0] bg-white shadow-sm transition hover:shadow-md"
                >
                  <div className="relative h-48 w-full bg-[#E8E6E0] overflow-hidden">
                    {primaryMedia?.media_url ? (
                      <img
                        src={primaryMedia.media_url}
                        alt={listing.animal?.name || 'Animal photo'}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-4xl text-gray-400">
                        🐾
                      </div>
                    )}
                    <span className="absolute top-3 right-3 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-semibold text-[#245B45] backdrop-blur-sm">
                      {listing.animal?.species?.common_name || 'Companion'}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-bold text-[#252A27]">
                        {listing.animal?.name}
                      </h2>
                      <span className="text-xs text-gray-500 capitalize">
                        {listing.animal?.sex || 'Unknown sex'}
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-gray-500">
                      {listing.animal?.breed?.name || 'Mixed Breed'} • {listing.lister?.area_label || listing.lister?.city || 'Bangladesh'}
                    </p>

                    {listing.description && (
                      <p className="mt-3 line-clamp-2 text-sm text-gray-600">
                        {listing.description}
                      </p>
                    )}

                    <div className="mt-auto pt-4 flex items-center justify-between">
                      <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                        Free Adoption
                      </span>
                      <Link
                        href={`/adoption/${listing.id}`}
                        className="rounded-lg bg-[#245B45] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#1B4736]"
                      >
                        View & Apply
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
