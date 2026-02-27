
"use client"

import React, { useState, useEffect } from 'react';
import RoleLayout from '../../components/shared/RoleLayout';
import {
    Search,
    User,
    BookOpen,
    Mail,
    Loader2,
    Filter,
    Plus,
    X,
    Trash2,
    CheckCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Course {
    id: string;
    title: string;
    courseCode: string | null;
    program: {
        title: string;
    };
}

interface Lecturer {
    id: string;
    firstname: string | null;
    surname: string | null;
    email: string;
    role: string;
    coursesTaught: Course[];
}

interface ProgramData {
    id: string;
    title: string;
    courses: Course[];
}

export default function LecturersPage() {
    const [lecturers, setLecturers] = useState<Lecturer[]>([]);
    const [myCourses, setMyCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('ALL');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLecturer, setSelectedLecturer] = useState<Lecturer | null>(null);
    const [courseToAssign, setCourseToAssign] = useState('');
    const [processing, setProcessing] = useState(false);

    // Audit Modal State
    const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
    const [selectedCourseForAudit, setSelectedCourseForAudit] = useState<Course | null>(null);
    const [auditData, setAuditData] = useState<{ materials: any[], results: any[] }>({ materials: [], results: [] });
    const [loadingAudit, setLoadingAudit] = useState(false);

    const openAuditModal = async (course: Course, lecturer: Lecturer) => {
        setSelectedCourseForAudit(course);
        setIsAuditModalOpen(true);
        setLoadingAudit(true);

        try {
            const response = await fetch(`/api/head-of-program/courses/${course.id}/materials`);
            const data = await response.json();
            if (data.success) {
                setAuditData({
                    materials: data.materials || [],
                    results: data.results || []
                });
            } else {
                toast.error(data.message || 'Failed to view course activity');
            }
        } catch (error) {
            console.error('Audit Error:', error);
            toast.error('Failed to load course activity');
        } finally {
            setLoadingAudit(false);
        }
    };

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            await Promise.all([fetchLecturers(), fetchMyPrograms()]);
            setLoading(false);
        };
        init();
    }, []);

    const fetchLecturers = async () => {
        try {
            const response = await fetch('/api/academic-program-coordinator/lecturers');
            const data = await response.json();
            if (data.success) {
                setLecturers(data.lecturers);
            }
        } catch (error) {
            console.error('Error fetching lecturers:', error);
            toast.error('Failed to fetch lecturers');
        }
    };

    const fetchMyPrograms = async () => {
        try {
            const response = await fetch('/api/head-of-program/program-data');
            const data = await response.json();
            if (data.success) {
                const courses = data.programs.flatMap((p: ProgramData) => p.courses);
                setMyCourses(courses);
            }
        } catch (error) {
            console.error('Error fetching my programs:', error);
        }
    };

    const handleAssignCourse = async () => {
        if (!selectedLecturer || !courseToAssign) return;

        setProcessing(true);
        try {
            const response = await fetch('/api/head-of-program/lecturers/manage-course', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lecturerId: selectedLecturer.id,
                    courseId: courseToAssign,
                    action: 'ASSIGN'
                })
            });

            const data = await response.json();
            if (response.ok && data.success) {
                toast.success('Course assigned successfully');
                setIsModalOpen(false);
                setCourseToAssign('');
                fetchLecturers(); // Refresh list
            } else {
                toast.error(data.message || 'Failed to assign course');
            }
        } catch (error) {
            console.error('Error assigning course:', error);
            toast.error('An error occurred');
        } finally {
            setProcessing(false);
        }
    };

    const handleRemoveCourse = async (lecturerId: string, courseId: string) => {
        if (!window.confirm('Are you sure you want to remove this course assignment?')) return;

        try {
            const response = await fetch('/api/head-of-program/lecturers/manage-course', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lecturerId,
                    courseId,
                    action: 'REMOVE'
                })
            });

            const data = await response.json();
            if (response.ok && data.success) {
                toast.success('Course removed successfully');
                fetchLecturers(); // Refresh list
            } else {
                toast.error(data.message || 'Failed to remove course');
            }
        } catch (error) {
            console.error('Error removing course:', error);
            toast.error('An error occurred');
        }
    };

    const openAssignModal = (lecturer: Lecturer) => {
        setSelectedLecturer(lecturer);
        setCourseToAssign('');
        setIsModalOpen(true);
    };

    // Extract all unique courses for filter
    const allCourses = Array.from(new Set(
        lecturers.flatMap(l => l.coursesTaught.map(c => c.title))
    )).sort();

    const filteredLecturers = lecturers.filter(lecturer => {
        const fullName = `${lecturer.firstname || ''} ${lecturer.surname || ''}`.toLowerCase();
        const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
            lecturer.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCourse = selectedCourse === 'ALL' ||
            lecturer.coursesTaught.some(c => c.title === selectedCourse);

        // Filter: Lecturer must teach at least one course from my program
        const teachesMyCourse = lecturer.coursesTaught.some(lc =>
            myCourses.some(mc => mc.id === lc.id)
        );

        return matchesSearch && matchesCourse && teachesMyCourse;
    });

    // Check if a course is managed by the current Head of Program
    const isMyCourse = (courseId: string) => {
        return myCourses.some(c => c.id === courseId);
    };

    return (
        <RoleLayout
            rolePath="head-of-program"
            roleDisplayName="Head of Program"
            roleColor="orange"
        >
            <div className="p-8">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Lecturers Management
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Assign or remove lecturers from your program courses
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm text-gray-900 dark:text-white"
                            />
                        </div>
                        <div className="md:w-64">
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <select
                                    value={selectedCourse}
                                    onChange={(e) => setSelectedCourse(e.target.value)}
                                    className="pl-10 pr-8 py-2 w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm text-gray-900 dark:text-white appearance-none"
                                >
                                    <option value="ALL">All Courses</option>
                                    {allCourses.map(course => (
                                        <option key={course} value={course}>{course}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lecturers Grid */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
                    </div>
                ) : filteredLecturers.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl shadow">
                        <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No lecturers found</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">
                            Try adjusting your search or filters
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredLecturers.map((lecturer) => (
                            <div key={lecturer.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-700 flex flex-col">
                                <div className="p-6 flex-1">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center">
                                            <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold text-lg mr-3">
                                                {(lecturer.firstname?.[0] || '')}{(lecturer.surname?.[0] || '')}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 dark:text-white">
                                                    {lecturer.firstname} {lecturer.surname}
                                                </h3>
                                                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    <Mail className="h-3 w-3 mr-1" />
                                                    {lecturer.email}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                                        <div className="flex justify-between items-center mb-3">
                                            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center">
                                                <BookOpen className="h-3 w-3 mr-1" />
                                                Assigned Courses
                                            </h4>
                                            <button
                                                onClick={() => openAssignModal(lecturer)}
                                                className="text-xs font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400 flex items-center gap-1"
                                            >
                                                <Plus className="w-3 h-3" /> Assign
                                            </button>
                                        </div>

                                        {lecturer.coursesTaught.length > 0 ? (
                                            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                                                {lecturer.coursesTaught.map(course => {
                                                    const canManage = isMyCourse(course.id);
                                                    return (
                                                        <div key={course.id} className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded text-sm group relative">
                                                            <div className="font-medium text-gray-800 dark:text-gray-200 pr-6">
                                                                {course.title}
                                                            </div>
                                                            <div className="flex justify-between items-center mt-1">
                                                                <span className="text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-1.5 py-0.5 rounded">
                                                                    {course.courseCode || 'No Code'}
                                                                </span>

                                                                {canManage && (
                                                                    <button
                                                                        onClick={() => openAuditModal(course, lecturer)}
                                                                        className="text-xs text-blue-500 hover:text-blue-600 hover:underline"
                                                                    >
                                                                        View Activity
                                                                    </button>
                                                                )}
                                                            </div>

                                                            {canManage && (
                                                                <button
                                                                    onClick={() => handleRemoveCourse(lecturer.id, course.id)}
                                                                    className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                                                    title="Remove from course"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="text-sm text-gray-400 italic py-4 text-center bg-gray-50 dark:bg-gray-700/30 rounded border border-dashed border-gray-200 dark:border-gray-600">
                                                No courses assigned
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Audit Materials Modal */}
                {isAuditModalOpen && selectedCourseForAudit && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                        Course Activity Audit
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {selectedCourseForAudit.courseCode} - {selectedCourseForAudit.title}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsAuditModalOpen(false)}
                                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto flex-1">
                                {loadingAudit ? (
                                    <div className="flex justify-center py-12">
                                        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                                <BookOpen className="h-4 w-4 text-blue-500" />
                                                Uploaded Materials
                                            </h4>
                                            {auditData.materials.length === 0 ? (
                                                <p className="text-sm text-gray-500 italic ml-6">No materials uploaded yet.</p>
                                            ) : (
                                                <ul className="space-y-2 ml-2">
                                                    {auditData.materials.map((mat: any) => (
                                                        <li key={mat.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm">
                                                            <div className="flex items-center gap-3">
                                                                <span className={`text-xs px-2 py-0.5 rounded font-medium ${mat.type === 'NOTE' ? 'bg-blue-100 text-blue-800' :
                                                                    mat.type === 'SLIDE' ? 'bg-purple-100 text-purple-800' :
                                                                        'bg-yellow-100 text-yellow-800'
                                                                    }`}>
                                                                    {mat.type}
                                                                </span>
                                                                <span className="text-gray-700 dark:text-gray-200">{mat.title}</span>
                                                            </div>
                                                            <span className="text-xs text-gray-400">
                                                                {new Date(mat.uploadedAt).toLocaleDateString()}
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                Result Submissions
                                            </h4>
                                            {auditData.results.length === 0 ? (
                                                <p className="text-sm text-gray-500 italic ml-6">No results submitted yet.</p>
                                            ) : (
                                                <ul className="space-y-2 ml-2">
                                                    {auditData.results.map((res: any) => (
                                                        <li key={res.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm">
                                                            <div className="font-medium text-gray-700 dark:text-gray-200">
                                                                {res.session} - {res.semester} Semester
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <span className={`text-xs px-2 py-0.5 rounded font-medium ${res.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                                                    res.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                                                        'bg-orange-100 text-orange-800'
                                                                    }`}>
                                                                    {res.status}
                                                                </span>
                                                                <span className="text-xs text-gray-400">
                                                                    {new Date(res.submittedAt).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 text-right">
                                <button
                                    onClick={() => setIsAuditModalOpen(false)}
                                    className="px-4 py-2 bg-white border border-gray-300 dark:bg-gray-700 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Assign Course Modal */}
                {isModalOpen && selectedLecturer && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                    Assign Course
                                </h3>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6">
                                <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                                    Assign a course to <span className="font-semibold text-gray-900 dark:text-white">{selectedLecturer.firstname} {selectedLecturer.surname}</span>.
                                    Only courses from your managed programs are available.
                                </p>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Select Course
                                        </label>
                                        <select
                                            value={courseToAssign}
                                            onChange={(e) => setCourseToAssign(e.target.value)}
                                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-orange-500 focus:ring-orange-500"
                                        >
                                            <option value="">-- Select a course --</option>
                                            {myCourses
                                                .filter(c => !selectedLecturer.coursesTaught.some(existing => existing.id === c.id))
                                                .map(course => (
                                                    <option key={course.id} value={course.id}>
                                                        {course.courseCode ? `${course.courseCode} - ` : ''}{course.title}
                                                    </option>
                                                ))
                                            }
                                        </select>
                                    </div>

                                    {myCourses.filter(c => !selectedLecturer.coursesTaught.some(existing => existing.id === c.id)).length === 0 && (
                                        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 rounded text-sm">
                                            No available courses to assign.
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAssignCourse}
                                    disabled={!courseToAssign || processing}
                                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                    Assign Course
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </RoleLayout>
    );
}
