"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, LogIn, Loader2, GraduationCap } from 'lucide-react';

export default function LecturerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/lecturer/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      const roleToRoute: { [key: string]: string } = {
        SUPER_ADMIN: '/admin',
        Center_Leader: '/center-leader',
        Deputy_Center_Leader: '/deputy-center-leader',
        Center_Secretary: '/center-secretary',
        Academic_Program_Coordinator: '/academic-program-coordinator',
        Applied_Research_Coordinator: '/applied-research-coordinator',
        Head_of_Program: '/head-of-program',
        Co_Head_of_Program: '/co-head-of-program',
        Lecturer: '/lecturer',
        PG_Rep: '/pg-rep',
        Staff: '/staff',
        Head_of_Finance: '/head-of-finance',
        Industrial_Liaison_Officer: '/industrial-liaison-officer',
        ICT: '/ict',
        Monitoring_and_Evaluation_Officer: '/monitoring-and-evaluation-officer',
      };

      const redirectRoute = roleToRoute[data.user.role] || '/';
      router.push(redirectRoute);
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-emerald-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center text-emerald-200">
            <GraduationCap className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold text-white mt-4">Lecturer Portal</h1>
          <p className="text-emerald-100/80">Sign in to manage your courses</p>
        </div>

        <div className="bg-white/10 backdrop-blur border border-white/10 rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-200 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-emerald-50 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-200/70" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-900/60 border border-white/10 text-white placeholder-emerald-100/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="lecturer@aceportal.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-50 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-200/70" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 rounded-lg bg-slate-900/60 border border-white/10 text-white placeholder-emerald-100/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-200/70 hover:text-emerald-200"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-emerald-100/70">
            Not a lecturer?{' '}
            <button
              onClick={() => router.push('/login')}
              className="text-emerald-300 hover:text-emerald-200"
            >
              Staff login
            </button>
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={() => router.push('/')}
              className="text-xs text-emerald-100/60 hover:text-emerald-100"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
