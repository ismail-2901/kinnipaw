import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

interface ProvidersPageProps {
  searchParams: Promise<{ type?: string; city?: string }>;
}

export default async function ProvidersDirectoryPage({ searchParams }: ProvidersPageProps) {
  const { type, city } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from('provider_profiles')
    .select(`
      id,
      provider_type,
      public_name,
      verification_status,
      public_address,
      description,
      services:provider_services(service_name, price_range_description),
      reviews:provider_reviews(rating)
    `)
    .order('created_at', { ascending: false });

  if (type && type !== 'all') {
    query = query.eq('provider_type', type as any);
  }

  if (city) {
    query = query.ilike('public_address', `%${city}%`);
  }

  const { data: providers } = await query;

  // Format ratings
  const items = (providers || []).map((p) => {
    const ratings = p.reviews?.map((r: { rating: number }) => r.rating) || [];
    const avgRating = ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : null;
    return {
      ...p,
      average_rating: avgRating,
      review_count: ratings.length,
    };
  });

  const providerFilters = [
    { label: 'All Providers', value: 'all' },
    { label: 'Veterinarians', value: 'veterinarian' },
    { label: 'Clinics & Hospitals', value: 'clinic' },
    { label: 'Groomers', value: 'groomer' },
    { label: 'Trainers', value: 'trainer' },
    { label: 'Boarding / Daycare', value: 'boarding' },
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
              <Link href="/adoption" className="hover:text-[#245B45]">Adopt</Link>
              <Link href="/lost-found" className="hover:text-[#245B45]">Lost & Found</Link>
              <Link href="/rescue" className="hover:text-[#245B45]">Rescue</Link>
              <Link href="/providers" className="text-[#245B45] font-bold">Providers</Link>
            </nav>
          </div>
          <Link
            href="/providers/register"
            className="rounded-lg bg-[#245B45] px-4 py-2 text-sm font-bold text-white hover:bg-[#1B4736] transition"
          >
            + Register as Care Provider
          </Link>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="bg-[#245B45] text-white px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <span className="inline-block rounded-full bg-[#34785D] px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-100">
            Verified Professional Care Network
          </span>
          <h1 className="mt-3 text-3xl font-black sm:text-4xl">
            Animal Care & Veterinary Directory
          </h1>
          <p className="mt-2 max-w-2xl text-emerald-100 text-sm">
            Find certified veterinarians, ethical groomers, animal trainers, and boarding facilities across Bangladesh.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Filters */}
        <div className="mb-8 flex flex-wrap items-center gap-2 border-b border-[#E8E6E0] pb-4">
          <span className="text-sm font-medium text-gray-500 mr-2">Specialty:</span>
          {providerFilters.map((pf) => {
            const active = (!type && pf.value === 'all') || type === pf.value;
            return (
              <Link
                key={pf.value}
                href={pf.value === 'all' ? '/providers' : `/providers?type=${pf.value}`}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                  active
                    ? 'bg-[#245B45] text-white'
                    : 'bg-white text-[#252A27] border border-[#E8E6E0] hover:bg-gray-50'
                }`}
              >
                {pf.label}
              </Link>
            );
          })}
        </div>

        {/* Providers Grid */}
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#D5D2CA] bg-white p-12 text-center">
            <span className="text-4xl">🩺</span>
            <h2 className="mt-3 text-xl font-bold text-[#252A27]">No care providers registered yet</h2>
            <p className="mt-1 text-sm text-gray-500 max-w-md mx-auto">
              Are you a licensed veterinarian or certified pet groomer? Join the KINNIPAW network today.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((p) => (
              <div
                key={p.id}
                className="flex flex-col overflow-hidden rounded-xl border border-[#E8E6E0] bg-white shadow-sm transition hover:shadow-md"
              >
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-emerald-50 text-[#245B45] border border-emerald-200 px-2.5 py-0.5 text-xs font-bold capitalize">
                      {p.provider_type}
                    </span>
                    {p.verification_status === 'verified' && (
                      <span className="flex items-center gap-1 text-xs font-bold text-blue-600">
                        ✓ Verified Provider
                      </span>
                    )}
                  </div>

                  <h2 className="mt-3 text-lg font-bold text-[#252A27]">
                    {p.public_name}
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    📍 {p.public_address || 'Bangladesh'}
                  </p>

                  {p.average_rating ? (
                    <div className="mt-2 flex items-center gap-1.5 text-xs">
                      <span className="text-amber-500">★</span>
                      <span className="font-bold text-[#252A27]">{p.average_rating}</span>
                      <span className="text-gray-400">({p.review_count} reviews)</span>
                    </div>
                  ) : (
                    <span className="mt-2 text-xs text-gray-400">New provider (no reviews yet)</span>
                  )}

                  {p.description && (
                    <p className="mt-3 line-clamp-2 text-xs text-gray-600 leading-relaxed">
                      {p.description}
                    </p>
                  )}

                  {/* Services tags */}
                  {p.services && p.services.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {p.services.slice(0, 3).map((s: { service_name: string }, idx: number) => (
                        <span key={idx} className="rounded bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600">
                          {s.service_name}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-auto pt-6 flex items-center justify-between border-t border-[#F3F4F6]">
                    <span className="text-xs text-[#245B45] font-semibold">
                      Licensed Care
                    </span>
                    <Link
                      href={`/providers/${p.id}`}
                      className="rounded-lg bg-[#245B45] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#1B4736]"
                    >
                      View & Book
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
