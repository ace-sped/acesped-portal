
"use client"

import React, { useState, useEffect } from 'react';
import RoleLayout from '../../components/shared/RoleLayout';
import {
    Users, Search, Filter, GraduationCap, Mail, Phone,
    Loader2, CheckCircle
} from 'lucide-react';

interface Supervisee {
    id: string;
    fullName: string;
    matricNumber: string;
    email: string;
    program: string;
    level: string;
    status: string;
    admissionSession: string;
}

export default function LecturerSupervision() {
    const [students, setStudents] = useState<Supervisee[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchSupervisees();
    }, []);

    const fetchSupervisees = async () => {
        try {
            const response = await fetch('/api/lecturer/supervisees');
            const data = await response.json();
            if (data.success) {
                setStudents(data.students);
            }
        } catch (error) {
            console.error('Error fetching supervisees:', error);
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
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Research Supervision</h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Manage your MS and PhD research students.
                        </p>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    {/* Toolbar */}
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search students..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 w-full border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-gray-50 dark:bg-gray-700/50"
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                        </div>
                    ) : filteredStudents.length === 0 ? (
                        <div className="text-center py-12">
                            <GraduationCap className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                            <p className="text-gray-500">No research students assigned yet.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase text-gray-500 font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Student</th>
                                    <th className="px-6 py-4">Program</th>
                                    <th className="px-6 py-4">Session</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {filteredStudents.map(student => (
                                    <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900 dark:text-white">{student.fullName}</div>
                                            <div className="text-sm text-gray-500">{student.matricNumber}</div>
                                            <div className="text-xs text-gray-400">{student.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 dark:text-white">{student.program}</div>
                                            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">{student.level}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {student.admissionSession}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                <CheckCircle className="h-3 w-3" />
                                                {student.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <a href={`mailto:${student.email}`} className="text-gray-400 hover:text-green-600 transition-colors">
                                                <Mail className="h-5 w-5 inline" />
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
