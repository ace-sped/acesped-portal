"use client"

import React, { useState, useEffect } from 'react';
import RoleLayout from '../../components/shared/RoleLayout';
import { BookOpen, Clock, BarChart, AlertCircle } from 'lucide-react';

interface Course {
    id: string;
    title: string;
    slug: string;
    level: string;
    duration?: string;
    studyMode?: string;
    isActive: boolean;
}

interface Program {
    id: string;
    title: string;
    courses: Course[];
}

export default function AllocateCourses() {
    const [programs, setPrograms] = useState<Program[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchProgramData();
    }, []);

    const fetchProgramData = async () => {
        try {
            const response = await fetch('/api/head-of-program/program-data');
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setPrograms(data.programs);
                } else {
                    setError(data.message || 'Failed to fetch program data');
                }
            } else {
                const errorData = await response.json().catch(() => ({}));
                setError(errorData.message || 'Failed to fetch program data');
            }
        } catch (err) {
            setError('An unexpected error occurred');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <RoleLayout
            rolePath="head-of-program"
            roleDisplayName="Head of Program"
            roleColor="orange"
        >
            <div className="space-y-8">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-4 rounded-lg flex items-center">
                        <AlertCircle className="h-5 w-5 mr-2" />
                        {error}
                    </div>
                ) : programs.length === 0 ? (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 p-6 rounded-lg text-center">
                        <p className="text-lg font-medium">No programs assigned to you.</p>
                        <p className="text-sm mt-2">Please contact the administrator if this is an error.</p>
                    </div>
                ) : (
                    programs.map((program) => (
                        <div key={program.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                            <div className="bg-orange-50 dark:bg-orange-900/20 border-b border-orange-100 dark:border-orange-900/30 p-6">
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                                    <BookOpen className="h-6 w-6 mr-3 text-orange-600 dark:text-orange-400" />
                                    {program.title}
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400 mt-2">
                                    Manage course allocations for {program.title}
                                </p>
                            </div>

                            <div className="p-6">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Program Courses ({program.courses.length})
                                </h2>

                                {program.courses.length === 0 ? (
                                    <p className="text-gray-500 italic">No courses found for this program.</p>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {program.courses.map((course) => (
                                            <div
                                                key={course.id}
                                                className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-5 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow"
                                            >
                                                <div className="flex justify-between items-start mb-3">
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${course.isActive
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                                        }`}>
                                                        {course.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium px-2 py-1 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                                                        {course.level}
                                                    </span>
                                                </div>

                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2" title={course.title}>
                                                    {course.title}
                                                </h3>

                                                <div className="space-y-2 mt-4 text-sm text-gray-600 dark:text-gray-400">
                                                    <div className="flex items-center">
                                                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                                                        <span>{course.duration || 'Duration unused'}</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <BarChart className="h-4 w-4 mr-2 text-gray-400" />
                                                        <span>{course.studyMode || 'Mode unspecified'}</span>
                                                    </div>
                                                </div>

                                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 flex justify-end">
                                                    <button className="text-sm font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300">
                                                        View Details
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </RoleLayout>
    );
}
