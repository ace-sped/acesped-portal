'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  GraduationCap, Microscope, Lightbulb, Briefcase, ArrowRight, ArrowLeft,
  Users, Clock, Award, BookOpen, Loader2
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

  // Calculate stats
  const totalCourses = programs.reduce((sum, program) => sum + (program.totalCourses || 0), 0);
  const totalPrograms = programs.length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-900 to-emerald-900 text-white py-12 sm:py-16 lg:py-20">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => router.push('/')}
            className="flex items-center text-white/80 hover:text-white mb-6 sm:mb-8 transition-colors text-sm sm:text-base"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Back to Home
          </button>

          <div className="text-center max-w-4xl mx-auto">
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
      <section className="py-0 -mt-12 sm:-mt-16 relative z-10">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-xl border border-gray-200 dark:border-gray-700 text-center">
              <div className="bg-green-100 dark:bg-green-900 w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <BookOpen className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">{totalPrograms}</p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 break-words">Total Programs</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-xl border border-gray-200 dark:border-gray-700 text-center">
              <div className="bg-blue-100 dark:bg-blue-900 w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Users className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">1000+</p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 break-words">Active Students</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-xl border border-gray-200 dark:border-gray-700 text-center">
              <div className="bg-purple-100 dark:bg-purple-900 w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Award className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">95%</p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 break-words">Success Rate</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-xl border border-gray-200 dark:border-gray-700 text-center">
              <div className="bg-orange-100 dark:bg-orange-900 w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <GraduationCap className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-orange-600 dark:text-orange-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">{totalPrograms}</p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 break-words">Programs Available</p>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Grid */}
      <section className="py-12 sm:py-16 lg:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="py-12 sm:py-16 lg:py-20">
              <div className="flex flex-col items-center justify-center">
                <Loader2 className="h-12 w-12 text-green-600 animate-spin mb-4" />
                <p className="text-gray-600 dark:text-gray-400 text-lg">Loading programs...</p>
                <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">Please wait while we fetch the latest programs</p>
              </div>
              {/* Skeleton loaders */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mt-12">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-gray-700 animate-pulse">
                    <div className="flex items-center mb-6">
                      <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-xl mr-4"></div>
                      <div className="flex-1">
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-3/4"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
                    </div>
                    <div className="flex items-center justify-between mt-6">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              {programs.map((program) => {
                const Icon = getIconComponent(program.icon);
                const color = program.color || 'from-green-500 to-emerald-500';
                return (
                  <div
                    key={program.id}
                    className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden border border-gray-200 dark:border-gray-700"
                  >
                    <div className={`absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br ${color} rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity`}></div>
                    
                    <div className="relative">
                      <div className={`inline-flex p-3 sm:p-4 bg-gradient-to-br ${color} rounded-xl mb-4 sm:mb-6 shadow-lg`}>
                        <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                      </div>

                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 break-words">
                        {program.title}
                      </h3>

                      {program.subtitle && (
                        <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 mb-2 font-medium break-words">
                          {program.subtitle}
                        </p>
                      )}

                      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 line-clamp-3 break-words">
                        {program.description}
                      </p>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                        <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-500 break-words">
                          {program.totalCourses || 0} {program.totalCourses === 1 ? 'course' : 'courses'} available
                        </span>
                        <button 
                          onClick={() => router.push(`/programs/${program.slug}`)}
                          className="text-green-600 dark:text-green-400 font-semibold flex items-center group-hover:gap-2 transition-all text-sm sm:text-base"
                        >
                          Explore
                          <ArrowRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" />
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
