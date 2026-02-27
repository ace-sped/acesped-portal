"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, Shield, Settings, FileText,
  Activity, Database, LogOut, Menu, X, ChevronDown,
  Bell, Search, User, UserPlus, BookOpen, GraduationCap, Newspaper, UserCircle, ClipboardList, Share, Youtube, Key
} from 'lucide-react';

interface AdminLayoutProps {
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

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const pathname = usePathname();

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    // Initial check
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    if (!currentUser) return 'SA';
    const first = currentUser.firstname?.[0] || '';
    const last = currentUser.surname?.[0] || '';
    return (first + last).toUpperCase() || currentUser.email[0].toUpperCase();
  };

  // Get display name
  const getDisplayName = () => {
    if (!currentUser) return 'Super Admin';
    if (currentUser.firstname && currentUser.surname) {
      return `${currentUser.firstname} ${currentUser.surname}`;
    }
    if (currentUser.firstname) return currentUser.firstname;
    return currentUser.email.split('@')[0];
  };

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Profile', href: '/admin/profile', icon: User },
    { name: 'User Management', href: '/admin/users', icon: Users },
    { name: 'Lecturer Management', href: '/admin/lecturers', icon: Users },
    { name: 'Applicants', href: '/admin/applicants', icon: UserPlus },
    { name: 'IVET Applicants', href: '/admin/skill-applicants', icon: ClipboardList },
    { name: 'Admission Exercise', href: '/admin/admission-exercise', icon: FileText },
    { name: 'Manage Services', href: '/admin/services', icon: BookOpen },
    { name: 'Manage Courses', href: '/admin/courses', icon: BookOpen },
    { name: 'Manage Programs', href: '/admin/programs', icon: GraduationCap },
    { name: 'Manage News', href: '/admin/news', icon: Newspaper },
    { name: 'Manage Youtube', href: '/admin/youtube', icon: Youtube },
    { name: 'Manage Team', href: '/admin/team', icon: UserCircle },
    { name: 'Manage Roles', href: '/admin/roles', icon: Shield },
    { name: 'Access Codes', href: '/admin/access-codes', icon: Key },
    { name: 'Activity Logs', href: '/admin/logs', icon: Activity },
    { name: 'System Settings', href: '/admin/settings', icon: Settings },
    { name: 'Reports', href: '/admin/reports', icon: FileText },
    { name: 'Share Docs', href: '/admin/share-docs', icon: Share },
    { name: 'Database', href: '/admin/database', icon: Database },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Sidebar Backdrop */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-transform duration-300 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 w-64 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <Link href="/" className="flex items-center">
              <div className="relative">
                <img src="/images/ace-logo.png" alt="ACE-SPED" className="h-10 w-10 rounded-full object-contain" />
              </div>
              <div className="ml-3">
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                  ACE Portal
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Super Admin</p>
              </div>
            </Link>
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 md:hidden"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={() => isMobile && setSidebarOpen(false)}
                      className={`flex items-center px-4 py-3 rounded-lg transition-colors ${isActive
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                    >
                      <Icon className="h-5 w-5 mr-3 shrink-0" />
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
                  <div className="h-8 w-8 bg-linear-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                    {getInitials()}
                  </div>
                )}
                <div className="ml-3 min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {loadingUser ? '...' : getDisplayName()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {loadingUser ? '...' : currentUser?.email || 'admin@aceportal.com'}
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
                className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors ml-2 shrink-0"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${sidebarOpen && !isMobile ? 'ml-64' : 'ml-0'
          }`}
      >
        {/* Top Bar */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 sm:px-8 py-4">
            <div className="flex items-center flex-1">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg mr-4"
              >
                <Menu className="h-6 w-6" />
              </button>

              {/* Search Bar */}
              <div className="relative hidden sm:block max-w-md w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Mobile Search Icon */}
              <button className="sm:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                <Search className="h-6 w-6" />
              </button>

              {/* Notifications */}
              <button className="relative p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <Bell className="h-6 w-6" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User Menu */}
              <button className="flex items-center space-x-2 p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <div className="h-8 w-8 bg-green-600 rounded-full flex items-center justify-center text-white font-medium text-sm sm:hidden">
                  {getInitials()}
                </div>
                <div className="hidden sm:block">
                  <User className="h-6 w-6" />
                </div>
                <ChevronDown className="h-4 w-4 hidden sm:block" />
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

