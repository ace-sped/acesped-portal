"use client";

import React, { useState, useEffect } from "react";
import RoleLayout from "../../components/shared/RoleLayout";
import { ArrowRightLeft, Calendar, BookOpen, Loader2, CheckCircle, AlertCircle } from "lucide-react";

const ACADEMIC_SESSIONS = ["2025/2026", "2026/2027", "2027/2028"] as const;
const SEMESTERS = ["First", "Second"] as const;

export default function ManageSessionPage() {
  const [academicSession, setAcademicSession] = useState<string>("2025/2026");
  const [semester, setSemester] = useState<string>("First");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/academic-program-coordinator/sessions");
      const data = await res.json();
      if (data.success) {
        setAcademicSession(data.academicSession || "2025/2026");
        setSemester(data.semester || "First");
      }
    } catch (err) {
      console.error("Failed to fetch session settings:", err);
      setMessage({ type: "error", text: "Failed to load session settings" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);
      const res = await fetch("/api/academic-program-coordinator/sessions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ academicSession, semester }),
      });
      const data = await res.json();

      if (data.success) {
        setMessage({ type: "success", text: "Active session updated. Students will see this on their dashboard." });
      } else {
        setMessage({ type: "error", text: data.message || "Failed to update session" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "An error occurred while saving" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <RoleLayout
      rolePath="academic-program-coordinator"
      roleDisplayName="Academic Program Coordinator"
      roleColor="indigo"
    >
      <div className="p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-12 w-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
            <ArrowRightLeft className="h-6 w-6 text-indigo-700 dark:text-indigo-300" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Manage Session
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Set the active academic session and semester. This will reflect on the students dashboard.
            </p>
          </div>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
              message.type === "success"
                ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0" />
            )}
            <p
              className={`text-sm ${
                message.type === "success"
                  ? "text-green-800 dark:text-green-200"
                  : "text-red-800 dark:text-red-200"
              }`}
            >
              {message.text}
            </p>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Active Academic Session
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Students will see this session and semester on their dashboard.
            </p>
          </div>

          {loading ? (
            <div className="p-12 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
          ) : (
            <div className="p-6 space-y-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar className="h-4 w-4 text-indigo-600" />
                  Academic Session
                </label>
                <select
                  value={academicSession}
                  onChange={(e) => setAcademicSession(e.target.value)}
                  className="w-full max-w-xs px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-white"
                >
                  {ACADEMIC_SESSIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <BookOpen className="h-4 w-4 text-indigo-600" />
                  Semester
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full max-w-xs px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-white"
                >
                  {SEMESTERS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  Preview:{" "}
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {academicSession} - {semester} Semester
                  </span>
                </p>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Save Active Session
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800 rounded-xl">
          <p className="text-sm text-indigo-800 dark:text-indigo-200">
            <strong>Note:</strong> This selection is used across the student portal for course registration, fees, and results display. Students will see the current active session and semester on their dashboard.
          </p>
        </div>
      </div>
    </RoleLayout>
  );
}
