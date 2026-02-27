"use client"

import React, { useState, useEffect } from 'react';
import CenterLeaderLayout from '../components/CenterLeaderLayout';
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
    role: string;
    staffId: string | null;
    title: string | null;
    department: string | null;
    faculty: string | null;
    qualification: string | null;
    specialization: string | null;
    bio: string | null;
    employmentType: string | null;
    status: string;
    appointmentDate: string | null;
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
        avatar: '',
        staffId: '',
        title: '',
        department: '',
        faculty: '',
        qualification: '',
        specialization: '',
        bio: '',
        employmentType: '',
        appointmentDate: '',
    });

    const [avatarPreview, setAvatarPreview] = useState<string>('');
    const [showCreatePassword, setShowCreatePassword] = useState(false);
    const [showEditPassword, setShowEditPassword] = useState(false);

    useEffect(() => {
        fetchLecturers();
    }, []);

    useEffect(() => {
        filterLecturers();
    }, [searchTerm, lecturers]);

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

    const fetchLecturers = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/center-leader/lecturers');
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

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(lecturer =>
                lecturer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lecturer.firstname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lecturer.surname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lecturer.staffId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lecturer.department?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredLecturers(filtered);
    };

    const handleCreateLecturer = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/center-leader/lecturers', {
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
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateLecturer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedLecturer) return;

        setLoading(true);

        try {
            const response = await fetch(`/api/center-leader/lecturers/${selectedLecturer.id}`, {
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
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteLecturer = async () => {
        if (!selectedLecturer) return;

        setLoading(true);

        try {
            const response = await fetch(`/api/center-leader/lecturers/${selectedLecturer.id}`, {
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
            console.error('Error:', error);
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
            avatar: lecturer.avatar || '',
            staffId: lecturer.staffId || '',
            title: lecturer.title || '',
            department: lecturer.department || '',
            faculty: lecturer.faculty || '',
            qualification: lecturer.qualification || '',
            specialization: lecturer.specialization || '',
            bio: lecturer.bio || '',
            employmentType: lecturer.employmentType || '',
            appointmentDate: lecturer.appointmentDate ? (typeof lecturer.appointmentDate === 'string' ? lecturer.appointmentDate.split('T')[0] : '') : '',
        });
        setAvatarPreview(lecturer.avatar || '');
        setShowEditPassword(false);
        setShowEditModal(true);
    };

    const openDeleteModal = (lecturer: Lecturer) => {
        setSelectedLecturer(lecturer);
        setShowDeleteModal(true);
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                showMessage('error', 'Avatar image must be less than 2MB');
                return;
            }
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
            email: '', firstname: '', surname: '', password: '', avatar: '',
            staffId: '', title: '', department: '', faculty: '', qualification: '',
            specialization: '', bio: '', employmentType: '', appointmentDate: '',
        });
        setAvatarPreview('');
        setSelectedLecturer(null);
        setShowCreatePassword(false);
        setShowEditPassword(false);
    };

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 5000);
    };

    const exportToExcel = () => {
        const exportData = filteredLecturers.map(lecturer => ({
            'Staff ID': lecturer.staffId || '',
            'Email': lecturer.email,
            'First Name': lecturer.firstname || '',
            'Surname': lecturer.surname || '',
            'Title': lecturer.title || '',
            'Department': lecturer.department || '',
            'Faculty': lecturer.faculty || '',
            'Qualification': lecturer.qualification || '',
            'Status': lecturer.status,
            'Joined Date': new Date(lecturer.createdAt).toLocaleDateString(),
        }));
        const ws = XLSX.utils.json_to_sheet(exportData);
        ws['!cols'] = [{ wch: 12 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 10 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 10 }, { wch: 15 }];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Lecturers');
        XLSX.writeFile(wb, `ACE-SPED_Lecturers_${new Date().toISOString().split('T')[0]}.xlsx`);
        showMessage('success', 'Lecturers exported to Excel successfully');
        setShowExportMenu(false);
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.setTextColor(22, 163, 74);
        doc.text('ACE-SPED Lecturers Report', 14, 20);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
        doc.text(`Total Lecturers: ${filteredLecturers.length}`, 14, 34);
        const tableData = filteredLecturers.map(lecturer => [
            lecturer.staffId || 'N/A',
            lecturer.email,
            `${lecturer.firstname || ''} ${lecturer.surname || ''}`.trim(),
            lecturer.department || 'N/A',
            lecturer.qualification || 'N/A',
            lecturer.status,
        ]);
        autoTable(doc, {
            head: [['Staff ID', 'Email', 'Name', 'Department', 'Qualification', 'Status']],
            body: tableData,
            startY: 40,
            styles: { fontSize: 9, cellPadding: 3 },
            headStyles: { fillColor: [22, 163, 74], textColor: [255, 255, 255], fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [245, 245, 245] },
            margin: { top: 40 },
        });
        doc.save(`ACE-SPED_Lecturers_${new Date().toISOString().split('T')[0]}.pdf`);
        showMessage('success', 'Lecturers exported to PDF successfully');
        setShowExportMenu(false);
    };

    return (
        <CenterLeaderLayout>
            <div className="p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Lecturer Management</h1>
                    <p className="text-gray-600 dark:text-gray-400">Manage lecturers and their permissions</p>
                </div>
                {message && (
                    <div className={`mb-6 p-4 rounded-lg flex items-center justify-between ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                        <div className="flex items-center">
                            {message.type === 'success' ? <Check className="h-5 w-5 mr-2" /> : <AlertCircle className="h-5 w-5 mr-2" />}
                            <span>{message.text}</span>
                        </div>
                        <button onClick={() => setMessage(null)}><X className="h-5 w-5" /></button>
                    </div>
                )}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex flex-col sm:flex-row gap-4 flex-1">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input type="text" placeholder="Search lecturers..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg" />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <div className="relative export-dropdown">
                                <button onClick={() => setShowExportMenu(!showExportMenu)} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 transition-colors flex items-center">
                                    <Download className="h-4 w-4 mr-2" /> Export <ChevronDown className={`h-4 w-4 ml-1 transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
                                </button>
                                {showExportMenu && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-10">
                                        <button onClick={exportToExcel} className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 flex items-center"><FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" /> Export to Excel</button>
                                        <button onClick={exportToPDF} className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 flex items-center"><FileText className="h-4 w-4 mr-2 text-red-600" /> Export to PDF</button>
                                    </div>
                                )}
                            </div>
                            <button onClick={() => { resetForm(); setShowCreatePassword(false); setShowCreateModal(true); }} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center">
                                <Plus className="h-4 w-4 mr-2" /> Add Lecturer
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Lecturer</th>
                                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Email</th>
                                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Role</th>
                                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Joined</th>
                                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={5} className="text-center py-8 text-gray-500">Loading...</td></tr>
                                ) : filteredLecturers.length === 0 ? (
                                    <tr><td colSpan={5} className="text-center py-8 text-gray-500">No lecturers found</td></tr>
                                ) : (
                                    filteredLecturers.map((lecturer) => (
                                        <tr key={lecturer.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3 overflow-hidden relative">
                                                        {lecturer.avatar ? (
                                                            <Image src={lecturer.avatar} alt="Avatar" fill className="object-cover" />
                                                        ) : (
                                                            <span className="text-blue-700 font-bold">{lecturer.firstname?.[0] || 'L'}{lecturer.surname?.[0] || ''}</span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{lecturer.title} {lecturer.firstname} {lecturer.surname}</p>
                                                        {lecturer.staffId && <p className="text-xs text-gray-500">ID: {lecturer.staffId}</p>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">{lecturer.email}</td>
                                            <td className="py-4 px-6"><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{lecturer.role}</span></td>
                                            <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">{new Date(lecturer.createdAt).toLocaleDateString()}</td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => openEditModal(lecturer)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit className="h-4 w-4" /></button>
                                                    <button onClick={() => openDeleteModal(lecturer)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="h-4 w-4" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modals omitted for brevity, but they use formData which is correctly state managed */}
                {(showCreateModal || showEditModal) && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-[50%] mx-4 max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{showCreateModal ? 'Create New Lecturer' : 'Edit Lecturer'}</h2>
                            </div>
                            <form onSubmit={showCreateModal ? handleCreateLecturer : handleUpdateLecturer} className="p-6">
                                <div className="space-y-6">
                                    <div className="flex items-center space-x-4">
                                        <div className="relative h-20 w-20 rounded-full bg-gray-100 overflow-hidden">
                                            {avatarPreview ? <Image src={avatarPreview} alt="Preview" fill className="object-cover" /> : <Camera className="h-8 w-8 m-auto mt-6 text-gray-400" />}
                                        </div>
                                        <input type="file" onChange={handleAvatarChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <input type="text" placeholder="First Name *" required value={formData.firstname} onChange={e => setFormData({ ...formData, firstname: e.target.value })} className="border p-2 rounded" />
                                        <input type="text" placeholder="Surname *" required value={formData.surname} onChange={e => setFormData({ ...formData, surname: e.target.value })} className="border p-2 rounded" />
                                        <input type="email" placeholder="Email *" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="border p-2 rounded" />
                                        <input type={showCreatePassword ? "text" : "password"} placeholder="Password *" required={showCreateModal} value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="border p-2 rounded" />
                                        <input type="text" placeholder="Title" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="border p-2 rounded" />
                                        <input type="text" placeholder="Staff ID" value={formData.staffId} onChange={e => setFormData({ ...formData, staffId: e.target.value })} className="border p-2 rounded" />
                                        <input type="text" placeholder="Department" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} className="border p-2 rounded" />
                                        <input type="text" placeholder="Faculty" value={formData.faculty} onChange={e => setFormData({ ...formData, faculty: e.target.value })} className="border p-2 rounded" />
                                        <input type="text" placeholder="Qualification" value={formData.qualification} onChange={e => setFormData({ ...formData, qualification: e.target.value })} className="border p-2 rounded" />
                                        <input type="text" placeholder="Specialization" value={formData.specialization} onChange={e => setFormData({ ...formData, specialization: e.target.value })} className="border p-2 rounded" />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <button type="button" onClick={() => { setShowCreateModal(false); setShowEditModal(false); }} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                                        <button type="submit" disabled={loading} className="px-4 py-2 bg-purple-600 text-white rounded">{loading ? 'Saving...' : 'Save'}</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
                {showDeleteModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white p-6 rounded-lg max-w-sm w-full text-center">
                            <h3 className="text-lg font-bold">Confirm Delete</h3>
                            <button onClick={handleDeleteLecturer} className="px-4 py-2 bg-red-600 text-white rounded mt-4">Delete</button>
                            <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 bg-gray-200 rounded mt-4 ml-2">Cancel</button>
                        </div>
                    </div>
                )}
            </div>
        </CenterLeaderLayout>
    );
}
