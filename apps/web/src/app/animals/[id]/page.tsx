import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AnimalDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Query animal
  const { data: animal } = await supabase
    .from('animals')
    .select('*, species(name, slug), breeds(name), animal_media(*)')
    .eq('id', id)
    .single();

  if (!animal) {
    notFound();
  }

  const isOwner = user?.id === animal.owner_id;

  if (animal.visibility === 'private' && !isOwner) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-center">
        <div className="max-w-md rounded-2xl border border-red-200 bg-white p-8">
          <h2 className="text-xl font-bold text-red-600">Private Profile</h2>
          <p className="mt-2 text-sm text-[#252A27]/80">
            This animal profile has been marked private by its guardian.
          </p>
          <Link
            href="/animals"
            className="mt-6 inline-block rounded-lg bg-[#245B45] px-4 py-2 text-sm font-semibold text-white"
          >
            Return to Animals
          </Link>
        </div>
      </div>
    );
  }

  // If owner, query health records & reminders
  let healthRecords: Array<any> = [];
  let reminders: Array<any> = [];

  if (isOwner) {
    const [healthRes, remRes] = await Promise.all([
      supabase.from('animal_health_records').select('*').eq('animal_id', id).order('occurred_at', { ascending: false }),
      supabase.from('care_reminders').select('*').eq('animal_id', id).order('due_date', { ascending: true }),
    ]);

    healthRecords = healthRes.data || [];
    reminders = remRes.data || [];
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* Header */}
      <header className="border-b border-[#E8E6E0] bg-white px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/animals" className="text-sm font-semibold text-[#245B45] hover:underline">
            ← Back to Animals
          </Link>
          <Link href="/" className="text-xl font-black text-[#245B45]">
            KINNIPAW
          </Link>
        </div>
      </header>

      {/* Profile Overview */}
      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="rounded-2xl border border-[#E8E6E0] bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-extrabold text-[#252A27]">{animal.name}</h1>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    animal.visibility === 'public'
                      ? 'bg-[#E0EDE6] text-[#245B45]'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {animal.visibility}
                </span>
              </div>
              <p className="mt-1 text-base text-[#66856C]">
                {animal.species?.name || 'Animal'}
                {animal.breeds?.name ? ` • ${animal.breeds.name}` : ''}
                {animal.sex ? ` • ${animal.sex}` : ''}
              </p>
            </div>

            {isOwner && (
              <div className="flex gap-2">
                <span className="rounded-lg bg-[#E0EDE6] px-3 py-1.5 text-xs font-semibold text-[#245B45]">
                  Verified Guardian (Owner)
                </span>
              </div>
            )}
          </div>

          {animal.bio && (
            <p className="mt-6 border-t border-[#F0F6F3] pt-4 text-sm text-[#252A27]/80 leading-relaxed">
              {animal.bio}
            </p>
          )}
        </div>

        {/* Private Care & Reminders Section (Only for Verified Owner) */}
        {isOwner && (
          <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Health Records */}
            <div className="rounded-2xl border border-[#E8E6E0] bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#F0F6F3] pb-4">
                <h2 className="text-lg font-bold text-[#252A27]">Care &amp; Health Records</h2>
                <span className="text-xs font-medium text-[#66856C] bg-[#F0F6F3] px-2.5 py-1 rounded-full">
                  Private
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {healthRecords.length === 0 ? (
                  <p className="text-xs text-[#252A27]/60 italic py-4 text-center">
                    No health records recorded yet.
                  </p>
                ) : (
                  healthRecords.map((record) => (
                    <div
                      key={record.id}
                      className="rounded-lg border border-[#F0F6F3] p-3 hover:border-[#CCD8D0]"
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="text-sm font-semibold text-[#252A27]">{record.title}</h4>
                        <span className="text-xs text-[#66856C] uppercase font-mono">
                          {record.record_type}
                        </span>
                      </div>
                      {record.notes && (
                        <p className="mt-1 text-xs text-[#252A27]/70">{record.notes}</p>
                      )}
                      <p className="mt-2 text-[10px] text-[#252A27]/40">
                        Date: {new Date(record.occurred_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Care Reminders */}
            <div className="rounded-2xl border border-[#E8E6E0] bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#F0F6F3] pb-4">
                <h2 className="text-lg font-bold text-[#252A27]">Scheduled Reminders</h2>
                <span className="text-xs font-medium text-[#66856C] bg-[#F0F6F3] px-2.5 py-1 rounded-full">
                  Private
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {reminders.length === 0 ? (
                  <p className="text-xs text-[#252A27]/60 italic py-4 text-center">
                    No reminders scheduled.
                  </p>
                ) : (
                  reminders.map((reminder) => (
                    <div
                      key={reminder.id}
                      className="flex items-center justify-between rounded-lg border border-[#F0F6F3] p-3 hover:border-[#CCD8D0]"
                    >
                      <div>
                        <h4 className="text-sm font-semibold text-[#252A27]">{reminder.title}</h4>
                        <span className="text-xs text-[#66856C]">Due: {reminder.due_date}</span>
                      </div>
                      <span className="text-xs text-[#245B45] font-medium bg-[#E0EDE6] px-2 py-0.5 rounded">
                        {reminder.reminder_type}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
