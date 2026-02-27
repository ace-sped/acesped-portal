"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, Shield, Settings, FileText,
  Activity, Database, LogOut, Menu, X, ChevronDown,
  Bell, Search, User, UserPlus, BookOpen, GraduationCap, Newspaper, UserCircle, ClipboardList, Share, ArrowRightLeft, Key
} from 'lucide-react';

interface RoleLayoutProps {
  children: React.ReactNode;
  rolePath: string; // e.g., 'center-secretary', 'academic-program-coordinator'
  roleDisplayName: string; // e.g., 'Center Secretary'
  roleColor: string; // e.g., 'blue', 'purple', 'green'
}

interface CurrentUser {
  id: string;
  email: string;
  firstname?: string;
  surname?: string;
  avatar?: string;
  role: string;

}

interface Role {
  role: string;
  displayName: string;
  permissions: string[];
}

interface NavigationItem {
  name: string;
  href: string;
  icon: any;
}

// Map permission names to navigation items
const permissionToNavItem: { [key: string]: NavigationItem } = {
  'Dashboard': { name: 'Dashboard', href: '', icon: LayoutDashboard },
  'Profile': { name: 'Profile', href: '/profile', icon: User },
  'User Management': { name: 'User Management', href: '/users', icon: Users },
  'Manage Applicants': { name: 'Manage Applicants', href: '/applicants', icon: UserPlus },
  'Skill Applicants': { name: 'Skill Applicants', href: '/skill-applicants', icon: ClipboardList },
  'Manage Services': { name: 'Manage Services', href: '/services', icon: BookOpen },
  'Manage Programs': { name: 'Manage Programs', href: '/programs', icon: GraduationCap },
  'Manage Projects': { name: 'Manage Projects', href: '/projects', icon: BookOpen },
  'Manage News': { name: 'Manage News', href: '/news', icon: Newspaper },
  'Manage Team': { name: 'Manage Team', href: '/team', icon: UserCircle },
  'Role Management': { name: 'Role Management', href: '/roles', icon: Shield },
  'Access Codes': { name: 'Access Codes', href: '/access-codes', icon: Key },
  'Activity Logs': { name: 'Activity Logs', href: '/logs', icon: Activity },
  'System Settings': { name: 'System Settings', href: '/settings', icon: Settings },
  'Reports': { name: 'Reports', href: '/reports', icon: FileText },
  'Share Docs': { name: 'Share Docs', href: '/share-docs', icon: Share },
  'Database': { name: 'Database', href: '/database', icon: Database },
};

