
"use client"

import React, { useState } from 'react';
import RoleLayout from '../../components/shared/RoleLayout';
import {
    FileText, Send, Download, Eye,
    Search, User, Users, Check, X
} from 'lucide-react';

// Mock Data Types
type ResultStatus = 'Pending' | 'Approved' | 'Rejected' | 'Released';

interface ResultBatch {
    id: string; // key from API: courseId-session-semester
    courseId: string;
    courseCode: string;
    courseTitle: string;
    lecturer: string;
    session: string;
    semester: string;
    studentsCount: number;
    submittedDate: string;
    status: ResultStatus;
}

export default function ResultsPage() {
    const [activeTab, setActiveTab] = useState<ResultStatus | 'All'>('Pending');
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<ResultBatch[]>([]);
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        fetchResults();
    }, []);

    const fetchResults = async () => {
        try {
            const response = await fetch('/api/academic-program-coordinator/results');
            const data = await response.json();
            if (data.success) {
                setResults(data.results);
            }
        } catch (error) {
            console.error('Error fetching results:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter Logic
    const filteredResults = results.filter(result => {
        const matchesTab = activeTab === 'All' || result.status === activeTab;
        const matchesSearch =
            result.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
            result.courseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
            result.lecturer.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesTab && matchesSearch;
    });

    const getStatusColor = (status: ResultStatus) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
            case 'Approved': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
            case 'Released': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            case 'Rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const handleAction = async (result: ResultBatch, action: string) => {
        const confirmed = window.confirm(`Are you sure you want to ${action} these results?`);
        if (!confirmed) return;

        try {
            const response = await fetch('/api/academic-program-coordinator/results', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courseId: result.courseId,
                    session: result.session,
                    semester: result.semester,
                    action
                })
            });

            const data = await response.json();
            if (data.success) {
                // Refresh data
                fetchResults();
                // Optionally show success message
            } else {
                alert(data.message || 'Action failed');
            }
        } catch (error) {
            console.error('Error performing action:', error);
            alert('An error occurred');
        }
    };

    return (
        <RoleLayout
            rolePath="academic-program-coordinator"
            roleDisplayName="Academic Program Coordinator"
            roleColor="indigo"
        >
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Results Management</h1>
                        <p className="text-gray-600 dark:text-gray-400">View, approve, and release academic results</p>
                    </div>
                    <button className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download All Reports
                    </button>
                </div>

                {/* Filters & Search */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                        {/* Tabs */}
                        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg overflow-x-auto">
                            {(['Pending', 'Approved', 'Released', 'Rejected', 'All'] as const).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-all ${activeTab === tab
                                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                        }`}
                                >
                                    {tab} {tab === 'Pending' && <span className="ml-1 px-1.5 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded-full">2</span>}
                                </button>
                            ))}
                        </div>

                        {/* Search */}
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search course or lecturer..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Results Table */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Course</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Lecturer</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Session/Semester</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Students</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {filteredResults.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                            <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                                            <p>No results found matching your criteria.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredResults.map((result) => (
                                        <tr key={result.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-900 dark:text-white">{result.courseCode}</span>
                                                    <span className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[200px]" title={result.courseTitle}>
                                                        {result.courseTitle}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                                <div className="flex items-center">
                                                    <User className="h-3 w-3 mr-1.5 text-gray-400" />
                                                    {result.lecturer}
                                                </div>
                                                <div className="text-xs text-gray-400 mt-0.5">
                                                    Submitted: {result.submittedDate}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                                <div>{result.session}</div>
                                                <div className="text-xs text-gray-400">{result.semester} Semester</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                                <div className="flex items-center">
                                                    <Users className="h-3 w-3 mr-1.5 text-gray-400" />
                                                    {result.studentsCount} Students
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(result.status)}`}>
                                                    {result.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                <button
                                                    className="p-1 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>

                                                {/* Actions based on status */}
                                                {result.status === 'Pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleAction(result, 'approve')}
                                                            className="p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                                                            title="Approve"
                                                        >
                                                            <Check className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleAction(result, 'reject')}
                                                            className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                                            title="Reject"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </>
                                                )}

                                                {result.status === 'Approved' && (
                                                    <button
                                                        onClick={() => handleAction(result, 'release')}
                                                        className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                                        title="Release Results"
                                                    >
                                                        <Send className="h-4 w-4" />
                                                    </button>
                                                )}

                                                {(result.status === 'Approved' || result.status === 'Released') && (
                                                    <button
                                                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                                        title="Download Report"
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination (Mock) */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredResults.length}</span> of <span className="font-medium">{filteredResults.length}</span> results
                        </div>
                        <div className="flex items-center space-x-2">
                            <button disabled className="px-3 py-1 text-xs text-gray-400 bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded cursor-not-allowed">Previous</button>
                            <button disabled className="px-3 py-1 text-xs text-gray-400 bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded cursor-not-allowed">Next</button>
                        </div>
                    </div>
                </div>
            </div>
        </RoleLayout>
    );
}
