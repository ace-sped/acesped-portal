"use client"

import React, { useState, useEffect } from 'react';
import RoleLayout from '../../components/shared/RoleLayout';
import {
    Search, Filter, UserCheck, Loader2, GraduationCap,
    CheckCircle, X, ChevronDown, UserPlus, BookOpen
} from 'lucide-react';

interface ThesisStudent {
    id: string;
    matricNumber: string;
    fullName: string;
    program: string;
    studentProgrammeId: string;
    supervisor: string | null;
    internalExaminer1: string | null;
    internalExaminer1Id: string | null;
    internalExaminer2: string | null;
    internalExaminer2Id: string | null;
    externalExaminer: string | null;
    externalExaminerId: string | null;
}

interface Lecturer {
    id: string;
    firstname: string;
    surname: string;
    email: string;
}

export default function ThesisPage() {
    const [students, setStudents] = useState<ThesisStudent[]>([]);
    const [lecturers, setLecturers] = useState<Lecturer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<ThesisStudent | null>(null);
    const [assignmentType, setAssignmentType] = useState<'internal1' | 'internal2' | 'external' | null>(null);
    const [selectedExaminerId, setSelectedExaminerId] = useState('');
    const [processing, setProcessing] = useState(false);

    // Toast
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [selectedProgram, setSelectedProgram] = useState('ALL');

    useEffect(() => {
        fetchData();
        fetchLecturers();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/academic-program-coordinator/thesis/students');
            const data = await response.json();
            if (data.success) {
                setStudents(data.students);
            } else {
                console.error(data.message);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
        }
    };

    // Extract unique programs
    const allPrograms = Array.from(new Set(students.map(s => s.program))).sort();

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

    const handleOpenAssignModal = (student: ThesisStudent, type: 'internal1' | 'internal2' | 'external') => {
        setSelectedStudent(student);
        setAssignmentType(type);

        // Pre-select if already assigned
        if (type === 'internal1') setSelectedExaminerId(student.internalExaminer1Id || '');
        else if (type === 'internal2') setSelectedExaminerId(student.internalExaminer2Id || '');
        else if (type === 'external') setSelectedExaminerId(student.externalExaminerId || '');

        setShowAssignModal(true);
    };

    const handleAssignExaminer = async () => {
        if (!selectedStudent || !assignmentType) return;

        setProcessing(true);
        try {
            const response = await fetch('/api/academic-program-coordinator/thesis/assign-examiner', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentProgrammeId: selectedStudent.studentProgrammeId,
                    examinerId: selectedExaminerId,
                    type: assignmentType
                })
            });

            const data = await response.json();
            if (data.success) {
                showMessageToast('success', 'Examiner assigned successfully');
                setShowAssignModal(false);
                fetchData(); // Refresh list
            } else {
                showMessageToast('error', data.message || 'Failed to assign examiner');
            }
        } catch (error) {
            showMessageToast('error', 'An error occurred');
        } finally {
            setProcessing(false);
        }
    };

    const filteredStudents = students.filter(s => {
        const matchesSearch = s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.matricNumber.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesProgram = selectedProgram === 'ALL' || s.program === selectedProgram;

        return matchesSearch && matchesProgram;
    });

    const getExaminerLabel = (type: string) => {
        switch (type) {
            case 'internal1': return 'Internal Examiner 1';
            case 'internal2': return 'Internal Examiner 2';
            case 'external': return 'External Examiner';
            default: return 'Examiner';
        }
    };

    return (
        <RoleLayout
            rolePath="academic-program-coordinator"
            roleDisplayName="Academic Program Coordinator"
            roleColor="indigo"
        >
            <div className="p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Thesis Management
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Assign examiners and manage thesis defense process.
                    </p>
                </div>

                {/* Toast */}
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
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by student name or matric number..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
                            />
                        </div>
                        <div className="md:w-64 relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <select
                                value={selectedProgram}
                                onChange={(e) => setSelectedProgram(e.target.value)}
                                className="w-full pl-10 pr-8 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white appearance-none cursor-pointer"
                            >
                                <option value="ALL">All Programs</option>
                                {allPrograms.map(prog => (
                                    <option key={prog} value={prog}>{prog}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Student</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Internal Examiner 1</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Internal Examiner 2</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">External Examiner</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center">
                                            <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-500" />
                                        </td>
                                    </tr>
                                ) : filteredStudents.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                            No students found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredStudents.map((student) => (
                                        <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold">
                                                        {student.fullName.charAt(0)}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">{student.fullName}</div>
                                                        <div className="text-xs text-gray-500">{student.matricNumber}</div>
                                                        <div className="text-xs text-indigo-600 dark:text-indigo-400 mt-0.5">{student.program}</div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Internal 1 */}
                                            <td className="px-6 py-4">
                                                {student.internalExaminer1 ? (
                                                    <div className="flex items-center justify-between group">
                                                        <div className="text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                                                            <UserCheck className="h-3.5 w-3.5 text-green-500" />
                                                            {student.internalExaminer1}
                                                        </div>
                                                        <button
                                                            onClick={() => handleOpenAssignModal(student, 'internal1')}
                                                            className="text-xs text-indigo-600 hover:text-indigo-800 opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                                                        >
                                                            Change
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => handleOpenAssignModal(student, 'internal1')}
                                                        className="text-xs flex items-center gap-1 text-gray-400 hover:text-indigo-600 border border-dashed border-gray-300 hover:border-indigo-300 px-2 py-1 rounded-full transition-colors"
                                                    >
                                                        <UserPlus className="h-3 w-3" />
                                                        Assign
                                                    </button>
                                                )}
                                            </td>

                                            {/* Internal 2 */}
                                            <td className="px-6 py-4">
                                                {student.internalExaminer2 ? (
                                                    <div className="flex items-center justify-between group">
                                                        <div className="text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                                                            <UserCheck className="h-3.5 w-3.5 text-green-500" />
                                                            {student.internalExaminer2}
                                                        </div>
                                                        <button
                                                            onClick={() => handleOpenAssignModal(student, 'internal2')}
                                                            className="text-xs text-indigo-600 hover:text-indigo-800 opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                                                        >
                                                            Change
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => handleOpenAssignModal(student, 'internal2')}
                                                        className="text-xs flex items-center gap-1 text-gray-400 hover:text-indigo-600 border border-dashed border-gray-300 hover:border-indigo-300 px-2 py-1 rounded-full transition-colors"
                                                    >
                                                        <UserPlus className="h-3 w-3" />
                                                        Assign
                                                    </button>
                                                )}
                                            </td>

                                            {/* External */}
                                            <td className="px-6 py-4">
                                                {student.externalExaminer ? (
                                                    <div className="flex items-center justify-between group">
                                                        <div className="text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                                                            <GraduationCap className="h-3.5 w-3.5 text-amber-500" />
                                                            {student.externalExaminer}
                                                        </div>
                                                        <button
                                                            onClick={() => handleOpenAssignModal(student, 'external')}
                                                            className="text-xs text-indigo-600 hover:text-indigo-800 opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                                                        >
                                                            Change
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => handleOpenAssignModal(student, 'external')}
                                                        className="text-xs flex items-center gap-1 text-gray-400 hover:text-indigo-600 border border-dashed border-gray-300 hover:border-indigo-300 px-2 py-1 rounded-full transition-colors"
                                                    >
                                                        <UserPlus className="h-3 w-3" />
                                                        Assign
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Assignment Modal */}
                {showAssignModal && selectedStudent && assignmentType && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Assign {getExaminerLabel(assignmentType)}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    For {selectedStudent.fullName} ({selectedStudent.matricNumber})
                                </p>
                            </div>
                            <div className="p-6">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Select Examiner (Lecturer)
                                </label>
                                <div className="space-y-4">
                                    <div className="relative">
                                        <select
                                            value={selectedExaminerId}
                                            onChange={(e) => setSelectedExaminerId(e.target.value)}
                                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white appearance-none"
                                        >
                                            <option value="">Select a lecturer...</option>
                                            {lecturers.map(lecturer => (
                                                <option key={lecturer.id} value={lecturer.id}>
                                                    {lecturer.firstname} {lecturer.surname}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                    </div>

                                    {/* Unassign Option */}
                                    <div className="flex items-center">
                                        <button
                                            onClick={() => setSelectedExaminerId('')}
                                            className="text-xs text-red-500 hover:text-red-700"
                                        >
                                            Clear Selection / Unassign
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 bg-gray-50 dark:bg-gray-700/50 flex justify-end gap-3">
                                <button
                                    onClick={() => setShowAssignModal(false)}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAssignExaminer}
                                    disabled={processing}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center transition-colors"
                                >
                                    {processing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                    Save Assignment
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </RoleLayout>
    );
}
