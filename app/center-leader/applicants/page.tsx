'use client'

import React, { useState, useEffect } from 'react';
import CenterLeaderLayout from '../components/CenterLeaderLayout';
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
  User,
  BookOpen,
  CreditCard,
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

export default function CenterLeaderApplicantsPage() {
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
    <CenterLeaderLayout>
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
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white appearance-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="AWAITING_PAYMENT">Awaiting Payment</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <Filter className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    App. #
                  </th>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Applicant
                  </th>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Program
                  </th>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Session
                  </th>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Status
                  </th>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Applied On
                  </th>
                  <th className="text-right py-3 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">
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
                      Loading applications...
                    </td>
                  </tr>
                ) : filteredApplications.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-8 text-gray-500 dark:text-gray-400"
                    >
                      No applications found.
                    </td>
                  </tr>
                ) : (
                  filteredApplications.map((app) => (
                    <tr
                      key={app.id}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="py-4 px-6 text-sm font-medium text-gray-900 dark:text-white font-mono">
                        {app.applicationNumber || '-'}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center mr-3">
                            <span className="text-green-700 dark:text-green-300 font-semibold">
                              {app.firstname.charAt(0)}
                              {app.surname.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {app.firstname} {app.surname}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {app.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-300">
                        <div className="font-medium">{app.programChoice}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {app.programType} • {app.modeOfStudy}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-300">
                        {app.admissionSession}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            app.status
                          )}`}
                        >
                          {app.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-300">
                        {formatDate(app.createdAt)}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => openDetailModal(app)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(app.id)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Delete application"
                            disabled={deletingId === app.id}
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                    <ClipboardList className="h-6 w-6 text-green-700 dark:text-green-300" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Application Details
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Application #{selectedApplication.applicationNumber || 'N/A'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Personal Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <User className="h-5 w-5 text-green-600" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-300">Full Name</p>
                      <p className="text-gray-600 dark:text-gray-400">
                        {selectedApplication.firstname} {selectedApplication.surname}{' '}
                        {selectedApplication.middlename || ''}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-300">Email</p>
                      <p className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {selectedApplication.email}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-300">Phone</p>
                      <p className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {selectedApplication.phoneNumber}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-300">Alternate Phone</p>
                      <p className="text-gray-600 dark:text-gray-400">
                        {selectedApplication.alternatePhone || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-300">Date of Birth</p>
                      <p className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(selectedApplication.dateOfBirth)}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-300">Gender</p>
                      <p className="text-gray-600 dark:text-gray-400">
                        {selectedApplication.gender}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-300">Nationality</p>
                      <p className="text-gray-600 dark:text-gray-400">
                        {selectedApplication.nationality}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="font-medium text-gray-700 dark:text-gray-300">Address</p>
                      <p className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {selectedApplication.address}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Program Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-green-600" />
                    Program Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-300">Program Type</p>
                      <p className="text-gray-600 dark:text-gray-400">
                        {selectedApplication.programType}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-300">Program Choice</p>
                      <p className="text-gray-600 dark:text-gray-400">
                        {selectedApplication.programChoice}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-300">Session</p>
                      <p className="text-gray-600 dark:text-gray-400">
                        {selectedApplication.admissionSession}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-300">Mode of Study</p>
                      <p className="text-gray-600 dark:text-gray-400">
                        {selectedApplication.modeOfStudy}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status & Payment Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-green-600" />
                    Status & Payment
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-300">Status</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            selectedApplication.status
                          )}`}
                        >
                          {selectedApplication.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-300">
                        Payment Reference
                      </p>
                      <p className="text-gray-600 dark:text-gray-400 break-all">
                        {selectedApplication.paymentReference || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-300">
                        Payment Method
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        {selectedApplication.paymentMethod || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-300">
                        Applied On
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        {formatDate(selectedApplication.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Status update actions */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => handleStatusChange('UNDER_REVIEW')}
                      disabled={updatingStatus}
                      className="px-3 py-1.5 text-xs font-medium rounded-full border border-yellow-500 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 disabled:opacity-50"
                    >
                      Mark Under Review
                    </button>
                    <button
                      onClick={() => handleStatusChange('APPROVED')}
                      disabled={updatingStatus}
                      className="px-3 py-1.5 text-xs font-medium rounded-full border border-green-500 text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleStatusChange('REJECTED')}
                      disabled={updatingStatus}
                      className="px-3 py-1.5 text-xs font-medium rounded-full border border-red-500 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleStatusChange('AWAITING_PAYMENT')}
                      disabled={updatingStatus}
                      className="px-3 py-1.5 text-xs font-medium rounded-full border border-blue-500 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50"
                    >
                      Mark Awaiting Payment
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </CenterLeaderLayout>
  );
}
