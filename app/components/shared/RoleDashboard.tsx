"use client"

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, FileText, TrendingUp, 
  CheckCircle, Clock, BarChart3, ArrowUpRight
} from 'lucide-react';

interface RoleDashboardProps {
  roleDisplayName: string;
  roleColor: string;
  statsEndpoint?: string;
  customStatLabels?: {
    totalUsers?: string;
    activeUsers?: string;
    recentActivity?: string;
  };
}

export default function RoleDashboard({ roleDisplayName, roleColor, statsEndpoint, customStatLabels }: RoleDashboardProps) {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    recentActivity: 0,
  });

  const [currentTime, setCurrentTime] = useState<string>('');

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch(statsEndpoint || '/api/admin/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString());
    fetchDashboardStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statsEndpoint]);

  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    green: 'from-green-500 to-green-600',
    indigo: 'from-indigo-500 to-indigo-600',
    orange: 'from-orange-500 to-orange-600',
    teal: 'from-teal-500 to-teal-600',
  };

  const gradient = colorClasses[roleColor as keyof typeof colorClasses] || colorClasses.blue;

  const statCards = [
    {
      title: customStatLabels?.totalUsers || 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: gradient,
    },
    {
      title: customStatLabels?.activeUsers || 'Active Users',
      value: stats.activeUsers,
      icon: CheckCircle,
      color: 'from-green-500 to-green-600',
    },
    {
      title: customStatLabels?.recentActivity || 'Recent Activity',
      value: stats.recentActivity,
      icon: TrendingUp,
      color: 'from-orange-500 to-orange-600',
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {roleDisplayName} Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome back! Here's what's happening with your portal today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {stat.value.toLocaleString()}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer">
            <LayoutDashboard className="h-6 w-6 text-blue-500 mb-2" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">View Dashboard</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Access your main dashboard</p>
          </div>
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-green-500 dark:hover:border-green-400 transition-colors cursor-pointer">
            <FileText className="h-6 w-6 text-green-500 mb-2" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">View Reports</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Check your reports and analytics</p>
          </div>
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-500 dark:hover:border-purple-400 transition-colors cursor-pointer">
            <BarChart3 className="h-6 w-6 text-purple-500 mb-2" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">View Analytics</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">See detailed analytics</p>
          </div>
        </div>
      </div>

      {currentTime && (
        <div className="mt-6 text-sm text-gray-500 dark:text-gray-400 text-center">
          Last updated: {currentTime}
        </div>
      )}
    </div>
  );
}



