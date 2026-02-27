'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../components/navbar/page';
import Footer from '../components/footer/page';
import { Search, Loader2, AlertCircle } from 'lucide-react';

interface AdmissionExercise {
    id: string;
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

export default function AdmissionExercisePage() {
    const [academicYear, setAcademicYear] = useState('');
    const [years, setYears] = useState<string[]>([]);
    const [exercises, setExercises] = useState<AdmissionExercise[]>([]);
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);
    const [error, setError] = useState('');
    const [hasSearched, setHasSearched] = useState(false);

    useEffect(() => {
        const fetchYears = async () => {
            try {
                // Fetch with a dummy year to get the years list without a heavy payload initially
                // or just fetch all if the dataset is small. 
                // Using a non-existent year to get empty exercises but valid years list.
                const response = await fetch('/api/admin/admission-exercise?academicYear=INIT_YEARS');
                const data = await response.json();
                if (data.success) {
                    setYears(data.years || []);
                }
            } catch (err) {
                console.error('Failed to fetch academic years', err);
            }
        };

        fetchYears();
    }, []);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!academicYear) return;

        setSearching(true);
        setError('');
        setHasSearched(true);
        setExercises([]);

        try {
            const response = await fetch(`/api/admin/admission-exercise?academicYear=${encodeURIComponent(academicYear)}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch data');
            }

            if (data.success) {
                setExercises(data.exercises || []);
            } else {
                setError(data.message || 'Failed to fetch data');
            }
        } catch (err: any) {
            console.error('Error fetching exercises:', err);
            setError(err.message || 'An error occurred while fetching data');
        } finally {
            setSearching(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col font-sans">
            <Navbar />

            {/* Breadcrumb Section */}
            <div className="bg-gray-100 py-3 border-b border-gray-200">
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-sm text-gray-600">
                        <Link href="/" className="hover:text-green-600 transition-colors">
                            Home
                        </Link>
                        <span className="mx-2">/</span>
                        <span className="text-gray-900">admission exercise</span>
                    </div>
                </div>
            </div>

            {/* Main Content Section */}
            <main className="flex-grow py-12 bg-white">
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="space-y-8">
                        {/* Heading & Search */}
                        <div>
                            <h1 className="text-2xl md:text-3xl font-normal text-green-700 mb-8 flex items-center">
                                <span className="mr-2 text-xl">&gt;</span>
                                Admission Exercises
                            </h1>

                            <form onSubmit={handleSearch} className="max-w-xl">
                                <div className="mb-4">
                                    <label
                                        htmlFor="academic-year"
                                        className="block text-gray-700 text-sm font-normal mb-2"
                                    >
                                        Select academic Year
                                    </label>
                                    <div className="flex flex-col sm:flex-row gap-0">
                                        <select
                                            id="academic-year"
                                            value={academicYear}
                                            onChange={(e) => setAcademicYear(e.target.value)}
                                            className="flex-grow appearance-none border border-gray-300 px-4 py-2.5 bg-white text-gray-700 focus:outline-none focus:border-green-500 rounded-l-md sm:rounded-r-none rounded-r-md sm:mb-0 mb-2"
                                        >
                                            <option value="">Select academic year</option>
                                            {years.map((year) => (
                                                <option key={year} value={year}>
                                                    {year}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            type="submit"
                                            disabled={searching}
                                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 font-medium rounded-r-md sm:rounded-l-none rounded-l-md transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            {searching ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Search className="h-4 w-4" />
                                            )}
                                            Search
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="max-w-3xl p-4 bg-red-50 border border-red-200 rounded-md flex items-start gap-3 text-red-700">
                                <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
                                <p>{error}</p>
                            </div>
                        )}

                        {/* Results Table */}
                        {hasSearched && !searching && !error && (
                            <div className="mt-8">
                                {exercises.length > 0 ? (
                                    <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">App. No.</th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Program</th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Score</th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comportment</th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Answer</th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proposal</th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-bold">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {exercises.map((exercise, index) => (
                                                    <tr key={exercise.id || index} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {exercise.applicationNumber}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {exercise.name}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {exercise.gender}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            <div className="flex flex-col">
                                                                <span>{exercise.program}</span>
                                                                <span className="text-xs text-gray-400">{exercise.level}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {exercise.testScore}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {exercise.comportment}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {exercise.answer}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {exercise.proposal}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 bg-gray-50">
                                                            {exercise.total}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                        <p className="text-gray-500">No admission exercises found for this academic year.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
