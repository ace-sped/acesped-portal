"use client"

import React, { useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { FileText, Download, Calendar, TrendingUp, Users, Activity, BarChart3, PieChart } from 'lucide-react';

export default function Reports() {
  const [dateRange, setDateRange] = useState('last30days');

  const reportTypes = [
    {
      title: 'User Activity Report',
      description: 'Detailed report of all user activities, logins, and actions',
      icon: Activity,
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'User Growth Report',
      description: 'Track user registration trends and growth metrics',
      icon: TrendingUp,
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'Role Distribution Report',
      description: 'Analysis of user roles and permissions across the platform',
      icon: Users,
      color: 'from-purple-500 to-purple-600',
    },
    {
      title: 'System Usage Report',
      description: 'Comprehensive system usage statistics and performance metrics',
      icon: BarChart3,
      color: 'from-orange-500 to-orange-600',
    },
    {
      title: 'Analytics Report',
      description: 'Detailed analytics of portal usage and engagement',
      icon: PieChart,
      color: 'from-pink-500 to-pink-600',
    },
    {
      title: 'Security Audit Report',
      description: 'Security events, failed logins, and access attempts',
      icon: FileText,
      color: 'from-red-500 to-red-600',
    },
  ];

  const recentReports = [
    {
      name: 'User Activity Report - November 2025',
      date: new Date().toISOString(),
      type: 'Activity',
      size: '2.4 MB',
    },
    {
      name: 'Monthly Analytics Report - October 2025',
      date: new Date(Date.now() - 2592000000).toISOString(),
      type: 'Analytics',
      size: '3.1 MB',
    },
    {
      name: 'Security Audit - Q4 2025',
      date: new Date(Date.now() - 5184000000).toISOString(),
      type: 'Security',
      size: '1.8 MB',
    },
  ];

  const handleGenerateReport = (reportTitle: string) => {
    console.log(`Generating ${reportTitle} for ${dateRange}`);
    // Add actual report generation logic here
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}/${day}/${year}`;
  };

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Reports & Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Generate comprehensive reports and analyze portal data
          </p>
        </div>

        {/* Date Range Selector */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-400 mr-3" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Report Date Range:
              </span>
            </div>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm text-gray-900 dark:text-white"
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

        {/* Report Types Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Generate New Report
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportTypes.map((report, index) => {
              const Icon = report.icon;
              return (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                >
                  <div className={`inline-flex p-4 bg-gradient-to-br ${report.color} rounded-xl mb-4`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {report.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {report.description}
                  </p>
                  <button
                    onClick={() => handleGenerateReport(report.title)}
                    className="w-full px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-colors flex items-center justify-center"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Report
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Reports */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Recent Reports
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Report Name
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Type
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Generated Date
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Size
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentReports.map((report, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {report.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {report.type}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(report.date)}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                      {report.size}
                    </td>
                    <td className="py-4 px-6">
                      <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center text-sm">
                        <Download className="h-4 w-4 mr-2" />
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
    </AdminLayout>
  );
}

