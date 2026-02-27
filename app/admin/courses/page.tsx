"use client"

import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import {
  GraduationCap, Plus, Search, Edit, Trash2,
  X, Check, AlertCircle, Filter, Upload, FileText, Download,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface Course {
  id: string;
  title: string;
  slug: string;
  programId: string;
  duration: string | null;
  studyMode: string | null;
  fee: string | null;
  brochure: string | null;
  overview: string;
  objectives: any;
  curriculum: any;
  requirements: any;
  careerPaths: any;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  program: {
    title: string;
    slug: string;
  };
  courseCode?: string | null;
  courseType?: string | null;
  programType?: string | null;
  semester?: string | null;
  creditHours?: number | null;
}

interface Program {
  id: string;
  title: string;
  slug: string;
}

export default function CoursesManagement() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProgramFilter, setSelectedProgramFilter] = useState<string>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // CSV Preview State
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    programId: '',


    programType: 'MASTERS',
    overview: '',
    isActive: true,
    displayOrder: 0,
    courseCode: '',
    courseType: '',
    semester: '',
    creditHours: '',
  });

  const courseLevels = ['CERTIFICATE', 'DIPLOMA', 'BACHELORS', 'MASTERS', 'PHD', 'MASTERS_AND_PHD'];

  const getLevelDisplayName = (level: string) => {
    const levelMap: { [key: string]: string } = {
      'CERTIFICATE': 'Certificate',
      'DIPLOMA': 'Diploma',
      'BACHELORS': 'Bachelors',
      'MASTERS': 'MSc / MEng',
      'MSC': 'MSc',
      'PGD': 'PGD',
      'PHD': 'PhD',
      'MASTERS_AND_PHD': 'PhD / MSc / MEng',
    };
    return levelMap[level] || level.replace(/_/g, ' ');
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCourses(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedProgramFilter]);

  useEffect(() => {
    fetchCourses(pagination.page);
  }, [pagination.page]);

  const fetchPrograms = async () => {
    try {
      const response = await fetch('/api/admin/programs');
      const data = await response.json();
      if (data.success) {
        setPrograms(data.programs);
      }
    } catch (error) {
      console.error('Error fetching programs:', error);
    }
  };

  const fetchCourses = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        programId: selectedProgramFilter,
        search: searchTerm
      });

      const response = await fetch(`/api/admin/courses?${params}`);
      const data = await response.json();
      if (data.success) {
        setCourses(data.courses);
        if (data.pagination) {
          setPagination(prev => ({ ...prev, ...data.pagination }));
        }
      } else {
        showMessage('error', 'Failed to fetch courses');
      }
    } catch (error) {
      showMessage('error', 'Error fetching courses');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const slug = formData.slug || generateSlug(formData.title);
      const response = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          slug,
        }),
      });

      const data = await response.json();

      if (data.success) {
        showMessage('success', 'Course created successfully');
        setShowCreateModal(false);
        fetchCourses(pagination.page);
        resetForm();
      } else {
        showMessage('error', data.message || 'Failed to create course');
      }
    } catch (error) {
      showMessage('error', 'Error creating course');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/admin/courses/${selectedCourse.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        showMessage('success', 'Course updated successfully');
        setShowEditModal(false);
        fetchCourses(pagination.page);
        resetForm();
      } else {
        showMessage('error', data.message || 'Failed to update course');
      }
    } catch (error) {
      showMessage('error', 'Error updating course');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!selectedCourse) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/admin/courses/${selectedCourse.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        showMessage('success', 'Course deleted successfully');
        setShowDeleteModal(false);
        fetchCourses(pagination.page);
      } else {
        showMessage('error', data.message || 'Failed to delete course');
      }
    } catch (error) {
      showMessage('error', 'Error deleting course');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (course: Course) => {
    setSelectedCourse(course);
    setFormData({
      title: course.title,
      slug: course.slug,
      programId: course.programId,
      overview: course.overview,
      isActive: course.isActive,
      displayOrder: course.displayOrder || 0,
      courseCode: course.courseCode || '',
      courseType: course.courseType || '',
      programType: course.programType || 'MASTERS',
      semester: course.semester || '',
      creditHours: course.creditHours?.toString() || '',
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (course: Course) => {
    setSelectedCourse(course);
    setShowDeleteModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      programId: '',
      programType: 'MASTERS',
      overview: '',
      isActive: true,
      displayOrder: 0,
      courseCode: '',
      courseType: '',
      semester: '',
      creditHours: '',
    });
    setSelectedCourse(null);
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };



  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet);
        setPreviewData(json.slice(0, 5)); // Preview first 5 rows
        setShowPreviewModal(true);
      } catch (error) {
        showMessage('error', 'Failed to parse file for preview');
        console.error('Preview error:', error);
      } finally {
        setIsUploading(false);
      }
    };
    reader.onerror = () => {
      showMessage('error', 'Failed to read file');
      setIsUploading(false);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleConfirmUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('/api/admin/courses/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        let msg = data.message;
        if (data.errors && data.errors.length > 0) {
          msg += '. Some rows failed. Check console for details.';
          console.warn('Upload errors:', data.errors);
        }
        showMessage('success', msg);
        fetchCourses(pagination.page);
        setShowPreviewModal(false);
        setSelectedFile(null);
        setPreviewData([]);
      } else {
        showMessage('error', data.message || 'Failed to upload file');
      }
    } catch (error) {
      showMessage('error', 'Error uploading file');
      console.error('Error:', error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleExportExcel = () => {
    const dataToExport = courses.map(course => ({
      'Course Code': course.courseCode || '',
      'Title': course.title,
      'Program': course.program.title,
      'Program Type': getLevelDisplayName(course.programType || ''),
      'Course Type': course.courseType || '',
      'Credit Hours': course.creditHours || '',
      'Semester': course.semester || '',
      'Slug': course.slug,
      'Status': course.isActive ? 'Active' : 'Inactive'
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Courses");
    XLSX.writeFile(wb, "courses_export.xlsx");
  };

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Manage Courses <span className="text-xl font-medium text-gray-500">({pagination.total})</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Create, edit, and manage courses
            </p>
          </div>

          <div className="flex gap-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".csv,.xlsx,.xls"
              className="hidden"
            />
            <button
              onClick={handleExportExcel}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Download className="h-5 w-5 mr-2" />
              Export Excel
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isUploading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
              ) : (
                <Upload className="h-5 w-5 mr-2" />
              )}
              Upload CSV
            </button>
            <button
              onClick={() => {
                resetForm();
                setShowCreateModal(true);
              }}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Course
            </button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center ${message.type === 'success'
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
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
            />
          </div>
          <select
            value={selectedProgramFilter}
            onChange={(e) => setSelectedProgramFilter(e.target.value)}
            className="px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
          >
            <option value="ALL">All Programs</option>
            {programs.map((program) => (
              <option key={program.id} value={program.id}>
                {program.title}
              </option>
            ))}
          </select>
        </div>

        {/* Courses Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Code</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Title</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Program</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Program Type</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Credit Hours</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500 dark:text-gray-400">
                      Loading...
                    </td>
                  </tr>
                ) : courses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No courses found
                    </td>
                  </tr>
                ) : (
                  courses.map((course) => (
                    <tr key={course.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className={`py-4 px-6 text-sm font-medium ${course.courseType === 'Elective' ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                        {course.courseCode}
                      </td>
                      <td className="py-4 px-6">
                        <div className={`font-medium ${course.courseType === 'Elective' ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>{course.title}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{course.slug}</div>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">{course.program.title}</td>
                      <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">{getLevelDisplayName(course.programType || '')}</td>
                      <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">{course.creditHours}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${course.isActive
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                          }`}>
                          {course.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openEditModal(course)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(course)}
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

          {/* Pagination */}
          {/* Pagination */}
          <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-t border-gray-200 dark:border-gray-600 grid grid-cols-1 sm:grid-cols-3 items-center gap-4">
            <div className="text-sm text-gray-500 dark:text-gray-400 text-center sm:text-left">
              Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="font-medium">{pagination.total}</span> results
            </div>
            <div className="flex items-center justify-center space-x-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 dark:text-gray-300 transition-colors"
                title="Previous Page"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.pages}
                className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 dark:text-gray-300 transition-colors"
                title="Next Page"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            <div className="hidden sm:block"></div>
          </div>
        </div>

        {/* Create/Edit Modal */}
        {(showCreateModal || showEditModal) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {showCreateModal ? 'Create Course' : 'Edit Course'}
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

              <form onSubmit={showCreateModal ? handleCreateCourse : handleUpdateCourse} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Priority Fields */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Course Code *
                    </label>
                    <input
                      type="text"
                      value={formData.courseCode}
                      onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
                      placeholder="e.g., CSC 101"
                      className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Course Title *
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
                      Program *
                    </label>
                    <select
                      required
                      value={formData.programId}
                      onChange={(e) => setFormData({ ...formData, programId: e.target.value })}
                      className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                    >
                      <option value="">Select Program</option>
                      {programs.map((program) => (
                        <option key={program.id} value={program.id}>
                          {program.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Program Type
                    </label>
                    <select
                      value={formData.programType}
                      onChange={(e) => setFormData({ ...formData, programType: e.target.value })}
                      className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                    >
                      <option value="MASTERS">MSc / MEng</option>
                      <option value="MSC">MSc</option>
                      <option value="PGD">PGD</option>
                      <option value="PHD">PhD</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Course Type
                    </label>
                    <select
                      value={formData.courseType || ''}
                      onChange={(e) => setFormData({ ...formData, courseType: e.target.value })}
                      className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                    >
                      <option value="">Select Type</option>
                      <option value="Core">Core</option>
                      <option value="Elective">Elective</option>
                      <option value="Ancillary">Ancillary</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Semester
                    </label>
                    <select
                      value={formData.semester || ''}
                      onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                      className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                    >
                      <option value="">Select Semester</option>
                      <option value="First">First Semester</option>
                      <option value="Second">Second Semester</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Credit Hours
                    </label>
                    <input
                      type="number"
                      value={formData.creditHours}
                      onChange={(e) => setFormData({ ...formData, creditHours: e.target.value })}
                      placeholder="e.g., 3"
                      className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Course Slug *
                    </label>
                    <input
                      type="text"
                      required
                      readOnly
                      value={formData.slug}
                      className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Course Description *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.overview}
                    onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                  />
                </div>



                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Active
                  </label>
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
                    {loading ? 'Saving...' : showCreateModal ? 'Create Course' : 'Update Course'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && selectedCourse && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Delete Course
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete "{selectedCourse.title}"? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteCourse}
                  disabled={loading}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CSV Preview Modal */}
        {showPreviewModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Preview CSV Upload
                </h2>
                <button
                  onClick={() => {
                    setShowPreviewModal(false);
                    setSelectedFile(null);
                    setPreviewData([]);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6">
                <p className="mb-4 text-gray-600 dark:text-gray-300">
                  Previewing first {previewData.length} rows. Please review column mapping.
                </p>
                <div className="overflow-x-auto mb-6 border rounded-lg dark:border-gray-700">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-300">
                      <tr>
                        {previewData.length > 0 && Object.keys(previewData[0]).map((key) => (
                          <th key={key} className="px-6 py-3">{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.map((row, idx) => (
                        <tr key={idx} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                          {Object.values(row).map((val: any, i) => (
                            <td key={i} className="px-6 py-4 text-gray-900 dark:text-white">
                              {val?.toString()}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => {
                      setShowPreviewModal(false);
                      setSelectedFile(null);
                      setPreviewData([]);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmUpload}
                    disabled={isUploading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                  >
                    {isUploading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />}
                    Confirm Upload
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

