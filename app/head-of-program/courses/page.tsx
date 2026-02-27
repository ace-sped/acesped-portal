
"use client"

import React, { useState, useEffect } from 'react';
import RoleLayout from '../../components/shared/RoleLayout';
import {
    Search, BookOpen, Plus, Trash2, User, Loader2, X, Users, ChevronDown, Filter, GraduationCap, Calendar
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Lecturer {
    id: string;
    firstname: string;
    surname: string;
    email: string;
}

interface Program {
    id: string;
    title: string;
    courseCode: string;
}

interface Course {
    id: string;
    title: string;
    courseCode: string;
    program: {
        id: string;
        title: string;
    };
    lecturers: Lecturer[];
    _count?: {
        registrations: number;
    };
}

interface Student {
    id: string;
    matricNumber: string | null;
    firstname: string | null;
    surname: string | null;
    email: string | null;
    avatar: string | null;
    registrationDate: string;
}

export default function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [programs, setPrograms] = useState<Program[]>([]);
    const [lecturers, setLecturers] = useState<Lecturer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProgramId, setSelectedProgramId] = useState<string>('ALL');

    // Assign Lecturer Modal State
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [selectedLecturerId, setSelectedLecturerId] = useState('');
    const [assigning, setAssigning] = useState(false);

    // View Students Modal State
    const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
    const [courseStudents, setCourseStudents] = useState<Student[]>([]);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [viewingCourse, setViewingCourse] = useState<Course | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [coursesRes, programsRes, lecturersRes] = await Promise.all([
                fetch('/api/head-of-program/courses'),
                fetch('/api/head-of-program/program-data'),
                fetch('/api/academic-program-coordinator/lecturers')
            ]);

            const coursesData = await coursesRes.json();
            const programsData = await programsRes.json();
            const lecturersData = await lecturersRes.json();

            if (coursesData.success) {
                setCourses(coursesData.courses);
            }
            if (programsData.success) {
                setPrograms(programsData.programs);
            }
            if (lecturersData.success) {
                setLecturers(lecturersData.lecturers);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const filteredCourses = courses.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (course.courseCode && course.courseCode.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesProgram = selectedProgramId === 'ALL' || course.program.id === selectedProgramId;

        return matchesSearch && matchesProgram;
    });

    // --- Assign Lecturer Handlers ---

    const openAssignModal = (course: Course) => {
        setSelectedCourse(course);
        setSelectedLecturerId('');
        setIsAssignModalOpen(true);
    };

    const closeAssignModal = () => {
        setIsAssignModalOpen(false);
        setSelectedCourse(null);
    };

    const handleAssignLecturer = async () => {
        if (!selectedCourse || !selectedLecturerId) return;

        setAssigning(true);
        try {
            // Using APC endpoint logic
            const response = await fetch(`/api/academic-program-coordinator/courses/${selectedCourse.id}/lecturers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lecturerId: selectedLecturerId })
            });

            const data = await response.json();
            if (data.success) {
                toast.success('Lecturer assigned successfully');
                // Update local state
                setCourses(prev => prev.map(c => {
                    if (c.id === selectedCourse.id) {
                        const lecturerAdded = lecturers.find(l => l.id === selectedLecturerId);
                        if (lecturerAdded && !c.lecturers.find(l => l.id === lecturerAdded.id)) {
                            return { ...c, lecturers: [...c.lecturers, lecturerAdded] };
                        }
                    }
                    return c;
                }));
                closeAssignModal();
            } else {
                toast.error(data.message || 'Failed to assign lecturer');
            }
        } catch (error) {
            console.error('Error assigning lecturer:', error);
            toast.error('An error occurred');
        } finally {
            setAssigning(false);
        }
    };

    const handleRemoveLecturer = async (courseId: string, lecturerId: string) => {
        if (!confirm('Are you sure you want to remove this lecturer from the course?')) return;

        try {
            const response = await fetch(`/api/academic-program-coordinator/courses/${courseId}/lecturers?lecturerId=${lecturerId}`, {
                method: 'DELETE'
            });

            const data = await response.json();
            if (data.success) {
                toast.success('Lecturer removed successfully');
                setCourses(prev => prev.map(c => {
                    if (c.id === courseId) {
                        return {
                            ...c,
                            lecturers: c.lecturers.filter(l => l.id !== lecturerId)
                        };
                    }
                    return c;
                }));
            } else {
                toast.error(data.message || 'Failed to remove lecturer');
            }
        } catch (error) {
            console.error('Error removing lecturer:', error);
            toast.error('An error occurred');
        }
    };

    // --- View Students Handlers ---

    const openStudentModal = async (course: Course) => {
        setViewingCourse(course);
        setIsStudentModalOpen(true);
        setLoadingStudents(true);
        setCourseStudents([]);

        try {
            const response = await fetch(`/api/head-of-program/courses/${course.id}/students`);
            const data = await response.json();
            if (data.success) {
                setCourseStudents(data.students);
            } else {
                toast.error('Failed to load students');
            }
        } catch (error) {
            console.error('Error fetching students:', error);
            toast.error('Error fetching students');
        } finally {
            setLoadingStudents(false);
        }
    };

    const closeStudentModal = () => {
        setIsStudentModalOpen(false);
        setViewingCourse(null);
        setCourseStudents([]);
    };

    return (
        <RoleLayout
            rolePath="head-of-program"
            roleDisplayName="Head of Program"
            roleColor="orange"
        >
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Courses Management</h1>
                        <p className="text-gray-600 dark:text-gray-400">View courses, manage lecturer assignments, and view registered students.</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search courses..."
                                value={searchTerm}
                                onChange={handleSearch}
                                className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                            />
                        </div>
                        <div className="md:w-64">
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <select
                                    value={selectedProgramId}
                                    onChange={(e) => setSelectedProgramId(e.target.value)}
                                    className="pl-10 pr-8 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 appearance-none"
                                >
                                    <option value="ALL">All Programs</option>
                                    {programs.map(prog => (
                                        <option key={prog.id} value={prog.id}>{prog.title}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Courses List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="flex justify-center p-12">
                            <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
                        </div>
                    ) : filteredCourses.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 p-12 text-center rounded-xl shadow-sm">
                            <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No courses found</h3>
                            <p className="text-gray-500 dark:text-gray-400">Try adjusting your search criteria</p>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {filteredCourses.map(course => (
                                <div key={course.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                                    <div className="p-6">
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                                                        {course.courseCode || 'No Code'}
                                                    </span>
                                                    <span className="text-sm text-gray-500 dark:text-gray-400">• {course.program?.title || 'No Program'}</span>
                                                </div>
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{course.title}</h3>
                                                <div className='mt-2 flex items-center gap-2'>
                                                    <div className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                                        <Users className="w-3 h-3 mr-1" />
                                                        {course._count?.registrations || 0} Students
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => openStudentModal(course)}
                                                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
                                                >
                                                    <GraduationCap className="h-4 w-4 mr-1.5" />
                                                    View Students
                                                </button>
                                                <button
                                                    onClick={() => openAssignModal(course)}
                                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
                                                >
                                                    <Plus className="h-4 w-4 mr-1.5" />
                                                    Assign Lecturer
                                                </button>
                                            </div>
                                        </div>

                                        <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                                                <Users className="h-4 w-4 mr-2 text-orange-500" />
                                                Assigned Lecturers
                                            </h4>

                                            {course.lecturers.length > 0 ? (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                    {course.lecturers.map(lecturer => (
                                                        <div key={lecturer.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700 group">
                                                            <div className="flex items-center gap-3 min-w-0">
                                                                <div className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center flex-shrink-0">
                                                                    <User className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                                        {lecturer.firstname} {lecturer.surname}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                                        {lecturer.email}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => handleRemoveLecturer(course.id, lecturer.id)}
                                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                                                title="Remove lecturer"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-500 dark:text-gray-400 italic pl-1">
                                                    No lecturers assigned yet.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Assign Lecturer Modal */}
            {isAssignModalOpen && selectedCourse && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                Assign Lecturer
                            </h3>
                            <button
                                onClick={closeAssignModal}
                                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="mb-4">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Target Course</p>
                                <p className="font-medium text-gray-900 dark:text-white">{selectedCourse.title}</p>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Select Lecturer
                                </label>
                                <div className="relative">
                                    <select
                                        value={selectedLecturerId}
                                        onChange={(e) => setSelectedLecturerId(e.target.value)}
                                        className="block w-full pl-3 pr-10 py-2.5 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none"
                                    >
                                        <option value="">Select a lecturer...</option>
                                        {lecturers.length === 0 ? (
                                            <option disabled>No lecturers found</option>
                                        ) : (
                                            lecturers.map(lecturer => {
                                                const isAssigned = selectedCourse?.lecturers.some(sl => sl.id === lecturer.id);
                                                return (
                                                    <option
                                                        key={lecturer.id}
                                                        value={lecturer.id}
                                                        disabled={isAssigned}
                                                    >
                                                        {lecturer.firstname || ''} {lecturer.surname || ''} ({lecturer.email})
                                                        {isAssigned ? ' (Already Assigned)' : ''}
                                                    </option>
                                                );
                                            })
                                        )}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                        <ChevronDown className="h-4 w-4" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={closeAssignModal}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAssignLecturer}
                                    disabled={!selectedLecturerId || assigning}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {assigning ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Assigning...
                                        </>
                                    ) : (
                                        'Assign Lecturer'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* View Students Modal */}
            {isStudentModalOpen && viewingCourse && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center shrink-0">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                    Enrolled Students
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {viewingCourse.title} ({viewingCourse.courseCode})
                                </p>
                            </div>
                            <button
                                onClick={closeStudentModal}
                                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-0 overflow-y-auto flex-1">
                            {loadingStudents ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <Loader2 className="h-8 w-8 text-orange-600 animate-spin mb-2" />
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Loading students...</p>
                                </div>
                            ) : courseStudents.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                                    <Users className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
                                    <p className="text-gray-900 dark:text-white font-medium">No students enrolled</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        There are currently no students registered for this course.
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {courseStudents.map((student) => (
                                        <div key={student.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-700 dark:text-orange-300 font-bold shrink-0">
                                                {student.avatar ? (
                                                    <img src={student.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                                                ) : (
                                                    (student.firstname?.[0] || '') + (student.surname?.[0] || '')
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                                    {student.firstname} {student.surname}
                                                </h4>
                                                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                    <span className="truncate">{student.matricNumber || 'No Matric Number'}</span>
                                                    <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                                                    <span className="truncate">{student.email}</span>
                                                </div>
                                            </div>
                                            <div className="text-xs text-gray-400 dark:text-gray-500 shrink-0 flex flex-col items-end">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(student.registrationDate).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center shrink-0">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                Total: <span className="font-semibold text-gray-900 dark:text-white">{courseStudents.length}</span> students
                            </span>
                            <button
                                onClick={closeStudentModal}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </RoleLayout>
    );
}
