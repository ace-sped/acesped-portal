'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '../../components/navbar/page';
import Footer from '../../components/footer/page';
import { Calendar, Users, Clock, ArrowLeft, Video, Play, Maximize2 } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string | null;
  lead: string;
  dueDate: string;
  images: string[];
  video: string | null;
  createdAt: string;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<{ type: 'image' | 'video', src: string } | null>(null);
  const [otherProjects, setOtherProjects] = useState<any[]>([]);

  const fetchProject = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/projects/${id}`);

      if (!response.ok) {
        throw new Error('Project not found');
      }

      const data = await response.json();
      setProject(data);

      // Set initial selected media
      if (data.images && data.images.length > 0) {
        setSelectedMedia({ type: 'image', src: data.images[0] });
      } else if (data.video) {
        setSelectedMedia({ type: 'video', src: data.video });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!id) return;
    fetchProject();
  }, [id]);



  const images = useMemo(() => project?.images || [], [project]);
  const hasVideo = !!project?.video;

  // Fetch all projects for the "Other Projects" section
  useEffect(() => {
    const fetchOtherProjects = async () => {
      try {
        const response = await fetch('/api/projects');
        if (response.ok) {
          const data = await response.json();
          // Filter out the current project and show ALL others
          const others = data.filter((p: any) => p.id !== id);
          setOtherProjects(others); // Show all other projects
        }
      } catch (error) {
        console.error('Error fetching other projects:', error);
      }
    };

    if (id) {
      fetchOtherProjects();
    }
  }, [id]);

  // Reusable Other Projects Section
  const OtherProjectsSection = () => {
    if (otherProjects.length === 0) return null;

    return (
      <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-gray-200 dark:border-gray-800">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Other ACE-SPED Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {otherProjects.map((project) => (
            <Link
              href={`/projects/${project.id}`}
              key={project.id}
              className="group flex flex-col bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="relative aspect-video w-full bg-gray-100 dark:bg-gray-900 overflow-hidden">
                {project.imageSrc ? (
                  <Image
                    src={project.imageSrc}
                    alt={project.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
                      </div>
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                  <span className="text-white font-medium flex items-center gap-2">
                    View Project <ArrowLeft className="rotate-180 w-4 h-4" />
                  </span>
                </div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${project.status === 'Ongoing'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                    {project.status}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 leading-tight">
                  {project.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4">
                  {project.description}
                </p>
                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center text-sm text-gray-500 dark:text-gray-400">
                  {project.researchers} Researcher{project.researchers !== 1 ? 's' : ''} • {project.area}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-screen-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 text-center flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Project not found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">The project you are looking for does not exist, has been removed, or you do not have permission to view it.</p>
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Projects
          </Link>
        </div>
        <OtherProjectsSection />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-screen-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 dark:hover:text-emerald-200 transition-colors mb-8 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to Projects
        </Link>

        <article className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* ... (existing content) ... */}
            <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900/50 border-b lg:border-b-0 lg:border-r border-gray-100 dark:border-gray-700">
              <div className="sticky top-24 space-y-6">
                {/* Main Media Display */}
                <div className="aspect-video w-full rounded-2xl bg-black/5 dark:bg-black/20 border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm relative group">
                  {selectedMedia?.type === 'video' ? (
                    <video
                      key={selectedMedia.src}
                      autoPlay
                      src={selectedMedia.src}
                      controls
                      className="w-full h-full object-contain bg-black"
                      poster={images[0]} // Fallback to first image as poster
                    />
                  ) : (
                    selectedMedia?.src ? (
                      <Image
                        src={selectedMedia.src}
                        alt={project.title}
                        fill
                        className="object-contain"
                        priority
                        sizes="(max-width: 1024px) 100vw, 50vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No media available
                      </div>
                    )
                  )}
                </div>

                {/* Thumbnails Gallery */}
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {/* Images */}
                  {images.map((src, i) => (
                    <button
                      key={`img-${i}`}
                      onClick={() => setSelectedMedia({ type: 'image', src })}
                      className={`relative shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden transition-all duration-200 ${selectedMedia?.type === 'image' && selectedMedia.src === src
                        ? 'ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-gray-900 scale-105'
                        : 'opacity-70 hover:opacity-100 hover:scale-105'
                        }`}
                    >
                      <Image
                        src={src}
                        alt={`View ${i + 1}`}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    </button>
                  ))}

                  {/* Video Thumbnail */}
                  {project.video && (
                    <button
                      onClick={() => setSelectedMedia({ type: 'video', src: project.video! })}
                      className={`relative shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-gray-900 flex items-center justify-center transition-all duration-200 ${selectedMedia?.type === 'video'
                        ? 'ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-gray-900 scale-105'
                        : 'opacity-70 hover:opacity-100 hover:scale-105'
                        }`}
                    >
                      <Video className="w-8 h-8 text-white z-10" />
                      {/* Optional: if you have a video thumbnail image, put it here with opacity */}
                      <div className="absolute inset-0 bg-black/40" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Project Details Section */}
            <div className="p-6 sm:p-8 lg:p-12 flex flex-col">
              <div className="mb-8">
                <div className="flex items-center gap-3 text-sm font-semibold text-emerald-600 dark:text-emerald-400 mb-4 uppercase tracking-wider">
                  <span className="bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-800">
                    {new Date(project.dueDate) > new Date() ? 'Ongoing Project' : 'Completed'}
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
                  {project.title}
                </h1>

                <div className="flex flex-wrap gap-6 text-sm text-gray-600 dark:text-gray-400 border-y border-gray-100 dark:border-gray-700 py-6 mb-8">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-emerald-500" />
                    <div>
                      <span className="block font-medium text-gray-900 dark:text-white">Lead</span>
                      {project.lead}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-emerald-500" />
                    <div>
                      <span className="block font-medium text-gray-900 dark:text-white">Due Date</span>
                      {new Date(project.dueDate).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-emerald-500" />
                    <div>
                      <span className="block font-medium text-gray-900 dark:text-white">Timeline</span>
                      {Math.ceil((new Date(project.dueDate).getTime() - new Date(project.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30))} months
                    </div>
                  </div>
                </div>

                <div className="prose prose-lg prose-emerald dark:prose-invert max-w-none">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">About the Project</h3>
                  <div className="whitespace-pre-wrap text-gray-600 dark:text-gray-300 leading-relaxed">
                    {project.description || "No description provided."}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>

      {/* Other Projects Section (Visible when unlocked) */}
      <OtherProjectsSection />

      <Footer />
    </div>
  );
}
