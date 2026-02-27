"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Wallet,
  BookOpen,
  BarChart2,
  User,
  Folder,
  LifeBuoy,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ChevronDown,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";

interface StudentLayoutProps {
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

export default function StudentLayout({ children }: StudentLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            setCurrentUser(data.user);
            // Check if this is first login by checking if password needs to be changed
            // We can add a flag in the JWT or check user metadata
          } else {
            // Not authenticated, redirect to login
            router.push("/students/login");
          }
        } else {
          // Not authenticated, redirect to login
          router.push("/students/login");
        }
      } catch (error) {
        console.error("Failed to fetch current user:", error);
        router.push("/students/login");
      } finally {
        setLoadingUser(false);
      }
    };

    fetchCurrentUser();
  }, [router]);

  // Allow child pages (e.g. /students/profile) to open the change-password modal
  useEffect(() => {
    const onOpen = () => setShowPasswordModal(true);
    window.addEventListener("student:open-change-password", onOpen);
    return () => window.removeEventListener("student:open-change-password", onOpen);
  }, []);

  const getInitials = () => {
    if (!currentUser) return "ST";
    const first = currentUser.firstname?.[0] || "";
    const last = currentUser.surname?.[0] || "";
    return (first + last).toUpperCase() || currentUser.email[0].toUpperCase();
  };

  const getDisplayName = () => {
    if (!currentUser) return "Student";
    if (currentUser.firstname && currentUser.surname) {
      return `${currentUser.firstname} ${currentUser.surname}`;
    }
    if (currentUser.firstname) return currentUser.firstname;
    return currentUser.email.split("@")[0];
  };

  const navigation = [
    { name: "Dashboard", href: "/students", icon: LayoutDashboard },
    { name: "Academic Fees", href: "/students/academic-fees", icon: Wallet },
    {
      name: "Course Registration",
      href: "/students/course-registration",
      icon: BookOpen,
    },
    { name: "Results", href: "/students/results", icon: BarChart2 },
    { name: "Profile", href: "/students/profile", icon: User },
    { name: "Documents", href: "/students/documents", icon: Folder },
    { name: "Support", href: "/students/support", icon: LifeBuoy },
  ];

  const handlePasswordChange = async () => {
    setPasswordError("");

    if (!newPassword || !confirmPassword) {
      setPasswordError("Please fill in all fields");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setUpdatingPassword(true);
    try {
      const response = await fetch("/api/students/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update password");
      }

      setShowPasswordModal(false);
      setNewPassword("");
      setConfirmPassword("");
      alert("Password updated successfully! Please use your new password for future logins.");
    } catch (error: any) {
      setPasswordError(error.message || "Failed to update password");
    } finally {
      setUpdatingPassword(false);
    }
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
                <Lock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Change Password
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Please set a new password for your account
                </p>
              </div>
            </div>

            {passwordError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm text-red-800 dark:text-red-200">{passwordError}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  disabled={updatingPassword}
                >
                  Later
                </button>
                <button
                  onClick={handlePasswordChange}
                  disabled={updatingPassword}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updatingPassword ? "Updating..." : "Update Password"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 w-64`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <Link href="/" className="flex items-center">
              <div className="relative">
                <img
                  src="/images/ace-logo.png"
                  alt="ACE-SPED"
                  className="h-10 w-10 rounded-full object-contain"
                />
              </div>
              <div className="ml-3">
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                  ACE Portal
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Student Portal
                </p>
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
                        ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
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
                  <div className="h-8 w-8 bg-linear-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                    {getInitials()}
                  </div>
                )}
                <div className="ml-3 min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {loadingUser ? "..." : getDisplayName()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {loadingUser
                      ? "..."
                      : currentUser?.email || "student@aceportal.com"}
                  </p>
                </div>
              </div>
              <button
                onClick={async () => {
                  try {
                    await fetch("/api/auth/logout", { method: "POST" });
                    router.push("/students/login");
                  } catch (error) {
                    console.error("Logout failed:", error);
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
        className={`${sidebarOpen ? "ml-64" : "ml-0"} transition-all duration-300`}
      >
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
                  placeholder="Search courses, results, fees..."
                  className="pl-10 pr-4 py-2 w-72 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <Bell className="h-6 w-6" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Quick user indicator */}
              <button className="flex items-center space-x-2 p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <User className="h-6 w-6" />
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
}


