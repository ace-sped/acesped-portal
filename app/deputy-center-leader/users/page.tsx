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

interface User {
  id: string;
  email: string;
  firstname: string | null;
  surname: string | null;
  avatar: string | null;
  role: string;

  createdAt: string;
  updatedAt: string;
}

interface RoleOption {
  role: string;
  displayName: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    firstname: '',
    surname: '',
    password: '',
    role: 'Student',

    avatar: '',
  });

  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);

  // Deputy Center Leaders cannot create or view SUPER_ADMIN users client-side
  const fallbackAllRoleOptions: RoleOption[] = [
    { role: 'Center_Leader', displayName: 'Center Leader' },
    { role: 'Center_Secretary', displayName: 'Center Secretary' },
    { role: 'Deputy_Center_Leader', displayName: 'Deputy Center Leader' },
    { role: 'Academic_Program_Coordinator', displayName: 'Academic Program Coordinator' },
    { role: 'Applied_Research_Coordinator', displayName: 'Applied Research Coordinator' },
    { role: 'Head_of_Program', displayName: 'Head of Program' },
    { role: 'Lecturer', displayName: 'Lecturer' },
    { role: 'PG_Rep', displayName: 'PG Representative' },
    { role: 'Student', displayName: 'Student' },
    { role: 'Applicant', displayName: 'Applicant' },
    { role: 'Staff', displayName: 'Staff' },
    { role: 'Head_of_Finance', displayName: 'Head of Finance' },
    { role: 'Industrial_Liaison_Officer', displayName: 'Industrial Liaison Officer' },
  ];

  const [roleOptions, setRoleOptions] = useState<RoleOption[]>(fallbackAllRoleOptions);

  const allRoleIds = roleOptions.map((r) => r.role);

  // Deputy Center Leaders cannot create Center Leader or other Deputy Center Leader accounts
  const assignableRoleIds = allRoleIds.filter(role => role !== 'Center_Leader' && role !== 'Deputy_Center_Leader');

  // Allow editing if it's one of the roles they can manage (or maybe they can edit themselves? logic here is for other users)
  // For simplicity, we use the same assignable list + current user role if they are editing someone. 
  // But typically they shouldn't edit their superiors. 

  const isEditingSuperior = selectedUser?.role === 'Center_Leader' || selectedUser?.role === 'Deputy_Center_Leader';
  const roleOptionIdsForEdit = isEditingSuperior ? allRoleIds : assignableRoleIds;

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
      const response = await fetch('/api/deputy-center-leader/users');
      const data = await response.json();
      if (data.success) {
        // Filter out SUPER_ADMIN users (double-check client-side)
        const filteredUsers = data.users.filter((user: User) =>
          user.role !== 'SUPER_ADMIN'
        );
        setUsers(filteredUsers);
      } else {
        showMessage('error', 'Failed to fetch users');
      }
    } catch (error) {
      showMessage('error', 'Error fetching users');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.firstname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.surname?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedRole !== 'ALL') {
      filtered = filtered.filter(user => user.role === selectedRole);
    }

    setFilteredUsers(filtered);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/deputy-center-leader/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        showMessage('success', 'User created successfully');
        setShowCreateModal(false);
        fetchUsers();
        resetForm();
      } else {
        showMessage('error', data.message || 'Failed to create user');
      }
    } catch (error) {
      showMessage('error', 'Error creating user');
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
      const response = await fetch(`/api/deputy-center-leader/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        showMessage('success', 'User updated successfully');
        setShowEditModal(false);
        fetchUsers();
        resetForm();
      } else {
        showMessage('error', data.message || 'Failed to update user');
      }
    } catch (error) {
      showMessage('error', 'Error updating user');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/deputy-center-leader/users/${selectedUser.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        showMessage('success', 'User deleted successfully');
        setShowDeleteModal(false);
        fetchUsers();
      } else {
        showMessage('error', data.message || 'Failed to delete user');
      }
    } catch (error) {
      showMessage('error', 'Error deleting user');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      firstname: user.firstname || '',
      surname: user.surname || '',
      password: '',
      role: user.role,
      avatar: user.avatar || '',
    });
    setAvatarPreview(user.avatar || '');
    setShowEditPassword(false);
    setShowEditModal(true);
  };

  const openDeleteModal = (user: User) => {
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
      role: 'Student',
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

  const getRoleBadgeColor = (role: string) => {
    const colors: { [key: string]: string } = {
      SUPER_ADMIN: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      Center_Leader: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      Lecturer: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      Student: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      Applicant: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      Staff: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      Applied_Research_Coordinator: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    };
    return colors[role] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
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
    XLSX.utils.book_append_sheet(wb, ws, 'Users');

    // Generate filename with timestamp
    const filename = `ACE-SPED_Users_${new Date().toISOString().split('T')[0]}.xlsx`;

    // Save file
    XLSX.writeFile(wb, filename);

    showMessage('success', 'Users exported to Excel successfully');
    setShowExportMenu(false);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(18);
    doc.setTextColor(22, 163, 74); // Green color
    doc.text('ACE-SPED Users Report', 14, 20);

    // Add metadata
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
    doc.text(`Total Users: ${filteredUsers.length}`, 14, 34);
    if (selectedRole !== 'ALL') {
      doc.text(`Filtered by Role: ${selectedRole.replace(/_/g, ' ')}`, 14, 40);
    }

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
      startY: selectedRole !== 'ALL' ? 45 : 40,
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
    const filename = `ACE-SPED_Users_${new Date().toISOString().split('T')[0]}.pdf`;

    // Save PDF
    doc.save(filename);

    showMessage('success', 'Users exported to PDF successfully');
    setShowExportMenu(false);
  };

  return (
    <DeputyCenterLeaderLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            User Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage users, roles, and permissions
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
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm text-gray-900 dark:text-white"
                />
              </div>

              {/* Role Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="pl-10 pr-8 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm text-gray-900 dark:text-white appearance-none"
                >
                  <option value="ALL">All Roles</option>
                  {roleOptions.map((r) => (
                    <option key={r.role} value={r.role}>
                      {r.displayName}
                    </option>
                  ))}
                </select>
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
                Add User
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
                    User
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
                      No users found
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
                              {user.firstname?.[0] || 'U'}{user.surname?.[0] || 'U'}
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
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
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

        {/* Create User Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-[50%] mx-4">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Create New User
                </h2>
              </div>
              <form onSubmit={handleCreateUser} className="p-6">
                <div className="space-y-4">
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
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          Max size: 2MB. Supported formats: JPG, PNG, GIF
                        </p>
                      </div>
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
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={formData.firstname}
                        onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Surname
                      </label>
                      <input
                        type="text"
                        value={formData.surname}
                        onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showCreatePassword ? 'text' : 'password'}
                        required
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
                  <div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Role *
                      </label>
                      <select
                        required
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                      >
                        {roleOptions
                          .filter((r) => assignableRoleIds.includes(r.role))
                          .map((r) => (
                            <option key={r.role} value={r.role}>
                              {r.displayName}
                            </option>
                          ))}
                      </select>
                    </div>

                  </div>
                </div>
                <div className="flex gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditModal && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-[50%] mx-4">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Edit User
                </h2>
              </div>
              <form onSubmit={handleUpdateUser} className="p-6">
                <div className="space-y-4">
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
                            {selectedUser.firstname?.[0] || 'U'}{selectedUser.surname?.[0] || 'U'}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <input
                          type="file"
                          id="edit-avatar-upload"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                        />
                        <label
                          htmlFor="edit-avatar-upload"
                          className="cursor-pointer inline-flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Change Image
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={formData.firstname}
                        onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Surname
                      </label>
                      <input
                        type="text"
                        value={formData.surname}
                        onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Password (leave blank to keep current)
                    </label>
                    <div className="relative">
                      <input
                        type={showEditPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-4 py-2 pr-11 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowEditPassword((prev) => !prev)}
                        className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        aria-label={showEditPassword ? 'Hide password' : 'Show password'}
                      >
                        {showEditPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Role
                    </label>
                    <select
                      required
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                    >
                      {roleOptions
                        .filter((r) => roleOptionIdsForEdit.includes(r.role))
                        .map((r) => (
                          <option key={r.role} value={r.role}>
                            {r.displayName}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Updating...' : 'Update User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
              <div className="text-center">
                <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  Delete User
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Are you sure you want to delete this user? This action cannot be undone.
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteUser}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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
