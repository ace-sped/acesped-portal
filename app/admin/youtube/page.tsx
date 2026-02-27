"use client"

import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { 
  Youtube, Plus, Search, Edit, Trash2, Eye, 
  X, Check, AlertCircle, Filter, ExternalLink
} from 'lucide-react';

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  videoId: string;
  thumbnailUrl?: string;
  category: string;
  isPublished: boolean;
  isFeatured: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

const videoCategories = ['WELCOME', 'RESEARCH', 'ACHIEVEMENT', 'EVENT', 'ANNOUNCEMENT', 'STUDENT_STORIES', 'TUTORIAL'];

export default function YouTubeManagement() {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<YouTubeVideo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [videoPreviewId, setVideoPreviewId] = useState<string>('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoId: '',
    category: 'WELCOME',
    isPublished: false,
    isFeatured: false,
    displayOrder: 0,
  });

  useEffect(() => {
    fetchVideos();
  }, []);

  useEffect(() => {
    filterVideos();
  }, [searchTerm, selectedCategoryFilter, selectedStatusFilter, videos]);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/youtube');
      const data = await response.json();
      if (data.success) {
        setVideos(data.videos || []);
      } else {
        showMessage('error', 'Failed to fetch videos');
      }
    } catch (error) {
      showMessage('error', 'Error fetching videos');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterVideos = () => {
    let filtered = videos;

    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.videoId.toLowerCase().includes(searchTerm.toLowerCase())
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

    setFilteredVideos(filtered);
  };

  // Extract YouTube video ID from URL
  const extractVideoId = (url: string): string => {
    if (!url || !url.trim()) return '';
    
    const trimmedUrl = url.trim();
    
    // Handle different YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/ // Direct video ID (11 characters)
    ];

    for (const pattern of patterns) {
      const match = trimmedUrl.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    // If it looks like a direct video ID (11 alphanumeric characters)
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmedUrl)) {
      return trimmedUrl;
    }

    return ''; // Return empty if no valid pattern matches
  };

  const getThumbnailUrl = (videoId: string): string => {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  };

  const handleCreateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const videoId = extractVideoId(formData.videoId);
      if (!videoId) {
        showMessage('error', 'Please enter a valid YouTube video URL or ID');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/admin/youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          videoId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        showMessage('success', 'Video added successfully');
        setShowCreateModal(false);
        fetchVideos();
        resetForm();
      } else {
        showMessage('error', data.message || 'Failed to add video');
      }
    } catch (error) {
      showMessage('error', 'Error adding video');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVideo) return;

    setLoading(true);

    try {
      const videoId = extractVideoId(formData.videoId);
      if (!videoId) {
        showMessage('error', 'Please enter a valid YouTube video URL or ID');
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/admin/youtube/${selectedVideo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          videoId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        showMessage('success', 'Video updated successfully');
        setShowEditModal(false);
        fetchVideos();
        resetForm();
      } else {
        showMessage('error', data.message || 'Failed to update video');
      }
    } catch (error) {
      showMessage('error', 'Error updating video');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVideo = async () => {
    if (!selectedVideo) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/admin/youtube/${selectedVideo.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        showMessage('success', 'Video deleted successfully');
        setShowDeleteModal(false);
        fetchVideos();
      } else {
        showMessage('error', data.message || 'Failed to delete video');
      }
    } catch (error) {
      showMessage('error', 'Error deleting video');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (video: YouTubeVideo) => {
    setSelectedVideo(video);
    setFormData({
      title: video.title,
      description: video.description,
      videoId: video.videoId,
      category: video.category,
      isPublished: video.isPublished,
      isFeatured: video.isFeatured,
      displayOrder: video.displayOrder,
    });
    setVideoPreviewId(video.videoId);
    setShowEditModal(true);
  };

  const openDeleteModal = (video: YouTubeVideo) => {
    setSelectedVideo(video);
    setShowDeleteModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      videoId: '',
      category: 'WELCOME',
      isPublished: false,
      isFeatured: false,
      displayOrder: 0,
    });
    setSelectedVideo(null);
    setVideoPreviewId('');
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Manage YouTube Videos
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Add, edit, and manage YouTube videos for the homepage
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
            Add Video
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
              placeholder="Search videos..."
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
            {videoCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.replace('_', ' ')}
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

        {/* Videos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
              Loading videos...
            </div>
          ) : filteredVideos.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
              No videos found
            </div>
          ) : (
            filteredVideos.map((video) => (
              <div
                key={video.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-gray-900">
                  <img
                    src={getThumbnailUrl(video.videoId)}
                    alt={video.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`;
                    }}
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <Youtube className="h-12 w-12 text-white opacity-80" />
                  </div>
                  {video.isFeatured && (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium">
                      Featured
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 rounded text-xs font-medium">
                      {video.category.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      video.isPublished 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}>
                      {video.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {video.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {video.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <a
                      href={`https://www.youtube.com/watch?v=${video.videoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-red-600 dark:text-red-400 hover:underline flex items-center"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Watch on YouTube
                    </a>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openEditModal(video)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(video)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Create/Edit Modal */}
        {(showCreateModal || showEditModal) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {showCreateModal ? 'Add YouTube Video' : 'Edit YouTube Video'}
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

              <form onSubmit={showCreateModal ? handleCreateVideo : handleUpdateVideo} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    YouTube Video URL or ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.videoId}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData({ ...formData, videoId: value });
                      const extractedId = extractVideoId(value);
                      setVideoPreviewId(extractedId);
                    }}
                    placeholder="https://www.youtube.com/watch?v=VIDEO_ID or VIDEO_ID"
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Enter YouTube URL (youtube.com/watch?v=...) or just the video ID
                  </p>
                  {videoPreviewId && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preview:</p>
                      <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden border-2 border-gray-300 dark:border-gray-600">
                        <img
                          src={getThumbnailUrl(videoPreviewId)}
                          alt="Video preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            // Try fallback thumbnail
                            target.src = `https://img.youtube.com/vi/${videoPreviewId}/hqdefault.jpg`;
                            target.onerror = () => {
                              // If fallback also fails, show placeholder
                              target.src = '';
                              target.style.display = 'none';
                            };
                          }}
                          onLoad={() => {
                            // Image loaded successfully
                            console.log('Thumbnail loaded for video:', videoPreviewId);
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/10 transition-colors">
                          <div className="bg-red-600 rounded-full p-4 opacity-90 hover:opacity-100 transition-opacity">
                            <Youtube className="h-8 w-8 text-white" />
                          </div>
                        </div>
                        <a
                          href={`https://www.youtube.com/watch?v=${videoPreviewId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute bottom-2 right-2 text-xs bg-black/70 text-white px-2 py-1 rounded hover:bg-black/90 transition-colors"
                        >
                          Watch on YouTube
                        </a>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Video ID: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">{videoPreviewId}</code>
                      </p>
                    </div>
                  )}
                  {formData.videoId && !videoPreviewId && (
                    <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        ⚠️ Could not extract valid YouTube video ID. Please check the URL format.
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                    placeholder="Brief description of the video..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      {videoCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat.replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Display Order
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.displayOrder}
                      onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Lower numbers appear first
                    </p>
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
                    {loading ? 'Saving...' : showCreateModal ? 'Add Video' : 'Update Video'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && selectedVideo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Delete Video
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete "{selectedVideo.title}"? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteVideo}
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
    </AdminLayout>
  );
}

