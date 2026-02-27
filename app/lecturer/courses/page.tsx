
"use client"

import React, { useState, useEffect } from 'react';
import RoleLayout from '../../components/shared/RoleLayout';
import Link from 'next/link';
import {
    BookOpen, Users, Upload, FileText, Download, Mail,
    MoreVertical, FileCheck, Search, Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Course {
    id: string;
    title: string;
    courseCode: string;
    program: string;
    level: string;
    semester: string;
    studentsCount: number;
    materialsCount: number;
}

export default function LecturerCourses() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Upload Modal State
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadType, setUploadType] = useState<'NOTE' | 'SLIDE' | 'ASSIGNMENT' | 'RESULT'>('NOTE');
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [description, setDescription] = useState('');
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const response = await fetch('/api/lecturer/courses');
            const data = await response.json();
            if (data.success) {
                setCourses(data.courses);
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async () => {
        if (!selectedCourse || !file) {
            toast.error('Please select a file');
            return;
        }

        setUploading(true);
        // Simulate upload or call real API if available
        // Ideally: upload file -> get URL -> save record

        try {
            // Mock delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            toast.success(`${uploadType} uploaded successfully for ${selectedCourse.courseCode}`);
            setShowUploadModal(false);
            setFile(null);
            setDescription('');
        } catch (error) {
            toast.error('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const filteredCourses = courses.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.courseCode.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <RoleLayout
            rolePath="lecturer"
            roleDisplayName="Lecturer"
            roleColor="green"
        >
            <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Courses</h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Manage assigned courses, materials, and results.
                        </p>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search courses..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-800"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                    </div>
                ) : filteredCourses.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                        <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No courses assigned</h3>
                        <p className="text-gray-500">You haven't been assigned to any courses yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCourses.map(course => (
                            <div key={course.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col h-full hover:shadow-md transition-all">
                                <div className="p-6 flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                            {course.courseCode}
                                        </span>
                                        <span className="text-xs text-gray-500">{course.level} Level</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                                        {course.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                        {course.program}
                                    </p>
                                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                        <div className="flex items-center gap-1">
                                            <Users className="h-4 w-4" />
                                            <span>{course.studentsCount} Students</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <FileText className="h-4 w-4" />
                                            <span>{course.materialsCount} Materials</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-700 rounded-b-xl flex justify-between items-center gap-2">

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                setSelectedCourse(course);
                                                setUploadType('NOTE');
                                                setShowUploadModal(true);
                                            }}
                                            className="p-2 text-gray-600 hover:text-green-600 hover:bg-white rounded-lg transition-colors"
                                            title="Upload Notes"
                                        >
                                            <Upload className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedCourse(course);
                                                setUploadType('RESULT');
                                                setShowUploadModal(true);
                                            }}
                                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-white rounded-lg transition-colors"
                                            title="Upload Results"
                                        >
                                            <FileCheck className="h-4 w-4" />
                                        </button>
                                        <Link
                                            href={`/lecturer/courses/${course.id}/students`}
                                            className="p-2 text-gray-600 hover:text-purple-600 hover:bg-white rounded-lg transition-colors"
                                            title="View Students"
                                        >
                                            <Users className="h-4 w-4" />
                                        </Link>
                                    </div>

                                    {/* More Actions Dropdown (Optional, simplified here) */}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Upload Modal */}
                {showUploadModal && selectedCourse && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full animate-in fade-in zoom-in duration-200">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Upload {uploadType === 'RESULT' ? 'Results' : 'Course Material'}
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    {selectedCourse.courseCode} - {selectedCourse.title}
                                </p>
                            </div>
                            <div className="p-6 space-y-4">
                                {uploadType !== 'RESULT' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Material Type</label>
                                        <div className="flex gap-2">
                                            {['NOTE', 'SLIDE', 'ASSIGNMENT'].map(type => (
                                                <button
                                                    key={type}
                                                    onClick={() => setUploadType(type as any)}
                                                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border ${uploadType === type
                                                            ? 'bg-green-600 text-white border-green-600'
                                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description/Title</label>
                                    <input
                                        type="text"
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                                        placeholder={uploadType === 'RESULT' ? "e.g. 2023/2024 First Semester Results" : "e.g. Week 1 Lecture Notes"}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">File</label>
                                    <input
                                        type="file"
                                        onChange={e => setFile(e.target.files?.[0] || null)}
                                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                                    />
                                    {uploadType === 'RESULT' && (
                                        <p className="text-xs text-orange-500 mt-2">
                                            Note: Please ensure you upload the correct handy results format (CSV/Excel).
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="p-6 bg-gray-50 dark:bg-gray-700/50 flex justify-end gap-3 rounded-b-xl">
                                <button className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg" onClick={() => setShowUploadModal(false)}>Cancel</button>
                                <button
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
                                    onClick={handleUpload}
                                    disabled={uploading || !file}
                                >
                                    {uploading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                    Upload
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </RoleLayout>
    );
}
