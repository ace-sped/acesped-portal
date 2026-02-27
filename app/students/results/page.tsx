"use client";

import React from "react";
import { BarChart2, FileText } from "lucide-react";
import StudentLayout from "../components/StudentLayout";

export default function ResultsPage() {
  const sampleResults = [
    {
      session: "2023/2024",
      semester: "Second",
      gpa: "4.50",
      status: "Approved",
    },
    {
      session: "2023/2024",
      semester: "First",
      gpa: "4.20",
      status: "Approved",
    },
  ];

  return (
    <StudentLayout>
      <div className="p-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Results
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              View your academic performance across sessions and semesters.
            </p>
          </div>
          <div className="flex items-center space-x-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-xl px-4 py-3">
            <BarChart2 className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-amber-700 dark:text-amber-300">
                CGPA
              </p>
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-100">
                — (awaiting official computation)
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Session Results Summary
            </h2>
            <button className="inline-flex items-center px-3 py-2 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors">
              <FileText className="h-4 w-4 mr-2" />
              Download Transcript (Demo)
            </button>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
            These entries are sample placeholders. When connected to the backend
            you&apos;ll see your official results here.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">
                    Session
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">
                    Semester
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">
                    GPA
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">
                    View Details
                  </th>
                </tr>
              </thead>
              <tbody>
                {sampleResults.map((result) => (
                  <tr
                    key={`${result.session}-${result.semester}`}
                    className="border-b border-gray-100 dark:border-gray-700/60 hover:bg-gray-50 dark:hover:bg-gray-800/60"
                  >
                    <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">
                      {result.session}
                    </td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-200">
                      {result.semester} Semester
                    </td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white font-semibold">
                      {result.gpa}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
                        {result.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline">
                        View Result Slip
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            How grading works
          </h2>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            The student dashboard is designed to give you a clear overview of
            your performance. Once integrated with the academic records system,
            you&apos;ll be able to drill down to course-level grades, view
            grade points and credit loads, and generate official result slips
            for each semester.
          </p>
        </div>
      </div>
    </StudentLayout>
  );
}


