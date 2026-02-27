"use client"

import React, { useState, useEffect } from 'react';
import DeputyCenterLeaderLayout from '../components/DeputyCenterLeaderLayout';
import {
    Users, Plus, Search, Filter, Edit, Trash2, Eye, EyeOff,
    MoreVertical, Download, Upload, X, Check, AlertCircle, Camera, ChevronDown, FileSpreadsheet, FileText
} from 'lucide-react';
import Image from 'next/image';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Lecturer {
    id: string;
    email: string;
    firstname: string | null;
    surname: string | null;
    avatar: string | null;
    phoneNumber: string | null;
    role: string;
    staffId: string | null;
    title: string | null;
    department: string | null;
    faculty: string | null;
    qualification: string | null;
    specialization: string | null;
    employmentType: string | null;
    status: string;
    appointmentDate: string | null;
    createdAt: string;
    updatedAt: string;
}

interface RoleOption {
    role: string;
    displayName: string;
}

export default function LecturerManagement() {
    const [users, setUsers] = useState<Lecturer[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<Lecturer[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    // Default to Lecturer and effectively lock it for this view
    const [selectedRole, setSelectedRole] = useState('Lecturer');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<Lecturer | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [showExportMenu, setShowExportMenu] = useState(false);

    const [formData, setFormData] = useState({
        email: '',
        firstname: '',
        surname: '',
        password: '',
        role: 'Lecturer',
        staffId: '',
        title: '',
        department: '',
        faculty: '',
        qualification: '',
        specialization: '',
        employmentType: 'Full Time',
        phoneNumber: '',
        status: 'ACTIVE',
        avatar: '',
    });

    const [avatarPreview, setAvatarPreview] = useState<string>('');
    const [showCreatePassword, setShowCreatePassword] = useState(false);
    const [showEditPassword, setShowEditPassword] = useState(false);

    const [roleOptions, setRoleOptions] = useState<RoleOption[]>([]);

    useEffect(() => {
        fetchUsers();
        fetchRoles();
    }, []);

    useEffect(() => {
        filterUsers();
    }, [searchTerm, selectedRole, users]);

    // Close export menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (showExportMenu && !target.closest('.export-dropdown')) {
                setShowExportMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showExportMenu]);

    const fetchRoles = async () => {
        try {
            const response = await fetch('/api/admin/roles');
            const data = await response.json();
            if (data.success && Array.isArray(data.roles)) {
                const fetched: RoleOption[] = (data.roles as any[])
                    .filter((r) => r?.role && r.role !== 'SUPER_ADMIN')
                    .map((r) => ({
                        role: String(r.role),
                        displayName: String(r.displayName || r.role).trim(),
                    }));
                if (fetched.length > 0) setRoleOptions(fetched);
            }
        } catch (error) {
            console.error('Error fetching roles:', error);
        }
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            // Fetch lecturers from the Lecturer table
            const response = await fetch('/api/deputy-center-leader/lecturers');
            const data = await response.json();
            if (data.success) {
                setUsers(data.lecturers);
            } else {
                showMessage('error', 'Failed to fetch lecturers');
            }
        } catch (error) {
            showMessage('error', 'Error fetching lecturers');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterUsers = () => {
        let filtered = users;

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(user =>
                user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.firstname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.surname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.staffId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.department?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredUsers(filtered);
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/deputy-center-leader/lecturers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.success) {
                showMessage('success', 'Lecturer created successfully');
                setShowCreateModal(false);
                fetchUsers();
                resetForm();
            } else {
                showMessage('error', data.message || 'Failed to create lecturer');
            }
        } catch (error) {
            showMessage('error', 'Error creating lecturer');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;

        setLoading(true);

        try {
            const response = await fetch(`/api/deputy-center-leader/lecturers/${selectedUser.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.success) {
                showMessage('success', 'Lecturer updated successfully');
                setShowEditModal(false);
                fetchUsers();
                resetForm();
            } else {
                showMessage('error', data.message || 'Failed to update lecturer');
            }
        } catch (error) {
            showMessage('error', 'Error updating lecturer');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async () => {
        if (!selectedUser) return;

        setLoading(true);

        try {
            const response = await fetch(`/api/deputy-center-leader/lecturers/${selectedUser.id}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (data.success) {
                showMessage('success', 'Lecturer deleted successfully');
                setShowDeleteModal(false);
                fetchUsers();
            } else {
                showMessage('error', data.message || 'Failed to delete lecturer');
            }
        } catch (error) {
            showMessage('error', 'Error deleting lecturer');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const openEditModal = (user: Lecturer) => {
        setSelectedUser(user);
        setFormData({
            email: user.email,
            firstname: user.firstname || '',
            surname: user.surname || '',
            password: '',
            role: user.role,
            staffId: user.staffId || '',
            title: user.title || '',
            department: user.department || '',
            faculty: user.faculty || '',
            qualification: user.qualification || '',
            specialization: user.specialization || '',
            employmentType: user.employmentType || 'Full Time',
            phoneNumber: user.phoneNumber || '',
            status: user.status || 'ACTIVE',
            avatar: user.avatar || '',
        });
        setAvatarPreview(user.avatar || '');
        setShowEditPassword(false);
        setShowEditModal(true);
    };

    const openDeleteModal = (user: Lecturer) => {
        setSelectedUser(user);
        setShowDeleteModal(true);
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                showMessage('error', 'Avatar image must be less than 2MB');
                return;
            }

            // Check file type
            if (!file.type.startsWith('image/')) {
                showMessage('error', 'Please upload an image file');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setFormData({ ...formData, avatar: base64String });
                setAvatarPreview(base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeAvatar = () => {
        setFormData({ ...formData, avatar: '' });
        setAvatarPreview('');
    };

    const resetForm = () => {
        setFormData({
            email: '',
            firstname: '',
            surname: '',
            password: '',
            role: 'Lecturer',
            staffId: '',
            title: '',
            department: '',
            faculty: '',
            qualification: '',
            specialization: '',
            employmentType: 'Full Time',
            phoneNumber: '',
            status: 'ACTIVE',
            avatar: '',
        });
        setAvatarPreview('');
        setSelectedUser(null);
        setShowCreatePassword(false);
        setShowEditPassword(false);
    };

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 5000);
    };

    const exportToExcel = () => {
        // Prepare data for export
        const exportData = filteredUsers.map(user => ({
            'Email': user.email,
            'First Name': user.firstname || '',
            'Surname': user.surname || '',
            'Role': user.role.replace(/_/g, ' '),
            'Joined Date': new Date(user.createdAt).toLocaleDateString(),
            'Last Updated': new Date(user.updatedAt).toLocaleDateString(),
        }));

        // Create worksheet
        const ws = XLSX.utils.json_to_sheet(exportData);

        // Set column widths
        ws['!cols'] = [
            { wch: 30 }, // Email
            { wch: 15 }, // First Name
            { wch: 15 }, // Surname
            { wch: 25 }, // Role
            { wch: 15 }, // Joined Date
            { wch: 15 }, // Last Updated
        ];

        // Create workbook
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Lecturers');

        // Generate filename with timestamp
        const filename = `ACE-SPED_Lecturers_${new Date().toISOString().split('T')[0]}.xlsx`;

        // Save file
        XLSX.writeFile(wb, filename);

        showMessage('success', 'Lecturers exported to Excel successfully');
        setShowExportMenu(false);
    };

    const exportToPDF = () => {
        const doc = new jsPDF();

        // Add title
        doc.setFontSize(18);
        doc.setTextColor(22, 163, 74); // Green color
        doc.text('ACE-SPED Lecturers Report', 14, 20);

        // Add metadata
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
        doc.text(`Total Lecturers: ${filteredUsers.length}`, 14, 34);

        // Prepare table data
        const tableData = filteredUsers.map(user => [
            user.email,
            user.firstname || '',
            user.surname || '',
            user.role.replace(/_/g, ' '),
            new Date(user.createdAt).toLocaleDateString(),
        ]);

        // Add table
        autoTable(doc, {
            head: [['Email', 'First Name', 'Surname', 'Role', 'Joined']],
            body: tableData,
            startY: 40,
            styles: {
                fontSize: 9,
                cellPadding: 3,
            },
            headStyles: {
                fillColor: [22, 163, 74], // Green
                textColor: [255, 255, 255],
                fontStyle: 'bold',
            },
            alternateRowStyles: {
                fillColor: [245, 245, 245],
            },
            margin: { top: 40 },
        });

        // Generate filename with timestamp
        const filename = `ACE-SPED_Lecturers_${new Date().toISOString().split('T')[0]}.pdf`;

        // Save PDF
        doc.save(filename);

        showMessage('success', 'Lecturers exported to PDF successfully');
        setShowExportMenu(false);
    };

    return (
        <DeputyCenterLeaderLayout>
            <div className="p-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Lecturer Management
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Manage lecturers and their permissions
                    </p>
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

                {/* Actions Bar */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex flex-col sm:flex-row gap-4 flex-1">
                            {/* Search */}
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search lecturers..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="flex gap-2">
                            {/* Export Dropdown */}
                            <div className="relative export-dropdown">
                                <button
                                    onClick={() => setShowExportMenu(!showExportMenu)}
                                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center"
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Export
                                    <ChevronDown className={`h-4 w-4 ml-1 transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Export Menu */}
                                {showExportMenu && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-10">
                                        <button
                                            onClick={exportToExcel}
                                            className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center"
                                        >
                                            <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
                                            Export to Excel
                                        </button>
                                        <button
                                            onClick={exportToPDF}
                                            className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center"
                                        >
                                            <FileText className="h-4 w-4 mr-2 text-red-600" />
                                            Export to PDF
                                        </button>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => {
                                    resetForm();
                                    setShowCreatePassword(false);
                                    setShowCreateModal(true);
                                }}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Lecturer
                            </button>
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Lecturer
                                    </th>
                                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Email
                                    </th>
                                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Role
                                    </th>
                                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Joined
                                    </th>
                                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">
                                            Loading...
                                        </td>
                                    </tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">
                                            No lecturers found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <tr
                                            key={user.id}
                                            className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                        >
                                            <td className="py-4 px-6">
                                                <div className="flex items-center">
                                                    {user.avatar ? (
                                                        <div className="relative h-10 w-10 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                                                            <Image
                                                                src={user.avatar}
                                                                alt={`${user.firstname} ${user.surname}`}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                                                            {user.firstname?.[0] || 'L'}{user.surname?.[0] || 'U'}
                                                        </div>
                                                    )}
                                                    <div className="ml-3">
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {user.firstname} {user.surname}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                                                {user.email}
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                    {user.role.replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => openEditModal(user)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => openDeleteModal(user)}
                                                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Create/Edit User Modal */}
                {(showCreateModal || showEditModal) && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-[50%] mx-4">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {showCreateModal ? 'Create New Lecturer' : 'Edit Lecturer'}
                                </h2>
                            </div>
                            <form onSubmit={showCreateModal ? handleCreateUser : handleUpdateUser} className="p-6">
                                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                                    {/* Avatar Upload */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Avatar
                                        </label>
                                        <div className="flex items-center space-x-4">
                                            <div className="relative">
                                                {avatarPreview ? (
                                                    <div className="relative h-20 w-20 rounded-full overflow-hidden border-2 border-gray-300 dark:border-gray-600">
                                                        <Image
                                                            src={avatarPreview}
                                                            alt="Avatar preview"
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                                                        <Camera className="h-8 w-8" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <input
                                                    type="file"
                                                    id="avatar-upload"
                                                    accept="image/*"
                                                    onChange={handleAvatarChange}
                                                    className="hidden"
                                                />
                                                <label
                                                    htmlFor="avatar-upload"
                                                    className="cursor-pointer inline-flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                                >
                                                    <Upload className="h-4 w-4 mr-2" />
                                                    Choose Image
                                                </label>
                                                {avatarPreview && (
                                                    <button
                                                        type="button"
                                                        onClick={removeAvatar}
                                                        className="ml-2 inline-flex items-center px-4 py-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors"
                                                    >
                                                        <X className="h-4 w-4 mr-2" />
                                                        Remove
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Personal Info */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Title
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                placeholder="e.g. Dr., Prof."
                                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Phone Number
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.phoneNumber}
                                                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                First Name *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.firstname}
                                                onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
                                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Surname *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.surname}
                                                onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                                        />
                                    </div>

                                    {/* Professional Info */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Staff ID
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.staffId}
                                                onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Department
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.department}
                                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Faculty
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.faculty}
                                                onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Employment Type
                                            </label>
                                            <select
                                                value={formData.employmentType}
                                                onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                                            >
                                                <option value="Full Time">Full Time</option>
                                                <option value="Part Time">Part Time</option>
                                                <option value="Adjunct">Adjunct</option>
                                                <option value="Visiting">Visiting</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Academic Info */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Qualification
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.qualification}
                                                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                                                placeholder="e.g. PhD"
                                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Specialization
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.specialization}
                                                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Password {showEditModal && '(Leave blank to keep current)'} *
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showCreatePassword ? 'text' : 'password'}
                                                required={showCreateModal}
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                className="w-full px-4 py-2 pr-11 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowCreatePassword((prev) => !prev)}
                                                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                                aria-label={showCreatePassword ? 'Hide password' : 'Show password'}
                                            >
                                                {showCreatePassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                    </div>

                                </div>
                                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700 mt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowCreateModal(false);
                                            setShowEditModal(false);
                                            resetForm();
                                        }}
                                        className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Check className="h-4 w-4 mr-2" />
                                                Save Lecturer
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete Modal */}
                {showDeleteModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-sm mx-4">
                            <div className="text-center">
                                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
                                    <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                    Delete Lecturer
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                    Are you sure you want to delete this lecturer? This action cannot be undone.
                                </p>
                                <div className="flex justify-center gap-3">
                                    <button
                                        onClick={() => setShowDeleteModal(false)}
                                        className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleDeleteUser}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DeputyCenterLeaderLayout>
    );
}
