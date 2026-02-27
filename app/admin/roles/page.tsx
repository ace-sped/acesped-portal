"use client"

import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Shield, Plus, Edit, Trash2, Check, X, AlertCircle } from 'lucide-react';

interface Role {
    role: string;
    displayName: string;
    description: string;
    permissions: string[];
}

const AVAILABLE_PERMISSIONS = [
    'Dashboard',
    'Profile',
    'User Management',
    'Manage Applicants',
    'Skill Applicants',
    'Manage Services',
    'Manage Courses',
    'Manage Programs',
    'Manage News',
    'Manage Youtube',
    'Manage Team',
    'Role Management',
    'Activity Logs',
    'System Settings',
    'Reports',
    'Share Docs',
    'Database',
];

export default function RoleManagement() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [formData, setFormData] = useState({
        displayName: '',
        description: '',
        permissions: [] as string[],
    });

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            const response = await fetch('/api/admin/roles');
            const data = await response.json();
            if (data.success && Array.isArray(data.roles)) {
                setRoles(data.roles);
            }
        } catch (error) {
            console.error('Error fetching roles:', error);
            showMessage('error', 'Failed to fetch roles');
        } finally {
            setLoading(false);
        }
    };

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 5000);
    };

    const handleCreateRole = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.displayName) {
            showMessage('error', 'Role name is required');
            return;
        }

        try {
            const response = await fetch('/api/admin/roles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.success) {
                showMessage('success', 'Role created successfully');
                setShowCreateModal(false);
                setFormData({ displayName: '', description: '', permissions: [] });
                fetchRoles();
            } else {
                showMessage('error', data.message || 'Failed to create role');
            }
        } catch (error) {
            console.error('Error creating role:', error);
            showMessage('error', 'Error creating role');
        }
    };

    const togglePermission = (permission: string) => {
        setFormData(prev => {
            const permissions = prev.permissions.includes(permission)
                ? prev.permissions.filter(p => p !== permission)
                : [...prev.permissions, permission];
            return { ...prev, permissions };
        });
    };

    return (
        <AdminLayout>
            <div className="p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Role Management
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            View and manage user roles and their permissions
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 duration-200"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Add Role
                    </button>
                </div>

                {/* Message Alert */}
                {message && (
                    <div className={`mb-6 p-4 rounded-lg flex items-center justify-between ${message.type === 'success'
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
                        <button onClick={() => setMessage(null)}>
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                )}

                {/* Roles Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {loading ? (
                        <div className="col-span-full text-center py-12 text-gray-500">
                            Loading roles...
                        </div>
                    ) : roles.map((role) => (
                        <div key={role.role} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                    <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
                                </div>
                                {/* Future: Add edit/delete buttons here */}
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                {role.displayName}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 min-h-[40px] line-clamp-2">
                                {role.description}
                            </p>

                            <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                    Permissions ({role.permissions.length})
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {role.permissions.slice(0, 5).map((perm, idx) => (
                                        <span key={idx} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
                                            {perm}
                                        </span>
                                    ))}
                                    {role.permissions.length > 5 && (
                                        <span className="px-2 py-1 bg-gray-50 dark:bg-gray-800 text-gray-400 rounded text-xs" title={role.permissions.slice(5).join(', ')}>
                                            +{role.permissions.length - 5} more
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Create Role Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Create New Role
                                </h2>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                                >
                                    <X className="h-6 w-6 text-gray-500" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateRole} className="p-6 space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Role Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.displayName}
                                        onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                        placeholder="e.g. Content Manager"
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                                        required
                                    />
                                    <p className="mt-1 text-xs text-gray-500">This will be used to generate the role identifier.</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                        placeholder="Describe the role's responsibilities..."
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white resize-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                        Permissions
                                    </label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {AVAILABLE_PERMISSIONS.map((perm) => (
                                            <div
                                                key={perm}
                                                onClick={() => togglePermission(perm)}
                                                className={`
                          cursor-pointer p-3 rounded-lg border flex items-center justify-between transition-all
                          ${formData.permissions.includes(perm)
                                                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                                        : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 hover:border-green-300'}
                        `}
                                            >
                                                <span className={`text-sm ${formData.permissions.includes(perm) ? 'text-green-800 dark:text-green-300 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
                                                    {perm}
                                                </span>
                                                {formData.permissions.includes(perm) && (
                                                    <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-gray-800 pb-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
                                    >
                                        Create Role
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
