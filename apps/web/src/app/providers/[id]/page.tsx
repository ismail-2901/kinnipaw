import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

interface ProviderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProviderDetailPage({ params }: ProviderDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: provider, error } = await supabase
    .from('provider_profiles')
    .select(`
      id,
      user_id,
      provider_type,
      public_name,
      verification_status,
      public_address,
      description,
      services:provider_services(id, service_name, description, price_range_description, is_active),
      reviews:provider_reviews(
        id,
        rating,
        body,
        created_at,
        reviewer:profiles(display_name, username)
      )
    `)
    .eq('id', id)
    .single();

  if (error || !provider) {
    notFound();
  }

  const p = provider as any;
  const ratings = p.reviews?.map((r: { rating: number }) => r.rating) || [];
  const avgRating = ratings.length > 0 ? (ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length).toFixed(1) : null;

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* Header */}
      <header className="border-b border-[#E8E6E0] bg-white px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="text-2xl font-black text-[#245B45]">
            KINNIPAW
          </Link>
          <Link href="/providers" className="text-sm font-semibold text-[#252A27] hover:text-[#245B45]">
            ← Back to Care Providers
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
            <div className="rounded-2xl border border-[#E8E6E0] bg-white p-8 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#E8E6E0] pb-4">
                <span className="rounded-full bg-emerald-50 text-[#245B45] border border-emerald-200 px-3 py-1 text-xs font-bold capitalize">
                  {p.provider_type}
                </span>
                {p.verification_status === 'verified' && (
                  <span className="text-xs font-bold text-blue-600">
                    ✓ Verified License
                  </span>
                )}
              </div>

              <h1 className="mt-4 text-3xl font-black text-[#252A27]">{p.public_name}</h1>
              <p className="mt-1 text-sm text-gray-500">📍 {p.public_address || 'Bangladesh'}</p>

              {avgRating && (
                <div className="mt-3 flex items-center gap-2 text-sm">
                  <span className="text-amber-500 text-lg">★</span>
                  <span className="font-bold text-[#252A27]">{avgRating}</span>
                  <span className="text-gray-400">({p.reviews.length} reviews)</span>
                </div>
              )}

              <div className="mt-6 border-t border-[#E8E6E0] pt-6">
                <h2 className="text-sm font-bold text-[#252A27]">About this Provider</h2>
                <p className="mt-2 text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                  {p.description || 'Dedicated to providing high quality, ethical animal care and wellness services.'}
                </p>
              </div>
            </div>

            {/* Offered Services */}
            <div className="rounded-2xl border border-[#E8E6E0] bg-white p-8 shadow-sm">
              <h2 className="text-lg font-bold text-[#252A27]">Care Services & Pricing</h2>
              <div className="mt-4 space-y-3">
                {p.services && p.services.length > 0 ? (
                  p.services.map((s: { id: string; service_name: string; description?: string; price_range_description?: string }) => (
                    <div key={s.id} className="flex justify-between items-start rounded-xl border border-[#E8E6E0] p-4 bg-[#FAF9F6]">
                      <div>
                        <h3 className="text-sm font-bold text-[#252A27]">{s.service_name}</h3>
                        {s.description && (
                          <p className="mt-1 text-xs text-gray-600">{s.description}</p>
                        )}
                      </div>
                      {s.price_range_description && (
                        <span className="text-xs font-semibold text-[#245B45] bg-emerald-50 px-2.5 py-1 rounded">
                          {s.price_range_description}
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400">No specific services listed yet.</p>
                )}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="rounded-2xl border border-[#E8E6E0] bg-white p-8 shadow-sm">
              <h2 className="text-lg font-bold text-[#252A27]">
                Client Reviews ({p.reviews?.length || 0})
              </h2>

              {(!p.reviews || p.reviews.length === 0) ? (
                <p className="mt-4 text-xs text-gray-400">No reviews yet for this care provider.</p>
              ) : (
                <div className="mt-4 space-y-4">
                  {p.reviews.map((r: { id: string; rating: number; body?: string; created_at: string; reviewer: { display_name: string } }) => (
                    <div key={r.id} className="rounded-xl border border-[#E8E6E0] p-4 bg-[#FAF9F6]">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-[#252A27]">{r.reviewer?.display_name || 'Guardian'}</span>
                        <span className="text-amber-500 font-bold">★ {r.rating} / 5</span>
                      </div>
                      {r.body && (
                        <p className="mt-2 text-xs text-gray-600 leading-relaxed">{r.body}</p>
                      )}
                      <p className="mt-1 text-[10px] text-gray-400">
                        {new Date(r.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar CTA */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-[#E8E6E0] bg-white p-6 shadow-sm">
              <h2 className="text-base font-bold text-[#252A27]">Request an Appointment</h2>
              <p className="text-xs text-gray-500 mt-1">
                Book a consultation or service appointment for your animal.
              </p>

              <button
                type="button"
                className="mt-6 w-full rounded-xl bg-[#245B45] py-3 text-sm font-bold text-white shadow transition hover:bg-[#1B4736]"
              >
                Schedule Visit
              </button>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                Ethical Practice Standard
              </h3>
              <p className="mt-2 text-xs text-emerald-800 leading-relaxed">
                All listed professionals adhere to humane handling and lawful animal care guidelines. No harmful procedures or unauthorized wildlife treatment.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
