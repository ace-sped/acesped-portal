'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/navbar/page';
import Footer from '../components/footer/page';
import { Lock, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';

export default function AccessCodePage() {
  const router = useRouter();
  const [accessCode, setAccessCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Verify the access code against the database
      const response = await fetch('/api/verify-access-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessCode: accessCode.trim(),
          incrementUsage: true, // Increment usage count on initial verification
        }),
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        // Access code is valid - store it and redirect
        sessionStorage.setItem('project_access_code', accessCode.trim());
        
        // Redirect to projects page
        router.push('/projects');
      } else {
        // Access code is invalid
        setError(data.error || 'Invalid access code. Please try again.');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setError('Failed to verify access code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 via-teal-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4 py-16">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            {/* Header with gradient */}
            <div className="bg-linear-to-r from-emerald-600 to-teal-600 p-8 text-white text-center">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Lock className="h-10 w-10" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Restricted Access</h1>
              <p className="text-emerald-100">Enter your access code to view projects</p>
            </div>

            {/* Form */}
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label 
                    htmlFor="accessCode" 
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Access Code
                  </label>
                  <input
                    type="text"
                    id="accessCode"
                    value={accessCode}
                    onChange={(e) => {
                      setAccessCode(e.target.value);
                      setError(null);
                    }}
                    placeholder="Enter your access code"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-lg font-mono focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-400 placeholder:font-sans"
                    autoFocus
                    required
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 shrink-0" />
                      <p className="text-sm font-medium text-red-800 dark:text-red-300">
                        {error}
                      </p>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || !accessCode.trim()}
                  className="w-full py-4 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-lg font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Verifying...
                    </>
                  ) : (
                    <>
                      Access Projects
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </form>

              {/* Help Text */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  Don't have an access code?{' '}
                  <a 
                    href="mailto:contact@acesped.com" 
                    className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                  >
                    Contact us
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Security Badge */}
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-full border border-gray-200 dark:border-gray-700 shadow-sm">
              <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Secure Access System
              </span>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
