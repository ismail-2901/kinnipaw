'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      router.push('/animals');
      router.refresh();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm border border-[#E8E6E0]">
        <div className="mb-6 text-center">
          <Link href="/" className="text-2xl font-black text-[#245B45]">
            KINNIPAW
          </Link>
          <h2 className="mt-2 text-xl font-bold text-[#252A27]">Sign in to your account</h2>
          <p className="text-sm text-[#66856C]">Welcome back to the animal care ecosystem</p>
        </div>

        {errorMsg && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSignIn} className="space-y-4">
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#E8E6E0] px-3 py-2 text-sm focus:border-[#245B45] focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#245B45] py-2.5 text-sm font-semibold text-white hover:bg-[#1B4736] disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#252A27]/70">
          Do not have an account?{' '}
          <Link href="/sign-up" className="font-semibold text-[#245B45] hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
