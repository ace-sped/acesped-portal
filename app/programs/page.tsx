'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  GraduationCap, Microscope, Lightbulb, Briefcase, ArrowRight, ArrowLeft,
  Users, Award, BookOpen, Loader2
} from 'lucide-react';
import Navbar from '../components/navbar/page';
import Footer from '../components/footer/page';

// Icon mapping function
const getIconComponent = (iconName: string | null) => {
  const iconMap: { [key: string]: React.ComponentType<any> } = {
    'GraduationCap': GraduationCap,
    'Microscope': Microscope,
    'Briefcase': Briefcase,
    'Lightbulb': Lightbulb,
    'BookOpen': BookOpen,
  };
  return iconMap[iconName || ''] || GraduationCap;
};

export default function ProgramsPage() {
  const router = useRouter();
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/programs');
      const data = await response.json();
      
      if (data.success) {
        setPrograms(data.programs);
      } else {
        setError('Failed to fetch programs');
      }
    } catch (err) {
      console.error('Error fetching programs:', err);
      setError('Error loading programs');
    } finally {
      setLoading(false);
    }
  };

  const totalPrograms = programs.length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-900 to-emerald-900 text-white min-h-[50vh] flex flex-col justify-center items-center py-16">
        <div className="page-shell w-full">
          <div className="text-center max-w-4xl mx-auto">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="inline-flex items-center text-white/80 hover:text-white mb-6 sm:mb-8 transition-colors text-sm sm:text-base"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Back to Home
            </button>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 break-words">
              Our Programs
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-green-100 mb-6 sm:mb-8 break-words px-2">
              Discover world-class programs designed to prepare you for success in sustainable power and energy development
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-0 -mt-6 sm:-mt-8 relative z-10">
        <div className="page-shell">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 shadow-lg border border-gray-200 dark:border-gray-700 text-center">
              <div className="bg-green-100 dark:bg-green-900 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-0.5">{totalPrograms}</p>
              <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 break-words leading-tight">Total Programs</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 shadow-lg border border-gray-200 dark:border-gray-700 text-center">
              <div className="bg-blue-100 dark:bg-blue-900 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-0.5">1000+</p>
              <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 break-words leading-tight">Active Students</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 shadow-lg border border-gray-200 dark:border-gray-700 text-center">
              <div className="bg-purple-100 dark:bg-purple-900 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                <Award className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-0.5">95%</p>
              <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 break-words leading-tight">Success Rate</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 shadow-lg border border-gray-200 dark:border-gray-700 text-center">
              <div className="bg-orange-100 dark:bg-orange-900 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-0.5">{totalPrograms}</p>
              <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 break-words leading-tight">Programs Available</p>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Grid */}
      <section className="py-8 sm:py-12 lg:py-16 bg-gray-50 dark:bg-gray-900">
        <div className="page-shell">
          {loading ? (
            <div className="py-8 sm:py-12">
              <div className="flex flex-col items-center justify-center">
                <Loader2 className="h-10 w-10 text-green-600 animate-spin mb-3" />
                <p className="text-gray-600 dark:text-gray-400 text-base">Loading programs...</p>
                <p className="text-gray-500 dark:text-gray-500 text-xs mt-1.5">Please wait while we fetch the latest programs</p>
              </div>
              {/* Skeleton loaders */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 mt-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-700 animate-pulse">
                    <div className="flex items-center mb-4">
                      <div className="w-11 h-11 bg-gray-200 dark:bg-gray-700 rounded-lg mr-3 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-3/4" />
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/6" />
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                      <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 dark:text-red-400 break-words">{error}</p>
            </div>
          ) : programs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">No programs available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
              {programs.map((program) => {
                const Icon = getIconComponent(program.icon);
                const color = program.color || 'from-green-500 to-emerald-500';
                return (
                  <div
                    key={program.id}
                    className="group relative bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden border border-gray-200 dark:border-gray-700"
                  >
                    <div className={`absolute top-0 right-0 w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br ${color} rounded-full blur-2xl opacity-15 group-hover:opacity-25 transition-opacity`} />
                    
                    <div className="relative">
                      <div className={`inline-flex p-2 sm:p-2.5 bg-gradient-to-br ${color} rounded-lg mb-3 shadow-md`}>
                        <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-1.5 break-words leading-snug">
                        {program.title}
                      </h3>

                      {program.subtitle && (
                        <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 mb-2 font-medium break-words leading-snug">
                          {program.subtitle}
                        </p>
                      )}

                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 sm:line-clamp-3 break-words leading-relaxed">
                        {program.description}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-gray-100 dark:border-gray-700/80">
                        <span className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-500 break-words">
                          {program.totalCourses || 0} {program.totalCourses === 1 ? 'course' : 'courses'}
                        </span>
                        <button 
                          type="button"
                          onClick={() => router.push(`/programs/${program.slug}`)}
                          className="text-green-600 dark:text-green-400 font-semibold inline-flex items-center gap-0.5 text-xs sm:text-sm hover:gap-1 transition-all"
                        >
                          Explore
                          <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-green-900 to-emerald-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 break-words">
            Ready to Transform Your Future?
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-green-100 mb-8 sm:mb-12 leading-relaxed break-words">
            Join ACE-SPED and be part of sustainable solutions for Africa's developmental challenges
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <button 
              onClick={() => router.push('/application')}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white text-green-800 rounded-xl font-semibold text-base sm:text-lg hover:shadow-2xl hover:scale-105 transition-all duration-200 flex items-center justify-center group"
            >
              Apply for Admission
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => router.push('/')}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-transparent border-2 border-white text-white rounded-xl font-semibold text-base sm:text-lg hover:bg-white hover:text-green-800 transition-all duration-200"
            >
              Back to Home
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
