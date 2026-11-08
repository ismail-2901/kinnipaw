import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Parallel counts
  const [
    { count: totalUsers },
    { count: totalAnimals },
    { count: totalAdoptions },
    { count: activeRescues },
    { count: activeLostPosts },
    { count: pendingReports },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('animals').select('*', { count: 'exact', head: true }),
    supabase.from('adoption_listings').select('*', { count: 'exact', head: true }).eq('listing_status', 'active'),
    supabase.from('rescue_cases').select('*', { count: 'exact', head: true }).eq('case_status', 'open'),
    supabase.from('lost_found_posts').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('content_reports').select('*', { count: 'exact', head: true }).eq('report_status', 'pending'),
  ]);

  const metrics = [
    { label: 'Total Guardians & Users', value: totalUsers || 0, icon: '👥', color: 'bg-blue-50 text-blue-700' },
    { label: 'Registered Animals', value: totalAnimals || 0, icon: '🐾', color: 'bg-emerald-50 text-emerald-700' },
    { label: 'Active Adoption Listings', value: totalAdoptions || 0, icon: '🏠', color: 'bg-purple-50 text-purple-700' },
    { label: 'Open Rescue Emergencies', value: activeRescues || 0, icon: '🚨', color: 'bg-red-50 text-red-700' },
    { label: 'Active Lost Reports', value: activeLostPosts || 0, icon: '🔍', color: 'bg-amber-50 text-amber-700' },
    { label: 'Pending Moderation Queue', value: pendingReports || 0, icon: '🛡️', color: 'bg-rose-50 text-rose-700' },
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
            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-red-800">
              Admin & Moderation Shell
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm font-semibold">
            <Link href="/feed" className="text-gray-600 hover:text-[#245B45]">
              View Site
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-[#252A27]">Platform Operations</h1>
            <p className="text-sm text-gray-500 mt-1">
              Platform administration, community welfare governance, and moderation review queue.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/reports"
              className="rounded-xl bg-[#245B45] px-4 py-2 text-sm font-bold text-white hover:bg-[#1B4736] transition shadow-sm"
            >
              🛡️ Moderation Queue ({pendingReports || 0})
            </Link>
            <Link
              href="/admin/audit-logs"
              className="rounded-xl border border-[#D5D2CA] bg-white px-4 py-2 text-sm font-bold text-[#252A27] hover:bg-gray-50 transition"
            >
              📜 Audit Logs
            </Link>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {metrics.map((m, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-[#E8E6E0] bg-white p-6 shadow-sm flex items-center justify-between"
            >
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{m.label}</span>
                <p className="mt-2 text-3xl font-black text-[#252A27]">{m.value}</p>
              </div>
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl ${m.color}`}>
                {m.icon}
              </div>
            </div>
          ))}
        </div>

        {/* Governance Rules & Bangladesh Law Checklist */}
        <div className="mt-10 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-8">
          <h2 className="text-lg font-bold text-emerald-950">
            Platform Safety & Legal Compliance Principles
          </h2>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-emerald-900 leading-relaxed">
            <div>
              <h3 className="font-bold text-emerald-950">Wildlife Preservation Act 2012</h3>
              <p className="mt-1">
                Zero tolerance for unlawful trade, breeding, or commercial transfer of protected indigenous birds, reptiles, or mammals.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-emerald-950">Location Privacy Invariant</h3>
              <p className="mt-1">
                Never disclose private street addresses or raw GPS coordinates publicly. Coarse neighborhood labels only.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-emerald-950">AI Guardrail Compliance</h3>
              <p className="mt-1">
                AI match recommendations and auto-triage are strictly advisory. Final enforcement decisions require authorized human review.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-emerald-950">Veterinary Boundary</h3>
              <p className="mt-1">
                Platform automated systems must never diagnose medical symptoms or prescribe dosages. Urgent cases route to accredited vets.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
