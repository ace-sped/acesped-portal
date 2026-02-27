"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, Settings, FileText,
  Activity, LogOut, Menu, X, ChevronDown,
  Bell, Search, User, Shield, UserPlus, BookOpen, GraduationCap, Newspaper, UserCircle, ClipboardList
} from 'lucide-react';

interface CenterLeaderLayoutProps {
  children: React.ReactNode;
}

interface CurrentUser {
  id: string;
  email: string;
  firstname?: string;
  surname?: string;
  avatar?: string;
  role: string;
}

export default function CenterLeaderLayout({ children }: CenterLeaderLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const pathname = usePathname();

  // Fetch current user on mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            setCurrentUser(data.user);
          }
        }
      } catch (error) {
        console.error('Failed to fetch current user:', error);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchCurrentUser();
  }, []);

  // Generate initials from name
  const getInitials = () => {
    if (!currentUser) return 'CL';
    const first = currentUser.firstname?.[0] || '';
    const last = currentUser.surname?.[0] || '';
    return (first + last).toUpperCase() || currentUser.email[0].toUpperCase();
  };

  // Get display name
  const getDisplayName = () => {
    if (!currentUser) return 'Center Leader';
    if (currentUser.firstname && currentUser.surname) {
      return `${currentUser.firstname} ${currentUser.surname}`;
    }
    if (currentUser.firstname) return currentUser.firstname;
    return currentUser.email.split('@')[0];
  };

  const navigation = [
    { name: 'Dashboard', href: '/center-leader', icon: LayoutDashboard },
    { name: 'Users', href: '/center-leader/users', icon: Users },
    { name: 'Students', href: '/center-leader/students', icon: GraduationCap },
    { name: 'Lecturers', href: '/center-leader/lecturers', icon: Users },
    { name: 'Applicants', href: '/center-leader/applicants', icon: UserPlus },
    { name: 'IVET Applicants', href: '/center-leader/skill-applicants', icon: ClipboardList },
    { name: 'Recommendations', href: '/center-leader/recommendation', icon: FileText },
    { name: 'Statement of Results', href: '/center-leader/statement-of-results', icon: FileText },
    { name: 'Support Letter', href: '/center-leader/support-letter', icon: FileText },
    { name: 'Manage News', href: '/center-leader/news', icon: Newspaper },
    { name: 'Manage Team', href: '/center-leader/team', icon: UserCircle },
    { name: 'Settings', href: '/center-leader/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 w-64`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <Link href="/" className="flex items-center">
              <div className="relative">
                <img src="/images/ace-logo.png" alt="ACE-SPED" className="h-10 w-10 rounded-full object-contain" />
              </div>
              <div className="ml-3">
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                  ACE Portal
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Center Leader</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`flex items-center px-4 py-3 rounded-lg transition-colors ${isActive
                        ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center min-w-0 flex-1">
                {loadingUser ? (
                  <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse" />
                ) : currentUser?.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={getDisplayName()}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                    {getInitials()}
                  </div>
                )}
                <div className="ml-3 min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {loadingUser ? '...' : getDisplayName()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {loadingUser ? '...' : currentUser?.email || 'leader@aceportal.com'}
                  </p>
                </div>
              </div>
              <button
                onClick={async () => {
                  try {
                    await fetch('/api/auth/logout', { method: 'POST' });
                    window.location.href = '/login';
                  } catch (error) {
                    console.error('Logout failed:', error);
                  }
                }}
                className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors ml-2 flex-shrink-0"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`${sidebarOpen ? 'ml-64' : 'ml-0'} transition-all duration-300`}>
        {/* Top Bar */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
          <div className="flex items-center justify-between px-8 py-4">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                {sidebarOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>

              {/* Search Bar */}
              <div className="ml-6 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 w-80 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <Bell className="h-6 w-6" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User Menu */}
              <button className="flex items-center space-x-2 p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <User className="h-6 w-6" />
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
