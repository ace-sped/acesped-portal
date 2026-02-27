"use client"

import React, { useState, useEffect } from 'react';
import RoleLayout from '../../components/shared/RoleLayout';
import {
    Users, Search, Filter, MoreVertical, Mail,
    BookOpen, UserPlus, FileCheck, CheckCircle,
    X, Loader2, GraduationCap, ChevronDown
} from 'lucide-react';

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
}

interface Lecturer {
    id: string;
    firstname: string;
    surname: string;
    email: string;
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

    // Message Toast
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetchStudents();
        fetchLecturers();
    }, []);

    const fetchStudents = async () => {
        try {
            const response = await fetch('/api/academic-program-coordinator/students');
            const data = await response.json();
            if (data.success) {
                setStudents(data.students);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchLecturers = async () => {
        try {
            const response = await fetch('/api/academic-program-coordinator/lecturers');
            const data = await response.json();
            if (data.success) {
                setLecturers(data.lecturers);
            }
        } catch (error) {
            console.error('Error fetching lecturers:', error);
        }
    };

    const showMessageToast = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 5000);
    };

    const handleAssignSupervisor = async () => {
        if (!selectedStudent || !selectedSupervisorId) return;

        setAssigningSupervisor(true);
        try {
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
                showMessageToast('success', 'Supervisor assigned successfully');
                setShowSupervisorModal(false);
                fetchStudents(); // Refresh list
            } else {
                showMessageToast('error', data.message || 'Failed to assign supervisor');
            }
        } catch (error) {
            showMessageToast('error', 'An error occurred');
        } finally {
            setAssigningSupervisor(false);
        }
    };

    const handleNotifyStatus = (student: Student) => {
        // Mock notification
        showMessageToast('success', `Verification status notification sent to ${student.fullName}`);
    };

    const filteredStudents = students.filter(student => {
        const matchesSearch =
            student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.matricNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'ALL' || student.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <RoleLayout
            rolePath="academic-program-coordinator"
            roleDisplayName="Academic Program Coordinator"
            roleColor="indigo"
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
                        <div className="bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 rounded-lg border border-indigo-100 dark:border-indigo-800">
                            <span className="text-sm text-indigo-800 dark:text-indigo-300 font-medium">
                                Total Students: {students.length}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Message Toast */}
                {message && (
                    <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 ${message.type === 'success'
                        ? 'bg-green-600 text-white'
                        : 'bg-red-600 text-white'
                        }`}>
                        <div className="flex items-center gap-2">
                            {message.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <X className="h-5 w-5" />}
                            <span>{message.text}</span>
                        </div>
                    </div>
                )}

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
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div className="w-full md:w-64">
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full pl-10 pr-10 py-2 appearance-none bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 dark:text-gray-300 cursor-pointer"
                                >
                                    <option value="ALL">All Status</option>
                                    <option value="ACTIVE">Active</option>
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
                                                    <div className="h-10 w-10 flex-shrink-0 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold">
                                                        {student.fullName.charAt(0)}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">{student.fullName}</div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">{student.matricNumber}</div>
                                                        <div className="text-xs text-gray-400">{student.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900 dark:text-white font-medium">{student.programCode}</div>
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
                                                        <GraduationCap className="h-4 w-4 text-indigo-500" />
                                                        {student.supervisor}
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-400 italic">Unassigned</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${student.status === 'ACTIVE'
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                    }`}>
                                                    {student.status.charAt(0) + student.status.slice(1).toLowerCase()}
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
                                                        className="p-2 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                                        title="Assign Supervisor"
                                                    >
                                                        <UserPlus className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            // In a real app, this would open courses modal
                                                            showMessageToast('success', 'Courses management modal would open here (Add/Drop)');
                                                        }}
                                                        className="p-2 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                                        title="Manage Courses"
                                                    >
                                                        <BookOpen className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleNotifyStatus(student)}
                                                        className="p-2 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                                        title="Notify Status"
                                                    >
                                                        <FileCheck className="h-4 w-4" />
                                                    </button>
                                                    <a
                                                        href={`mailto:${student.email}`}
                                                        className="p-2 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
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
                    <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                        <span>Showing {filteredStudents.length} of {students.length} students</span>
                        {/* Pagination could go here */}
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
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
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
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center transition-colors"
                                >
                                    {assigningSupervisor && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                    Assign Supervisor
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </RoleLayout>
    );
}
