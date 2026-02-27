"use client"

import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import {
    Users, Plus, Search, Filter, Edit, Trash2, Eye, EyeOff,
    MoreVertical, Download, Upload, X, Check, AlertCircle, Camera, ChevronDown, FileSpreadsheet, FileText, GraduationCap
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
    role: string; // Always Lecturer
    staffId: string | null;
    title: string | null;
    department: string | null;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export default function LecturerManagement() {
    const [lecturers, setLecturers] = useState<Lecturer[]>([]);
    const [filteredLecturers, setFilteredLecturers] = useState<Lecturer[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedLecturer, setSelectedLecturer] = useState<Lecturer | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [showExportMenu, setShowExportMenu] = useState(false);

    const [formData, setFormData] = useState({
        email: '',
        firstname: '',
        surname: '',
        password: '',
        staffId: '',
        title: '',
        department: '',
        avatar: '',
        status: 'ACTIVE'
    });

    const [avatarPreview, setAvatarPreview] = useState<string>('');
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        fetchLecturers();
    }, []);

    useEffect(() => {
        filterLecturers();
    }, [searchTerm, lecturers]);

    const fetchLecturers = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/admin/lecturers');
            const data = await response.json();
            if (data.success) {
                setLecturers(data.lecturers);
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

    const filterLecturers = () => {
        let filtered = lecturers;
        if (searchTerm) {
            filtered = filtered.filter(l =>
                l.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                l.firstname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                l.surname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                l.staffId?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        setFilteredLecturers(filtered);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch('/api/admin/lecturers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (data.success) {
                showMessage('success', 'Lecturer created successfully');
                setShowCreateModal(false);
                fetchLecturers();
                resetForm();
            } else {
                showMessage('error', data.message || 'Failed to create lecturer');
            }
        } catch (error) {
            showMessage('error', 'Error creating lecturer');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedLecturer) return;
        setLoading(true);
        try {
            const response = await fetch(`/api/admin/lecturers/${selectedLecturer.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (data.success) {
                showMessage('success', 'Lecturer updated successfully');
                setShowEditModal(false);
                fetchLecturers();
                resetForm();
            } else {
                showMessage('error', data.message || 'Failed to update lecturer');
            }
        } catch (error) {
            showMessage('error', 'Error updating lecturer');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedLecturer) return;
        setLoading(true);
        try {
            const response = await fetch(`/api/admin/lecturers/${selectedLecturer.id}`, {
                method: 'DELETE',
            });
            const data = await response.json();
            if (data.success) {
                showMessage('success', 'Lecturer deleted successfully');
                setShowDeleteModal(false);
                fetchLecturers();
            } else {
                showMessage('error', data.message || 'Failed to delete lecturer');
            }
        } catch (error) {
            showMessage('error', 'Error deleting lecturer');
        } finally {
            setLoading(false);
        }
    };

    const openEditModal = (lecturer: Lecturer) => {
        setSelectedLecturer(lecturer);
        setFormData({
            email: lecturer.email,
            firstname: lecturer.firstname || '',
            surname: lecturer.surname || '',
            password: '',
            staffId: lecturer.staffId || '',
            title: lecturer.title || '',
            department: lecturer.department || '',
            avatar: lecturer.avatar || '',
            status: lecturer.status
        });
        setAvatarPreview(lecturer.avatar || '');
        setShowEditModal(true);
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) return showMessage('error', 'Max size 2MB');
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, avatar: reader.result as string });
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const resetForm = () => {
        setFormData({
            email: '', firstname: '', surname: '', password: '',
            staffId: '', title: '', department: '', avatar: '', status: 'ACTIVE'
        });
        setAvatarPreview('');
        setSelectedLecturer(null);
    };

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 5000);
    };

    return (
        <AdminLayout>
            <div className="p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Lecturer Management</h1>
                    <p className="text-gray-600 dark:text-gray-400">Manage academic staff in a separate system</p>
                </div>

                {message && (
                    <div className={`mb-6 p-4 rounded-lg flex items-center justify-between ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                        <span>{message.text}</span>
                        <button onClick={() => setMessage(null)}><X className="h-5 w-5" /></button>
                    </div>
                )}

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search lecturers..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 rounded-lg"
                            />
                        </div>
                        <button
                            onClick={() => { resetForm(); setShowCreateModal(true); }}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Lecturer
                        </button>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Lecturer</th>
                                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Details</th>
                                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Department</th>
                                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={4} className="text-center py-8">Loading...</td></tr>
                            ) : filteredLecturers.length === 0 ? (
                                <tr><td colSpan={4} className="text-center py-8">No lecturers found</td></tr>
                            ) : (
                                filteredLecturers.map((lecturer) => (
                                    <tr key={lecturer.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mr-3 overflow-hidden relative">
                                                    {lecturer.avatar ? (
                                                        <Image src={lecturer.avatar} alt="Avatar" fill className="object-cover" />
                                                    ) : (
                                                        <span className="text-green-700 font-bold">{lecturer.firstname?.[0]}{lecturer.surname?.[0]}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{lecturer.title} {lecturer.firstname} {lecturer.surname}</p>
                                                    <p className="text-xs text-gray-500">{lecturer.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-sm text-gray-600">
                                            ID: {lecturer.staffId || 'N/A'}<br />
                                            Status: {lecturer.status}
                                        </td>
                                        <td className="py-4 px-6 text-sm text-gray-600">
                                            {lecturer.department || 'Unassigned'}
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex gap-2">
                                                <button onClick={() => openEditModal(lecturer)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit className="h-4 w-4" /></button>
                                                <button onClick={() => { setSelectedLecturer(lecturer); setShowDeleteModal(true); }} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="h-4 w-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Create/Edit Modal */}
                {(showCreateModal || showEditModal) && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b">
                                <h2 className="text-2xl font-bold">{showCreateModal ? 'New Lecturer' : 'Edit Lecturer'}</h2>
                            </div>
                            <form onSubmit={showCreateModal ? handleCreate : handleUpdate} className="p-6 space-y-4">
                                <div className="flex items-center space-x-4 mb-4">
                                    <div className="relative h-20 w-20 rounded-full bg-gray-100 overflow-hidden">
                                        {avatarPreview ? <Image src={avatarPreview} alt="Preview" fill className="object-cover" /> : <Camera className="h-8 w-8 m-auto mt-6 text-gray-400" />}
                                    </div>
                                    <label className="cursor-pointer bg-gray-200 px-3 py-1 rounded-md text-sm hover:bg-gray-300">
                                        Upload Photo
                                        <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                                    </label>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <input type="text" placeholder="Title (e.g. Dr.)" className="border p-2 rounded" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                                    <input type="text" placeholder="Staff ID" className="border p-2 rounded" value={formData.staffId} onChange={e => setFormData({ ...formData, staffId: e.target.value })} />
                                    <input type="text" placeholder="First Name *" required className="border p-2 rounded" value={formData.firstname} onChange={e => setFormData({ ...formData, firstname: e.target.value })} />
                                    <input type="text" placeholder="Surname *" required className="border p-2 rounded" value={formData.surname} onChange={e => setFormData({ ...formData, surname: e.target.value })} />
                                </div>

                                <input type="email" placeholder="Email *" required className="border p-2 rounded w-full" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />

                                <div className="relative">
                                    <input type={showPassword ? "text" : "password"} placeholder={showCreateModal ? "Password *" : "New Password (leave blank to keep current)"} className="border p-2 rounded w-full" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required={showCreateModal} />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2 text-gray-400"><Eye className="h-4 w-4" /></button>
                                </div>

                                <input type="text" placeholder="Department" className="border p-2 rounded w-full" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} />

                                <div className="flex justify-end gap-2 mt-4">
                                    <button type="button" onClick={() => { setShowCreateModal(false); setShowEditModal(false); }} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                                    <button type="submit" disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded">{loading ? 'Saving...' : 'Save'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete Modal */}
                {showDeleteModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white p-6 rounded-lg max-w-sm w-full text-center">
                            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                            <h3 className="text-lg font-bold">Confirm Delete</h3>
                            <p className="text-gray-500 mb-6">Are you sure you want to delete this lecturer? This cannot be undone.</p>
                            <div className="flex justify-center gap-2">
                                <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                                <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded">Delete</button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </AdminLayout>
    );
}
