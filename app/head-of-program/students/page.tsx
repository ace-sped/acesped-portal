
"use client"

import React, { useState, useEffect } from 'react';
import RoleLayout from '../../components/shared/RoleLayout';
import {
    Users, Search, Filter, MoreVertical, Mail,
    BookOpen, UserPlus, FileCheck, CheckCircle,
    X, Loader2, GraduationCap, ChevronDown, Plus, Trash2, AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Student {
    id: string;
    userId: string;
    matricNumber: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    program: string;
    programId: string;
    programCode: string;
    status: string;
    supervisor: string | null;
    supervisorId: string | null;
    activeCoursesCount: number;
    studentProgrammeId: string;
    avatar?: string;
    level: string;
    modeOfStudy: string;
}

interface Lecturer {
    id: string;
    firstname: string;
    surname: string;
    email: string;
}

interface Course {
    id: string;
    title: string;
    courseCode: string;
    creditHours: number;
    isRegistered: boolean;
    registrationStatus: string | null;
}

export default function StudentsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    // Modals
    const [showSupervisorModal, setShowSupervisorModal] = useState(false);
    const [showCoursesModal, setShowCoursesModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

    // Supervisor Data
    const [lecturers, setLecturers] = useState<Lecturer[]>([]);
    const [selectedSupervisorId, setSelectedSupervisorId] = useState('');
    const [assigningSupervisor, setAssigningSupervisor] = useState(false);

    // Course Management Data
    const [studentCourses, setStudentCourses] = useState<Course[]>([]);
    const [loadingCourses, setLoadingCourses] = useState(false);
    const [processingCourseId, setProcessingCourseId] = useState<string | null>(null);

    useEffect(() => {
        fetchStudents();
        fetchLecturers();
    }, []);

    const fetchStudents = async () => {
        try {
            const response = await fetch('/api/head-of-program/students');
            const data = await response.json();
            if (data.success) {
                setStudents(data.students);
            } else {
                toast.error(data.message || 'Failed to fetch students');
            }
        } catch (error) {
            console.error('Error fetching students:', error);
            toast.error('Failed to load students');
        } finally {
            setLoading(false);
        }
    };

    const fetchLecturers = async () => {
        try {
            // Reusing APC endpoint or HoP specific if available. 
            // APC endpoint is usually generic enough for fetching lecturers list
            const response = await fetch('/api/academic-program-coordinator/lecturers');
            const data = await response.json();
            if (data.success) {
                setLecturers(data.lecturers);
            }
        } catch (error) {
            console.error('Error fetching lecturers:', error);
        }
    };

    const handleAssignSupervisor = async () => {
        if (!selectedStudent || !selectedSupervisorId) return;

        setAssigningSupervisor(true);
        try {
            // Reusing APC endpoint which updates StudentProgramme
            const response = await fetch('/api/academic-program-coordinator/students/assign-supervisor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentProgrammeId: selectedStudent.studentProgrammeId,
                    supervisorId: selectedSupervisorId
                }),
            });

            const data = await response.json();
            if (data.success) {
                toast.success('Supervisor assigned successfully');
                setShowSupervisorModal(false);
                fetchStudents(); // Refresh list
            } else {
                toast.error(data.message || 'Failed to assign supervisor');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setAssigningSupervisor(false);
        }
    };

    const handleNotifyStatus = (student: Student) => {
        toast.success(`Verification status notification sent to ${student.fullName}`);
    };

    // --- Course Management Functions ---

    const openCoursesModal = async (student: Student) => {
        setSelectedStudent(student);
        setShowCoursesModal(true);
        setLoadingCourses(true);
        setStudentCourses([]);

        try {
            const response = await fetch(`/api/head-of-program/students/${student.id}/courses`);
            const data = await response.json();
            if (data.success) {
                setStudentCourses(data.courses);
            } else {
                toast.error('Failed to fetch courses');
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
            toast.error('Error loading courses');
        } finally {
            setLoadingCourses(false);
        }
    };

    const handleCourseAction = async (courseId: string, action: 'add' | 'drop') => {
        if (!selectedStudent) return;
        setProcessingCourseId(courseId);

        try {
            const response = await fetch(`/api/head-of-program/students/${selectedStudent.id}/courses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ courseId, action })
            });

            const data = await response.json();
            if (data.success) {
                toast.success(data.message);
                // Update local state
                setStudentCourses(prev => prev.map(c => {
                    if (c.id === courseId) {
                        return { ...c, isRegistered: action === 'add', registrationStatus: action === 'add' ? 'REGISTERED' : null };
                    }
                    return c;
                }));
                // Update student list count
                setStudents(prev => prev.map(s => {
                    if (s.id === selectedStudent.id) {
                        return {
                            ...s,
                            activeCoursesCount: action === 'add' ? s.activeCoursesCount + 1 : Math.max(0, s.activeCoursesCount - 1)
                        };
                    }
                    return s;
                }));
            } else {
                toast.error(data.message || 'Failed to update course');
            }
        } catch (error) {
            console.error('Error updating course:', error);
            toast.error('An error occurred');
        } finally {
            setProcessingCourseId(null);
        }
    };

    const filteredStudents = students.filter(student => {
        const matchesSearch =
            student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.matricNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.email?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'ALL' || student.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            case 'INACTIVE': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
            case 'ADMITTED': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
            case 'GRADUATED': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    return (
        <RoleLayout
            rolePath="head-of-program"
            roleDisplayName="Head of Program"
            roleColor="blue"
        >
            <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Student Management</h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Manage enrolled students, course registrations, and supervision.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg border border-blue-100 dark:border-blue-800">
                            <span className="text-sm text-blue-800 dark:text-blue-300 font-medium">
                                Total Students: {students.length}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name, matric number, or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="w-full md:w-64">
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full pl-10 pr-10 py-2 appearance-none bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-gray-300 cursor-pointer"
                                >
                                    <option value="ALL">All Status</option>
                                    <option value="ACTIVE">Active</option>
                                    <option value="ADMITTED">Admitted</option>
                                    <option value="INACTIVE">Inactive</option>
                                    <option value="GRADUATED">Graduated</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Students Table */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Student</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Program</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Academics</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Supervisor</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="px-6 py-4"><div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-48"></div></td>
                                            <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div></td>
                                            <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div></td>
                                            <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div></td>
                                            <td className="px-6 py-4"><div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div></td>
                                            <td className="px-6 py-4"></td>
                                        </tr>
                                    ))
                                ) : filteredStudents.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                            <Users className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                                            <p className="text-lg font-medium">No students found</p>
                                            <p className="text-sm">Try adjusting your filters or search terms.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredStudents.map((student) => (
                                        <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    {student.avatar ? (
                                                        <img className="h-10 w-10 flex-shrink-0 rounded-full object-cover" src={student.avatar} alt="" />
                                                    ) : (
                                                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold">
                                                            {student.fullName.charAt(0)}
                                                        </div>
                                                    )}
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">{student.fullName}</div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">{student.matricNumber || 'No ID'}</div>
                                                        <div className="text-xs text-gray-400">{student.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900 dark:text-white font-medium">{student.programCode || student.level}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]" title={student.program}>
                                                    {student.program}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                                                    <BookOpen className="h-4 w-4" />
                                                    <span>{student.activeCoursesCount} Courses</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {student.supervisor ? (
                                                    <div className="text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                                                        <GraduationCap className="h-4 w-4 text-blue-500" />
                                                        {student.supervisor}
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-400 italic">Unassigned</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(student.status)}`}>
                                                    {student.status.charAt(0) + student.status.slice(1).toLowerCase().replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedStudent(student);
                                                            setSelectedSupervisorId(student.supervisorId || '');
                                                            setShowSupervisorModal(true);
                                                        }}
                                                        className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                                        title="Assign Supervisor"
                                                    >
                                                        <UserPlus className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => openCoursesModal(student)}
                                                        className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                                        title="Manage Courses (Add/Drop)"
                                                    >
                                                        <BookOpen className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleNotifyStatus(student)}
                                                        className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                                        title="Notify Status"
                                                    >
                                                        <FileCheck className="h-4 w-4" />
                                                    </button>
                                                    <a
                                                        href={`mailto:${student.email}`}
                                                        className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                                        title="Email Student"
                                                    >
                                                        <Mail className="h-4 w-4" />
                                                    </a>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Supervisor Modal */}
                {showSupervisorModal && selectedStudent && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Assign Research Supervisor</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    For {selectedStudent.fullName} ({selectedStudent.matricNumber})
                                </p>
                            </div>
                            <div className="p-6">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Select Supervisor (Lecturer)
                                </label>
                                <select
                                    value={selectedSupervisorId}
                                    onChange={(e) => setSelectedSupervisorId(e.target.value)}
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                >
                                    <option value="">Select a lecturer...</option>
                                    {lecturers.map(lecturer => (
                                        <option key={lecturer.id} value={lecturer.id}>
                                            {lecturer.firstname} {lecturer.surname}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="p-6 bg-gray-50 dark:bg-gray-700/50 flex justify-end gap-3">
                                <button
                                    onClick={() => setShowSupervisorModal(false)}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAssignSupervisor}
                                    disabled={assigningSupervisor || !selectedSupervisorId || !selectedStudent?.studentProgrammeId}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center transition-colors"
                                >
                                    {assigningSupervisor && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                    Assign Supervisor
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Manage Courses Modal */}
                {showCoursesModal && selectedStudent && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Manage Registrations</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        Add or drop courses for {selectedStudent.fullName}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowCoursesModal(false)}
                                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="p-6 flex-1 overflow-y-auto">
                                {loadingCourses ? (
                                    <div className="flex justify-center items-center py-12">
                                        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                                    </div>
                                ) : studentCourses.length === 0 ? (
                                    <div className="text-center py-12">
                                        <AlertCircle className="h-10 w-10 text-yellow-500 mx-auto mb-3" />
                                        <p className="text-gray-600 dark:text-gray-400">No courses available for this program.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {studentCourses.map(course => (
                                            <div key={course.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-semibold text-gray-900 dark:text-white">{course.title}</h4>
                                                        <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded">
                                                            {course.courseCode}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                        {course.creditHours} Credit Units
                                                    </p>
                                                </div>
                                                <div className="ml-4">
                                                    {course.isRegistered ? (
                                                        <button
                                                            onClick={() => handleCourseAction(course.id, 'drop')}
                                                            disabled={processingCourseId === course.id}
                                                            className="flex items-center px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 rounded-lg transition-colors disabled:opacity-50"
                                                        >
                                                            {processingCourseId === course.id ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <>
                                                                    <Trash2 className="h-4 w-4 mr-1.5" />
                                                                    Drop
                                                                </>
                                                            )}
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleCourseAction(course.id, 'add')}
                                                            disabled={processingCourseId === course.id}
                                                            className="flex items-center px-3 py-1.5 text-sm font-medium text-green-600 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40 rounded-lg transition-colors disabled:opacity-50"
                                                        >
                                                            {processingCourseId === course.id ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <>
                                                                    <Plus className="h-4 w-4 mr-1.5" />
                                                                    Add
                                                                </>
                                                            )}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </RoleLayout>
    );
}
