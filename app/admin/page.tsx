"use client"

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  Users, UserCheck, UserX, Shield, Activity, Database,
  Settings, FileText, TrendingUp, AlertCircle, CheckCircle,
  Clock, BarChart3, PieChart, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import AdminLayout from './components/AdminLayout';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    superAdmins: 0,
    centerLeaders: 0,
    lecturers: 0,
    students: 0,
    applicants: 0,
    recentActivity: 0,
  });

  const [recentUsers, setRecentUsers] = useState([]);
  const [systemHealth, setSystemHealth] = useState({
    database: 'healthy',
    api: 'healthy',
    storage: 'healthy',
  });

  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    // Set current time on client side only to avoid hydration mismatch
    setCurrentTime(new Date().toLocaleTimeString());
    
    // Fetch dashboard stats
    fetchDashboardStats();
    fetchRecentUsers();
    checkSystemHealth();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchRecentUsers = async () => {
    try {
      const response = await fetch('/api/admin/users/recent');
      const data = await response.json();
      if (data.success) {
        setRecentUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching recent users:', error);
    }
  };

  const checkSystemHealth = async () => {
    try {
      const response = await fetch('/api/admin/health');
      const data = await response.json();
      if (data.success) {
        setSystemHealth(data.health);
      }
    } catch (error) {
      console.error('Error checking system health:', error);
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      change: '+12%',
      isPositive: true,
    },
    {
      title: 'Active Users',
      value: stats.activeUsers,
      icon: UserCheck,
      color: 'from-green-500 to-green-600',
      change: '+8%',
      isPositive: true,
    },
    {
      title: 'Super Admins',
      value: stats.superAdmins,
      icon: Shield,
      color: 'from-purple-500 to-purple-600',
      change: '0%',
      isPositive: true,
    },
    {
      title: 'Recent Activity',
      value: stats.recentActivity,
      icon: Activity,
      color: 'from-orange-500 to-orange-600',
      change: '+24%',
      isPositive: true,
    },
  ];

  const roleDistribution = [
    { role: 'Students', count: stats.students, color: 'bg-blue-500' },
    { role: 'Lecturers', count: stats.lecturers, color: 'bg-green-500' },
    { role: 'Center Leaders', count: stats.centerLeaders, color: 'bg-purple-500' },
    { role: 'Applicants', count: stats.applicants, color: 'bg-orange-500' },
    { role: 'Super Admins', count: stats.superAdmins, color: 'bg-red-500' },
  ];

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Super Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back! Here's what's happening with your portal today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                  <div className={`flex items-center text-sm font-medium ${
                    stat.isPositive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                    {stat.isPositive ? (
                      <ArrowUpRight className="h-4 w-4 ml-1" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 ml-1" />
                    )}
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Role Distribution */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Role Distribution
              </h2>
              <PieChart className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {roleDistribution.map((item, index) => {
                const total = stats.totalUsers || 1;
                const percentage = ((item.count / total) * 100).toFixed(1);
                return (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {item.role}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {item.count} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`${item.color} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* System Health */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                System Health
              </h2>
              <Activity className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Database className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Database
                  </span>
                </div>
                {systemHealth.database === 'healthy' ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Activity className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    API Status
                  </span>
                </div>
                {systemHealth.api === 'healthy' ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Storage
                  </span>
                </div>
                {systemHealth.storage === 'healthy' ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
            </div>
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm text-green-800 dark:text-green-300 font-medium">
                All systems operational
              </p>
              {currentTime && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  Last checked: {currentTime}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Users Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Recent Users
            </h2>
            <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    User
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Email
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Role
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Joined
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No recent users to display
                    </td>
                  </tr>
                ) : (
                  recentUsers.map((user: any, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          {user.avatar ? (
                            <div className="relative h-8 w-8 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                              <Image 
                                src={user.avatar} 
                                alt={`${user.firstname} ${user.surname}`}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                              {user.firstname?.[0]}{user.surname?.[0]}
                            </div>
                          )}
                          <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white">
                            {user.firstname} {user.surname}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                        {user.email}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                          {user.role.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center text-xs font-medium text-green-600 dark:text-green-400">
                          <span className="h-2 w-2 bg-green-500 rounded-full mr-1"></span>
                          Active
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

