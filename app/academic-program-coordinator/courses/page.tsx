
"use client"

import React, { useState, useEffect, useRef } from 'react';
import RoleLayout from '../../components/shared/RoleLayout';
import {
    Search, BookOpen, Plus, Trash2, User, Loader2, X, Users, ChevronDown
} from 'lucide-react';

interface Lecturer {
    id: string;
    firstname: string;
    surname: string;
    email: string;
}

interface Program {
    id: string;
    title: string;
    courseCode: string;
}

interface Service {
    id: string;
    title: string;
    programs: Program[];
}

interface Course {
    id: string;
    title: string;
    courseCode: string;
    program: {
        id: string;
        title: string;
    };
    lecturers: Lecturer[];
}

export default function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [lecturers, setLecturers] = useState<Lecturer[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Filtering State
    const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
    const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);

    // Timeout ref for dropdown delay
    const timeoutRef = useRef<any>(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [selectedLecturerId, setSelectedLecturerId] = useState('');
    const [assigning, setAssigning] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const handleMouseEnter = (serviceId: string) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        setActiveDropdown(serviceId);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setActiveDropdown(null);
        }, 300);
    };

    // Effect to handle filtering when courses, search, or selected program changes
    useEffect(() => {
        let result = courses;

        // Filter by Program (primary filter if selected)
        if (selectedProgramId) {
            result = result.filter(course => course.program?.id === selectedProgramId);
        } else if (selectedServiceId) {
            // If just service is selected, show all courses from that service's programs.
            const service = services.find(s => s.id === selectedServiceId);
            if (service) {
                const programIds = service.programs.map(p => p.id);
                result = result.filter(course => programIds.includes(course.program?.id));
            }
        }

        // Filter by Search Term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(course =>
                course.title.toLowerCase().includes(term) ||
                (course.courseCode && course.courseCode.toLowerCase().includes(term))
            );
        }

        setFilteredCourses(result);
    }, [courses, searchTerm, selectedProgramId, selectedServiceId, services]);

    // When a program is selected, we should re-fetch courses for that program to be accurate?
    // Or just filter client side? The current GET /courses allows ?programId=...
    // Let's use the API for robust filtering when a program is selected.
    useEffect(() => {
        if (selectedProgramId) {
            fetchCourses(selectedProgramId);
        } else {
            // If no program selected, maybe fetch all again? Or just reset?
            // Initial load fetches all.
            if (!loading && courses.length === 0) fetchCourses(); // Re-fetch all if empty and not loading
        }
    }, [selectedProgramId]);


    const fetchData = async () => {
        try {
            setLoading(true);
            const [coursesRes, lecturersRes, servicesRes] = await Promise.all([
                fetch('/api/academic-program-coordinator/courses'),
                fetch('/api/academic-program-coordinator/lecturers'),
                fetch('/api/academic-program-coordinator/services')
            ]);

            const coursesData = await coursesRes.json();
            const lecturersData = await lecturersRes.json();
            const servicesData = await servicesRes.json();

            if (coursesData.success) {
                setCourses(coursesData.courses);
                setFilteredCourses(coursesData.courses);
            }
            if (lecturersData.success) setLecturers(lecturersData.lecturers);
            if (servicesData.success) setServices(servicesData.services);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCourses = async (programId: string = '') => {
        setLoading(true);
        try {
            const url = programId
                ? `/api/academic-program-coordinator/courses?programId=${programId}`
                : `/api/academic-program-coordinator/courses`;

            const response = await fetch(url);
            const data = await response.json();
            if (data.success) {
                setCourses(data.courses);
                // filteredCourses will be updated by the effect
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleProgramSelect = (serviceId: string, programId: string) => {
        if (selectedProgramId === programId) {
            // Deselect if already selected
            setSelectedProgramId(null);
            setSelectedServiceId(null);
            fetchCourses(); // Fetch all
        } else {
            setSelectedServiceId(serviceId);
            setSelectedProgramId(programId);
        }
        setActiveDropdown(null);
    };

    const openAssignModal = (course: Course) => {
        setSelectedCourse(course);
        setSelectedLecturerId('');
        setIsModalOpen(true);
    };

    const closeAssignModal = () => {
        setIsModalOpen(false);
        setSelectedCourse(null);
    };

    const handleAssignLecturer = async () => {
        if (!selectedCourse || !selectedLecturerId) return;

        setAssigning(true);
        try {
            const response = await fetch(`/api/academic-program-coordinator/courses/${selectedCourse.id}/lecturers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lecturerId: selectedLecturerId })
            });

            const data = await response.json();
            if (data.success) {
                // Update local state
                setCourses(prev => prev.map(c => {
                    if (c.id === selectedCourse.id) {
                        const lecturerAdded = lecturers.find(l => l.id === selectedLecturerId);
                        if (lecturerAdded && !c.lecturers.find(l => l.id === lecturerAdded.id)) {
                            return { ...c, lecturers: [...c.lecturers, lecturerAdded] };
                        }
                    }
                    return c;
                }));
                closeAssignModal();
            } else {
                alert(data.message || 'Failed to assign lecturer');
            }
        } catch (error) {
            console.error('Error assigning lecturer:', error);
            alert('An error occurred');
        } finally {
            setAssigning(false);
        }
    };

    const handleRemoveLecturer = async (courseId: string, lecturerId: string) => {
        if (!confirm('Are you sure you want to remove this lecturer from the course?')) return;

        try {
            const response = await fetch(`/api/academic-program-coordinator/courses/${courseId}/lecturers?lecturerId=${lecturerId}`, {
                method: 'DELETE'
            });

            const data = await response.json();
            if (data.success) {
                setCourses(prev => prev.map(c => {
                    if (c.id === courseId) {
                        return {
                            ...c,
                            lecturers: c.lecturers.filter(l => l.id !== lecturerId)
                        };
                    }
                    return c;
                }));
            } else {
                alert(data.message || 'Failed to remove lecturer');
            }
        } catch (error) {
            console.error('Error removing lecturer:', error);
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
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Courses Management</h1>
                        <p className="text-gray-600 dark:text-gray-400">Manage courses and lecturer assignments</p>
                    </div>
                </div>

                {/* Services & Programs Filter */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border-b border-gray-200 dark:border-gray-700">
                    <div className="flex flex-wrap gap-2">
                        {services.map((service) => (
                            <div
                                key={service.id}
                                className="relative"
                                onMouseEnter={() => handleMouseEnter(service.id)}
                                onMouseLeave={handleMouseLeave}
                            >
                                <button
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedServiceId === service.id
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400'
                                        }`}
                                >
                                    {service.title}
                                </button>

                                {activeDropdown === service.id && service.programs.length > 0 && (
                                    <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 py-1">
                                        {service.programs.map((program) => (
                                            <button
                                                key={program.id}
                                                onClick={() => handleProgramSelect(service.id, program.id)}
                                                className={`w-full text-left px-4 py-2 text-sm transition-colors ${selectedProgramId === program.id
                                                    ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                    }`}
                                            >
                                                {program.title}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Search */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search courses..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        />
                    </div>
                </div>

                {/* Courses List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="flex justify-center p-12">
                            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                        </div>
                    ) : filteredCourses.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 p-12 text-center rounded-xl shadow-sm">
                            <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No courses found</h3>
                            <p className="text-gray-500 dark:text-gray-400">Try adjusting your search criteria</p>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {filteredCourses.map(course => (
                                <div key={course.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                                                        {course.courseCode || 'No Code'}
                                                    </span>
                                                    <span className="text-sm text-gray-500 dark:text-gray-400">• {course.program?.title || 'No Program'}</span>
                                                </div>
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{course.title}</h3>
                                            </div>
                                            <button
                                                onClick={() => openAssignModal(course)}
                                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                                            >
                                                <Plus className="h-4 w-4 mr-1.5" />
                                                Assign Lecturer
                                            </button>
                                        </div>

                                        <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                                                <Users className="h-4 w-4 mr-2 text-indigo-500" />
                                                Assigned Lecturers
                                            </h4>

                                            {course.lecturers.length > 0 ? (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                    {course.lecturers.map(lecturer => (
                                                        <div key={lecturer.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700 group">
                                                            <div className="flex items-center gap-3 min-w-0">
                                                                <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center flex-shrink-0">
                                                                    <User className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                                        {lecturer.firstname} {lecturer.surname}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                                        {lecturer.email}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => handleRemoveLecturer(course.id, lecturer.id)}
                                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                                                title="Remove lecturer"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-500 dark:text-gray-400 italic pl-1">
                                                    No lecturers assigned yet.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Assign Lecturer Modal */}
            {isModalOpen && selectedCourse && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                Assign Lecturer
                            </h3>
                            <button
                                onClick={closeAssignModal}
                                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="mb-4">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Target Course</p>
                                <p className="font-medium text-gray-900 dark:text-white">{selectedCourse.title}</p>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Select Lecturer
                                </label>
                                <div className="relative">
                                    <select
                                        value={selectedLecturerId}
                                        onChange={(e) => setSelectedLecturerId(e.target.value)}
                                        className="block w-full pl-3 pr-10 py-2.5 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none"
                                    >
                                        <option value="">Select a lecturer...</option>
                                        {lecturers.length === 0 ? (
                                            <option disabled>No lecturers found</option>
                                        ) : (
                                            lecturers.map(lecturer => {
                                                const isAssigned = selectedCourse?.lecturers.some(sl => sl.id === lecturer.id);
                                                return (
                                                    <option
                                                        key={lecturer.id}
                                                        value={lecturer.id}
                                                        disabled={isAssigned}
                                                    >
                                                        {lecturer.firstname || ''} {lecturer.surname || ''} ({lecturer.email})
                                                        {isAssigned ? ' (Already Assigned)' : ''}
                                                    </option>
                                                );
                                            })
                                        )}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                        <ChevronDown className="h-4 w-4" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={closeAssignModal}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAssignLecturer}
                                    disabled={!selectedLecturerId || assigning}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {assigning ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Assigning...
                                        </>
                                    ) : (
                                        'Assign Lecturer'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </RoleLayout>
    );
}
