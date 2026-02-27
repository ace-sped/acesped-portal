"use client";

import React from "react";
import { Folder, UploadCloud } from "lucide-react";
import StudentLayout from "../components/StudentLayout";

export default function StudentDocumentsPage() {
  const sampleDocuments = [
    {
      name: "Admission Letter",
      type: "PDF",
      uploadedAt: "Sep 01, 2024",
      status: "Verified",
    },
    {
      name: "O&apos;Level Certificate",
      type: "PDF",
      uploadedAt: "Aug 20, 2024",
      status: "Pending Review",
    },
  ];

  return (
    <StudentLayout>
      <div className="p-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Documents
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your academic documents such as admission letters, results,
              and identification.
            </p>
          </div>
          <button className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors">
            <UploadCloud className="h-4 w-4 mr-2" />
            Upload Document
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">
                    Document
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">
                    Type
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">
                    Uploaded
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {sampleDocuments.map((doc) => (
                  <tr
                    key={doc.name}
                    className="border-b border-gray-100 dark:border-gray-700/60 hover:bg-gray-50 dark:hover:bg-gray-800/60"
                  >
                    <td className="py-3 px-4 flex items-center text-gray-900 dark:text-white font-medium">
                      <Folder className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mr-2" />
                      {doc.name}
                    </td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-200">
                      {doc.type}
                    </td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-200">
                      {doc.uploadedAt}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          doc.status === "Verified"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
                        }`}
                      >
                        {doc.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline mr-3">
                        View
                      </button>
                      <button className="text-xs font-medium text-gray-600 dark:text-gray-300 hover:underline">
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-gray-600 dark:text-gray-400">
            This page is a design mock. When wired to the backend, it will use
            your `StudentDocument` records from Prisma.
          </p>
        </div>
      </div>
    </StudentLayout>
  );
}


