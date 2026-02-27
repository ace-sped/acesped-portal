'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import DeputyCenterLeaderLayout from '../components/DeputyCenterLeaderLayout';
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
  UserCheck,
  GraduationCap,
  ArrowRight,
  FileText,
  CheckCircle,
} from 'lucide-react';

interface StudentInfo {
  id: string;
  matricNumber: string | null;
  registrationNumber: string | null;
  status: string;
}

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
  acceptanceFeePaid: boolean;
  acceptancePaymentReference?: string | null;
  createdAt: string;
  updatedAt: string;
  student?: StudentInfo | null;
}

export default function DeputyCenterLeaderApplicantsPage() {
  const [applications, setApplications] = useState<Applicant[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Applicant[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedApplication, setSelectedApplication] = useState<Applicant | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [migrating, setMigrating] = useState(false);
  const [graduating, setGraduating] = useState(false);
  const [showStudentInfoModal, setShowStudentInfoModal] = useState(false);
  const [studentInfoToShow, setStudentInfoToShow] = useState<StudentInfo | null>(null);
  const [showMigrateConfirmModal, setShowMigrateConfirmModal] = useState(false);
  const [sendingInvite, setSendingInvite] = useState(false);
  const [showInviteSuccessModal, setShowInviteSuccessModal] = useState(false);
  const router = useRouter();

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
        throw new Error(data.message || 'Failed to fetch applicants from database. Please check your internet connection and try again.');
      }
      setApplications(data.applications || []);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to fetch applicants from database, please check your internet Connection and try again.'
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

  const openDetailModal = async (application: Applicant) => {
    setSelectedApplication(application);
    setShowDetailModal(true);

    // Always fetch student information to check if migration has already occurred
    try {
      const response = await fetch(`/api/deputy-center-leader/applicants/${application.id}/student`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSelectedApplication((prev) =>
            prev ? { ...prev, student: data.student || null } : prev
          );
        }
      }
    } catch (err) {
      // Silently fail - student might not exist yet
      console.log('No student record found for this application');
      // Ensure student is set to null if fetch fails
      setSelectedApplication((prev) =>
        prev ? { ...prev, student: null } : prev
      );
    }
  };

  const handleInviteForAdmissionExercise = async () => {
    if (!selectedApplication) return;
    try {
      setSendingInvite(true);
      const response = await fetch('/api/deputy-center-leader/admission-exercise/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: selectedApplication.id }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to send invite email');
      }
      setShowInviteSuccessModal(true);
    } catch (err) {
      console.error('Error sending invite:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to send invite email');
    } finally {
      setSendingInvite(false);
    }
  };

  const handleCloseInviteSuccessModal = () => {
    setShowInviteSuccessModal(false);
    setShowDetailModal(false);
    setSelectedApplication(null);
    router.push('/deputy-center-leader/admission-exercise');
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

  const handleMigrateToStudent = async () => {
    if (!selectedApplication) return;

    // Double-check: Fetch latest student info before attempting migration
    try {
      const checkResponse = await fetch(
        `/api/deputy-center-leader/applicants/${selectedApplication.id}/student`
      );
      if (checkResponse.ok) {
        const checkData = await checkResponse.json();
        if (checkData.success && checkData.student) {
          // Update local state with latest student info
          setSelectedApplication((prev) =>
            prev ? { ...prev, student: checkData.student } : prev
          );
          // Show modal with student information
          setStudentInfoToShow(checkData.student);
          setShowStudentInfoModal(true);
          return;
        }
      }
    } catch (checkErr) {
      console.log('Error checking student status:', checkErr);
      // Continue with migration attempt if check fails
    }

    // Check if student already exists in local state
    if (selectedApplication.student) {
      // Show modal with student information
      setStudentInfoToShow(selectedApplication.student);
      setShowStudentInfoModal(true);
      return;
    }

    // Check if acceptance fee has been paid
    if (!selectedApplication.acceptanceFeePaid) {
      alert(
        'Cannot migrate applicant to student. Acceptance fee has not been paid.\n\nPlease ensure the applicant has paid their acceptance fee before migration.'
      );
      return;
    }

    setShowMigrateConfirmModal(true);
  };

  const executeMigration = async () => {
    if (!selectedApplication) return;
    setShowMigrateConfirmModal(false);

    try {
      setMigrating(true);
      const response = await fetch('/api/deputy-center-leader/applicants/migrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId: selectedApplication.id,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to migrate applicant to student');
      }

      // Update the selected application with student info
      setSelectedApplication((prev) =>
        prev
          ? {
            ...prev,
            student: {
              id: data.student.id,
              matricNumber: data.student.matricNumber,
              registrationNumber: data.student.registrationNumber,
              status: 'ACTIVE',
            },
          }
          : prev
      );

      // Show modal with student information instead of alert
      setStudentInfoToShow({
        id: data.student.id,
        matricNumber: data.student.matricNumber,
        registrationNumber: data.student.registrationNumber,
        status: 'ACTIVE',
      });
      setShowStudentInfoModal(true);
      fetchApplications(); // Refresh the list
    } catch (err) {
      console.error('Error migrating applicant:', err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to migrate applicant. Please try again.';

      // Show user-friendly error message
      if (errorMessage.includes('already exists') || errorMessage.includes('Student record already exists')) {
        // Immediately refresh student info from server
        const refreshResponse = await fetch(
          `/api/deputy-center-leader/applicants/${selectedApplication.id}/student`
        );
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          if (refreshData.success && refreshData.student) {
            setSelectedApplication((prev) =>
              prev ? { ...prev, student: refreshData.student } : prev
            );
            // Show modal with student information
            setStudentInfoToShow(refreshData.student);
            setShowStudentInfoModal(true);
          } else {
            // Show generic message modal
            setStudentInfoToShow(null);
            setShowStudentInfoModal(true);
            fetchApplications(); // Refresh the list
          }
        } else {
          // Show generic message modal
          setStudentInfoToShow(null);
          setShowStudentInfoModal(true);
        }
      } else if (errorMessage.includes('acceptance fee') || errorMessage.includes('Acceptance fee')) {
        alert(
          'Cannot migrate applicant to student.\n\nAcceptance fee has not been paid. Please ensure the applicant has paid their acceptance fee before migration.'
        );
      } else {
        alert(errorMessage);
      }
    } finally {
      setMigrating(false);
    }
  };

  const handleGraduateStudent = async () => {
    if (!selectedApplication) return;

    // Check if student exists
    if (!selectedApplication.student) {
      alert('No student record found. Please migrate the applicant to student first.');
      return;
    }

    // Check if already graduated
    if (selectedApplication.student.status === 'GRADUATED') {
      alert('This student is already graduated.');
      return;
    }

    const confirmGraduate = window.confirm(
      `Are you sure you want to mark ${selectedApplication.firstname} ${selectedApplication.surname} as graduated? This will update their student status to GRADUATED.`
    );
    if (!confirmGraduate) return;

    try {
      setGraduating(true);
      const response = await fetch('/api/deputy-center-leader/applicants/graduate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId: selectedApplication.id,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to graduate student');
      }

      // Update the selected application with graduated status
      setSelectedApplication((prev) =>
        prev && prev.student
          ? {
            ...prev,
            student: {
              ...prev.student,
              status: 'GRADUATED',
            },
          }
          : prev
      );

      alert('Student successfully graduated!');
      fetchApplications(); // Refresh the list
    } catch (err) {
      console.error('Error graduating student:', err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to graduate student. Please try again.';

      alert(errorMessage);
    } finally {
      setGraduating(false);
    }
  };

  return (
    <DeputyCenterLeaderLayout>
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
                          {app.avatar ? (
                            <img
                              src={app.avatar}
                              alt={`${app.firstname} ${app.surname}`}
                              className="h-10 w-10 rounded-full object-cover mr-3 border border-gray-200 dark:border-gray-700"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center mr-3">
                              <span className="text-green-700 dark:text-green-300 font-semibold">
                                {app.firstname.charAt(0)}
                                {app.surname.charAt(0)}
                              </span>
                            </div>
                          )}
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
                  {selectedApplication.avatar ? (
                    <img
                      src={selectedApplication.avatar}
                      alt={`${selectedApplication.firstname} ${selectedApplication.surname}`}
                      className="h-12 w-12 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                      <ClipboardList className="h-6 w-6 text-green-700 dark:text-green-300" />
                    </div>
                  )}
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
                    Payment Status
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
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-300">
                        Acceptance Fee
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedApplication.acceptanceFeePaid
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}
                        >
                          {selectedApplication.acceptanceFeePaid ? 'Paid' : 'Not Paid'}
                        </span>
                      </div>
                    </div>
                    {selectedApplication.acceptanceFeePaid && selectedApplication.acceptancePaymentReference && (
                      <div>
                        <p className="font-medium text-gray-700 dark:text-gray-300">
                          Acceptance Payment Reference
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 break-all">
                          {selectedApplication.acceptancePaymentReference}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Invite for Admission Exercise */}
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={handleInviteForAdmissionExercise}
                      disabled={sendingInvite}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-purple-500 text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {sendingInvite ? (
                        <>
                          <span className="h-4 w-4 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
                          Sending…
                        </>
                      ) : (
                        <>
                          <FileText className="h-4 w-4" />
                          Invite for Admission Exercise
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Applicant Status Management */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-green-600" />
                    Applicant Status
                  </h3>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Manage applicant progression to student and graduation status.
                    </p>

                    {/* Migrate to Student */}
                    {selectedApplication.student ? (
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-green-900 dark:text-green-200 mb-1 flex items-center gap-2">
                              <UserCheck className="h-4 w-4" />
                              Student Record Exists
                            </h4>
                            <div className="text-sm text-green-700 dark:text-green-300 space-y-1 mt-2">
                              <p>
                                <span className="font-medium">Matric Number:</span>{' '}
                                {selectedApplication.student.matricNumber || 'N/A'}
                              </p>
                              <p>
                                <span className="font-medium">Registration Number:</span>{' '}
                                {selectedApplication.student.registrationNumber || 'N/A'}
                              </p>
                              <p>
                                <span className="font-medium">Status:</span>{' '}
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                  {selectedApplication.student.status}
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-1 flex items-center gap-2">
                              <ArrowRight className="h-4 w-4" />
                              Migrate to Student
                            </h4>
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                              Convert this applicant into a student record. This creates a student profile with all application details.
                            </p>
                          </div>
                          <button
                            onClick={handleMigrateToStudent}
                            disabled={
                              migrating ||
                              !!selectedApplication.student ||
                              selectedApplication.status !== 'APPROVED' ||
                              !selectedApplication.acceptanceFeePaid
                            }
                            className="ml-4 px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                          >
                            <UserCheck className="h-4 w-4" />
                            {migrating ? 'Migrating...' : 'Migrate'}
                          </button>
                        </div>
                        {selectedApplication.status !== 'APPROVED' && (
                          <p className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                            Note: Applicant must be approved before migration.
                          </p>
                        )}
                        {selectedApplication.student && (
                          <p className="mt-2 text-xs text-blue-600 dark:text-blue-400 font-medium">
                            ✓ This applicant has already been migrated to a student.
                          </p>
                        )}
                        {selectedApplication.status === 'APPROVED' && !selectedApplication.acceptanceFeePaid && !selectedApplication.student && (
                          <p className="mt-2 text-xs text-red-600 dark:text-red-400 font-medium">
                            ⚠️ Acceptance fee must be paid before migration.
                          </p>
                        )}
                      </div>
                    )}

                    {/* Graduate Student */}
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-purple-900 dark:text-purple-200 mb-1 flex items-center gap-2">
                            <GraduationCap className="h-4 w-4" />
                            Graduate Student
                          </h4>
                          <p className="text-sm text-purple-700 dark:text-purple-300">
                            Mark the associated student as graduated. This updates their status to GRADUATED in the system.
                          </p>
                        </div>
                        <button
                          onClick={handleGraduateStudent}
                          disabled={
                            graduating ||
                            selectedApplication.status !== 'APPROVED' ||
                            !selectedApplication.student ||
                            selectedApplication.student.status === 'GRADUATED'
                          }
                          className="ml-4 px-4 py-2 text-sm font-medium rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                        >
                          <GraduationCap className="h-4 w-4" />
                          {graduating ? 'Graduating...' : 'Graduate'}
                        </button>
                      </div>
                      {!selectedApplication.student && (
                        <p className="mt-2 text-xs text-purple-600 dark:text-purple-400">
                          Note: Applicant must be migrated to student first before graduation.
                        </p>
                      )}
                      {selectedApplication.student?.status === 'GRADUATED' && (
                        <p className="mt-2 text-xs text-purple-600 dark:text-purple-400">
                          ✓ Student is already graduated.
                        </p>
                      )}
                      {selectedApplication.status !== 'APPROVED' && !selectedApplication.student && (
                        <p className="mt-2 text-xs text-purple-600 dark:text-purple-400">
                          Note: Only approved applicants with student records can be graduated.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Student Info Modal */}
        {showStudentInfoModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                    <UserCheck className="h-6 w-6 text-green-700 dark:text-green-300" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Student Record Exists
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      This applicant has been migrated to a student
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowStudentInfoModal(false);
                    setStudentInfoToShow(null);
                  }}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6">
                {studentInfoToShow ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Matric Number
                          </p>
                          <p className="text-base font-mono text-gray-900 dark:text-white mt-1">
                            {studentInfoToShow.matricNumber || 'N/A'}
                          </p>
                        </div>
                        {studentInfoToShow.registrationNumber && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Registration Number
                            </p>
                            <p className="text-base font-mono text-gray-900 dark:text-white mt-1">
                              {studentInfoToShow.registrationNumber}
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Status
                          </p>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 mt-1">
                            {studentInfoToShow.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      The student information has been updated in the system.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        This applicant has already been migrated to a student. The page will refresh to show the updated information.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    setShowStudentInfoModal(false);
                    setStudentInfoToShow(null);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Migrate Confirmation Modal */}
        {showMigrateConfirmModal && selectedApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="text-center mb-6">
                <div className="mx-auto h-16 w-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                  <UserCheck className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Confirm Migration
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Are you sure you want to migrate <span className="font-semibold">{selectedApplication.firstname} {selectedApplication.surname}</span> to a student?
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                  This action will create a permanent student record in the database.
                </p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowMigrateConfirmModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={executeMigration}
                  disabled={migrating}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors flex items-center justify-center"
                >
                  {migrating ? 'Migrating...' : 'Yes, Migrate'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Invite sent success modal */}
        {showInviteSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="text-center mb-6">
                <div className="mx-auto h-16 w-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Invitation sent
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Invitation sent successfully to the applicant.
                </p>
              </div>
              <button
                onClick={handleCloseInviteSuccessModal}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        )}
      </div>
    </DeputyCenterLeaderLayout>
  );
}
