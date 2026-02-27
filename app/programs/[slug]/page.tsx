'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Clock,
  GraduationCap,
  BookOpen,
  Loader2,
  Check,
  ChevronRight,
  Calendar,
  FileText,
  Briefcase,
  Award,
  Users,
} from 'lucide-react';
import { TbCurrencyNaira } from 'react-icons/tb';
import Navbar from '@/app/components/navbar/page';
import Footer from '@/app/components/footer/page';
import CourseCurriculumSection from './components/CourseCurriculumSection';

// Helper function to get level display name
const getLevelDisplayName = (level: string) => {
  const levelMap: { [key: string]: string } = {
    'CERTIFICATE': 'Certificate',
    'DIPLOMA': 'Diploma',
    'BACHELORS': 'Bachelors',
    'MASTERS': 'Masters',
    'PHD': 'Ph.D',
    'MASTERS_AND_PHD': 'Ph.D/M.Sc.',
  };
  return levelMap[level] || level.replace(/_/g, ' ');
};

export default function ProgramDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const { slug } = resolvedParams;
  const [program, setProgram] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchProgram(slug);
    }
  }, [slug]);

  const fetchProgram = async (programSlug: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/programs/${programSlug}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Handle non-OK responses
      if (!response.ok) {
        let errorMessage = `Failed to fetch program (${response.status})`;

        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }

        // Set error state instead of throwing
        setError(errorMessage);
        setLoading(false);
        return;
      }

      // Parse JSON response
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        setError('Invalid response from server. Please try again.');
        setLoading(false);
        return;
      }

      // Check if data is valid
      if (!data) {
        setError('No data received from server.');
        setLoading(false);
        return;
      }

      // Handle success response
      if (data.success && data.program) {
        setProgram(data.program);
      } else {
        setError(data.message || 'Program not found');
      }
    } catch (err) {
      // Handle network errors and other exceptions
      const errorMessage = err instanceof Error
        ? (err.message.includes('fetch') || err.message.includes('network')
          ? 'Network error. Please check your connection and try again.'
          : err.message)
        : 'An unexpected error occurred. Please try again.';

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <section className="py-20">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="h-12 w-12 text-green-600 animate-spin mb-4" />
              <p className="text-gray-600 dark:text-gray-400 text-lg">Loading program...</p>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />

        {/* Breadcrumb */}
        <section className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-4">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center space-x-2 text-sm">
              <Link
                href="/"
                className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
              >
                Home
              </Link>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <Link
                href="/programs"
                className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
              >
                Programs
              </Link>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <span className="text-gray-900 dark:text-white font-medium">Error</span>
            </nav>
          </div>
        </section>

        {/* Error Section */}
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-red-200 dark:border-red-800 p-8 sm:p-12 text-center">
              <div className="mb-6">
                <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-10 w-10 text-red-600 dark:text-red-400" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
                  Program Not Found
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
                  {error || 'The program you are looking for does not exist or could not be loaded.'}
                </p>
                {slug && (
                  <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
                    Program slug: <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{slug}</span>
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => {
                    setError(null);
                    setLoading(true);
                    fetchProgram(slug);
                  }}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center justify-center"
                >
                  <Loader2 className="h-4 w-4 mr-2" />
                  Try Again
                </button>
                <button
                  onClick={() => router.push('/programs')}
                  className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-semibold"
                >
                  View All Programs
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-semibold"
                >
                  Go to Home
                </button>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                  If you believe this is an error, please:
                </p>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2 text-left max-w-md mx-auto">
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Check the URL for typos</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Try refreshing the page</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Contact support if the problem persists</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    );
  }

  // Parse JSON arrays
  const objectives = Array.isArray(program.objectives) ? program.objectives : [];
  const curriculum = Array.isArray(program.curriculum) ? program.curriculum : [];
  const requirements = Array.isArray(program.requirements) ? program.requirements : [];
  const careerPaths = Array.isArray(program.careerPaths) ? program.careerPaths : [];

  // Build breadcrumb
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Programs', href: '/programs' },
  ];

  if (program.service) {
    breadcrumbItems.push({
      label: program.service.title.toUpperCase().replace(/-/g, ' '),
      href: `/services/${program.service.slug}`
    });
  }

  breadcrumbItems.push({ label: program.title, href: `#` });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      {/* Breadcrumb */}
      <section className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-4">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center space-x-2 text-sm">
            {breadcrumbItems.map((item, index) => (
              <React.Fragment key={index}>
                {index > 0 && <ChevronRight className="h-4 w-4 text-gray-400" />}
                {index === breadcrumbItems.length - 1 ? (
                  <span className="text-gray-900 dark:text-white font-medium">{item.label}</span>
                ) : (
                  <Link
                    href={item.href}
                    className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                  >
                    {item.label}
                  </Link>
                )}
              </React.Fragment>
            ))}
          </nav>
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-900 to-emerald-900 text-white py-12 sm:py-16 lg:py-20">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            {/* Level Badge */}
            {program.level && (
              <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm text-green-100 rounded-full text-sm font-semibold mb-4">
                {getLevelDisplayName(program.level)}
              </span>
            )}

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-50 mb-4 sm:mb-6 break-words">
              {program.title}
            </h1>

            {/* Description */}
            {program.overview && (
              <p className="text-base sm:text-lg md:text-xl text-gray-100/90 mb-4 sm:mb-6 leading-relaxed max-w-3xl mx-auto">
                {program.overview}
              </p>
            )}

            {/* Sub text */}
            <p className="text-xs sm:text-sm text-green-100/80">
              Designed to equip you with practical, job-ready skills for today&apos;s digital economy.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Info Cards */}
      <section className="py-0 -mt-8 sm:-mt-12 relative z-10">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col h-full">
              <div className="flex items-start">
                <div className="bg-green-100 dark:bg-green-900 p-2 sm:p-3 rounded-lg mr-3 sm:mr-4 flex-shrink-0">
                  <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                    Duration
                  </p>
                  <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white break-words leading-tight">
                    {program.duration || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col h-full">
              <div className="flex items-start">
                <div className="bg-blue-100 dark:bg-blue-900 p-2 sm:p-3 rounded-lg mr-3 sm:mr-4 flex-shrink-0">
                  <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                    Study Mode
                  </p>
                  <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white break-words leading-tight">
                    {program.studyMode || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col h-full">
              <div className="flex items-start">
                <div className="bg-purple-100 dark:bg-purple-900 p-2 sm:p-3 rounded-lg mr-3 sm:mr-4 flex-shrink-0">
                  <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                    Total Courses
                  </p>
                  <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white break-words leading-tight">
                    {program.courses ? program.courses.length : 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col h-full">
              <div className="flex items-start">
                <div className="bg-orange-100 dark:bg-orange-900 p-2 sm:p-3 rounded-lg mr-3 sm:mr-4 flex-shrink-0">
                  <TbCurrencyNaira className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                    Application Fee
                  </p>
                  <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white break-words leading-tight">
                    {program.fee || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Course Curriculum Section */}
      <CourseCurriculumSection courses={program.courses || []} programSlug={slug} />



      {/* Ready to Start Your Journey CTA */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-green-900 to-emerald-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 break-words">
              Ready to Start Your Journey?
            </h2>
            <p className="text-lg sm:text-xl text-green-100 break-words">
              Join hundreds of students who have transformed their careers
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 lg:p-10 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-start mb-8 sm:mb-10">
              <div className="text-center md:text-left">
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                  Application Fee
                </p>
                <div className="flex items-baseline justify-center md:justify-start gap-2 mb-2">
                  <TbCurrencyNaira className="h-8 w-8 sm:h-10 sm:w-10 text-green-600 flex-shrink-0" />
                  <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white break-words leading-none">
                    {program.fee ? program.fee.replace(/₦/g, '').trim() : 'N/A'}
                  </p>
                </div>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  Application fee
                </p>
              </div>

              <div className="text-center md:text-left">
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                  Duration
                </p>
                <div className="flex items-baseline justify-center md:justify-start gap-2 mb-2">
                  <Clock className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600 flex-shrink-0" />
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white break-words leading-none">
                    {program.duration || 'N/A'}
                  </p>
                </div>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 break-words">
                  {program.studyMode || 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              {(() => {
                const slugLower = (slug || '').toLowerCase();
                const serviceSlugLower = (program.service?.slug || '').toLowerCase();
                const serviceTitleLower = (program.service?.title || '').toLowerCase();
                const programTitleLower = (program.title || '').toLowerCase();

                const requiresSkillApplication =
                  slugLower.includes('ivet') ||
                  serviceSlugLower.includes('ivet') ||
                  slugLower.includes('professional-short') ||
                  serviceSlugLower.includes('professional-short') ||
                  serviceTitleLower.includes('professional short courses') ||
                  slugLower.includes('self-taught') ||
                  serviceSlugLower.includes('self-taught') ||
                  serviceTitleLower.includes('self taught') ||
                  serviceTitleLower.includes('self-taught');

                const requiresSubscription =
                  slugLower.includes('igbo-language') ||
                  serviceSlugLower.includes('igbo-language') ||
                  programTitleLower.includes('igbo language') ||
                  serviceTitleLower.includes('igbo language') ||
                  slugLower.includes('self-taught') ||
                  serviceSlugLower.includes('self-taught') ||
                  serviceTitleLower.includes('self taught') ||
                  serviceTitleLower.includes('self-taught');

                if (requiresSubscription) {
                  return (
                    <button
                      onClick={() => router.push(`/programs/${slug}/subscribe`)}
                      className="flex-1 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold text-base sm:text-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center"
                    >
                      <Users className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
                      Subscribe
                    </button>
                  );
                }

                return (
                  <button
                    onClick={() => {
                      if (requiresSkillApplication) {
                        router.push('/skill-application');
                      } else {
                        const searchParams = new URLSearchParams();
                        if (program.service?.slug) {
                          searchParams.set('service', program.service.slug);
                        }
                        if (slug) {
                          searchParams.set('program', slug);
                        }
                        const queryString = searchParams.toString();
                        const targetUrl = queryString
                          ? `/application?${queryString}`
                          : '/application';
                        router.push(targetUrl);
                      }
                    }}
                    className="flex-1 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold text-base sm:text-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center"
                  >
                    <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
                    Apply Now
                  </button>
                );
              })()}
              {program.service && (
                <button
                  onClick={() => router.push(`/services/${program.service.slug}`)}
                  className="flex-1 px-6 sm:px-8 py-3 sm:py-4 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-semibold text-base sm:text-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all flex items-center justify-center"
                >
                  <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
                  View All Courses
                </button>
              )}
            </div>

            <div className="mt-4 sm:mt-6 flex items-center justify-center text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
              <span className="break-words">Rolling Admissions - Apply Anytime</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
