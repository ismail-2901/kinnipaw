'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function SignUpPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
          preferred_locale: 'en',
        },
      },
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      setSuccessMsg('Registration successful! Please check your email to verify your account or proceed to sign in.');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm border border-[#E8E6E0]">
        <div className="mb-6 text-center">
          <Link href="/" className="text-2xl font-black text-[#245B45]">
            KINNIPAW
          </Link>
          <h2 className="mt-2 text-xl font-bold text-[#252A27]">Create an account</h2>
          <p className="text-sm text-[#66856C]">Join Bangladesh's animal care and rescue ecosystem</p>
        </div>

        {errorMsg && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-800 border border-green-200">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#252A27]">Display Name</label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#E8E6E0] px-3 py-2 text-sm focus:border-[#245B45] focus:outline-none"
              placeholder="e.g. Rahat Ahmed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#252A27]">Email address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#E8E6E0] px-3 py-2 text-sm focus:border-[#245B45] focus:outline-none"
              placeholder="guardian@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#252A27]">Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#E8E6E0] px-3 py-2 text-sm focus:border-[#245B45] focus:outline-none"
              placeholder="Minimum 8 characters"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#245B45] py-2.5 text-sm font-semibold text-white hover:bg-[#1B4736] disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#252A27]/70">
          Already have an account?{' '}
          <Link href="/sign-in" className="font-semibold text-[#245B45] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
