
"use client"

import React, { useState, useEffect } from 'react';
import DeputyCenterLeaderLayout from '../components/DeputyCenterLeaderLayout';
import {
    Search, GraduationCap, ChevronLeft, ChevronRight, Loader2,
    Eye, EyeOff, FileText, MoreVertical, Trash2, Filter, Edit
} from 'lucide-react';
import Link from 'next/link';

interface Student {
    id: string;
    userId: string | null;
    matricNumber: string | null;
    registrationNumber: string | null;
    firstname?: string;
    surname?: string;
    name: string;
    email: string;
    avatar?: string | null;
    program: string;
    programType: string;
    status: string;
}

interface EditStudentForm {
    id: string;
    firstname: string;
    surname: string;
    email: string;
    matricNumber: string;
    registrationNumber: string;
    status: string;
    password: string;
}

export default function DeputyCenterLeaderStudentsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ACTIVE');
    const [filterProgramType, setFilterProgramType] = useState('ALL');
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 1
    });
    const [showEditModal, setShowEditModal] = useState(false);
    const [savingEdit, setSavingEdit] = useState(false);
    const [showEditPassword, setShowEditPassword] = useState(false);
    const [editForm, setEditForm] = useState<EditStudentForm>({
        id: '',
        firstname: '',
        surname: '',
        email: '',
        matricNumber: '',
        registrationNumber: '',
        status: 'ACTIVE',
        password: ''
    });

    useEffect(() => {
        fetchStudents();
    }, [pagination.page, searchTerm, filterStatus, filterProgramType]);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const response = await fetch(
                `/api/deputy-center-leader/students?page=${pagination.page}&limit=${pagination.limit}&search=${searchTerm}&status=${filterStatus}&programType=${filterProgramType}`
            );
            
            if (!response.ok) {
                const text = await response.text();
                console.error('API Error Response:', text);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.success) {
                // Debug: Log registration numbers to verify they're being fetched
                console.log('Students data:', data.students.map((s: Student) => ({
                    name: s.name,
                    registrationNumber: s.registrationNumber,
                    matricNumber: s.matricNumber
                })));
                setStudents(data.students);
                setPagination(prev => ({ ...prev, ...data.pagination }));
            }
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this student? This action cannot be undone.')) return;

        try {
            const response = await fetch('/api/deputy-center-leader/students', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });

            if (!response.ok) {
                const text = await response.text();
                console.error('API DELETE Error Response:', text);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.success) {
                setStudents(prev => prev.filter(s => s.id !== id));
                setPagination(prev => ({ ...prev, total: prev.total - 1 }));
            } else {
                alert(data.message || 'Failed to delete student');
            }
        } catch (error) {
            console.error('Error deleting student:', error);
            alert('Failed to delete student');
        }
    };

    const openEditModal = (student: Student) => {
        const fallbackName = student.name ? student.name.trim().split(/\s+/) : [];
        const inferredSurname = fallbackName.length > 0 ? fallbackName[0] : '';
        const inferredFirstname = fallbackName.length > 1 ? fallbackName.slice(1).join(' ') : '';

        setEditForm({
            id: student.id,
            firstname: (student.firstname || inferredFirstname || '').trim(),
            surname: (student.surname || inferredSurname || '').trim(),
            email: (student.email || '').trim(),
            matricNumber: student.matricNumber || '',
            registrationNumber: student.registrationNumber || '',
            status: student.status || 'ACTIVE',
            password: ''
        });
        setShowEditPassword(false);
        setShowEditModal(true);
    };

    const handleEditSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingEdit(true);

        try {
            const response = await fetch('/api/deputy-center-leader/students', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm)
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                alert(data?.message || 'Failed to update student');
                return;
            }

            setShowEditModal(false);
            setShowEditPassword(false);
            setEditForm(prev => ({ ...prev, password: '' }));
            await fetchStudents();
        } catch (error) {
            console.error('Error updating student:', error);
            alert('Failed to update student');
        } finally {
            setSavingEdit(false);
        }
    };

    return (
        <DeputyCenterLeaderLayout>
            <div className="p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Students
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        View and manage enrolled students
                    </p>
                </div>

                {/* Search and Filter */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
                    <div className="flex flex-col md:flex-row gap-4 mb-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name, registration number, matric number, or email..."
                                value={searchTerm}
                                onChange={handleSearch}
                                className="pl-10 pr-4 py-2 w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm text-gray-900 dark:text-white"
                            />
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters:</span>
                        </div>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="ACTIVE">Active</option>
                            <option value="GRADUATED">Graduated</option>
                            <option value="WITHDRAWN">Withdrawn</option>
                            <option value="SUSPENDED">Suspended</option>
                        </select>
                        <select
                            value={filterProgramType}
                            onChange={(e) => setFilterProgramType(e.target.value)}
                            className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="ALL">All Program Types</option>
                            <option value="MSC">Masters</option>
                            <option value="PHD">PhD</option>
                            <option value="PGD">PGD</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Matric Number</th>
                                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Student</th>
                                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Program</th>
                                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Program Type</th>
                                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                                    <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center">
                                            <div className="flex justify-center items-center">
                                                <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                                                <span className="ml-2 text-gray-500">Loading students...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : students.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-gray-500">
                                            No students found matching your criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    students.map((student) => (
                                        <tr key={student.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400 font-mono">
                                                {student.matricNumber || 'N/A'}
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center">
                                                    {student.avatar ? (
                                                        <img
                                                            src={student.avatar}
                                                            alt={student.name}
                                                            className="h-10 w-10 rounded-full object-cover mr-3 border border-gray-200 dark:border-gray-700"
                                                        />
                                                    ) : (
                                                        <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400 font-medium mr-3">
                                                            {(student.name || 'S').charAt(0)}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="font-medium text-gray-900 dark:text-white">{student.name}</div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">{student.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                                                {student.program}
                                            </td>
                                            <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                                                {student.programType}
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${student.status === 'ACTIVE'
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                                    }`}>
                                                    {student.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => openEditModal(student)}
                                                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                                        title="Edit Student"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                    <button className="p-2 text-gray-400 hover:text-purple-600 transition-colors">
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(student.id)}
                                                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                                        title="Delete Student"
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
                    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} students
                        </div>
                        <div className="flex gap-2">
                            <button
                                disabled={pagination.page === 1}
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <button
                                disabled={pagination.page === pagination.pages}
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {showEditModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Student</h2>
                        </div>
                        <form onSubmit={handleEditSave} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={editForm.firstname}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, firstname: e.target.value }))}
                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Surname
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={editForm.surname}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, surname: e.target.value }))}
                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={editForm.email}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Matric Number
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.matricNumber}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, matricNumber: e.target.value }))}
                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Registration Number
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.registrationNumber}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, registrationNumber: e.target.value }))}
                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Status
                                </label>
                                <select
                                    value={editForm.status}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                                >
                                    <option value="ACTIVE">Active</option>
                                    <option value="INACTIVE">Inactive</option>
                                    <option value="GRADUATED">Graduated</option>
                                    <option value="SUSPENDED">Suspended</option>
                                    <option value="WITHDRAWN">Withdrawn</option>
                                    <option value="DEFERRED">Deferred</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Password (leave blank to keep current)
                                </label>
                                <div className="relative">
                                    <input
                                        type={showEditPassword ? 'text' : 'password'}
                                        value={editForm.password}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, password: e.target.value }))}
                                        className="w-full px-3 py-2 pr-11 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowEditPassword((prev) => !prev)}
                                        className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                        aria-label={showEditPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showEditPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setShowEditPassword(false);
                                        setEditForm(prev => ({ ...prev, password: '' }));
                                    }}
                                    className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingEdit}
                                    className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors disabled:opacity-50"
                                >
                                    {savingEdit ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DeputyCenterLeaderLayout>
    );
}
