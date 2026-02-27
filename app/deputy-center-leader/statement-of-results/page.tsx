"use client"

import React, { useState, useRef } from 'react';
import DeputyCenterLeaderLayout from '../components/DeputyCenterLeaderLayout';
import { Search, Printer, FileText, Loader2, ChevronLeft } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';

interface Student {
    id: string;
    name: string;
    matricNumber: string | null;
    program: string;
    gender: string;
}

interface ResultData {
    student: {
        name: string;
        matricNumber: string;
        program: string;
        cgpa: string;
        gender: string;
        passport?: string;
    };
    results: {
        [session: string]: {
            [semester: string]: {
                courseCode: string;
                courseTitle: string;
                unit: number;
                grade: string;
                score: number;
            }[]
        }
    };
}

export default function StatementOfResultsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Student[]>([]);
    const [searching, setSearching] = useState(false);
    const [loadingResults, setLoadingResults] = useState(false);
    const [resultData, setResultData] = useState<ResultData | null>(null);
    const [currentUser, setCurrentUser] = useState<{ signature?: string } | null>(null);

    React.useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch('/api/auth/me');
                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        setCurrentUser(data.user);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch user", error);
            }
        };
        fetchUser();
    }, []);

    const componentRef = useRef<HTMLDivElement>(null);

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        setSearching(true);
        try {
            const response = await fetch(`/api/deputy-center-leader/students/search?q=${encodeURIComponent(query)}`);
            const data = await response.json();
            if (data.success) {
                setSearchResults(data.students);
            }
        } catch (error) {
            console.error("Search failed", error);
        } finally {
            setSearching(false);
        }
    };

    const selectStudent = async (student: Student) => {
        setLoadingResults(true);
        setSearchResults([]);
        setSearchQuery('');

        try {
            const response = await fetch(`/api/deputy-center-leader/students/${student.id}/results`);
            const data = await response.json();

            if (data.success) {
                setResultData(data.data);
            } else {
                alert('Failed to load results');
            }
        } catch (error) {
            console.error('Error loading results:', error);
            alert('An error occurred');
        } finally {
            setLoadingResults(false);
        }
    };

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `Statement_of_Result_${resultData?.student.name || 'Student'}`,
    });

    return (
        <DeputyCenterLeaderLayout>
            <div className="p-8 max-w-screen-2xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Statement of Results</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Generate and print student academic transcripts</p>
                    </div>
                    {resultData && (
                        <button
                            onClick={() => setResultData(null)}
                            className="flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Back to Search
                        </button>
                    )}
                </div>

                {!resultData ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-2xl mx-auto text-center">
                        <FileText className="h-16 w-16 mx-auto text-purple-200 mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Select a Student</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">Search for a student to view their statement of results.</p>

                        <div className="relative max-w-md mx-auto">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-150 ease-in-out sm:text-sm"
                                placeholder="Search by name or matric number..."
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                            {searching && (
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    <Loader2 className="h-5 w-5 text-purple-600 animate-spin" />
                                </div>
                            )}

                            {searchResults.length > 0 && (
                                <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto max-h-60 focus:outline-none sm:text-sm text-left">
                                    {searchResults.map((student) => (
                                        <button
                                            key={student.id}
                                            onClick={() => selectStudent(student)}
                                            className="w-full px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 flex flex-col items-start border-b border-gray-100 dark:border-gray-700 last:border-0"
                                        >
                                            <span className="font-medium text-gray-900 dark:text-white">{student.name}</span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {student.matricNumber || 'No Matric'} • {student.program}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {loadingResults && (
                            <div className="mt-4 flex items-center justify-center text-purple-600">
                                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                Loading results...
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Sidebar Controls */}
                        <div className="w-full lg:w-64 flex-shrink-0 space-y-4">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Actions</h3>
                                <button
                                    onClick={handlePrint}
                                    className="w-full flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                                >
                                    <Printer className="h-4 w-4 mr-2" />
                                    Print / Save PDF
                                </button>
                            </div>
                        </div>

                        {/* Main Preview Area */}
                        <div className="flex-1 bg-gray-500 p-8 rounded-xl shadow-inner overflow-auto h-[800px] flex items-start justify-center">
                            <div
                                ref={componentRef}
                                className="bg-white text-black p-12 shadow-xl shrink-0"
                                style={{
                                    width: '210mm',
                                    minHeight: '297mm',
                                    padding: '10mm 15mm 10mm 15mm', // Adjust padding for print
                                    fontSize: '11pt',
                                    fontFamily: '"Times New Roman", Times, serif',
                                }}
                            >
                                {/* Header */}
                                <div className="text-center mb-6">
                                    <div className="flex justify-center mb-2">
                                        <img src="/images/ace-logo.png" alt="ACE-SPED Logo" className="h-20 w-auto" />
                                    </div>
                                    <h1 className="text-lg font-bold text-green-800 uppercase">Africa Centre of Excellence for<br />Sustainable Power and Energy Development</h1>
                                    <p className="text-sm font-bold">University of Nigeria, Nsukka</p>
                                    <h2 className="text-xl font-bold mt-4 uppercase underline">Statement of Results</h2>
                                </div>

                                {/* Student Info */}
                                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                                    <div>
                                        <p><span className="font-bold">Name:</span> {resultData.student.name.toUpperCase()}</p>
                                        <p><span className="font-bold">Matric No:</span> {resultData.student.matricNumber || 'N/A'}</p>
                                        <p><span className="font-bold">Program:</span> {resultData.student.program}</p>
                                    </div>
                                    <div className="text-right">
                                        <p><span className="font-bold">Date Printed:</span> {new Date().toLocaleDateString()}</p>
                                        <p><span className="font-bold">CGPA:</span> {resultData.student.cgpa}</p>
                                    </div>
                                </div>

                                {/* Results Table */}
                                <div className="space-y-6">
                                    {Object.entries(resultData.results).map(([session, semesters]) => (
                                        <div key={session}>
                                            <h3 className="font-bold bg-gray-100 p-1 mb-2 border-b border-gray-300">{session} Session</h3>
                                            {Object.entries(semesters).map(([semester, courses]) => (
                                                <div key={semester} className="mb-4 pl-2">
                                                    <h4 className="font-semibold italic mb-1 text-sm">{semester} Semester</h4>
                                                    <table className="w-full text-xs border-collapse">
                                                        <thead>
                                                            <tr className="border-b-2 border-black">
                                                                <th className="text-left py-1 w-24">Course Code</th>
                                                                <th className="text-left py-1">Course Title</th>
                                                                <th className="text-center py-1 w-12">Unit</th>
                                                                <th className="text-center py-1 w-12">Grade</th>
                                                                <th className="text-center py-1 w-12">Score</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {courses.map((course, idx) => (
                                                                <tr key={idx} className="border-b border-gray-200">
                                                                    <td className="py-1">{course.courseCode}</td>
                                                                    <td className="py-1">{course.courseTitle}</td>
                                                                    <td className="py-1 text-center">{course.unit}</td>
                                                                    <td className="py-1 text-center font-bold">{course.grade}</td>
                                                                    <td className="py-1 text-center">{course.score !== null ? course.score : '-'}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>

                                {/* Footer / Signature */}
                                <div className="mt-12 pt-8 border-t border-gray-400 flex justify-between items-end">
                                    <div className="w-1/3 text-center">
                                        <div className="border-b border-black h-8 mb-2"></div>
                                        <p className="font-bold text-sm">Registrar</p>
                                    </div>
                                    <div className="w-1/3 text-center">
                                        <div className="h-16 mb-2 flex items-end justify-center">
                                            {currentUser?.signature ? (
                                                <img
                                                    src={currentUser.signature}
                                                    className="h-full object-contain"
                                                    alt="Signature"
                                                />
                                            ) : (
                                                <div className="border-b border-black w-full h-8"></div>
                                            )}
                                        </div>
                                        <p className="font-bold text-sm">Deputy Centre Leader</p>
                                    </div>
                                </div>

                                <div className="mt-8 text-center text-xs italic text-gray-500">
                                    This document is issued by the Africa Centre of Excellence for Sustainable Power and Energy Development.
                                    Any alteration renders this document invalid.
                                </div>

                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DeputyCenterLeaderLayout>
    );
}
