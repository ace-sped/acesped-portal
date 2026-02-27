
"use client"

import React, { useState, useEffect } from 'react';
import CenterLeaderLayout from '../components/CenterLeaderLayout';
import {
    Search, GraduationCap, ChevronLeft, ChevronRight, Loader2,
    Eye, FileText, MoreVertical
} from 'lucide-react';
import Link from 'next/link';

interface Student {
    id: string;
    userId: string | null;
    matricNumber: string | null;
    name: string;
    email: string;
    program: string;
    level: string;
    status: string;
}

export default function StudentsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 1
    });

    useEffect(() => {
        fetchStudents();
    }, [pagination.page, searchTerm]);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const response = await fetch(
                `/api/center-leader/students?page=${pagination.page}&limit=${pagination.limit}&search=${searchTerm}`
            );
            const data = await response.json();
            if (data.success) {
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

    return (
        <CenterLeaderLayout>
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
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name, matric number, or email..."
                                value={searchTerm}
                                onChange={handleSearch}
                                className="pl-10 pr-4 py-2 w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm text-gray-900 dark:text-white"
                            />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Student</th>
                                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Matric No.</th>
                                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Program</th>
                                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Level</th>
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
                                            <td className="py-4 px-6">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400 font-medium mr-3">
                                                        {student.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900 dark:text-white">{student.name}</div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">{student.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400 font-mono">
                                                {student.matricNumber || 'N/A'}
                                            </td>
                                            <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                                                {student.program}
                                            </td>
                                            <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                                                {student.level}
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
                                                    {/* Add relevant actions here, for now just a placeholder view button */}
                                                    <button className="p-2 text-gray-400 hover:text-purple-600 transition-colors">
                                                        <Eye className="h-4 w-4" />
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
        </CenterLeaderLayout>
    );
}
