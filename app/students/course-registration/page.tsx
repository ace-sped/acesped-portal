"use client";

import React, { useState, useEffect } from "react";
import { BookOpen, CheckCircle2, CalendarDays, Loader2, AlertCircle } from "lucide-react";
import StudentLayout from "../components/StudentLayout";
import { toast } from "react-hot-toast";

interface Course {
  id: string;
  title: string;
  courseCode: string | null;
  creditHours: number | null;
  courseType: string | null;
  semester: string | null;
}

interface Program {
  title: string;
  level: string;
  studyMode: string | null;
}

export default function CourseRegistrationPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [program, setProgram] = useState<Program | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [session, setSession] = useState<string>("");
  const [semester, setSemester] = useState<string>("");
  const [programType, setProgramType] = useState<string>("");
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(new Set());

  const formatProgramType = (level: string) => {
    const key = (level || "")
      .toString()
      .trim()
      .replace(/\s+/g, "_")
      .toUpperCase();
    const map: Record<string, string> = {
      MASTERS: "Masters",
      PHD: "PhD",
      PGD: "PGD",
      MSC: "MSc",
      MASTERS_AND_PHD: "Masters / PhD",
      BACHELORS: "Bachelors",
      DIPLOMA: "Diploma",
      CERTIFICATE: "Certificate",
    };
    return map[key] || level;
  };

  useEffect(() => {
    fetchRegistrationData();
  }, []);

  const [isAuthError, setIsAuthError] = useState(false);
  const [isNotFound, setIsNotFound] = useState(false);

  useEffect(() => {
    fetchRegistrationData();
  }, []);

  const fetchRegistrationData = async () => {
    try {
      setLoading(true);
      setError(null);
      setIsAuthError(false);
      setIsNotFound(false);

      const response = await fetch('/api/students/course-registration');
      const data = await response.json();

      if (response.status === 401) {
        setIsAuthError(true);
        return;
      }

      if (response.status === 404) {
        setIsNotFound(true);
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch registration data');
      }

      if (data.success) {
        setProgram(data.program);
        setProgramType(data.programType || data.program?.level || "");
        setCourses(data.courses || []);
        setSession(data.session || "");
        setSemester(data.semester || "");
        if (data.registeredCourseIds) {
          setSelectedCourses(new Set(data.registeredCourseIds));
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : "Failed to load course registration data");
    } finally {
      setLoading(false);
    }
  };

  const toggleCourse = (courseId: string) => {
    const newSelected = new Set(selectedCourses);
    if (newSelected.has(courseId)) {
      newSelected.delete(courseId);
    } else {
      newSelected.add(courseId);
    }
    setSelectedCourses(newSelected);
  };

  const handleRegistration = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/students/course-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseIds: Array.from(selectedCourses),
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Course registration submitted successfully!");
        // Re-fetch to ensure sync
        await fetchRegistrationData();
      } else {
        toast.error(data.message || "Failed to submit registration");
      }
    } catch (err) {
      console.error("Registration error:", err);
      toast.error("An error occurred while submitting registration");
    } finally {
      setLoading(false);
    }
  };

  const totalUnits = Array.from(selectedCourses).reduce((total, courseId) => {
    const course = courses.find(c => c.id === courseId);
    return total + (course?.creditHours || 0);
  }, 0);

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        </div>
      </StudentLayout>
    );
  }

  if (isAuthError) {
    return (
      <StudentLayout>
        <div className="p-8 flex flex-col items-center justify-center min-h-[50vh] text-center">
          <div className="bg-amber-50 p-6 rounded-xl border border-amber-200 max-w-md w-full">
            <AlertCircle className="h-10 w-10 text-amber-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-6">Your session has expired or you are not logged in. Please log in to access course registration.</p>
            <a
              href="/students/login"
              className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
            >
              Log In Attempt
            </a>
          </div>
        </div>
      </StudentLayout>
    );
  }

  if (isNotFound) {
    return (
      <StudentLayout>
        <div className="p-8 flex flex-col items-center justify-center min-h-[50vh] text-center">
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 max-w-md w-full">
            <BookOpen className="h-10 w-10 text-blue-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Registration Not Available</h2>
            <p className="text-gray-600 mb-6">
              We could not find an active student record or program for your account.
              Please contact the academic office or ensure your admission status is active.
            </p>
            <button
              onClick={fetchRegistrationData}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Refresh
            </button>
          </div>
        </div>
      </StudentLayout>
    );
  }

  if (error) {
    return (
      <StudentLayout>
        <div className="p-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
            <button
              onClick={fetchRegistrationData}
              className="mt-2 text-sm underline hover:text-red-800"
            >
              Try Again
            </button>
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="p-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Course Registration
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Select and confirm your courses for the current academic session.
            </p>
          </div>
          <div className="flex items-center space-x-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl px-4 py-3">
            <CalendarDays className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-blue-700 dark:text-blue-300">
                Registration Status
              </p>
              <p className="text-sm font-semibold text-blue-800 dark:text-blue-100">
                Open
              </p>
            </div>
          </div>
        </div>

        {/* Current Session, Semester & Program Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              Current Session
            </p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {session || "N/A"}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Academic year
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              Current Semester
            </p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {semester ? `${semester} Semester` : "N/A"}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Courses listed below are for this semester
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              Programme
            </p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {program?.title || "N/A"}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {programType ? formatProgramType(programType) : "—"} · {program?.studyMode || "Full-time"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
              {programType ? `Courses shown are for ${formatProgramType(programType)} only` : "Courses for your program"}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5 flex items-center">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                Selected Units
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {totalUnits} units
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Minimum recommended: 15
              </p>
            </div>
          </div>
        </div>

        {/* Courses list */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Available Courses
            </h2>
            <button
              className="inline-flex items-center px-3 py-2 rounded-md text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={selectedCourses.size === 0 || loading}
              onClick={handleRegistration}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Submit Registration
            </button>
          </div>

          <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
            Select the courses you intend to take this semester.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">
                    Code
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">
                    Course Title
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">
                    Units
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">
                    Type
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">
                    Select
                  </th>
                </tr>
              </thead>
              <tbody>
                {courses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      No courses available for your program at this time.
                    </td>
                  </tr>
                ) : (
                  courses.map((course) => (
                    <tr
                      key={course.id}
                      className="border-b border-gray-100 dark:border-gray-700/60 hover:bg-gray-50 dark:hover:bg-gray-800/60"
                    >
                      <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">
                        {course.courseCode || "N/A"}
                      </td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-200">
                        {course.title}
                      </td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-200">
                        {course.creditHours || 0}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${course.courseType === "Core"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
                            : "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200"
                            }`}
                        >
                          {course.courseType || "Elective"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedCourses.has(course.id)}
                          onChange={() => toggleCourse(course.id)}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}


