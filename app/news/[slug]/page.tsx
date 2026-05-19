'use client'

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/components/navbar/page';
import Footer from '@/app/components/footer/page';
import { Calendar, ArrowRight, User, Loader2 } from 'lucide-react';

const defaultNewsImages = ['/images/news/1.jpg', '/images/news/2.jpg', '/images/news/3.jpg'];

interface NewsItem {
  id: string;
  category: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  image: string;
  content: string;
  tags: string[];
  slug: string;
}

const formatCategory = (category: string): string =>
  category.charAt(0) + category.slice(1).toLowerCase();

const formatDate = (date: Date | null | undefined): string => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const getImage = (imagePath: string | null | undefined, index: number = 0): string => {
  const fallback = defaultNewsImages[index % defaultNewsImages.length];
  if (!imagePath) return fallback;
  if (
    imagePath.startsWith('/') ||
    imagePath.startsWith('http://') ||
    imagePath.startsWith('https://') ||
    imagePath.startsWith('data:image/')
  ) {
    return imagePath;
  }
  return imagePath.trim() || fallback;
};

const isUnoptimizedImage = (imageSrc: string): boolean =>
  imageSrc.startsWith('data:') ||
  imageSrc.startsWith('http://') ||
  imageSrc.startsWith('https://');

export default function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const router = useRouter();
  const { slug } = React.use(params);
  const [article, setArticle] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) fetchArticle(slug);
  }, [slug]);

  const fetchArticle = async (articleSlug: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/news/${encodeURIComponent(articleSlug)}`);

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'News article not found');
      }

      const data = await response.json();
      if (!data.success || !data.news) {
        throw new Error(data.message || 'News article not found');
      }

      const item = data.news;
      setArticle({
        id: item.id,
        slug: item.slug,
        category: formatCategory(item.category),
        title: item.title,
        excerpt: item.excerpt,
        date: formatDate(item.publishedAt || item.createdAt),
        author: item.author,
        image: getImage(item.image),
        content: item.content,
        tags: Array.isArray(item.tags)
          ? item.tags
          : typeof item.tags === 'string'
            ? JSON.parse(item.tags)
            : [],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load article');
      setArticle(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      {loading ? (
        <NewsDetailLoading />
      ) : error || !article ? (
        <NewsDetailError error={error} onBack={() => router.push('/news')} />
      ) : (
        <NewsDetailArticle article={article} onBack={() => router.push('/news')} />
      )}

      <Footer />
    </div>
  );
}

function NewsDetailLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-32">
      <Loader2 className="h-12 w-12 text-green-600 animate-spin mb-4" />
      <p className="text-gray-500 dark:text-gray-400">Loading article...</p>
    </div>
  );
}

function NewsDetailError({
  error,
  onBack,
}: {
  error: string | null;
  onBack: () => void;
}) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Article not found
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
      <button
        onClick={onBack}
        className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
      >
        Back to News
      </button>
    </div>
  );
}

function NewsDetailArticle({
  article,
  onBack,
}: {
  article: NewsItem;
  onBack: () => void;
}) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button
        onClick={onBack}
        className="flex items-center text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 mb-8 transition-colors"
      >
        <ArrowRight className="h-5 w-5 mr-2 rotate-180" />
        Back to News
      </button>

      <article className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="relative aspect-video">
          <Image
            src={article.image}
            alt={article.title}
            fill
            className="object-cover"
            unoptimized={isUnoptimizedImage(article.image)}
          />
        </div>
        <div className="p-8">
          <NewsDetailMeta article={article} />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            {article.title}
          </h1>
          <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
              {article.excerpt}
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
              {article.content}
            </p>
          </div>
          {article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>
    </div>
  );
}

function NewsDetailMeta({ article }: { article: NewsItem }) {
  return (
    <div className="flex items-center flex-wrap gap-4 mb-6">
      <span className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 rounded-full text-sm font-medium">
        {article.category}
      </span>
      <NewsDetailDate date={article.date} />
      <NewsDetailAuthor author={article.author} />
    </div>
  );
}

function NewsDetailDate({ date }: { date: string }) {
  return (
    <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
      <Calendar className="h-4 w-4 mr-2" />
      {date}
    </div>
  );
}

function NewsDetailAuthor({ author }: { author: string }) {
  return (
    <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
      <User className="h-4 w-4 mr-2" />
      {author}
    </div>
  );
}
