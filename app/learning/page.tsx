'use client'

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Play, BookOpen, Clock, Users, CheckCircle, 
  ArrowLeft, Loader2, AlertTriangle, Video, 
  FileText, Download, Share2, Star
} from 'lucide-react';
import Navbar from '@/app/components/navbar/page';
import Footer from '@/app/components/footer/page';

interface VideoLesson {
  id: string;
  title: string;
  description?: string;
  videoUrl: string;
  duration?: string;
  thumbnail?: string;
  order: number;
  isCompleted?: boolean;
}

interface CourseModule {
  id: string;
  title: string;
  description?: string;
  videos: VideoLesson[];
  order: number;
}

interface CourseData {
  id: string;
  title: string;
  slug: string;
  overview: string;
  modules: CourseModule[];
  program?: {
    title: string;
    slug: string;
  };
}

function LearningPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseSlug = searchParams.get('course');
  const [course, setCourse] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoLesson | null>(null);
  const [completedVideos, setCompletedVideos] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (courseSlug) {
      fetchCourseData(courseSlug);
    } else {
      // If no course specified, try to get from sessionStorage or show all subscriptions
      const savedCourseSlug = sessionStorage.getItem('subscribedCourseSlug');
      if (savedCourseSlug) {
        fetchCourseData(savedCourseSlug);
      } else {
        setError('No course specified. Please select a course from your subscriptions.');
        setLoading(false);
      }
    }
  }, [courseSlug]);

  const fetchCourseData = async (slug: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch course details
      const response = await fetch(`/api/courses/${slug}`);
      const data = await response.json();

      if (response.ok && data.success && data.course) {
        // For now, we'll create mock video data
        // In production, this would come from the database
        const courseData: CourseData = {
          id: data.course.id,
          title: data.course.title,
          slug: data.course.slug,
          overview: data.course.overview || '',
          program: data.course.program ? {
            title: data.course.program.title,
            slug: data.course.program.slug,
          } : undefined,
          modules: [
            {
              id: '1',
              title: 'Introduction',
              description: 'Get started with the course',
              order: 1,
              videos: [
                {
                  id: '1-1',
                  title: 'Welcome to the Course',
                  description: 'Introduction and course overview',
                  videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Placeholder
                  duration: '5:30',
                  order: 1,
                },
                {
                  id: '1-2',
                  title: 'Course Structure',
                  description: 'Understanding the course layout',
                  videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Placeholder
                  duration: '8:15',
                  order: 2,
                },
              ],
            },
            {
              id: '2',
              title: 'Core Concepts',
              description: 'Learn the fundamentals',
              order: 2,
              videos: [
                {
                  id: '2-1',
                  title: 'Understanding the Basics',
                  description: 'Core concepts explained',
                  videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Placeholder
                  duration: '12:45',
                  order: 1,
                },
                {
                  id: '2-2',
                  title: 'Advanced Topics',
                  description: 'Diving deeper into the subject',
                  videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Placeholder
                  duration: '15:20',
                  order: 2,
                },
              ],
            },
          ],
        };

        setCourse(courseData);
        // Set first video as selected by default
        if (courseData.modules.length > 0 && courseData.modules[0].videos.length > 0) {
          setSelectedVideo(courseData.modules[0].videos[0]);
        }
      } else {
        setError(data.message || 'Course not found or you are not subscribed to this course.');
      }
    } catch (err: any) {
      console.error('Error fetching course data:', err);
      setError('Failed to load course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVideoSelect = (video: VideoLesson) => {
    setSelectedVideo(video);
    // Scroll to top of video player
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const markVideoComplete = (videoId: string) => {
    setCompletedVideos(prev => new Set(prev).add(videoId));
    // In production, this would save to the database
  };

  const getProgress = () => {
    if (!course) return 0;
    const totalVideos = course.modules.reduce((acc, module) => acc + module.videos.length, 0);
    if (totalVideos === 0) return 0;
    return Math.round((completedVideos.size / totalVideos) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-green-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading course content...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-2xl mx-auto px-4">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Error Loading Course</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
            <button
              onClick={() => router.push('/programs')}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Browse Programs
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!course) {
    return null;
  }

  const progress = getProgress();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <button
                onClick={() => router.push(course.program ? `/programs/${course.program.slug}` : '/programs')}
                className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 mb-2 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to {course.program ? course.program.title : 'Programs'}
              </button>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                {course.title}
              </h1>
              {course.program && (
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {course.program.title}
                </p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400">Progress</p>
                <p className="text-2xl font-bold text-green-600">{progress}%</p>
              </div>
              <div className="w-16 h-16 relative">
                <svg className="transform -rotate-90 w-16 h-16">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    className="text-gray-200 dark:text-gray-700"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 28}`}
                    strokeDashoffset={`${2 * Math.PI * 28 * (1 - progress / 100)}`}
                    className="text-green-600 transition-all duration-300"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Player Section */}
          <div className="lg:col-span-2">
            {selectedVideo ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                {/* Video Player */}
                <div className="relative aspect-video bg-black">
                  <iframe
                    src={selectedVideo.videoUrl}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={selectedVideo.title}
                  />
                </div>

                {/* Video Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {selectedVideo.title}
                      </h2>
                      {selectedVideo.description && (
                        <p className="text-gray-600 dark:text-gray-400">
                          {selectedVideo.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => markVideoComplete(selectedVideo.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          completedVideos.has(selectedVideo.id)
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                        title="Mark as complete"
                      >
                        <CheckCircle className="h-5 w-5" />
                      </button>
                      <button
                        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        title="Share"
                      >
                        <Share2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {selectedVideo.duration && (
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Clock className="h-4 w-4 mr-2" />
                      Duration: {selectedVideo.duration}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
                <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Select a video to start learning</p>
              </div>
            )}

            {/* Course Overview */}
            {course.overview && (
              <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-green-600" />
                  Course Overview
                </h3>
                <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">
                  {course.overview}
                </p>
              </div>
            )}
          </div>

          {/* Course Content Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-green-600" />
                Course Content
              </h3>

              <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                {course.modules.map((module) => (
                  <div key={module.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {module.order}. {module.title}
                    </h4>
                    {module.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {module.description}
                      </p>
                    )}
                    <div className="space-y-2">
                      {module.videos.map((video) => {
                        const isActive = selectedVideo?.id === video.id;
                        const isCompleted = completedVideos.has(video.id);
                        return (
                          <button
                            key={video.id}
                            onClick={() => handleVideoSelect(video)}
                            className={`w-full text-left p-3 rounded-lg transition-all ${
                              isActive
                                ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-500'
                                : 'bg-gray-50 dark:bg-gray-700/50 border-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 mt-1">
                                {isCompleted ? (
                                  <CheckCircle className="h-5 w-5 text-green-600" />
                                ) : (
                                  <Play className="h-5 w-5 text-gray-400" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium ${
                                  isActive
                                    ? 'text-green-700 dark:text-green-300'
                                    : 'text-gray-900 dark:text-white'
                                }`}>
                                  {video.title}
                                </p>
                                {video.duration && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {video.duration}
                                  </p>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function LearningPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-green-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading course content...</p>
          </div>
        </div>
        <Footer />
      </div>
    }>
      <LearningPageContent />
    </Suspense>
  );
}
