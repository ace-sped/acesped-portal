'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Check, X, Key, Users, AlertCircle } from 'lucide-react';

interface AccessCode {
  id: string;
  code: string;
  accessTo: string[];
  isActive: boolean;
  maxUses?: number;
  usageCount: number;
  createdAt: string;
}

export default function AccessCodesManager() {
  const [accessCodes, setAccessCodes] = useState<AccessCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Form state
  const [newCode, setNewCode] = useState({
    code: '',
    accessTo: '',
    maxUses: '',
  });

  // Load access codes
  useEffect(() => {
    loadAccessCodes();
  }, []);

  const loadAccessCodes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/project-access-codes');
      if (response.ok) {
        const data = await response.json();
        setAccessCodes(data);
      } else {
        throw new Error('Failed to fetch access codes');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createAccessCode = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Parse accessTo string into array (comma-separated project IDs)
      const accessToArray = newCode.accessTo
        .split(',')
        .map(id => id.trim())
        .filter(id => id.length > 0);

      const response = await fetch('/api/project-access-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newCode.code,
          accessTo: accessToArray,
          maxUses: newCode.maxUses ? parseInt(newCode.maxUses) : undefined,
        }),
      });

      if (response.ok) {
        setNewCode({ code: '', accessTo: '', maxUses: '' });
        setShowCreateForm(false);
        loadAccessCodes();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to create access code');
      }
    } catch (err: any) {
      alert('Failed to create access code');
    }
  };

  const toggleActiveStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/project-access-codes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        loadAccessCodes();
      } else {
        alert('Failed to update access code');
      }
    } catch (err) {
      alert('Failed to update access code');
    }
  };

  const deleteAccessCode = async (id: string) => {
    if (!confirm('Are you sure you want to delete this access code?')) return;

    try {
      const response = await fetch(`/api/project-access-codes/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadAccessCodes();
      } else {
        alert('Failed to delete access code');
      }
    } catch (err) {
      alert('Failed to delete access code');
    }
  };

  const isMaxedOut = (maxUses?: number, usageCount?: number) => {
    if (!maxUses) return false;
    return (usageCount || 0) >= maxUses;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Access Codes</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Manage access codes for this project</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Code
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <form onSubmit={createAccessCode} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Access Code *
            </label>
            <input
              type="text"
              value={newCode.code}
              onChange={(e) => setNewCode({ ...newCode, code: e.target.value })}
              placeholder="e.g., INNOV2024"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Access To (Project IDs) *
            </label>
            <input
              type="text"
              value={newCode.accessTo}
              onChange={(e) => setNewCode({ ...newCode, accessTo: e.target.value })}
              placeholder="Comma-separated project IDs (e.g., proj1, proj2, proj3)"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Enter project IDs separated by commas
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Max Uses
            </label>
            <input
              type="number"
              value={newCode.maxUses}
              onChange={(e) => setNewCode({ ...newCode, maxUses: e.target.value })}
              placeholder="Unlimited"
              min="1"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
            >
              <Check className="w-4 h-4" />
              Create
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreateForm(false);
                setNewCode({ code: '', accessTo: '', maxUses: '' });
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Access Codes List */}
      {accessCodes.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <Key className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400">No access codes yet</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">Create your first access code to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {accessCodes.map((accessCode) => {
            const maxedOut = isMaxedOut(accessCode.maxUses, accessCode.usageCount);
            const isInvalid = !accessCode.isActive || maxedOut;

            return (
              <div
                key={accessCode.id}
                className={`bg-white dark:bg-gray-800 border rounded-lg p-4 ${
                  isInvalid ? 'border-red-200 dark:border-red-800 opacity-60' : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <code className="text-lg font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                        {accessCode.code}
                      </code>
                      {!accessCode.isActive && (
                        <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                          Inactive
                        </span>
                      )}
                      {maxedOut && (
                        <span className="text-xs px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded">
                          Max Uses Reached
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Access to:</span>{' '}
                        {accessCode.accessTo.length > 0 ? (
                          <span className="font-mono">{accessCode.accessTo.join(', ')}</span>
                        ) : (
                          <span className="italic">No projects specified</span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>
                            Used: {accessCode.usageCount}
                            {accessCode.maxUses ? ` / ${accessCode.maxUses}` : ' (unlimited)'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleActiveStatus(accessCode.id, accessCode.isActive)}
                      className={`p-2 rounded-lg transition-colors ${
                        accessCode.isActive
                          ? 'bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-700 dark:text-green-300'
                          : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400'
                      }`}
                      title={accessCode.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {accessCode.isActive ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => deleteAccessCode(accessCode.id)}
                      className="p-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
