"use client"

import React, { useState, useEffect } from 'react';
import DeputyCenterLeaderLayout from '../components/DeputyCenterLeaderLayout';
import { FileText, Search, Check, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

/** Minimum total score required to allow approving an applicant. */
const MIN_SCORE_TO_APPROVE = 50;

interface AdmissionExercise {
    id: string;
    applicationId?: string;
    status?: string;
    academicYear: string;
    applicationNumber: string;
    name: string;
    gender: string;
    program: string;
    level: string;
    testScore: number;
    comportment: number;
    answer: number;
    proposal: number;
    total: number;
}

export default function AdmissionExerciseDeputy() {
    const [exercises, setExercises] = useState<AdmissionExercise[]>([]);
    const [loading, setLoading] = useState(true);
    const [years, setYears] = useState<string[]>([]);
    const [selectedYear, setSelectedYear] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [savingId, setSavingId] = useState<string | null>(null);
    const [actioningId, setActioningId] = useState<string | null>(null);

    useEffect(() => {
        fetchExercises();
    }, [selectedYear]);

    const fetchExercises = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams();
            if (selectedYear !== 'ALL') queryParams.append('academicYear', selectedYear);

            const response = await fetch(`/api/admin/admission-exercise?${queryParams.toString()}`);
            if (response.ok) {
                const data = await response.json();
                setExercises(data.exercises);
                if (data.years && data.years.length > 0) {
                    setYears(data.years);
                }
            }
        } catch (error) {
            console.error('Error fetching exercises:', error);
            toast.error('Failed to load admission exercises');
        } finally {
            setLoading(false);
        }
    };

    const handleScoreChange = (id: string, field: keyof AdmissionExercise, value: string) => {
        const numValue = Math.max(0, parseInt(value) || 0);

        setExercises(prev => prev.map(ex => {
            if (ex.id === id) {
                const updated = { ...ex, [field]: numValue };
                updated.total = (
                    (field === 'testScore' ? numValue : ex.testScore) +
                    (field === 'comportment' ? numValue : ex.comportment) +
                    (field === 'answer' ? numValue : ex.answer) +
                    (field === 'proposal' ? numValue : ex.proposal)
                );
                return updated;
            }
            return ex;
        }));
    };

    const saveScore = async (exercise: AdmissionExercise) => {
        try {
            setSavingId(exercise.id);
            const response = await fetch('/api/admin/admission-exercise', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    applicationNumber: exercise.applicationNumber,
                    testScore: exercise.testScore,
                    comportment: exercise.comportment,
                    answer: exercise.answer,
                    proposal: exercise.proposal,
                    name: exercise.name,
                    gender: exercise.gender,
                    program: exercise.program,
                    level: exercise.level,
                    academicYear: exercise.academicYear
                })
            });

            if (!response.ok) throw new Error('Failed to update');
        } catch (error) {
            console.error('Update error:', error);
            toast.error('Failed to save score');
        } finally {
            setSavingId(null);
        }
    };

    const setApplicationStatus = async (applicationNumber: string, status: 'APPROVED' | 'REJECTED') => {
        try {
            setActioningId(applicationNumber);
            const response = await fetch('/api/deputy-center-leader/admission-exercise/status', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ applicationNumber, status }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to update status');
            toast.success(status === 'APPROVED' ? 'Application approved' : 'Application rejected');
            setExercises(prev => prev.map(ex =>
                ex.applicationNumber === applicationNumber ? { ...ex, status } : ex
            ));
        } catch (error) {
            console.error('Status update error:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to update status');
        } finally {
            setActioningId(null);
        }
    };

    const filteredExercises = exercises.filter(ex =>
        ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ex.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ex.program.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DeputyCenterLeaderLayout>
            <div className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Admission Exercise Management
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Manage grading and results for admission candidates
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search name, S/N, program..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                            />
                        </div>

                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        >
                            <option value="ALL">All Sessions</option>
                            {years.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
                            <p className="text-gray-500">Loading exercises...</p>
                        </div>
                    ) : filteredExercises.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="bg-gray-100 dark:bg-gray-700 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                                <Search className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No exercises found</h3>
                            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                                No admission exercises match your criteria. Try adjusting your search or filters.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">S/N</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Gender</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Program</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Level</th>
                                        <th className="px-4 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center w-20">Test</th>
                                        <th className="px-4 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center w-32">Comportment</th>
                                        <th className="px-4 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center w-24">Answer</th>
                                        <th className="px-4 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center w-24">Proposal</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Total</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {filteredExercises.map((exercise) => (
                                        <tr key={exercise.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 font-mono">
                                                {exercise.applicationNumber}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">{exercise.name}</div>
                                                <div className="text-xs text-gray-500">{exercise.academicYear}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                                {exercise.gender}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                                {exercise.program}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${exercise.level === 'PhD' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                                                    exercise.level === 'MSc' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                                                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                    }`}>
                                                    {exercise.level}
                                                </span>
                                            </td>

                                            {['testScore', 'comportment', 'answer', 'proposal'].map((field) => (
                                                <td key={field} className="px-2 py-4">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={exercise[field as keyof AdmissionExercise]}
                                                        onChange={(e) => handleScoreChange(exercise.id, field as keyof AdmissionExercise, e.target.value)}
                                                        onBlur={() => saveScore(exercise)}
                                                        className="w-16 h-8 text-center text-sm border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-800 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                                                    />
                                                </td>
                                            ))}

                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                                                        {exercise.total}
                                                    </span>
                                                    {savingId === exercise.id && (
                                                        <div className="h-3 w-3 rounded-full border-2 border-purple-500 border-t-transparent animate-spin"></div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    {actioningId === exercise.applicationNumber ? (
                                                        <div className="h-8 w-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
                                                    ) : (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => setApplicationStatus(exercise.applicationNumber, 'APPROVED')}
                                                                disabled={exercise.status === 'APPROVED' || exercise.total < MIN_SCORE_TO_APPROVE}
                                                                title={exercise.total < MIN_SCORE_TO_APPROVE ? `Minimum score of ${MIN_SCORE_TO_APPROVE} required to approve` : undefined}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                            >
                                                                <Check className="h-3.5 w-3.5" />
                                                                Approve
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setApplicationStatus(exercise.applicationNumber, 'REJECTED')}
                                                                disabled={exercise.status === 'REJECTED'}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                            >
                                                                <X className="h-3.5 w-3.5" />
                                                                Reject
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </DeputyCenterLeaderLayout>
    );
}
