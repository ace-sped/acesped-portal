"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle, ArrowRight, Home } from 'lucide-react';

export default function StudentsLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // TODO: Implement student authentication API
      await new Promise(resolve => setTimeout(resolve, 1500));

      setError('Student portal is coming soon! Please check back later.');
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Left Column - Company Logo & Welcome Note with Green Background */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-600 via-emerald-700 to-green-800 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className={`absolute top-20 left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl ${mounted ? 'animate-blob' : ''}`}></div>
          <div className={`absolute bottom-20 right-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl ${mounted ? 'animate-blob animation-delay-2000' : ''}`}></div>
          <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-green-400/5 rounded-full blur-3xl ${mounted ? 'animate-blob animation-delay-4000' : ''}`}></div>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center p-8 xl:p-12 text-white w-full h-full">
          {/* Logo and Content */}
          <div className={`text-center transition-all duration-1000 ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
            <div className="mb-6">
              <img
                src="/images/ace-logo.png"
                alt="ACE-SPED Logo"
                className="h-32 w-32 xl:h-40 xl:w-40 mx-auto drop-shadow-2xl hover:scale-105 transition-transform duration-300 rounded-full object-contain"
              />
            </div>

            <div className="space-y-4 max-w-lg mx-auto">
              <h1 className="text-4xl xl:text-5xl font-bold text-white">
                ACE-SPED
              </h1>
              <div className="h-1 w-20 bg-white/40 mx-auto rounded-full"></div>

              {/* Welcome Note */}
              <div className="mt-6 space-y-3">
                <h2 className="text-2xl xl:text-3xl font-semibold text-green-50">
                  Welcome Back, Student!
                </h2>
                <p className="text-base xl:text-lg text-green-100 leading-relaxed px-4">
                  Access your personalized learning dashboard, track your academic progress,
                  and connect with your educational community.
                </p>
              </div>

              {/* Decorative Element */}
              <div className="mt-8 flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>

              <p className="text-sm text-green-200 mt-6">
                Your journey to academic excellence continues here
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="absolute bottom-6 left-0 right-0 text-center text-sm text-green-100/80">
            <p>© 2025 ACE-SPED. All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-8 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
        <div className={`w-full max-w-md my-auto transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Mobile Logo & Welcome */}
          <div className="lg:hidden text-center mb-6">
            <div className="mb-4">
              <img
                src="/images/ace-logo.png"
                alt="ACE-SPED Logo"
                className="h-20 w-20 mx-auto rounded-full object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              ACE-SPED
            </h1>
            <h2 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-1">
              Welcome Back, Student!
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Sign in to access your dashboard
            </p>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:block mb-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Student Login
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Enter your credentials to continue
            </p>
          </div>

          {/* Login Form Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-200 dark:border-gray-700">
            {error && (
              <div className="mb-5 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start animate-shake">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-3 shrink-0 mt-0.5" />
                <span className="text-sm text-red-800 dark:text-red-200">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Registration Number Input */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  Registration Number
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="email"
                    name="email"
                    type="text"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white transition-colors"
                    placeholder="PG/ACE-SPED/2025/M/035"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-12 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white transition-colors"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Remember me
                  </label>
                </div>

                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-green-600 dark:text-green-400 hover:text-green-500 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-2.5 px-4 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="h-5 w-5 mr-2" />
                    Sign In
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                    Need help?
                  </span>
                </div>
              </div>

              {/* Update Profile Button */}
              <Link
                href="#"
                className="w-full flex items-center justify-center py-2.5 px-4 border-2 border-green-600 dark:border-green-500 text-green-600 dark:text-green-400 rounded-lg font-medium text-sm hover:bg-green-50 dark:hover:bg-green-900/20 transition-all group"
              >
                Update Your Profile
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </form>
          </div>

          {/* Additional Links */}
          <div className="mt-5 text-center space-y-2.5">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Are you a staff member?{' '}
              <Link
                href="/login"
                className="font-medium text-green-600 dark:text-green-400 hover:text-green-500 transition-colors"
              >
                Staff Login
              </Link>
            </p>
            <Link
              href="/"
              className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors group"
            >
              <Home className="h-4 w-4 mr-1" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
