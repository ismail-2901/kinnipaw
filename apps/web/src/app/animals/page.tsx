import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

interface AnimalListItem {
  id: string;
  name: string;
  species?: any;
  breeds?: any;
  visibility: string;
  animal_status: string;
  date_of_birth?: string | null;
}

export default async function AnimalsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let animals: AnimalListItem[] = [];

  if (user) {
    const { data } = await supabase
      .from('animals')
      .select('id, name, visibility, animal_status, date_of_birth, species(name), breeds(name)')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    animals = (data as any) || [];
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* Header */}
      <header className="border-b border-[#E8E6E0] bg-white px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="text-2xl font-black text-[#245B45]">
            KINNIPAW
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/profile"
              className="text-sm font-semibold text-[#252A27] hover:text-[#245B45]"
            >
              My Profile
            </Link>
            <Link
              href="/animals/new"
              className="rounded-lg bg-[#245B45] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1B4736]"
            >
              + Add Animal
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-[#252A27]">My Animals</h1>
            <p className="text-sm text-[#66856C]">
              Manage profiles, health records, reminders, and privacy for your animal companions
            </p>
          </div>
        </div>

        {animals.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#CCD8D0] bg-white p-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#E0EDE6] text-2xl text-[#245B45]">
              🐾
            </div>
            <h3 className="mt-4 text-lg font-bold text-[#252A27]">No animals registered yet</h3>
            <p className="mt-1 text-sm text-[#66856C]">
              Add your companion to track health records, reminders, and adoption or lost/found status.
            </p>
            <div className="mt-6">
              <Link
                href="/animals/new"
                className="inline-flex items-center rounded-lg bg-[#245B45] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1B4736]"
              >
                Register Your First Animal
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {animals.map((animal) => {
              const speciesName = Array.isArray(animal.species)
                ? animal.species[0]?.name
                : animal.species?.name;
              const breedName = Array.isArray(animal.breeds)
                ? animal.breeds[0]?.name
                : animal.breeds?.name;

              return (
                <div
                  key={animal.id}
                  className="flex flex-col rounded-2xl border border-[#E8E6E0] bg-white p-6 shadow-sm transition hover:border-[#245B45]"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-[#252A27]">{animal.name}</h3>
                      <p className="text-sm text-[#66856C]">
                        {speciesName || 'Animal'}
                        {breedName ? ` • ${breedName}` : ''}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        animal.visibility === 'public'
                          ? 'bg-[#E0EDE6] text-[#245B45]'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {animal.visibility}
                    </span>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-[#F0F6F3] pt-4">
                    <span className="text-xs font-medium text-[#252A27]/60 capitalize">
                      Status: {animal.animal_status}
                    </span>
                    <Link
                      href={`/animals/${animal.id}`}
                      className="text-sm font-semibold text-[#245B45] hover:underline"
                    >
                      View Profile →
                    </Link>
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
