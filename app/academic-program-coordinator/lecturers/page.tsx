"use client"

import React, { useState, useEffect } from 'react';
import RoleLayout from '../../components/shared/RoleLayout';
import {
    Search,
    User,
    BookOpen,
    Mail,
    Loader2,
    Filter
} from 'lucide-react';

interface Course {
    id: string;
    title: string;
    courseCode: string | null;
    program: {
        title: string;
    };
}

interface Lecturer {
    id: string;
    firstname: string | null;
    surname: string | null;
    email: string;
    role: string;
    coursesTaught: Course[];
}

export default function LecturersPage() {
    const [lecturers, setLecturers] = useState<Lecturer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('ALL');

    useEffect(() => {
        fetchLecturers();
    }, []);

    const fetchLecturers = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/academic-program-coordinator/lecturers');
            const data = await response.json();
            if (data.success) {
                setLecturers(data.lecturers);
            }
        } catch (error) {
            console.error('Error fetching lecturers:', error);
        } finally {
            setLoading(false);
        }
    };

    // Extract all unique courses for filter
    const allCourses = Array.from(new Set(
        lecturers.flatMap(l => l.coursesTaught.map(c => c.title))
    )).sort();

    const filteredLecturers = lecturers.filter(lecturer => {
        const fullName = `${lecturer.firstname || ''} ${lecturer.surname || ''}`.toLowerCase();
        const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
            lecturer.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCourse = selectedCourse === 'ALL' ||
            lecturer.coursesTaught.some(c => c.title === selectedCourse);

        return matchesSearch && matchesCourse;
    });

    return (
        <RoleLayout
            rolePath="academic-program-coordinator"
            roleDisplayName="Academic Program Coordinator"
            roleColor="indigo"
        >
            <div className="p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Lecturers
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        View lecturers and their assigned courses
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-gray-900 dark:text-white"
                            />
                        </div>
                        <div className="md:w-64">
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <select
                                    value={selectedCourse}
                                    onChange={(e) => setSelectedCourse(e.target.value)}
                                    className="pl-10 pr-8 py-2 w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-gray-900 dark:text-white appearance-none"
                                >
                                    <option value="ALL">All Courses</option>
                                    {allCourses.map(course => (
                                        <option key={course} value={course}>{course}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lecturers Grid */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                    </div>
                ) : filteredLecturers.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl shadow">
                        <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No lecturers found</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">
                            Try adjusting your search or filters
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredLecturers.map((lecturer) => (
                            <div key={lecturer.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-700">
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center">
                                            <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-lg mr-3">
                                                {(lecturer.firstname?.[0] || '')}{(lecturer.surname?.[0] || '')}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 dark:text-white">
                                                    {lecturer.firstname} {lecturer.surname}
                                                </h3>
                                                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    <Mail className="h-3 w-3 mr-1" />
                                                    {lecturer.email}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                                        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center">
                                            <BookOpen className="h-3 w-3 mr-1" />
                                            Assigned Courses ({lecturer.coursesTaught.length})
                                        </h4>

                                        {lecturer.coursesTaught.length > 0 ? (
                                            <div className="space-y-2">
                                                {lecturer.coursesTaught.map(course => (
                                                    <div key={course.id} className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded text-sm group">
                                                        <div className="font-medium text-gray-800 dark:text-gray-200">
                                                            {course.title}
                                                        </div>
                                                        <div className="flex justify-between items-center mt-1">
                                                            <span className="text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-1.5 py-0.5 rounded">
                                                                {course.courseCode || 'No Code'}
                                                            </span>
                                                            <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]">
                                                                {course.program.title}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-sm text-gray-400 italic py-2 text-center bg-gray-50 dark:bg-gray-700/30 rounded">
                                                No courses assigned
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </RoleLayout>
    );
}
