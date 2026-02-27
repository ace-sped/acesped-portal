'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '../components/navbar/page';
import Footer from '../components/footer/page';
import { Search, Filter, Calendar, Users, Clock, ArrowRight, FolderGit2, Lock } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  status: 'Ongoing' | 'Completed' | 'Planned';
  duration: string;
  researchers: number;
  area: string;
  imageSrc: string;
  subImages?: string[];
  isProtected?: boolean;
}

const statusStyles: Record<string, string> = {
  Ongoing: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
  Completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
  Planned: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
};

export default function ProjectsPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<string>('All');
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);

  useEffect(() => {
    const checkAccessAndFetchProjects = async () => {
      // Check for access code in sessionStorage
      const accessCode = sessionStorage.getItem('project_access_code');
      
      if (!accessCode) {
        // No access code found, redirect to access page
        router.push('/access');
        return;
      }

      setIsCheckingAccess(false);
      setIsLoading(true);

      try {
        // Verify the access code is still valid
        const verifyResponse = await fetch('/api/verify-access-code', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            accessCode: accessCode,
          }),
        });

        const verifyData = await verifyResponse.json();

        if (!verifyResponse.ok || !verifyData.valid) {
          // Access code is invalid or expired
          sessionStorage.removeItem('project_access_code');
          router.push('/access');
          return;
        }

        // Access code is valid - fetch ALL projects
        const projectsResponse = await fetch('/api/projects');
        
        if (projectsResponse.ok) {
          const projectsData = await projectsResponse.json();
          setProjects(projectsData);
          setError(null);
        } else {
          const data = await projectsResponse.json();
          setError(data.error || 'Failed to fetch projects');
          setProjects([]);
        }
      } catch (error) {
        console.error('Failed to fetch projects:', error);
        // On network error, keep the page but show error
        setError('Failed to connect to the server');
      } finally {
        setIsLoading(false);
      }
    };

    checkAccessAndFetchProjects();
  }, [router]);

  // Re-validate access code when page becomes visible (tab focus)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const accessCode = sessionStorage.getItem('project_access_code');
        if (!accessCode) {
          router.push('/access');
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [router]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((p) => {
      const matchesQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.area.toLowerCase().includes(q);
      const matchesStatus = status === 'All' || p.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [query, status, projects]);

  const handleSignOut = () => {
    sessionStorage.removeItem('project_access_code');
    router.push('/access');
  };

  // Show loading while checking access
  if (isCheckingAccess) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Navbar />

      {/* Hero */}
      <div className="relative bg-linear-to-br from-green-800 via-emerald-800 to-teal-900 text-white py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-green-400/20 blur-3xl mix-blend-screen" />
          <div className="absolute top-1/2 left-1/4 w-72 h-72 rounded-full bg-emerald-400/20 blur-3xl mix-blend-screen animate-pulse" />
          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-teal-400/20 blur-3xl mix-blend-screen" />
        </div>

        <div className="relative z-10 max-w-screen-2xl mx-auto">
          <div className="flex items-start justify-between gap-4">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-800/40 rounded-full border border-emerald-700/60 backdrop-blur-sm mb-6">
                <FolderGit2 className="w-4 h-4 text-emerald-200" />
                <span className="text-sm text-emerald-100">Research & Innovation</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                Projects
              </h1>
              <p className="text-emerald-100 text-lg leading-relaxed">
                Explore ongoing and upcoming projects across power systems, renewables,
                energy storage, and policy.
              </p>
            </div>
            
            {/* Sign Out Button */}
            <button
              onClick={handleSignOut}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg transition-colors text-white text-sm font-medium"
            >
              <Lock className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-screen-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        {/* Mobile Sign Out Button */}
        <div className="sm:hidden mb-4">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-xl transition-colors text-gray-700 dark:text-gray-300 text-sm font-medium shadow-sm"
          >
            <Lock className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5 mb-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Search
              </label>
              <div className="mt-2 flex items-center gap-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2">
                <Search className="h-4 w-4 text-gray-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search projects..."
                  className="w-full bg-transparent outline-none text-sm text-gray-900 dark:text-white placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="md:col-span-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Status
              </label>
              <div className="mt-2 flex items-center gap-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-transparent outline-none text-sm text-gray-900 dark:text-white"
                >
                  <option value="All">All Statuses</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Planned">Planned</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 h-96 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {error ? (
              <div className="lg:col-span-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800 p-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-800/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="h-8 w-8 text-red-500 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">Access Denied</h3>
                <p className="text-red-600 dark:text-red-400 max-w-md mx-auto">{error}</p>

              </div>
            ) : filtered.length === 0 ? (
              <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-10 text-center">
                <p className="text-gray-600 dark:text-gray-400">No projects found matching your criteria.</p>

              </div>
            ) : (
              filtered.map((p) => (
                <div
                  key={p.id}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
                >
                  {/* Image */}
                  <div className="relative h-64 sm:h-72 w-full shrink-0 bg-gray-100 dark:bg-gray-800">
                    <Image
                      src={p.imageSrc}
                      alt={p.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/45 via-black/10 to-transparent" />
                    <div className="absolute top-3 right-3 flex items-center gap-2">
                      {p.isProtected && (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-900/60 backdrop-blur-sm text-white" title="Protected Project">
                          <Lock className="w-3 h-3" />
                        </span>
                      )}
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[p.status] || 'bg-gray-100 text-gray-800'}`}
                      >
                        {p.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <div className="mb-3 flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                        {p.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-3">
                        {p.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-sm shrink-0">
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="truncate">{p.duration}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="truncate">{p.researchers} researchers</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="truncate">{p.area}</span>
                      </div>
                    </div>

                    <Link
                      href={`/projects/${p.id}`}
                      className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-300 hover:underline"
                    >
                      View details <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

