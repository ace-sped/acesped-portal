
"use client"

import React, { useState, useEffect } from 'react';
import RoleLayout from '../../components/shared/RoleLayout';
import {
    Activity,
    Search,
    Filter,
    Loader2,
    BookOpen,
    User,
    Download
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Result {
    id: string;
    studentName: string;
    matricNumber: string;
    courseTitle: string;
    courseCode: string;
    programTitle: string;
    score: number | null;
    grade: string | null;
    session: string;
    semester: string;
}

export default function ResultsPage() {
    const [results, setResults] = useState<Result[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [programFilter, setProgramFilter] = useState('ALL');
    const [sessionFilter, setSessionFilter] = useState('ALL');

    useEffect(() => {
        fetchResults();
    }, []);

    const fetchResults = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/head-of-program/results');
            const data = await response.json();
            if (data.success) {
                setResults(data.results);
            } else {
                toast.error(data.message || 'Failed to fetch results');
            }
        } catch (error) {
            console.error('Error fetching results:', error);
            toast.error('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    // Derived states for filters
    const uniquePrograms = Array.from(new Set(results.map(r => r.programTitle))).sort();
    const uniqueSessions = Array.from(new Set(results.map(r => r.session))).sort();

    const filteredResults = results.filter(result => {
        const matchesSearch =
            result.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            result.matricNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            result.courseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (result.courseCode && result.courseCode.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesProgram = programFilter === 'ALL' || result.programTitle === programFilter;
        const matchesSession = sessionFilter === 'ALL' || result.session === sessionFilter;

        return matchesSearch && matchesProgram && matchesSession;
    });

    const getGradeColor = (grade: string | null) => {
        if (!grade) return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        const g = grade.toUpperCase();
        if (['A', 'A+'].includes(g)) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
        if (['B', 'B+', 'B-'].includes(g)) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
        if (['C', 'C+', 'C-'].includes(g)) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
        if (['D', 'E'].includes(g)) return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
        if (['F'].includes(g)) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    };

    return (
        <RoleLayout
            rolePath="head-of-program"
            roleDisplayName="Head of Program"
            roleColor="orange"
        >
            <div className="p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Student Results
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        View academic results for students in your programs.
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search student, course code, or title..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm text-gray-900 dark:text-white"
                            />
                        </div>
                        <div>
                            <select
                                value={programFilter}
                                onChange={(e) => setProgramFilter(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm text-gray-900 dark:text-white appearance-none"
                            >
                                <option value="ALL">All Programs</option>
                                {uniquePrograms.map(p => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <select
                                value={sessionFilter}
                                onChange={(e) => setSessionFilter(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm text-gray-900 dark:text-white appearance-none"
                            >
                                <option value="ALL">All Sessions</option>
                                {uniqueSessions.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Results Table */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Student</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Course</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Score</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Grade</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Session</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center">
                                            <Loader2 className="h-8 w-8 animate-spin text-orange-600 mx-auto" />
                                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading results...</p>
                                        </td>
                                    </tr>
                                ) : filteredResults.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center">
                                            <Activity className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                                            <p className="text-gray-500 dark:text-gray-400 font-medium">No results found matching your criteria</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredResults.map((result) => (
                                        <tr key={result.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold text-xs mr-3">
                                                        {result.studentName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {result.studentName}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            {result.matricNumber}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900 dark:text-white font-medium">
                                                    {result.courseCode}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 max-w-[200px] truncate" title={result.courseTitle}>
                                                    {result.courseTitle}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                                    {result.score !== null ? result.score : '-'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {result.grade ? (
                                                    <span className={`inline-flex items-center justify-center h-8 w-8 rounded-full text-xs font-bold ${getGradeColor(result.grade)}`}>
                                                        {result.grade}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-gray-400">N/A</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900 dark:text-white">
                                                    {result.session}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {result.semester}
                                                </div>
                                                <div className="text-[10px] text-orange-600 dark:text-orange-400 mt-1 max-w-[150px] truncate" title={result.programTitle}>
                                                    {result.programTitle}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </RoleLayout>
    );
}

