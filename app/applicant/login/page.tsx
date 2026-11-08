'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ClipboardList,
  Globe2,
  Loader2,
  LogIn,
  ArrowRight,
} from 'lucide-react';
import { COUNTRIES } from '@/lib/countries';
import { getFriendlyErrorMessage } from '@/lib/friendly-error';
import { safeSessionStorageSet } from '@/lib/safe-browser-storage';

const APPLICANT_SESSION_KEY = 'acesped_applicant_session';

export default function ApplicantLoginPage() {
  const router = useRouter();
  const [applicationNumber, setApplicationNumber] = useState('');
  const [nationality, setNationality] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/applicant/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationNumber: applicationNumber.trim(),
          nationality,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Login failed');
      }

      safeSessionStorageSet(APPLICANT_SESSION_KEY, JSON.stringify(data.application));
      router.push('/applicant/dashboard');
    } catch (err) {
      setError(
        getFriendlyErrorMessage(err, 'Unable to verify your application. Please try again.')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-dvh overflow-hidden relative bg-gradient-to-br from-green-950 via-emerald-900 to-green-800 flex items-center justify-center px-4 py-3">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.18), transparent 40%), radial-gradient(circle at 80% 0%, rgba(16,185,129,0.35), transparent 35%), radial-gradient(circle at 70% 80%, rgba(255,255,255,0.08), transparent 40%)',
        }}
      />

      <div className="relative max-w-md w-full">
        <div className="text-center mb-4">
          <div className="flex justify-center mb-2">
            <div className="bg-white rounded-full p-2.5 shadow-lg shadow-black/20">
              <img
                src="/images/ace-logo.png"
                alt="ACE-SPED"
                className="h-11 w-11 rounded-full object-contain"
              />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Applicant Login
          </h1>
          <p className="text-green-100/90 text-sm mt-1">
            Enter your application number and nationality
          </p>
        </div>

        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-5 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Application Number
              </label>
              <div className="relative">
                <ClipboardList className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
                <input
                  type="text"
                  value={applicationNumber}
                  onChange={(e) => setApplicationNumber(e.target.value.toUpperCase())}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white uppercase tracking-wide text-sm"
                  placeholder="e.g. ACE-SPED-2026-XXXX"
                  required
                  autoComplete="off"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Nationality
              </label>
              <div className="relative">
                <Globe2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400 z-10" />
                <select
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white appearance-none text-sm"
                  required
                >
                  <option value="">Select nationality</option>
                  {COUNTRIES.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !applicationNumber.trim() || !nationality}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Continue
                </>
              )}
            </button>
          </form>

          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-center text-sm">
            <button
              type="button"
              onClick={() => router.push('/application')}
              className="inline-flex items-center gap-1 font-semibold text-green-700 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
            >
              Start a new application
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => router.push('/')}
              className="text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
