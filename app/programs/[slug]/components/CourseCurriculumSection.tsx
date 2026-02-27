import React, { useState } from 'react';
import { ChevronDown, ChevronUp, BookOpen, Clock, Calendar } from 'lucide-react';

interface Course {
    id: string;
    title: string;
    courseCode?: string;
    overview: string;
    programType?: string; // 'MSc', 'PhD', etc.
    semester?: string;
    creditHours?: number;
}

interface CourseCurriculumSectionProps {
    courses: Course[];
    programSlug?: string;
}

export default function CourseCurriculumSection({ courses, programSlug }: CourseCurriculumSectionProps) {
    const isAmtProgram = programSlug === 'additive-manufacturing-3-d-printing-technology-amt';
    const [activeLevel, setActiveLevel] = useState<'MSc' | 'PhD' | 'PGD'>(isAmtProgram ? 'PGD' : 'MSc');
    const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);

    // Filter courses based on active level
    const filteredCourses = courses.filter((course) => {
        const type = (course.programType || '').toLowerCase();
        if (activeLevel === 'PhD') {
            return type.includes('phd') || type.includes('doctorate');
        } else if (activeLevel === 'PGD') {
            return type.includes('pgd') || type.includes('post graduate diploma');
        } else {
            return !type.includes('phd') && !type.includes('doctorate') && !type.includes('pgd');
        }
    });

    // Split courses by semester
    const firstSemesterCourses = filteredCourses.filter((course) => {
        const sem = (course.semester || '').toLowerCase();
        return sem.includes('first') || sem.includes('1st') || sem === '1';
    });

    const secondSemesterCourses = filteredCourses.filter((course) => {
        const sem = (course.semester || '').toLowerCase();
        return sem.includes('second') || sem.includes('2nd') || sem === '2';
    });

    const toggleCourse = (id: string) => {
        if (expandedCourseId === id) {
            setExpandedCourseId(null);
        } else {
            setExpandedCourseId(id);
        }
    };

    const renderCourseAccordion = (course: Course) => (
        <div
            key={course.id}
            className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-gray-50 dark:bg-gray-900 mb-3"
        >
            <button
                onClick={() => toggleCourse(course.id)}
                className="w-full flex items-center justify-between p-4 text-left focus:outline-none"
            >
                <div className="flex items-center gap-3">
                    <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-bold px-2 py-1 rounded text-xs w-20 text-center shrink-0">
                        {course.courseCode || 'N/A'}
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base line-clamp-1">
                        {course.title}
                    </span>
                </div>
                {expandedCourseId === course.id ? (
                    <ChevronUp className="h-4 w-4 text-gray-500 flex-shrink-0 ml-2" />
                ) : (
                    <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0 ml-2" />
                )}
            </button>

            {expandedCourseId === course.id && (
                <div className="px-4 pb-4 pt-0 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800">
                    <div className="mt-3 prose prose-green max-w-none text-gray-600 dark:text-gray-400 text-xs sm:text-sm leading-relaxed">
                        {/* Meta Info */}
                        <div className="flex flex-wrap gap-3 mb-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                            {course.creditHours && (
                                <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    <span>{course.creditHours} Credits</span>
                                </div>
                            )}
                            <div className="flex items-center gap-1">
                                <BookOpen className="h-3 w-3" />
                                <span>{course.programType || 'Core'}</span>
                            </div>
                        </div>

                        <p>{course.overview || 'No description available.'}</p>
                    </div>
                </div>
            )}
        </div>
    );

    if (courses.length === 0) return null;

    return (
        <section className="py-12 sm:py-16 lg:py-20 bg-white dark:bg-gray-800">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8 sm:mb-12">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Course Curriculum
                    </h2>
                    <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
                        Comprehensive syllabus covering all essential topics
                    </p>
                </div>

                {/* Level Filter Buttons */}
                <div className="flex justify-center mb-10 gap-4">
                    {isAmtProgram ? (
                        <button
                            onClick={() => setActiveLevel('PGD')}
                            className={`px-6 py-2 rounded-full font-medium transition-all ${activeLevel === 'PGD'
                                ? 'bg-green-600 text-white shadow-lg scale-105'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                                }`}
                        >
                            PGD
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={() => setActiveLevel('MSc')}
                                className={`px-6 py-2 rounded-full font-medium transition-all ${activeLevel === 'MSc'
                                    ? 'bg-green-600 text-white shadow-lg scale-105'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                                    }`}
                            >
                                MSc/MEng
                            </button>
                            <button
                                onClick={() => setActiveLevel('PhD')}
                                className={`px-6 py-2 rounded-full font-medium transition-all ${activeLevel === 'PhD'
                                    ? 'bg-green-600 text-white shadow-lg scale-105'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                                    }`}
                            >
                                PhD
                            </button>
                        </>
                    )}
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 max-w-screen-2xl mx-auto">
                    {/* First Semester Column */}
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-8 w-1 bg-green-600 rounded-full"></div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">First Semester</h3>
                            <span className="text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                                {firstSemesterCourses.length} Courses
                            </span>
                        </div>

                        <div className="space-y-3">
                            {firstSemesterCourses.length > 0 ? (
                                firstSemesterCourses.map(renderCourseAccordion)
                            ) : (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 italic text-sm">
                                    No courses found for First Semester.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Second Semester Column */}
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-8 w-1 bg-green-600 rounded-full"></div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Second Semester</h3>
                            <span className="text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                                {secondSemesterCourses.length} Courses
                            </span>
                        </div>

                        <div className="space-y-3">
                            {secondSemesterCourses.length > 0 ? (
                                secondSemesterCourses.map(renderCourseAccordion)
                            ) : (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 italic text-sm">
                                    No courses found for Second Semester.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
