"use client";

import React from "react";
import { LifeBuoy, Mail, Phone } from "lucide-react";
import StudentLayout from "../components/StudentLayout";

export default function StudentSupportPage() {
  return (
    <StudentLayout>
      <div className="p-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Help & Support
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Get help with your portal, course registration, fees and more.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Raise a Support Ticket
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              This form is for illustration. When implemented, it can send your
              request to the support team for follow-up.
            </p>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  placeholder="e.g. Issue with course registration"
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Details
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe the issue you are facing..."
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
              >
                <LifeBuoy className="h-4 w-4 mr-2" />
                Submit (Demo)
              </button>
            </form>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Contact Channels
            </h2>
            <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex items-center">
                <Mail className="h-4 w-4 text-emerald-500 mr-2" />
                support@aceportal.com
              </li>
              <li className="flex items-center">
                <Phone className="h-4 w-4 text-emerald-500 mr-2" />
                +234 000 000 0000
              </li>
            </ul>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}


