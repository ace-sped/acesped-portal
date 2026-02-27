'use client';

import React from 'react';
import AdminLayout from '../components/AdminLayout';
import AccessCodesManager from '@/components/access-codes-manager';

export default function AccessCodesPage() {
  return (
    <AdminLayout>
      <div className="p-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Access Codes Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Create and manage access codes for project viewing
          </p>
        </div>

        {/* Access Codes Manager Component */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <AccessCodesManager />
        </div>
      </div>
    </AdminLayout>
  );
}
