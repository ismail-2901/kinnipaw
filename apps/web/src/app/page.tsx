import React from 'react';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <div className="max-w-2xl space-y-6">
        <div className="inline-block rounded-full bg-[#E0EDE6] px-4 py-1.5 text-sm font-medium text-[#245B45]">
          Bangladesh-First Animal Ecosystem
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-[#245B45]">
          KINNIPAW
        </h1>
        <p className="text-xl font-medium text-[#66856C]">
          One Platform. Every Animal. One Connected Ecosystem.
        </p>
        <p className="text-base text-[#252A27]/80">
          Responsible care, lawful adoption, lost-and-found matching, rescue coordination, and
          welfare services for guardians, adopters, rescuers, and care professionals.
        </p>
        <div className="pt-4 flex flex-wrap justify-center gap-4">
          <span className="rounded-lg border border-[#245B45] px-4 py-2 text-sm font-semibold text-[#245B45]">
            Foundation M1 Active
          </span>
          <span className="rounded-lg bg-[#245B45] px-4 py-2 text-sm font-semibold text-white">
            Monorepo &amp; Shared Architecture
          </span>
        </div>
      </div>
    </main>
  );
}
