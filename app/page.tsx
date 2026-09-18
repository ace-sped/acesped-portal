"use client"

import React, { useState, useEffect } from 'react';
import Image, { StaticImageData } from 'next/image';
import { useRouter } from 'next/navigation';
import Navbar from './components/navbar/page';
import Footer from './components/footer/page';
import Image1 from '@/public/images/news/1.jpg';
import Image2 from '@/public/images/news/2.jpg';
import Image3 from '@/public/images/news/3.jpg';
import Image4 from '@/public/images/lab.jpg';
import Acesped from '@/public/images/acesped.png';
import {
  BookOpen, Users, Award, TrendingUp, Microscope, Globe,
  Lightbulb, Target, ArrowRight, Calendar, MapPin, Clock,
  GraduationCap, Briefcase, Zap, Heart, Star, ChevronLeft, ChevronRight, Youtube, X, Lock
} from 'lucide-react';

type HeroSlide = {
  title: string;
  subtitle?: string;
  description: string;
  image: string;
  ctaPrimaryText?: string;
  ctaPrimaryHref?: string;
  ctaSecondaryText?: string;
  ctaSecondaryHref?: string;
};


export default function Home() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [newsData, setNewsData] = useState<any[]>([]);
  const [loadingNews, setLoadingNews] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [youtubeVideos, setYoutubeVideos] = useState<any[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [heroLoading, setHeroLoading] = useState(true);


  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Auto-play functionality
  useEffect(() => {
    if (!heroSlides.length) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [currentSlide, heroSlides.length]);

  // Fetch hero slides from database
  useEffect(() => {
    const fetchHeroSlides = async () => {
      try {
        const response = await fetch('/api/hero?isActive=true');
        const data = await response.json();
        if (data.success && Array.isArray(data.slides)) {
          const mappedSlides: HeroSlide[] = data.slides.map((slide: any) => ({
            title: slide.title,
            subtitle: slide.subtitle ?? '',
            description: slide.description,
            image: slide.image as string,
            ctaPrimaryText: slide.ctaPrimaryText ?? undefined,
            ctaPrimaryHref: slide.ctaPrimaryHref ?? undefined,
            ctaSecondaryText: slide.ctaSecondaryText ?? undefined,
            ctaSecondaryHref: slide.ctaSecondaryHref ?? undefined,
          }));
          setHeroSlides(mappedSlides);
          setCurrentSlide(0);
        }
      } catch (error) {
        console.error('Error fetching hero slides:', error);
      } finally {
        setHeroLoading(false);
      }
    };

    fetchHeroSlides();
  }, []);

  // Fetch services data
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoadingServices(true);
        const response = await fetch('/api/services');
        const data = await response.json();

        if (data.success && data.services && Array.isArray(data.services)) {
          setServices(data.services);
        }
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoadingServices(false);
      }
    };

    fetchServices();
  }, []);

  // Fetch news data from database
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoadingNews(true);
        // Fetch all published news from database
        const response = await fetch('/api/news?isPublished=true');
        const data = await response.json();

        if (data.success && data.news && Array.isArray(data.news)) {
          // Prioritize featured news, then fill with latest published news (up to 3 items)
          let fetchedNews = data.news
            .filter((item: any) => item.isFeatured)
            .slice(0, 3);

          if (fetchedNews.length < 3) {
            const additional = data.news
              .filter((item: any) => !item.isFeatured)
              .slice(0, 3 - fetchedNews.length);
            fetchedNews = [...fetchedNews, ...additional];
          }

          setNewsData(fetchedNews);
        } else {
          // If API call fails or returns no data, set empty array
          setNewsData([]);
        }
      } catch (error) {
        console.error('Error fetching news from database:', error);
        setNewsData([]);
      } finally {
        setLoadingNews(false);
      }
    };

    fetchNews();
  }, []);

  // Fetch YouTube videos
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoadingVideos(true);
        const response = await fetch('/api/youtube?isPublished=true&limit=3');
        const data = await response.json();

        if (data.success && data.videos && Array.isArray(data.videos)) {
          setYoutubeVideos(data.videos);
        }
      } catch (error) {
        console.error('Error fetching YouTube videos:', error);
      } finally {
        setLoadingVideos(false);
      }
    };

    fetchVideos();
  }, []);

  // Helper function to map icon names to components
  const getIconComponent = (iconName: string | null) => {
    const iconMap: { [key: string]: any } = {
      'GraduationCap': GraduationCap,
      'Microscope': Microscope,
      'Briefcase': Briefcase,
      'Lightbulb': Lightbulb,
      'BookOpen': BookOpen,
      'Zap': Zap,
    };
    return iconMap[iconName || 'BookOpen'] || BookOpen;
  };

  // Fallback programs data
  const fallbackPrograms = [
    {
      icon: GraduationCap,
      title: 'ACE-SPED M.Eng/M.Sc and Ph.D. Programs',
      description: 'ACE-SPED Impactful Educational Research and Development Programs',
      courses: 9,
      color: 'from-green-500 to-emerald-500',
      slug: 'ace-sped-graduate-programs',
    },
    {
      icon: Microscope,
      title: 'ACE-SPED  Innovation, Vocational & Entrepreneurship Training (IVET-HUB)',
      description: 'Web Development | Data Analysis | Cyber Security and More...',
      courses: 10,
      color: 'from-blue-500 to-cyan-500',
      slug: 'ace-sped-ivet-hub',
    },
    {
      icon: Briefcase,
      title: 'Sales & Repairs of Gadgets',
      description: 'Laptop Repair | Printers Repair | Computer Accessories and More...',
      courses: 4,
      color: 'from-orange-500 to-red-500',
      slug: 'sales-repairs-gadgets',
    },
  ];

  // Use fetched services or fallback to static programs
  const programs = services.length > 0
    ? services.map((service: any) => ({
      icon: getIconComponent(service.icon),
      title: service.title,
      description: service.subtitle || service.description.substring(0, 100) + '...',
      courses: service.totalCourses || 0,
      color: service.color || 'from-green-500 to-emerald-500',
      slug: service.slug,
    }))
    : fallbackPrograms;

  const stats = [
    { label: 'Students Enrolled', value: '25,000+', icon: Users },
    { label: 'Expert Faculty', value: '1,200+', icon: Award },
    { label: 'Research Projects', value: '500+', icon: Microscope },
    { label: 'Global Partners', value: '150+', icon: Globe },
  ];


  // Helper function to get image
  const getImage = (imagePath: string | null | undefined, index: number = 0) => {
    const defaults = [Image1, Image2, Image3];
    if (!imagePath) return defaults[index % defaults.length];
    if (typeof imagePath === 'object') return imagePath;
    if (typeof imagePath === 'string' && imagePath.startsWith('data:image/')) return imagePath;
    if (typeof imagePath === 'string' && (imagePath.startsWith('/') || imagePath.startsWith('http://') || imagePath.startsWith('https://'))) {
      return imagePath;
    }
    return defaults[index % defaults.length];
  };

  // Helper function to format category
  const formatCategory = (category: string): string => {
    return category.charAt(0) + category.slice(1).toLowerCase();
  };

  // Helper function to format date
  const formatDate = (date: Date | null | undefined): string => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Helper function to check if image needs unoptimized prop
  const isUnoptimizedImage = (imageSrc: string | any): boolean => {
    if (typeof imageSrc === 'object') return false;
    if (typeof imageSrc === 'string') {
      return imageSrc.startsWith('data:') ||
        imageSrc.startsWith('http://') ||
        imageSrc.startsWith('https://');
    }
    return false;
  };

  // Use fetched news from database
  const displayNews: {
    category: string;
    title: string;
    excerpt: string;
    date: string;
    image: string | StaticImageData;
    slug?: string;
  }[] = newsData.map((item: any, index: number) => ({
    category: formatCategory(item.category),
    title: item.title,
    excerpt: item.excerpt,
    date: formatDate(item.publishedAt || item.createdAt),
    image: getImage(item.image, index),
    slug: item.slug,
  }));

  const features = [
    {
      icon: Target,
      title: 'Career-Focused',
      description: '95% employment rate within 6 months of graduation',
    },
    {
      icon: Globe,
      title: 'Global Network',
      description: 'Partnership with 150+ universities across 60 countries',
    },
    {
      icon: Zap,
      title: 'Innovation Hub',
      description: 'State-of-the-art labs and research facilities',
    },
    {
      icon: Heart,
      title: 'Student Support',
      description: '24/7 counseling, mentorship, and wellness programs',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900 dark:bg-gray-900">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      {(heroLoading || heroSlides.length > 0) && (
      <section className="relative isolate overflow-hidden bg-gray-950 md:min-h-[calc(100svh-5.5rem)]">
        <div className="flex flex-col md:block md:min-h-[calc(100svh-5.5rem)]">

          {/* ── Slides: top on mobile (height follows image), full-bleed on desktop ── */}
          <div className="relative z-0 w-full shrink-0 md:absolute md:inset-0 md:min-h-[calc(100svh-5.5rem)]">
            {heroSlides.map((slide, index) => {
              const isActive = index === currentSlide;
              return (
                <div
                  key={index}
                  className={`w-full transition-opacity duration-1000 ease-in-out ${
                    isActive
                      ? 'relative opacity-100 md:absolute md:inset-0'
                      : 'pointer-events-none absolute inset-0 opacity-0'
                  }`}
                >
                  {/* Mobile: natural height so content sits flush under the image */}
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    width={1920}
                    height={1080}
                    sizes="100vw"
                    priority={index === 0}
                    quality={90}
                    className="h-auto w-full object-contain object-top md:hidden"
                  />
                  {/* Desktop: fill hero */}
                  <Image
                    src={slide.image}
                    alt=""
                    fill
                    sizes="100vw"
                    priority={index === 0}
                    quality={90}
                    aria-hidden
                    className="hidden object-cover object-center md:block"
                  />
                  <div className="absolute inset-0 hidden bg-gradient-to-t from-gray-950/80 via-gray-950/35 to-gray-950/20 md:block" />
                  <div className="absolute inset-0 hidden bg-gradient-to-r from-gray-950/25 via-transparent to-transparent md:block" />
                </div>
              );
            })}

            <div className="pointer-events-none absolute inset-0 z-0 hidden overflow-hidden md:block">
              <div className="absolute top-1/4 right-1/4 h-96 w-96 rounded-full bg-emerald-400/20 blur-3xl animate-pulse" />
              <div className="absolute bottom-1/3 left-1/4 h-80 w-80 rounded-full bg-green-400/20 blur-3xl animate-pulse [animation-delay:2s]" />
            </div>
          </div>

          {/* ── Main content: under slides on mobile, centered overlay on desktop ── */}
          <div className="relative z-10 flex flex-1 flex-col md:min-h-[calc(100svh-5.5rem)]">
            <div className="flex flex-1 items-start justify-center px-4 pb-5 pt-3 sm:px-6 sm:pb-6 sm:pt-4 md:items-center md:py-10">
              <div className="w-full max-w-2xl text-center">
                {heroLoading ? (
                  <div className="space-y-3 animate-pulse pb-2">
                    <div className="mx-auto h-3 w-36 rounded-full bg-white/20" />
                    <div className="mx-auto h-7 w-3/4 rounded-lg bg-white/20" />
                    <div className="mx-auto h-3 w-2/3 rounded bg-white/10" />
                    <div className="flex justify-center gap-2 pt-1">
                      <div className="h-8 w-24 rounded-lg bg-white/20" />
                      <div className="h-8 w-24 rounded-lg bg-white/10" />
                    </div>
                  </div>
                ) : (
                  <div
                    key={currentSlide}
                    className="animate-in fade-in zoom-in-95 duration-700"
                  >
                    {heroSlides[currentSlide]?.subtitle && (
                      <div className="mb-2.5 inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/20 px-2.5 py-1 backdrop-blur-sm">
                        <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-emerald-400" />
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-300 sm:text-xs">
                          {heroSlides[currentSlide].subtitle}
                        </span>
                      </div>
                    )}

                    <h1 className="text-balance text-lg font-bold leading-snug text-white drop-shadow-md sm:text-xl md:text-2xl">
                      {heroSlides[currentSlide]?.title}
                    </h1>

                    <p className="mx-auto mt-2 max-w-xl text-pretty text-xs leading-relaxed text-gray-200/85 line-clamp-2 sm:text-sm">
                      {heroSlides[currentSlide]?.description}
                    </p>

                    <div className="mt-4 flex flex-row flex-wrap justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => router.push(heroSlides[currentSlide]?.ctaPrimaryHref || '/services')}
                        className="group inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-emerald-900/40 transition-all duration-200 hover:scale-[1.03] hover:bg-emerald-400 active:scale-[0.98] sm:text-sm"
                      >
                        {heroSlides[currentSlide]?.ctaPrimaryText || 'Explore Programs'}
                        <ArrowRight className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => router.push(heroSlides[currentSlide]?.ctaSecondaryHref || '/about')}
                        className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/30 bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:border-white/50 hover:bg-white/20 sm:text-sm"
                      >
                        {heroSlides[currentSlide]?.ctaSecondaryText || 'Learn More'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Bottom bar: stats + slide controls ── */}
            <div className="relative z-10 border-t border-white/10 bg-black/30 backdrop-blur-md">
              <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4">
                <div className="hidden items-center gap-6 text-white sm:flex lg:gap-8">
                  {stats.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                      <div key={i} className="flex items-center gap-2">
                        <Icon className="h-4 w-4 shrink-0 text-emerald-400" />
                        <div>
                          <p className="text-xs font-bold leading-none text-white">{stat.value}</p>
                          <p className="mt-0.5 text-[10px] leading-none text-gray-400">{stat.label}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="ml-auto flex items-center gap-3">
                  <button
                    type="button"
                    onClick={prevSlide}
                    className="rounded-full border border-white/20 bg-white/10 p-1.5 text-white transition-all hover:scale-110 hover:bg-white/25 touch-manipulation"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>

                  <div className="flex items-center gap-1.5">
                    {heroSlides.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`rounded-full transition-all duration-300 ${
                          index === currentSlide
                            ? 'h-2 w-6 bg-emerald-400'
                            : 'h-2 w-2 bg-white/30 hover:bg-white/50'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={nextSlide}
                    className="rounded-full border border-white/20 bg-white/10 p-1.5 text-white transition-all hover:scale-110 hover:bg-white/25 touch-manipulation"
                    aria-label="Next slide"
                  >
                    <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* AboutUs Section */}
      <section id="about" className="py-12 md:py-16 lg:py-20 bg-gray-50 dark:bg-gray-950">
        <div className="page-shell">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-center">
            <div className="relative h-full">
              <div className="aspect-square max-w-md mx-auto lg:max-w-none bg-linear-to-br from-green-900 to-emerald-900 rounded-2xl shadow-xl flex items-center justify-center">
                <Image src={Acesped} alt="Research" fill className="object-cover" />
              </div>
            </div>

            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                About ACE-SPED
              </h2>
              <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                Africa Centre of Excellence for Sustainable Power and Energy Development (ACE-SPED),
                is a World Bank assisted project domiciled at the University of Nigeria, Nsukka.
                The Centre was conceptualized to proffer sustainable solutions to some developmental
                challenges peculiar to the Sub-Saharan Africa region.
              </p>
              <p>The fundamental aim of ACE-SPED is to carry out impactful educational research development and training activities in five major thematic areas:</p>
              <ul className="space-y-2.5 mb-6 mt-3 text-sm md:text-base">
                {[
                  'Electric power systems development',
                  'Renewable energy, waste-to-energy and energy conservation',
                  'Energy resources assessment and forecasting',
                  'Sustainable energy materials',
                  'Energy policy, regulation and management',
                ].map((item, index) => (
                  <li key={index} className="flex items-center text-gray-700 dark:text-gray-300">
                    <div className="h-2 w-2 bg-green-800 rounded-full mr-3"></div>
                    {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => router.push('/about')}
                className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-semibold hover:shadow-lg transition-all inline-flex items-center group"
              >
                More About Us
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>


          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section id="programs" className="py-12 md:py-16 lg:py-20 bg-white dark:bg-gray-900">
        <div className="page-shell">
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              Our Programs
            </h2>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Discover world-class programs designed to prepare you for success in your chosen field
            </p>
          </div>

          {loadingServices ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500 dark:text-gray-400">Loading programs...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
              {programs.map((program, index) => {
                const Icon = program.icon;
                return (
                  <div
                    key={index}
                    className="group relative bg-gray-50 dark:bg-gray-800 rounded-xl p-5 md:p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                  >
                    <div className={`absolute top-0 right-0 w-28 h-28 bg-linear-to-br ${program.color} rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity`}></div>

                    <div className="relative">
                      <div className={`inline-flex p-3 bg-linear-to-br ${program.color} rounded-lg mb-4 shadow-md`}>
                        <Icon className="h-6 w-6 md:h-7 md:w-7 text-white" />
                      </div>

                      <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {program.title}
                      </h3>

                      <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-4">
                        {program.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-500">
                          {program.courses} courses available
                        </span>
                        <button
                          onClick={() => router.push(`/services/${program.slug}`)}
                          className="text-green-600 dark:text-green-400 font-semibold flex items-center group-hover:gap-2 transition-all"
                        >
                          Explore
                          <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
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

      {/* Why Choose Us Section */}
      <section className="py-12 md:py-16 lg:py-20 bg-linear-to-br from-green-900 to-emerald-900 text-white">
        <div className="page-shell">
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              WHY CHOOSE ACE-SPED?
            </h2>
            <p className="text-base md:text-lg text-green-100 max-w-2xl mx-auto">
              We provide more than education - we provide a launchpad for your dreams
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-4 md:p-5 hover:bg-white/20 transition-all hover:scale-[1.02]"
                >
                  <Icon className="h-9 w-9 md:h-10 md:w-10 mb-3" />
                  <h3 className="text-base md:text-lg font-bold mb-2">{feature.title}</h3>
                  <p className="text-sm text-green-100 leading-snug">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* YouTube Section */}
      <section className="py-12 md:py-16 lg:py-20 bg-white dark:bg-gray-900">
        <div className="page-shell">
          <div className="text-center mb-10 md:mb-12">
            <div className="inline-flex items-center justify-center p-2 bg-red-100 dark:bg-red-900/30 rounded-full mb-3">
              <Youtube className="h-6 w-6 md:h-7 md:w-7 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              Watch Our Videos
            </h2>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Explore our campus, programs, and achievements through our video content
            </p>
          </div>

          {loadingVideos ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500 dark:text-gray-400">Loading videos...</p>
            </div>
          ) : youtubeVideos.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500 dark:text-gray-400">No videos available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {youtubeVideos.map((video, index) => (
                <div
                  key={video.id}
                  className="group relative bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="relative aspect-video bg-gray-900">
                    <iframe
                      className="absolute inset-0 w-full h-full"
                      src={`https://www.youtube.com/embed/${video.videoId}`}
                      title={video.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                  <div className="p-4 md:p-5">
                    <div className="flex items-center gap-2 mb-1.5">
                      {video.isFeatured && (
                        <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded text-xs font-medium">
                          Featured
                        </span>
                      )}
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-300 rounded text-xs font-medium">
                        {video.category.replace('_', ' ')}
                      </span>
                    </div>
                    <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white mb-1.5">
                      {video.title}
                    </h3>
                    {video.description && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                        {video.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <a
              href="https://www.youtube.com/@ACE-SPED"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-4 bg-red-600 text-white rounded-xl font-semibold text-lg hover:bg-red-700 hover:shadow-2xl hover:scale-105 transition-all duration-200 group"
            >
              <Youtube className="h-6 w-6 mr-2" />
              Visit Our YouTube Channel
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </section>

      {/* Research Section */}
      <section id="research" className="py-12 md:py-16 lg:py-20 bg-gray-50 dark:bg-gray-950">
        <div className="page-shell">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Leading Research & Innovation
              </h2>
              <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                Our research centers are at the forefront of scientific discovery and technological innovation. With over $100M in annual research funding, we're solving real-world problems and shaping the future.
              </p>
              <ul className="space-y-2.5 mb-6 text-sm md:text-base">
                {[
                  'AI & Machine Learning Research Center',
                  'Sustainable Energy Laboratory',
                  'Biotechnology Innovation Hub',
                  'Quantum Computing Research',
                ].map((item, index) => (
                  <li key={index} className="flex items-center text-gray-700 dark:text-gray-300">
                    <div className="h-2 w-2 bg-green-800 rounded-full mr-3"></div>
                    {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => router.push('/research')}
                className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-semibold hover:shadow-lg transition-all inline-flex items-center group"
              >
                Explore Research
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="relative">
              <div className="aspect-square max-w-md mx-auto lg:max-w-none bg-linear-to-br from-green-900 to-emerald-900 rounded-2xl shadow-xl flex items-center justify-center">
                <Image src={Image4} alt="Research" fill className="object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="relative py-12 md:py-16 lg:py-20 bg-linear-to-r from-gray-900 via-green-900 to-emerald-900 text-white overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-green-500 rounded-full mix-blend-overlay filter blur-[128px] opacity-20"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-500 rounded-full mix-blend-overlay filter blur-[128px] opacity-20"></div>
        </div>

        <div className="relative z-10 page-shell text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-5 tracking-tight">
            Our Projects
          </h2>
          <div className="text-base md:text-lg text-green-50 mb-8 max-w-3xl mx-auto leading-relaxed font-light">
            <p>
              Ace-Sped Projects showcase innovative, practical solutions across technology, engineering, and professional development fields. These projects are designed for learning, collaboration, and real-world impact.
            </p>
          </div>
          <button
            onClick={() => router.push('/projects')}
            className="px-6 py-3 bg-white text-green-900 rounded-xl font-semibold text-sm md:text-base hover:bg-green-50 hover:shadow-lg transition-all duration-300 inline-flex items-center group"
          >
            Explore Projects
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* News & Events Section */}
      <section id="news" className="py-12 md:py-16 lg:py-20 bg-white dark:bg-gray-900">
        <div className="page-shell">
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              Latest News & Events
            </h2>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Stay updated with the latest happenings, achievements, and upcoming events
            </p>
          </div>

          {loadingNews ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500 dark:text-gray-400">Loading news...</p>
            </div>
          ) : displayNews.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500 dark:text-gray-400">No news available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
              {displayNews.map((item, index) => (
                <div
                  key={item.slug || index}
                  onClick={() => item.slug && router.push(`/news/${item.slug}`)}
                  className="group bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                >
                  <div className="relative aspect-video bg-linear-to-br from-green-500 to-emerald-600">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                      unoptimized={isUnoptimizedImage(item.image)}
                    />
                  </div>
                  <div className="p-4 md:p-5">
                    <div className="flex items-center mb-2">
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 rounded-full text-sm font-medium">
                        {item.category}
                      </span>
                      <span className="ml-auto text-sm text-gray-500 dark:text-gray-500 flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {item.date}
                      </span>
                    </div>
                    <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
                      {item.excerpt}
                    </p>
                    <button className="text-green-600 dark:text-green-400 font-semibold flex items-center group-hover:gap-2 transition-all">
                      Read More
                      <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 lg:py-20 bg-linear-to-r from-green-900 to-emerald-900 text-white">
        <div className="page-shell">
          <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-base md:text-lg text-green-100 mb-8 leading-relaxed">
            Join thousands of students who have transformed their lives at AcademiaHub. Your future starts here.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => router.push('/services')}
              className="w-full sm:w-auto px-6 py-3 bg-white text-green-800 rounded-lg font-semibold text-sm md:text-base hover:shadow-lg transition-all duration-200 inline-flex items-center justify-center group"
            >
              Apply for Admission
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => router.push('/contact')}
              className="w-full sm:w-auto px-6 py-3 bg-transparent border-2 border-white text-white rounded-lg font-semibold text-sm md:text-base hover:bg-white hover:text-green-800 transition-all duration-200"
            >
              Schedule a Visit
            </button>
          </div>
          </div>
        </div>
      </section>

      <Footer />

    </div >
  );
}
