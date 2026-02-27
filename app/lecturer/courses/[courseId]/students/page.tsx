
"use client"

import React, { useState, useEffect } from 'react';
import RoleLayout from '../../../../components/shared/RoleLayout';
import {
    Users, Search, Mail, Loader2, ArrowLeft, Download
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Student {
    id: string;
    fullName: string;
    matricNumber: string;
    email: string;
    phoneNumber: string;
    program: string;
    registeredAt: string;
    avatar?: string;
}

export default function CourseStudents() {
    const params = useParams();
    const courseId = params?.courseId as string;

    const [students, setStudents] = useState<Student[]>([]);
    const [courseInfo, setCourseInfo] = useState({ title: '', code: '' });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (courseId) {
            fetchStudents();
        }
    }, [courseId]);

    const fetchStudents = async () => {
        try {
            const response = await fetch(`/api/lecturer/courses/${courseId}/students`);
            const data = await response.json();
            if (data.success) {
                setStudents(data.students);
                setCourseInfo({
                    title: data.courseTitle,
                    code: data.courseCode
                });
            }
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredStudents = students.filter(student =>
        student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.matricNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <RoleLayout
            rolePath="lecturer"
            roleDisplayName="Lecturer"
            roleColor="green"
        >
            <div className="p-8">
                <div className="mb-6">
                    <Link href="/lecturer/courses" className="inline-flex items-center text-sm text-gray-500 hover:text-green-600 mb-4 transition-colors">
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back to Courses
                    </Link>
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                {courseInfo.code ? `${courseInfo.code} Students` : 'Course Students'}
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                {courseInfo.title}
                            </p>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-lg border border-green-100 dark:border-green-800">
                            <span className="text-sm text-green-800 dark:text-green-300 font-medium">
                                Total Registered: {students.length}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row gap-4 justify-between">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name or matric number..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 w-full border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-gray-50 dark:bg-gray-700/50"
                            />
                        </div>
                        <button className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                            <Download className="h-4 w-4 mr-2" />
                            Export List
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                        </div>
                    ) : filteredStudents.length === 0 ? (
                        <div className="text-center py-12">
                            <Users className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                            <p className="text-gray-500">No students registered yet.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase text-gray-500 font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Student Name</th>
                                    <th className="px-6 py-4">Matric Number</th>
                                    <th className="px-6 py-4">Program</th>
                                    <th className="px-6 py-4">Registered Date</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {filteredStudents.map(student => (
                                    <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                {student.avatar ? (
                                                    <img src={student.avatar} alt="" className="h-8 w-8 rounded-full mr-3" />
                                                ) : (
                                                    <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-700 dark:text-green-300 font-bold mr-3 text-xs">
                                                        {student.fullName.charAt(0)}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-medium text-gray-900 dark:text-white">{student.fullName}</div>
                                                    <div className="text-xs text-gray-400">{student.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                            {student.matricNumber || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                            {student.program}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(student.registeredAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <a
                                                href={`mailto:${student.email}`}
                                                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors border border-green-200"
                                                title="Send Email"
                                            >
                                                <Mail className="h-3 w-3 mr-1" />
                                                Email
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </RoleLayout>
    );
}
