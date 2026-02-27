"use client"

import React, { useState, useEffect } from 'react';
import CenterLeaderLayout from '../components/CenterLeaderLayout';
import Image from 'next/image';
import { 
  Newspaper, Plus, Search, Edit, Trash2, Eye, 
  X, Check, AlertCircle, Filter, Calendar, User, Tag, Upload, Camera
} from 'lucide-react';

interface News {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  author: string;
  image: string;
  tags: any;
  publishedAt: string | null;
  isPublished: boolean;
  isFeatured: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
}

const newsCategories = ['RESEARCH', 'ACHIEVEMENT', 'EVENT', 'ANNOUNCEMENT', 'COLLABORATION'];

export default function NewsManagement() {
  const [news, setNews] = useState<News[]>([]);
  const [filteredNews, setFilteredNews] = useState<News[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: 'RESEARCH',
    excerpt: '',
    content: '',
    author: '',
    image: '',
    tags: [] as string[],
    publishedAt: '',
    isPublished: false,
    isFeatured: false,
  });

  const [tempTag, setTempTag] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    fetchNews();
  }, []);

  useEffect(() => {
    filterNews();
  }, [searchTerm, selectedCategoryFilter, selectedStatusFilter, news]);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/center-leader/news');
      const data = await response.json();
      if (data.success) {
        setNews(data.news);
      } else {
        showMessage('error', 'Failed to fetch news');
      }
    } catch (error) {
      showMessage('error', 'Error fetching news');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterNews = () => {
    let filtered = news;

    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.author.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategoryFilter !== 'ALL') {
      filtered = filtered.filter(item => item.category === selectedCategoryFilter);
    }

    if (selectedStatusFilter !== 'ALL') {
      if (selectedStatusFilter === 'PUBLISHED') {
        filtered = filtered.filter(item => item.isPublished);
      } else if (selectedStatusFilter === 'UNPUBLISHED') {
        filtered = filtered.filter(item => !item.isPublished);
      } else if (selectedStatusFilter === 'FEATURED') {
        filtered = filtered.filter(item => item.isFeatured);
      }
    }

    setFilteredNews(filtered);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleImageUpload = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      showMessage('error', 'File size must be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      showMessage('error', 'Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setFormData({ ...formData, image: base64String });
      setImagePreview(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleAddImage = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      showMessage('error', 'File size must be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      showMessage('error', 'Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setImages([...images, base64String]);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleCreateNews = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const slug = formData.slug || generateSlug(formData.title);
      const response = await fetch('/api/center-leader/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          slug,
          tags: formData.tags.length > 0 ? formData.tags : null,
          images: images.length > 0 ? images : null,
          publishedAt: formData.publishedAt || null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        showMessage('success', 'News created successfully');
        setShowCreateModal(false);
        fetchNews();
        resetForm();
      } else {
        showMessage('error', data.message || 'Failed to create news');
      }
    } catch (error) {
      showMessage('error', 'Error creating news');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNews) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/center-leader/news/${selectedNews.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.length > 0 ? formData.tags : null,
          publishedAt: formData.publishedAt || null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        showMessage('success', 'News updated successfully');
        setShowEditModal(false);
        fetchNews();
        resetForm();
      } else {
        showMessage('error', data.message || 'Failed to update news');
      }
    } catch (error) {
      showMessage('error', 'Error updating news');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNews = async () => {
    if (!selectedNews) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/center-leader/news/${selectedNews.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        showMessage('success', 'News deleted successfully');
        setShowDeleteModal(false);
        fetchNews();
      } else {
        showMessage('error', data.message || 'Failed to delete news');
      }
    } catch (error) {
      showMessage('error', 'Error deleting news');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (item: News) => {
    setSelectedNews(item);
    setFormData({
      title: item.title,
      slug: item.slug,
      category: item.category,
      excerpt: item.excerpt,
      content: item.content,
      author: item.author,
      image: item.image,
      tags: Array.isArray(item.tags) ? item.tags : [],
      publishedAt: item.publishedAt ? new Date(item.publishedAt).toISOString().split('T')[0] : '',
      isPublished: item.isPublished,
      isFeatured: item.isFeatured,
    });
    setImagePreview(item.image || null);
    // Load additional images if they exist (assuming they're stored in a JSON field)
    // For now, we'll initialize with empty array and let user add more
    setImages([]);
    setShowEditModal(true);
  };

  const openDeleteModal = (item: News) => {
    setSelectedNews(item);
    setShowDeleteModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      category: 'RESEARCH',
      excerpt: '',
      content: '',
      author: '',
      image: '',
      tags: [],
      publishedAt: '',
      isPublished: false,
      isFeatured: false,
    });
    setSelectedNews(null);
    setTempTag('');
    setImagePreview(null);
    setImages([]);
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const addTag = () => {
    if (!tempTag.trim()) return;
    setFormData({
      ...formData,
      tags: [...formData.tags, tempTag.trim()],
    });
    setTempTag('');
  };

  const removeTag = (index: number) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((_, i) => i !== index),
    });
  };

  return (
    <CenterLeaderLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Manage News
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Create, edit, and manage news articles
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add News
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center ${
            message.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300' 
              : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'
          }`}>
            {message.type === 'success' ? (
              <Check className="h-5 w-5 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-2" />
            )}
            {message.text}
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search news..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
            />
          </div>
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
          >
            <option value="ALL">All Categories</option>
            {newsCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
          >
            <option value="ALL">All Status</option>
            <option value="PUBLISHED">Published</option>
            <option value="UNPUBLISHED">Unpublished</option>
            <option value="FEATURED">Featured</option>
          </select>
        </div>

        {/* News Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Title</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Category</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Author</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Views</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">
                      Loading...
                    </td>
                  </tr>
                ) : filteredNews.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No news found
                    </td>
                  </tr>
                ) : (
                  filteredNews.map((item) => (
                    <tr key={item.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="py-4 px-6">
                        <div className="font-medium text-gray-900 dark:text-white">{item.title}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{item.slug}</div>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">{item.category}</td>
                      <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">{item.author}</td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.isPublished 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                          }`}>
                            {item.isPublished ? 'Published' : 'Draft'}
                          </span>
                          {item.isFeatured && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                              Featured
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">{item.views}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(item)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create/Edit Modal - Same as admin version */}
        {(showCreateModal || showEditModal) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {showCreateModal ? 'Create News' : 'Edit News'}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={showCreateModal ? handleCreateNews : handleUpdateNews} className="p-6 space-y-6">
                {/* Image Upload - First Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Image *
                  </label>
                  <div className="flex items-center space-x-6">
                    {imagePreview ? (
                      <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-300 dark:border-gray-600">
                        <Image
                          src={imagePreview}
                          alt="Preview"
                          fill
                          className="object-cover"
                          unoptimized={imagePreview.startsWith('data:')}
                        />
                      </div>
                    ) : (
                      <div className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                        <Camera className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <input
                        type="file"
                        id={showCreateModal ? "image-upload-create" : "image-upload-edit"}
                        accept="image/*"
                        onChange={(e) => e.target.files && handleImageUpload(e.target.files[0])}
                        className="hidden"
                      />
                      <label
                        htmlFor={showCreateModal ? "image-upload-create" : "image-upload-edit"}
                        className="cursor-pointer inline-flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                      >
                        <Upload className="h-5 w-5 mr-2" />
                        Upload Image
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Max size: 5MB. Formats: JPG, PNG, GIF
                      </p>
                      {!formData.image && (
                        <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                          Image is required
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Additional Images */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Additional Images
                  </label>
                  <div className="space-y-4">
                    {/* Display uploaded images */}
                    {images.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {images.map((img, index) => (
                          <div key={index} className="relative group">
                            <div className="relative w-full h-32 rounded-lg overflow-hidden border-2 border-gray-300 dark:border-gray-600">
                              <Image
                                src={img}
                                alt={`Additional image ${index + 1}`}
                                fill
                                className="object-cover"
                                unoptimized={img.startsWith('data:')}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Add more images button */}
                    <div>
                      <input
                        type="file"
                        id={showCreateModal ? "add-images-create" : "add-images-edit"}
                        accept="image/*"
                        onChange={(e) => e.target.files && handleAddImage(e.target.files[0])}
                        className="hidden"
                        multiple
                      />
                      <label
                        htmlFor={showCreateModal ? "add-images-create" : "add-images-edit"}
                        className="cursor-pointer inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Plus className="h-5 w-5 mr-2" />
                        Add More Images
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        You can add multiple images. Max size: 5MB each.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => {
                        setFormData({ ...formData, title: e.target.value });
                        if (!formData.slug || formData.slug === generateSlug(formData.title)) {
                          setFormData({ ...formData, title: e.target.value, slug: generateSlug(e.target.value) });
                        } else {
                          setFormData({ ...formData, title: e.target.value });
                        }
                      }}
                      className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Slug *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category *
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                    >
                      {newsCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Author *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Published Date
                    </label>
                    <input
                      type="date"
                      value={formData.publishedAt}
                      onChange={(e) => setFormData({ ...formData, publishedAt: e.target.value })}
                      className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Excerpt *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                    placeholder="Brief summary of the news article..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Content *
                  </label>
                  <textarea
                    required
                    rows={8}
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                    placeholder="Full content of the news article..."
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tags
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={tempTag}
                      onChange={(e) => setTempTag(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                      placeholder="Add tag..."
                      className="flex-1 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span key={index} className="inline-flex items-center px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(index)}
                          className="ml-2 text-gray-500 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isPublished"
                      checked={formData.isPublished}
                      onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isPublished" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Published
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isFeatured"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isFeatured" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Featured
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setShowEditModal(false);
                      resetForm();
                    }}
                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : showCreateModal ? 'Create News' : 'Update News'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && selectedNews && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Delete News
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete "{selectedNews.title}"? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteNews}
                  disabled={loading}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </CenterLeaderLayout>
  );
}

