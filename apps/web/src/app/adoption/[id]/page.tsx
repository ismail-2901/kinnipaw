import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

interface ListingDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdoptionListingDetailPage({ params }: ListingDetailsPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: listing, error } = await supabase
    .from('adoption_listings')
    .select(`
      id,
      description,
      adoption_requirements,
      fee_description,
      listing_status,
      created_at,
      lister:profiles(id, display_name, username, avatar_path, city, area_label),
      animal:animals(
        id,
        name,
        sex,
        size_category,
        date_of_birth,
        bio,
        species:species(common_name, scientific_name),
        breed:breeds(name),
        media:animal_media(id, media_url, is_primary)
      )
    `)
    .eq('id', id)
    .single();

  if (error || !listing) {
    notFound();
  }

  const l = listing as any;
  const primaryMedia = l.animal?.media?.find((m: { is_primary: boolean }) => m.is_primary) || l.animal?.media?.[0];

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* Header */}
      <header className="border-b border-[#E8E6E0] bg-white px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="text-2xl font-black text-[#245B45]">
            KINNIPAW
          </Link>
          <div className="flex items-center gap-4 text-sm font-semibold">
            <Link href="/adoption" className="text-[#252A27] hover:text-[#245B45]">
              ← Back to Adoption Catalog
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="overflow-hidden rounded-2xl border border-[#E8E6E0] bg-white shadow-sm">
          {/* Main Photo Hero */}
          <div className="relative h-80 w-full bg-[#E8E6E0] overflow-hidden">
            {primaryMedia?.media_url ? (
              <img
                src={primaryMedia.media_url}
                alt={l.animal?.name || 'Animal photo'}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-6xl text-gray-400">
                🐾
              </div>
            )}
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="rounded-full bg-[#245B45] px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                {l.animal?.species?.common_name || 'Companion'}
              </span>
              <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-800 capitalize">
                {l.animal?.sex || 'Unknown sex'}
              </span>
            </div>
          </div>

          <div className="p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[#E8E6E0] pb-6 gap-4">
              <div>
                <h1 className="text-3xl font-black text-[#252A27]">{l.animal?.name}</h1>
                <p className="mt-1 text-sm text-gray-500">
                  {l.animal?.breed?.name || 'Mixed Breed'} • {l.animal?.size_category || 'Medium size'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Located in {l.lister?.area_label || l.lister?.city || 'Bangladesh'}
                </p>
              </div>

              {l.listing_status === 'active' ? (
                <Link
                  href={`/adoption/apply/${l.id}`}
                  className="rounded-xl bg-[#245B45] px-6 py-3 text-center text-sm font-bold text-white shadow transition hover:bg-[#1B4736]"
                >
                  Apply to Adopt
                </Link>
              ) : (
                <span className="rounded-xl bg-gray-100 px-6 py-3 text-center text-sm font-bold text-gray-500">
                  Listing {l.listing_status}
                </span>
              )}
            </div>

            {/* About Animal */}
            <div className="py-6 border-b border-[#E8E6E0]">
              <h2 className="text-lg font-bold text-[#252A27]">About {l.animal?.name}</h2>
              <p className="mt-2 text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {l.description || l.animal?.bio || 'No detailed biography provided for this animal.'}
              </p>
            </div>

            {/* Adoption Requirements */}
            <div className="py-6 border-b border-[#E8E6E0]">
              <h2 className="text-lg font-bold text-[#252A27]">Adoption Requirements & Home Setup</h2>
              <p className="mt-2 text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {l.adoption_requirements || 'The guardian asks for a responsible, secure home with adequate space and commitment to lifelong veterinary care.'}
              </p>
            </div>

            {/* Guardian & Safety Policy */}
            <div className="pt-6">
              <h2 className="text-lg font-bold text-[#252A27]">Lister Information & Welfare Policy</h2>
              <div className="mt-3 rounded-xl bg-[#FAF9F6] p-4 border border-[#E8E6E0] flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-[#245B45] text-white flex items-center justify-center font-bold text-lg">
                  {l.lister?.display_name?.[0] || 'G'}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#252A27]">{l.lister?.display_name || 'Guardian'}</h3>
                  <p className="text-xs text-gray-500">@{l.lister?.username || 'member'}</p>
                </div>
              </div>

              <div className="mt-4 rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-xs text-emerald-800">
                <strong>Bangladesh Animal Welfare Policy:</strong> KINNIPAW supports free, lawful adoption for domestic companion animals and strictly forbids commercial sale, breeding exploitation, or illegal trade of protected fauna under the Wildlife (Conservation and Security) Act, 2026 (Act No. 86 of 2026).
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
