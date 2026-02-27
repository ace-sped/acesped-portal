"use client";

import React, { useState, useEffect } from "react";
import {
  Wallet,
  BookOpen,
  BarChart2,
  Calendar,
  Clock,
  GraduationCap,
} from "lucide-react";
import StudentLayout from "./components/StudentLayout";

export default function StudentDashboard() {
  const [activeSession, setActiveSession] = useState<string>("2025/2026");
  const [activeSemester, setActiveSemester] = useState<string>("First");

  useEffect(() => {
    fetch("/api/active-session")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setActiveSession(data.academicSession || "2025/2026");
          setActiveSemester(data.semester || "First");
        }
      })
      .catch(() => {});
  }, []);
  const statCards = [
    {
      title: "Outstanding Fees",
      value: "₦0.00",
      subtitle: "All payments are up to date",
      icon: Wallet,
      color: "from-emerald-500 to-emerald-600",
    },
    {
      title: "Registered Courses",
      value: 0,
      subtitle: "For the current session",
      icon: BookOpen,
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Current GPA",
      value: "—",
      subtitle: "Results will appear here",
      icon: BarChart2,
      color: "from-amber-500 to-amber-600",
    },
    {
      title: "Next Academic Activity",
      value: "No schedule",
      subtitle: "Upcoming events & deadlines",
      icon: Calendar,
      color: "from-purple-500 to-purple-600",
    },
  ];

  const quickLinks = [
    {
      title: "Pay Academic Fees",
      description: "View your invoices and complete payments online.",
      href: "/students/academic-fees",
      icon: Wallet,
    },
    {
      title: "Register Courses",
      description: "Select and confirm your courses for this semester.",
      href: "/students/course-registration",
      icon: BookOpen,
    },
    {
      title: "View Results",
      description: "Check your grades and academic performance.",
      href: "/students/results",
      icon: BarChart2,
    },
  ];

  return (
    <StudentLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Student Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Welcome to your personalized academic space. Track your fees,
              courses and results in one place.
            </p>
          </div>
          <div className="flex items-center space-x-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl px-4 py-3">
            <GraduationCap className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                Current Session
              </p>
              <p className="text-sm text-emerald-800 dark:text-emerald-200">
                {activeSession} - {activeSemester} Semester
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.title}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 border border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`p-3 rounded-lg bg-linear-to-br ${stat.color}`}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <Clock className="h-4 w-4 text-gray-400" />
                </div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                  {stat.title}
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">
                  {typeof stat.value === "number"
                    ? stat.value.toString()
                    : stat.value}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.subtitle}
                </p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Quick Actions
              </h2>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Frequently used student services
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.title}
                    href={item.href}
                    className="group rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-800/60 hover:border-emerald-200 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-colors p-4 flex flex-col h-full"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 rounded-lg bg-white dark:bg-gray-900 shadow-sm">
                        <Icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 flex-1">
                      {item.description}
                    </p>
                    <span className="mt-3 text-xs font-medium text-emerald-600 dark:text-emerald-400 group-hover:underline">
                      Open
                    </span>
                  </a>
                );
              })}
            </div>
          </div>

          {/* At a Glance */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              At a Glance
            </h2>
            <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex items-start">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500 mr-2" />
                No outstanding academic fees at the moment.
              </li>
              <li className="flex items-start">
                <span className="mt-1 h-2 w-2 rounded-full bg-blue-500 mr-2" />
                Course registration for the current semester will open soon.
              </li>
              <li className="flex items-start">
                <span className="mt-1 h-2 w-2 rounded-full bg-amber-500 mr-2" />
                Once released, your results will be available under{" "}
                <span className="ml-1 font-medium">Results</span>.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}


