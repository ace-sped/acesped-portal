"use client";

import React, { useState } from "react";
import RoleLayout from "../../components/shared/RoleLayout";
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  Activity,
  BarChart3,
  PieChart,
  Lightbulb,
  FlaskConical,
  FolderKanban,
} from "lucide-react";

export default function HeadOfInnovationReportsPage() {
  const [dateRange, setDateRange] = useState("last30days");

  const reportTypes = [
    {
      title: "Project Pipeline Report",
      description: "Overview of proposals, active initiatives, and completion rates.",
      icon: FolderKanban,
      color: "from-indigo-500 to-indigo-600",
    },
    {
      title: "Innovation Impact Report",
      description: "Tracks outcomes, adoption impact, and strategic value delivered.",
      icon: Lightbulb,
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "Research Velocity Report",
      description: "Monitors execution speed, milestone throughput, and cycle time.",
      icon: TrendingUp,
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Experiment Performance Report",
      description: "Summarizes experiments, hypotheses, and validated learnings.",
      icon: FlaskConical,
      color: "from-pink-500 to-pink-600",
    },
    {
      title: "Resource Allocation Report",
      description: "Analyzes resource usage across teams, themes, and priorities.",
      icon: PieChart,
      color: "from-orange-500 to-orange-600",
    },
    {
      title: "Execution Health Report",
      description: "Highlights risks, blockers, completion trends, and team cadence.",
      icon: Activity,
      color: "from-teal-500 to-teal-600",
    },
  ];

  const recentReports = [
    {
      name: "Innovation Impact Summary - January 2026",
      date: new Date().toISOString(),
      type: "Impact",
      size: "2.8 MB",
    },
    {
      name: "Project Pipeline Review - December 2025",
      date: new Date(Date.now() - 2592000000).toISOString(),
      type: "Pipeline",
      size: "3.4 MB",
    },
    {
      name: "Experiment Performance - Q4 2025",
      date: new Date(Date.now() - 5184000000).toISOString(),
      type: "Performance",
      size: "1.9 MB",
    },
  ];

  const handleGenerateReport = (reportTitle: string) => {
    console.log(`Generating ${reportTitle} for ${dateRange}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${month}/${day}/${year}`;
  };

  return (
    <RoleLayout rolePath="head-of-innovation" roleDisplayName="Head of Innovation" roleColor="indigo">
      <div className="space-y-8">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">Innovation Reports</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Generate, review, and export strategic innovation intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-white p-5 shadow-sm dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">Generated This Month</p>
              <FileText className="h-5 w-5 text-indigo-500" />
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">18</p>
          </div>
          <div className="rounded-xl bg-white p-5 shadow-sm dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">On-Time Delivery</p>
              <BarChart3 className="h-5 w-5 text-green-500" />
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">94%</p>
          </div>
          <div className="rounded-xl bg-white p-5 shadow-sm dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">Open Insights</p>
              <Lightbulb className="h-5 w-5 text-amber-500" />
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">7</p>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center">
              <Calendar className="mr-3 h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Report Date Range:</span>
            </div>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="last7days">Last 7 Days</option>
              <option value="last30days">Last 30 Days</option>
              <option value="thismonth">This Month</option>
              <option value="lastmonth">Last Month</option>
              <option value="thisyear">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
        </div>

        <div>
          <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Generate New Report</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reportTypes.map((report, index) => {
              const Icon = report.icon;
              return (
                <div
                  key={index}
                  className="rounded-xl bg-white p-6 shadow-lg transition-shadow hover:shadow-xl dark:bg-gray-800"
                >
                  <div className={`mb-4 inline-flex rounded-xl bg-linear-to-br p-4 ${report.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">{report.title}</h3>
                  <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">{report.description}</p>
                  <button
                    onClick={() => handleGenerateReport(report.title)}
                    className="flex w-full items-center justify-center rounded-lg bg-linear-to-r from-indigo-600 to-indigo-700 px-4 py-2 text-white transition-colors hover:from-indigo-700 hover:to-indigo-800"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Report
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl bg-white shadow-lg dark:bg-gray-800">
          <div className="border-b border-gray-200 p-6 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Reports</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Report Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Generated Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Size
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentReports.map((report, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <FileText className="mr-3 h-5 w-5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{report.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                        {report.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{formatDate(report.date)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{report.size}</td>
                    <td className="px-6 py-4">
                      <button className="flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white transition-colors hover:bg-indigo-700">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </RoleLayout>
  );
}
