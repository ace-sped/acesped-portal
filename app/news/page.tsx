'use client'

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/components/navbar/page';
import Footer from '@/app/components/footer/page';
import { 
  Calendar, ArrowRight, Search, Filter, 
  Clock, User, Tag, ChevronRight, Loader2
} from 'lucide-react';

const defaultNewsImages = ['/images/news/1.jpg', '/images/news/2.jpg', '/images/news/3.jpg'];

interface NewsItem {
  id: string;
  category: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  image: string | any;
  content: string;
  tags: string[];
  slug: string;
}

const categories = ['All', 'Research', 'Achievement', 'Event', 'Announcement', 'Collaboration'];

// Helper function to format category from enum to display format
const formatCategory = (category: string): string => {
  return category.charAt(0) + category.slice(1).toLowerCase();
};

// Helper function to format date
const formatDate = (date: Date | null | undefined): string => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

// Helper function to get image
const getImage = (imagePath: string | null | undefined, index: number = 0) => {
  const fallback = defaultNewsImages[index % defaultNewsImages.length];

  if (!imagePath) {
    return fallback;
  }

  if (typeof imagePath === 'object') {
    return imagePath;
  }

  if (typeof imagePath === 'string') {
    if (imagePath.startsWith('data:image/')) {
      return imagePath;
    }
    if (imagePath.startsWith('/') || imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    return imagePath.trim();
  }

  return fallback;
};

// Helper function to check if image needs unoptimized prop
const isUnoptimizedImage = (imageSrc: string | any): boolean => {
  if (typeof imageSrc === 'object') return false; // Imported images
  if (typeof imageSrc === 'string') {
    // Base64 images or external URLs need unoptimized
    return imageSrc.startsWith('data:') || 
           imageSrc.startsWith('http://') || 
           imageSrc.startsWith('https://');
  }
  return false;
};

export default function NewsPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/news');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('News API response:', data);
      
      if (data.success && data.news) {
        // Transform database data to component format
        const news = Array.isArray(data.news) ? data.news.map((item: any, index: number) => ({
          id: item.id,
          slug: item.slug,
          category: formatCategory(item.category),
          title: item.title,
          excerpt: item.excerpt,
          date: formatDate(item.publishedAt || item.createdAt),
          author: item.author,
          image: getImage(item.image, index),
          content: item.content,
          tags: Array.isArray(item.tags) 
            ? item.tags 
            : typeof item.tags === 'string' 
              ? JSON.parse(item.tags) 
              : [],
        })) : [];
        console.log(`Transformed ${news.length} news items`);
        console.log('News images:', news.map((n: NewsItem) => ({ title: n.title, image: typeof n.image === 'string' ? n.image : 'imported' })));
        setNewsData(news);
      } else {
        console.error('Failed to fetch news:', data.message || data.error || 'Unknown error');
        console.error('Response data:', data);
        setNewsData([]);
      }
    } catch (error: any) {
      console.error('Error fetching news:', error);
      console.error('Error details:', error.message || error);
      setNewsData([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredNews = newsData.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  if (selectedNews) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        
        {/* News Detail */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <button
            onClick={() => setSelectedNews(null)}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 mb-8 transition-colors"
          >
            <ArrowRight className="h-5 w-5 mr-2 rotate-180" />
            Back to News
          </button>

          <article className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="relative aspect-video">
              <Image 
                src={selectedNews.image} 
                alt={selectedNews.title}
                fill
                className="object-cover"
                unoptimized={isUnoptimizedImage(selectedNews.image)}
              />
            </div>
            
            <div className="p-8">
              <div className="flex items-center flex-wrap gap-4 mb-6">
                <span className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 rounded-full text-sm font-medium">
                  {selectedNews.category}
                </span>
                <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  {selectedNews.date}
                </div>
                <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                  <User className="h-4 w-4 mr-2" />
                  {selectedNews.author}
                </div>
              </div>

              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
                {selectedNews.title}
              </h1>

              <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                  {selectedNews.excerpt}
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {selectedNews.content}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 mb-8">
                {selectedNews.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setSelectedNews(null)}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center"
                >
                  <ArrowRight className="h-5 w-5 mr-2 rotate-180" />
                  Back to All News
                </button>
              </div>
            </div>
          </article>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-linear-to-br from-green-900 to-emerald-900 text-white py-20">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              News & Events
            </h1>
            <p className="text-xl text-green-100 max-w-2xl mx-auto">
              Stay updated with the latest happenings, achievements, and upcoming events at ACE-SPED
            </p>
          </div>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="py-8 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search news..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* News Grid */}
      <section className="py-16">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-12 w-12 text-green-600 animate-spin mb-4" />
              <p className="text-xl text-gray-500 dark:text-gray-400">
                Loading news...
              </p>
            </div>
          ) : filteredNews.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-gray-500 dark:text-gray-400 mb-2">
                {newsData.length === 0 
                  ? 'No news found in the database. Please add news articles to see them here.'
                  : 'No news found matching your criteria.'}
              </p>
              {newsData.length === 0 && (
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Make sure news articles are marked as published (isPublished: true) in the database.
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredNews.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedNews(item)}
                  className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer"
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
                  <div className="p-6">
                    <div className="flex items-center mb-3">
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 rounded-full text-sm font-medium">
                        {item.category}
                      </span>
                      <span className="ml-auto text-sm text-gray-500 dark:text-gray-400 flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {item.date}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                      {item.excerpt}
                    </p>
                    <div className="flex items-center text-green-600 dark:text-green-400 font-semibold group-hover:gap-2 transition-all">
                      Read More
                      <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

