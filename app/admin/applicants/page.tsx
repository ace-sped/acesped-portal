"use client"

import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import {
  ClipboardList,
  Search,
  Eye,
  Filter,
  AlertCircle,
  X,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Trash2,
} from 'lucide-react';

interface Applicant {
  id: string;
  email: string;
  firstname: string;
  surname: string;
  middlename?: string | null;
  maritalStatus: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  phoneNumber: string;
  alternatePhone?: string | null;
  address: string;
  avatar?: string | null;
  programType: string;
  programChoice: string;
  admissionSession: string;
  modeOfStudy: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'AWAITING_PAYMENT';
  applicationNumber: string | null;
  paymentReference: string;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

export default function ApplicantsPage() {
  const [applications, setApplications] = useState<Applicant[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Applicant[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedApplication, setSelectedApplication] = useState<Applicant | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  useEffect(() => {
    filterApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, applications]);

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = new URL('/api/admin/applicants', window.location.origin);
      if (statusFilter !== 'ALL') {
        url.searchParams.append('status', statusFilter);
      }
      if (searchTerm) {
        url.searchParams.append('search', searchTerm);
      }

      const response = await fetch(url.toString());
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Unable to fetch applicant from database, please check your internet network and try again.');
      }
      setApplications(data.applications || []);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to fetch applicant from database, please check your internet network and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = applications;

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter((app) =>
        `${app.firstname} ${app.surname}`.toLowerCase().includes(lower) ||
        app.email.toLowerCase().includes(lower) ||
        app.phoneNumber.toLowerCase().includes(lower) ||
        (app.applicationNumber && app.applicationNumber.toLowerCase().includes(lower)) ||
        app.programChoice.toLowerCase().includes(lower)
      );
    }

    setFilteredApplications(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'UNDER_REVIEW':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'AWAITING_PAYMENT':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const openDetailModal = (application: Applicant) => {
    setSelectedApplication(application);
    setShowDetailModal(true);
  };

  const handleStatusChange = async (newStatus: Applicant['status']) => {
    if (!selectedApplication) return;

    try {
      setUpdatingStatus(true);
      const response = await fetch('/api/admin/applicants', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedApplication.id,
          status: newStatus,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update status');
      }

      setApplications((prev) =>
        prev.map((app) =>
          app.id === selectedApplication.id ? { ...app, status: newStatus } : app
        )
      );
      setSelectedApplication((prev) =>
        prev ? { ...prev, status: newStatus } : prev
      );
    } catch (err) {
      console.error('Error updating status:', err);
      alert(
        err instanceof Error
          ? err.message
          : 'Failed to update status. Please try again.'
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this application? This action cannot be undone.'
    );
    if (!confirmDelete) return;

    try {
      setDeletingId(id);
      const response = await fetch('/api/admin/applicants', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete application');
      }

      setApplications((prev) => prev.filter((app) => app.id !== id));
      setFilteredApplications((prev) => prev.filter((app) => app.id !== id));

      if (selectedApplication?.id === id) {
        setSelectedApplication(null);
        setShowDetailModal(false);
      }
    } catch (err) {
      console.error('Error deleting application:', err);
      alert(
        err instanceof Error
          ? err.message
          : 'Failed to delete application. Please try again.'
      );
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Applicants
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage postgraduate applications
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Filters and Search */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, phone, application number, or program..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white appearance-none"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="AWAITING_PAYMENT">Awaiting Payment</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {applications.length}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
            <div className="text-2xl font-bold text-yellow-600">
              {applications.filter((a) => a.status === 'PENDING').length}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">Under Review</div>
            <div className="text-2xl font-bold text-blue-600">
              {applications.filter((a) => a.status === 'UNDER_REVIEW').length}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">Approved</div>
            <div className="text-2xl font-bold text-green-600">
              {applications.filter((a) => a.status === 'APPROVED').length}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">Rejected</div>
            <div className="text-2xl font-bold text-red-600">
              {applications.filter((a) => a.status === 'REJECTED').length}
            </div>
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Name
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Contact
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Program
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Application #
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Status
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Date
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-8 text-gray-500 dark:text-gray-400"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : filteredApplications.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-8 text-gray-500 dark:text-gray-400"
                    >
                      No applications found
                    </td>
                  </tr>
                ) : (
                  filteredApplications.map((application) => (
                    <tr
                      key={application.id}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="py-4 px-6">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {application.firstname} {application.surname}
                        </div>
                        {application.gender && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {application.gender}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-gray-900 dark:text-white flex items-center gap-1">
                          <Mail className="h-4 w-4 text-gray-400" />
                          {application.email}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-1">
                          <Phone className="h-4 w-4 text-gray-400" />
                          {application.phoneNumber}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {application.programChoice}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {application.programType} • {application.modeOfStudy}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400 font-mono">
                        {application.applicationNumber || 'N/A'}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            application.status
                          )}`}
                        >
                          {application.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(application.createdAt)}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openDetailModal(application)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(application.id)}
                            disabled={deletingId === application.id}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete Application"
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

        {/* Detail Modal */}
        {showDetailModal && selectedApplication && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-start justify-between sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                      Application Details
                    </h2>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-mono">
                      #{selectedApplication.applicationNumber || 'N/A'}
                    </span>
                    <span className="hidden sm:inline text-gray-300 dark:text-gray-600">
                      •
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Submitted {formatDate(selectedApplication.createdAt)}
                    </span>
                    <span className="hidden sm:inline text-gray-300 dark:text-gray-600">
                      •
                    </span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        selectedApplication.status
                      )}`}
                    >
                      {selectedApplication.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Close details"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-950">
                {/* Personal Information */}
                <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 sm:p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Full Name
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {selectedApplication.firstname} {selectedApplication.surname}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Email
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {selectedApplication.email}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Phone
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {selectedApplication.phoneNumber}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Alternate Phone
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {selectedApplication.alternatePhone || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Date of Birth
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {selectedApplication.dateOfBirth}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Gender
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {selectedApplication.gender}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Address
                      </label>
                      <p className="text-gray-900 dark:text-white flex items-start gap-1">
                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                        <span>{selectedApplication.address}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Program Information */}
                <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 sm:p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Program Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Program Type
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {selectedApplication.programType}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Program Choice
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {selectedApplication.programChoice}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Admission Session
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {selectedApplication.admissionSession}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Mode of Study
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {selectedApplication.modeOfStudy}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment & Status */}
                <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 sm:p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Payment & Status
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Payment Reference
                      </label>
                      <p className="text-gray-900 dark:text-white font-mono">
                        {selectedApplication.paymentReference || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Payment Method
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {selectedApplication.paymentMethod}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 block">
                        Status
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        <select
                          value={selectedApplication.status}
                          onChange={(e) =>
                            handleStatusChange(e.target.value as Applicant['status'])
                          }
                          disabled={updatingStatus}
                          className="px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="UNDER_REVIEW">Under Review</option>
                          <option value="APPROVED">Approved</option>
                          <option value="REJECTED">Rejected</option>
                          <option value="AWAITING_PAYMENT">Awaiting Payment</option>
                        </select>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            selectedApplication.status
                          )}`}
                        >
                          {selectedApplication.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Submitted
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {formatDate(selectedApplication.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