export default function RoleLayout({ children, rolePath, roleDisplayName, roleColor }: RoleLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const pathname = usePathname();

  // Fetch current user and role permissions on mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const userResponse = await fetch('/api/auth/me');
        if (userResponse.ok) {
          const userData = await userResponse.json();
          if (userData.success && userData.user) {
            setCurrentUser(userData.user);

            // Try to fetch role permissions
            try {
              const roleResponse = await fetch('/api/admin/roles');
              if (roleResponse.ok) {
                const roleData = await roleResponse.json();
                if (roleData.success && Array.isArray(roleData.roles)) {
                  // Determine effective role based on current path
                  let effectiveRoleName = userData.user.role;
                  const userRoles = [userData.user.role];

                  // Map path to potential DB role name
                  // precise mapping depends on your DB seeding
                  const pathRoleMap: Record<string, string> = {
                    'head-of-program': 'Head_of_Program',
                    'lecturer': 'Lecturer',
                    'academic-program-coordinator': 'Academic_Program_Coordinator',
                    'center-leader': 'Center_Leader',
                    'deputy-center-leader': 'Deputy_Center_Leader',
                    'center-secretary': 'Center_Secretary',
                    'admin': 'SUPER_ADMIN',
                    'head-of-innovation': 'Head_of_Innovation',
                  };

                  const contextRole = pathRoleMap[rolePath];

                  // If we are on a page that matches one of our roles, use that role's permissions
                  if (contextRole) {
                    if (userRoles.includes(contextRole)) {
                      effectiveRoleName = contextRole;
                    } else if (userRoles.includes(contextRole.toUpperCase())) {
                      effectiveRoleName = contextRole.toUpperCase();
                    }
                  }

                  const role = roleData.roles.find((r: Role) => r.role.toLowerCase() === effectiveRoleName.toLowerCase());
                  if (role) {
                    setUserRole(role);
                  }
                }
              }
            } catch (roleError) {
              // If we can't fetch roles, use default permissions based on role
              console.warn('Could not fetch role permissions, using defaults');
              // The navigation will fall back to showing all items if userRole is null
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch current user:', error);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchCurrentUser();
  }, [pathname, rolePath]);

  // Generate initials from name
  const getInitials = () => {
    if (!currentUser) return roleDisplayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const first = currentUser.firstname?.[0] || '';
    const last = currentUser.surname?.[0] || '';
    return (first + last).toUpperCase() || currentUser.email[0].toUpperCase();
  };

  // Get display name
  const getDisplayName = () => {
    if (!currentUser) return roleDisplayName;
    if (currentUser.firstname && currentUser.surname) {
      return `${currentUser.firstname} ${currentUser.surname}`;
    }
    if (currentUser.firstname) return currentUser.firstname;
    return currentUser.email.split('@')[0];
  };

  // Build navigation based on permissions
  // If we have role permissions, use them; otherwise show Dashboard and Profile as defaults
  let navigation: NavigationItem[] = [];

  if (rolePath === 'academic-program-coordinator') {
    navigation = [
      { name: 'Dashboard', href: `/${rolePath}`, icon: LayoutDashboard },
      { name: 'Programs', href: `/${rolePath}/programs`, icon: BookOpen },
      { name: 'Courses', href: `/${rolePath}/courses`, icon: BookOpen },
      { name: 'Students', href: `/${rolePath}/students`, icon: Users },
      { name: 'Lecturers', href: `/${rolePath}/lecturers`, icon: Users },
      { name: 'Thesis', href: `/${rolePath}/thesis`, icon: GraduationCap },
      { name: 'Results', href: `/${rolePath}/results`, icon: Activity },
      { name: 'Financials', href: `/${rolePath}/financials`, icon: ClipboardList },
      { name: 'Manage Session', href: `/${rolePath}/sessions`, icon: ArrowRightLeft },
      { name: 'Settings', href: `/${rolePath}/settings`, icon: Settings },
    ];
  } else if (userRole?.permissions && Array.isArray(userRole.permissions)) {
    const navItems: NavigationItem[] = [];
    for (const permission of userRole.permissions) {
      const navItem = permissionToNavItem[permission];
      if (navItem) {
        navItems.push({
          ...navItem,
          href: `/${rolePath}${navItem.href}`,
        });
      }
    }
    // Add My Courses for lecturer
    if (rolePath === 'lecturer' && !navItems.some(item => item.name === 'My Courses')) {
      navItems.splice(1, 0, { name: 'My Courses', href: `/${rolePath}/courses`, icon: BookOpen });
    }
    // Add Allocate Courses and Remove Manage Programs for head-of-program
    if (rolePath === 'head-of-program') {
      if (!navItems.some(item => item.name === 'Lecturers')) {
        navItems.splice(1, 0, { name: 'Lecturers', href: `/${rolePath}/lecturers`, icon: Users });
      }
      if (!navItems.some(item => item.name === 'Courses')) {
        const insertIndex = navItems.findIndex(item => item.name === 'Lecturers') + 1 || 2;
        navItems.splice(insertIndex, 0, { name: 'Courses', href: `/${rolePath}/courses`, icon: BookOpen });
      }
      if (!navItems.some(item => item.name === 'Students')) {
        const insertIndex = navItems.findIndex(item => item.name === 'Courses') + 1 || 3;
        navItems.splice(insertIndex, 0, { name: 'Students', href: `/${rolePath}/students`, icon: Users });
      }
      if (!navItems.some(item => item.name === 'Results')) {
        const insertIndex = navItems.findIndex(item => item.name === 'Students') + 1 || navItems.findIndex(item => item.name === 'Courses') + 1 || 3;
        navItems.splice(insertIndex, 0, { name: 'Results', href: `/${rolePath}/results`, icon: Activity });
      }
      if (!navItems.some(item => item.name === 'Allocate Courses')) {
        const insertIndex = navItems.findIndex(item => item.name === 'Results') + 1 || 4;
        navItems.splice(insertIndex, 0, { name: 'Allocate Courses', href: `/${rolePath}/allocate-courses`, icon: BookOpen });
      }
      // Remove Manage Programs
      const manageProgramsIndex = navItems.findIndex(item => item.name === 'Manage Programs');
      if (manageProgramsIndex !== -1) {
        navItems.splice(manageProgramsIndex, 1);
      }
    }

    // Add Lecturers for Center Leader and Deputy Center Leader
    if (rolePath === 'center-leader' || rolePath === 'deputy-center-leader') {
      // Ensure Students item exists
      let studentsIndex = navItems.findIndex(item => item.name === 'Students');
      if (studentsIndex === -1) {
        // If Students is missing, insert it after User Management, or at the end
        const userIndex = navItems.findIndex(item => item.name === 'User Management');
        const insertIndex = userIndex !== -1 ? userIndex + 1 : navItems.length;
        navItems.splice(insertIndex, 0, { name: 'Students', href: `/${rolePath}/students`, icon: Users });
        studentsIndex = insertIndex;
      }

      // Ensure Lecturers item exists under Students
      if (!navItems.some(item => item.name === 'Lecturers')) {
        navItems.splice(studentsIndex + 1, 0, { name: 'Lecturers', href: `/${rolePath}/lecturers`, icon: Users });
      }
    }

    // specific reordering for head-of-innovation
    if (rolePath === 'head-of-innovation') {
      const dashboardIndex = navItems.findIndex(item => item.name === 'Dashboard');
      const projectsIndex = navItems.findIndex(item => item.name === 'Manage Projects');
      if (dashboardIndex !== -1 && projectsIndex !== -1) {
        const [projectItem] = navItems.splice(projectsIndex, 1);
        navItems.splice(dashboardIndex + 1, 0, projectItem);
      }
    }

    navigation = navItems;
  } else {
    navigation = [
      { name: 'Dashboard', href: `/${rolePath}`, icon: LayoutDashboard },
      { name: 'Profile', href: `/${rolePath}/profile`, icon: User },
    ] as NavigationItem[];

    if (rolePath === 'lecturer') {
      navigation.splice(1, 0, { name: 'My Courses', href: `/${rolePath}/courses`, icon: BookOpen });
    }

    if (rolePath === 'head-of-innovation') {
      navigation.splice(1, 0, { name: 'Manage Projects', href: `/${rolePath}/projects`, icon: BookOpen });
    }

    if (rolePath === 'head-of-program') {
      navigation.splice(1, 0,
        { name: 'Lecturers', href: `/${rolePath}/lecturers`, icon: Users },
        { name: 'Courses', href: `/${rolePath}/courses`, icon: BookOpen },
        { name: 'Students', href: `/${rolePath}/students`, icon: Users },
        { name: 'Results', href: `/${rolePath}/results`, icon: Activity },
        { name: 'All Courses', href: `/${rolePath}/allocate-courses`, icon: BookOpen }
      );
    }
  }

  const colorClasses = {
    blue: {
      active: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
      gradient: 'from-blue-500 to-blue-600',
    },
    purple: {
      active: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400',
      gradient: 'from-purple-500 to-purple-600',
    },
    green: {
      active: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400',
      gradient: 'from-green-500 to-green-600',
    },
    indigo: {
      active: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400',
      gradient: 'from-indigo-500 to-indigo-600',
    },
    orange: {
      active: 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400',
      gradient: 'from-orange-500 to-orange-600',
    },
    teal: {
      active: 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400',
      gradient: 'from-teal-500 to-teal-600',
    },
  };

  const colors = colorClasses[roleColor as keyof typeof colorClasses] || colorClasses.blue;

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
                <p className="text-xs text-gray-500 dark:text-gray-400">{roleDisplayName}</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {navigation.map((item: NavigationItem) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href === `/${rolePath}` && pathname === `/${rolePath}`);
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`flex items-center px-4 py-3 rounded-lg transition-colors ${isActive
                        ? colors.active
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
                  <div className={`h-8 w-8 bg-linear-to-br ${colors.gradient} rounded-full flex items-center justify-center text-white font-medium text-sm`}>
                    {getInitials()}
                  </div>
                )}
                <div className="ml-3 min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {loadingUser ? '...' : getDisplayName()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {loadingUser ? '...' : currentUser?.email || ''}
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
                  className="pl-10 pr-4 py-2 w-64 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="relative p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

