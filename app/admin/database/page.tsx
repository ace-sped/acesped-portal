"use client"

import React, { useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { 
  Database, HardDrive, Download, Upload, RefreshCw, 
  Trash2, AlertCircle, Check, Activity, Server 
} from 'lucide-react';

export default function DatabaseManagement() {
  const [backups, setBackups] = useState([
    {
      id: '1',
      name: 'backup_2025_11_15_10_00.sql',
      size: '45.2 MB',
      date: new Date().toISOString(),
      type: 'Automatic',
    },
    {
      id: '2',
      name: 'backup_2025_11_14_10_00.sql',
      size: '44.8 MB',
      date: new Date(Date.now() - 86400000).toISOString(),
      type: 'Automatic',
    },
    {
      id: '3',
      name: 'backup_manual_2025_11_13.sql',
      size: '44.5 MB',
      date: new Date(Date.now() - 172800000).toISOString(),
      type: 'Manual',
    },
  ]);

  const [stats] = useState({
    totalSize: '2.5 GB',
    totalRecords: '12,450',
    lastBackup: new Date().toISOString(),
    backupCount: 15,
  });

  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleCreateBackup = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      showMessage('success', 'Database backup created successfully');
    } catch (error) {
      showMessage('error', 'Failed to create backup');
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreBackup = async (backupId: string) => {
    if (confirm('Are you sure you want to restore this backup? This action cannot be undone.')) {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        showMessage('success', 'Database restored successfully');
      } catch (error) {
        showMessage('error', 'Failed to restore backup');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteBackup = async (backupId: string) => {
    if (confirm('Are you sure you want to delete this backup?')) {
      setBackups(backups.filter(b => b.id !== backupId));
      showMessage('success', 'Backup deleted successfully');
    }
  };

  const handleOptimizeDatabase = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      showMessage('success', 'Database optimized successfully');
    } catch (error) {
      showMessage('error', 'Failed to optimize database');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Database Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage database backups, optimization, and maintenance
          </p>
        </div>

        {/* Message Alert */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center justify-between ${
            message.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
              : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
          }`}>
            <div className="flex items-center">
              {message.type === 'success' ? (
                <Check className="h-5 w-5 mr-2" />
              ) : (
                <AlertCircle className="h-5 w-5 mr-2" />
              )}
              <span>{message.text}</span>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                <HardDrive className="h-6 w-6 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {stats.totalSize}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Database Size</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                <Database className="h-6 w-6 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {stats.totalRecords}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Records</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                <Server className="h-6 w-6 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {stats.backupCount}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Backups</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
              {new Date(stats.lastBackup).toLocaleDateString()}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Last Backup</p>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <button
                onClick={handleCreateBackup}
                disabled={loading}
                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center disabled:opacity-50"
              >
                <Download className="h-5 w-5 mr-2" />
                Create Manual Backup
              </button>
              <button
                onClick={handleOptimizeDatabase}
                disabled={loading}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50"
              >
                <RefreshCw className="h-5 w-5 mr-2" />
                Optimize Database
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl shadow-lg p-6 border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start">
              <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400 mr-3 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-300 mb-2">
                  Important Notice
                </h3>
                <p className="text-yellow-800 dark:text-yellow-400 text-sm">
                  Always create a backup before performing major operations. 
                  Database restoration will overwrite current data. Ensure you have proper 
                  authorization before executing any database operations.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Backups Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Database Backups
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Backup Name
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Size
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Type
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Date Created
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {backups.map((backup) => (
                  <tr
                    key={backup.id}
                    className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <Database className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {backup.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                      {backup.size}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        backup.type === 'Automatic'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                      }`}>
                        {backup.type}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(backup.date).toLocaleString()}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRestoreBackup(backup.id)}
                          disabled={loading}
                          className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors disabled:opacity-50"
                          title="Restore"
                        >
                          <Upload className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {/* Download backup */}}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBackup(backup.id)}
                          disabled={loading}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

