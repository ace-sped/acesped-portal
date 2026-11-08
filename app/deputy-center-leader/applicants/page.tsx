'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import DeputyCenterLeaderLayout from '../components/DeputyCenterLeaderLayout';
import ExportApplicationsMenu from '../../components/applicants/ExportApplicationsMenu';
import LoadErrorModal from '@/app/components/LoadErrorModal';
import { getFriendlyErrorMessage } from '@/lib/friendly-error';
import { hasPaidApplicationFee, isNigerianApplicant } from '@/lib/application-fee';
import {
  ClipboardList,
  Search,
  Eye,
  Filter,
  X,
  Calendar,
  MapPin,
  Trash2,
  UserCheck,
  GraduationCap,
  ArrowRight,
  FileText,
  CheckCircle,
  ExternalLink,
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
  maidenName?: string | null;
  nationalId: string;
  nationalIdFile?: string | null;
  maritalStatus: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  phoneNumber: string;
  alternatePhone?: string | null;
  address: string;
  homeAddress: string;
  homeTown: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string | null;
  religion: string;
  avatar?: string | null;
  kinFirstname: string;
  kinSurname: string;
  kinRelationship: string;
  kinPhone: string;
  kinEmail: string;
  kinAddress: string;
  programType: string;
  programChoice: string;
  admissionSession: string;
  modeOfStudy: string;
  previousDegree: string;
  previousInstitution: string;
  previousGraduationYear: string;
  previousGPA: string;
  previousFieldOfStudy: string;
  transcriptFile?: string | null;
  certificateFile?: string | null;
  employmentStatus: string;
  currentEmployer?: string | null;
  jobTitle?: string | null;
  employmentStartDate?: string | null;
  employmentEndDate?: string | null;
  reasonForPursuing: string;
  researchTitle?: string | null;
  researchAbstract?: string | null;
  researchObjectives?: string | null;
  researchMethodology?: string | null;
  proposalFile?: string | null;
  referee1Name: string;
  referee1Email: string;
  referee1Phone: string;
  referee1Institution: string;
  referee2Name: string;
  referee2Email: string;
  referee2Phone: string;
  referee2Institution: string;
  paymentMethod: string;
  paymentReference: string;
  paymentProof?: string | null;
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'AWAITING_PAYMENT';
  applicationNumber: string | null;
  acceptanceFeePaid: boolean;
  acceptancePaidAt?: string | null;
  acceptancePaymentReference?: string | null;
  createdAt: string;
  updatedAt: string;
  student?: StudentInfo | null;
}

function displayValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return 'N/A';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
}

function DetailField({
  label,
  value,
  mono = false,
  full = false,
}: {
  label: string;
  value: unknown;
  mono?: boolean;
  full?: boolean;
}) {
  return (
    <div className={full ? 'md:col-span-2' : undefined}>
      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
        {label}
      </label>
      <p
        className={`text-gray-900 dark:text-white whitespace-pre-wrap break-words ${
          mono ? 'font-mono text-sm' : ''
        }`}
      >
        {displayValue(value)}
      </p>
    </div>
  );
}

function DocumentLink({ label, href }: { label: string; href?: string | null }) {
  if (!href) {
    return (
      <div>
        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {label}
        </label>
        <p className="text-gray-900 dark:text-white">N/A</p>
      </div>
    );
  }

  return (
    <div>
      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
        {label}
      </label>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sm text-green-700 dark:text-green-400 hover:underline break-all"
      >
        <FileText className="h-4 w-4 shrink-0" />
        View document
        <ExternalLink className="h-3.5 w-3.5 shrink-0" />
      </a>
    </div>
  );
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
        getFriendlyErrorMessage(
          err,
          'Unable to load applicants. Please check your connection and try again.'
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = applications;

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter((app) => {
        const name = `${app.firstname || ''} ${app.surname || ''}`.toLowerCase();
        return (
          name.includes(lower) ||
          (app.email || '').toLowerCase().includes(lower) ||
          (app.phoneNumber || '').toLowerCase().includes(lower) ||
          (app.applicationNumber || '').toLowerCase().includes(lower) ||
          (app.programChoice || '').toLowerCase().includes(lower)
        );
      });
    }

    setFilteredApplications(filtered);
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
      <div className="min-w-0 max-w-full flex flex-col gap-3 overflow-hidden">
        {/* Header + filters */}
        <div className="shrink-0 space-y-2.5">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                Applicants
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                View and manage postgraduate applications
              </p>
            </div>
            <div className="shrink-0">
              <ExportApplicationsMenu applications={filteredApplications} />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 min-w-0">
            <div className="flex-1 min-w-0 relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search name, email, phone, app #, or program..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full min-w-0 pl-8 pr-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
              />
            </div>
            <div className="relative shrink-0">
              <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto pl-8 pr-7 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white appearance-none"
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

          {/* Compact stats */}
          <div className="grid grid-cols-5 gap-2">
            <div className="bg-white dark:bg-gray-800 rounded-md px-2.5 py-1.5 border border-gray-200 dark:border-gray-700 min-w-0">
              <div className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Total</div>
              <div className="text-base font-bold leading-tight text-gray-900 dark:text-white">
                {applications.length}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-md px-2.5 py-1.5 border border-gray-200 dark:border-gray-700 min-w-0">
              <div className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Pending</div>
              <div className="text-base font-bold leading-tight text-yellow-600">
                {applications.filter((a) => a.status === 'PENDING').length}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-md px-2.5 py-1.5 border border-gray-200 dark:border-gray-700 min-w-0">
              <div className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 truncate">Review</div>
              <div className="text-base font-bold leading-tight text-blue-600">
                {applications.filter((a) => a.status === 'UNDER_REVIEW').length}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-md px-2.5 py-1.5 border border-gray-200 dark:border-gray-700 min-w-0">
              <div className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Approved</div>
              <div className="text-base font-bold leading-tight text-green-600">
                {applications.filter((a) => a.status === 'APPROVED').length}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-md px-2.5 py-1.5 border border-gray-200 dark:border-gray-700 min-w-0">
              <div className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Rejected</div>
              <div className="text-base font-bold leading-tight text-red-600">
                {applications.filter((a) => a.status === 'REJECTED').length}
              </div>
            </div>
          </div>
        </div>

        {/* Applications Table */}
        <div className="h-[70vh] bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 min-w-0 max-w-full overflow-hidden">
          <div className="h-full max-w-full overflow-x-auto overflow-y-auto">
            <table className="w-full min-w-[640px] border-collapse">
              <thead className="sticky top-0 z-10">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 whitespace-nowrap border-b border-gray-200 dark:border-gray-600">
                    Name
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 whitespace-nowrap border-b border-gray-200 dark:border-gray-600">
                    Program
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 whitespace-nowrap border-b border-gray-200 dark:border-gray-600">
                    Application #
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 whitespace-nowrap border-b border-gray-200 dark:border-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center py-8 text-gray-500 dark:text-gray-400"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : filteredApplications.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
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
                      <td className="py-3 px-4 align-top max-w-[220px]">
                        <div
                          className="font-medium text-gray-900 dark:text-white truncate"
                          title={`${application.firstname || ''} ${application.surname || ''}`.trim()}
                        >
                          {application.firstname || ''} {application.surname || ''}
                        </div>
                        {application.gender ? (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {application.gender}
                          </div>
                        ) : null}
                      </td>
                      <td className="py-3 px-4 align-top max-w-[280px]">
                        <div
                          className="font-medium text-sm text-gray-900 dark:text-white truncate"
                          title={application.programChoice || ''}
                        >
                          {application.programChoice || '—'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                          {[application.programType, application.modeOfStudy]
                            .filter(Boolean)
                            .join(' • ') || '—'}
                        </div>
                      </td>
                      <td className="py-3 px-4 align-top text-sm text-gray-600 dark:text-gray-400 font-mono whitespace-nowrap">
                        {application.applicationNumber || 'N/A'}
                      </td>
                      <td className="py-3 px-4 align-top whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openDetailModal(application)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
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
                {selectedApplication.avatar ? (
                  <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 shadow-sm flex items-center gap-4">
                    <img
                      src={selectedApplication.avatar}
                      alt={`${selectedApplication.firstname} ${selectedApplication.surname}`}
                      className="h-20 w-20 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                    />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {[
                          selectedApplication.firstname,
                          selectedApplication.middlename,
                          selectedApplication.surname,
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {selectedApplication.email}
                      </p>
                    </div>
                  </div>
                ) : null}

                <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 sm:p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DetailField label="First Name" value={selectedApplication.firstname} />
                    <DetailField label="Middle Name" value={selectedApplication.middlename} />
                    <DetailField label="Surname" value={selectedApplication.surname} />
                    <DetailField label="Maiden Name" value={selectedApplication.maidenName} />
                    <DetailField label="Email" value={selectedApplication.email} />
                    <DetailField label="Phone" value={selectedApplication.phoneNumber} />
                    <DetailField label="Alternate Phone" value={selectedApplication.alternatePhone} />
                    <DetailField label="Date of Birth" value={selectedApplication.dateOfBirth} />
                    <DetailField label="Gender" value={selectedApplication.gender} />
                    <DetailField label="Marital Status" value={selectedApplication.maritalStatus} />
                    <DetailField label="Nationality" value={selectedApplication.nationality} />
                    <DetailField label="National ID" value={selectedApplication.nationalId} mono />
                    <DetailField label="Religion" value={selectedApplication.religion} />
                  </div>
                </div>

                <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 sm:p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    Address & Location
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DetailField label="Address" value={selectedApplication.address} full />
                    <DetailField label="Home Address" value={selectedApplication.homeAddress} full />
                    <DetailField label="Home Town" value={selectedApplication.homeTown} />
                    <DetailField label="City" value={selectedApplication.city} />
                    <DetailField label="State" value={selectedApplication.state} />
                    <DetailField label="Country" value={selectedApplication.country} />
                    <DetailField label="Postal Code" value={selectedApplication.postalCode} />
                  </div>
                </div>

                <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 sm:p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Next of Kin
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DetailField label="First Name" value={selectedApplication.kinFirstname} />
                    <DetailField label="Surname" value={selectedApplication.kinSurname} />
                    <DetailField label="Relationship" value={selectedApplication.kinRelationship} />
                    <DetailField label="Phone" value={selectedApplication.kinPhone} />
                    <DetailField label="Email" value={selectedApplication.kinEmail} />
                    <DetailField label="Address" value={selectedApplication.kinAddress} full />
                  </div>
                </div>

                <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 sm:p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Program Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DetailField label="Program Type" value={selectedApplication.programType} />
                    <DetailField label="Program Choice" value={selectedApplication.programChoice} />
                    <DetailField
                      label="Admission Session"
                      value={selectedApplication.admissionSession}
                    />
                    <DetailField label="Mode of Study" value={selectedApplication.modeOfStudy} />
                    <DetailField
                      label="Reason for Pursuing"
                      value={selectedApplication.reasonForPursuing}
                      full
                    />
                  </div>
                </div>

                <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 sm:p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Education Background
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DetailField label="Previous Degree" value={selectedApplication.previousDegree} />
                    <DetailField
                      label="Institution"
                      value={selectedApplication.previousInstitution}
                    />
                    <DetailField
                      label="Field of Study"
                      value={selectedApplication.previousFieldOfStudy}
                    />
                    <DetailField
                      label="Graduation Year"
                      value={selectedApplication.previousGraduationYear}
                    />
                    <DetailField label="GPA / Class" value={selectedApplication.previousGPA} />
                  </div>
                </div>

                <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 sm:p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Employment
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DetailField
                      label="Employment Status"
                      value={selectedApplication.employmentStatus}
                    />
                    <DetailField
                      label="Current Employer"
                      value={selectedApplication.currentEmployer}
                    />
                    <DetailField label="Job Title" value={selectedApplication.jobTitle} />
                    <DetailField
                      label="Start Date"
                      value={selectedApplication.employmentStartDate}
                    />
                    <DetailField label="End Date" value={selectedApplication.employmentEndDate} />
                  </div>
                </div>

                <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 sm:p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Research
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DetailField
                      label="Research Title"
                      value={selectedApplication.researchTitle}
                      full
                    />
                    <DetailField
                      label="Abstract"
                      value={selectedApplication.researchAbstract}
                      full
                    />
                    <DetailField
                      label="Objectives"
                      value={selectedApplication.researchObjectives}
                      full
                    />
                    <DetailField
                      label="Methodology"
                      value={selectedApplication.researchMethodology}
                      full
                    />
                  </div>
                </div>

                <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 sm:p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Referees
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3 rounded-lg border border-gray-100 dark:border-gray-800 p-4">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Referee 1
                      </p>
                      <DetailField label="Name" value={selectedApplication.referee1Name} />
                      <DetailField label="Email" value={selectedApplication.referee1Email} />
                      <DetailField label="Phone" value={selectedApplication.referee1Phone} />
                      <DetailField
                        label="Institution"
                        value={selectedApplication.referee1Institution}
                      />
                    </div>
                    <div className="space-y-3 rounded-lg border border-gray-100 dark:border-gray-800 p-4">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Referee 2
                      </p>
                      <DetailField label="Name" value={selectedApplication.referee2Name} />
                      <DetailField label="Email" value={selectedApplication.referee2Email} />
                      <DetailField label="Phone" value={selectedApplication.referee2Phone} />
                      <DetailField
                        label="Institution"
                        value={selectedApplication.referee2Institution}
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 sm:p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Documents
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DocumentLink
                      label="National ID File"
                      href={selectedApplication.nationalIdFile}
                    />
                    <DocumentLink label="Transcript" href={selectedApplication.transcriptFile} />
                    <DocumentLink label="Certificate" href={selectedApplication.certificateFile} />
                    <DocumentLink
                      label="Research Proposal"
                      href={selectedApplication.proposalFile}
                    />
                    <DocumentLink label="Passport Photo" href={selectedApplication.avatar} />
                  </div>
                </div>

                <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 sm:p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Payment & Status
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DetailField
                      label="Payment Reference"
                      value={selectedApplication.paymentReference}
                      mono
                    />
                    <DetailField
                      label="Payment Method"
                      value={selectedApplication.paymentMethod}
                    />
                    <DetailField
                      label="Application Number"
                      value={selectedApplication.applicationNumber}
                      mono
                    />
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 block">
                        Application Fee Status
                      </label>
                      {(() => {
                        const feePaid =
                          hasPaidApplicationFee(
                            selectedApplication.paymentReference,
                            selectedApplication.paymentProof
                          ) ||
                          !isNigerianApplicant(
                            selectedApplication.nationality,
                            selectedApplication.country
                          );
                        return (
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              feePaid
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}
                          >
                            {feePaid ? 'Paid' : 'Unpaid'}
                          </span>
                        );
                      })()}
                    </div>
                    <DetailField
                      label="Submitted"
                      value={formatDate(selectedApplication.createdAt)}
                    />
                    <DetailField
                      label="Last Updated"
                      value={formatDate(selectedApplication.updatedAt)}
                    />
                  </div>
                </div>

                <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 sm:p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Acceptance Fee
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    {selectedApplication.acceptanceFeePaid &&
                      selectedApplication.acceptancePaymentReference && (
                        <div>
                          <p className="font-medium text-gray-700 dark:text-gray-300">
                            Acceptance Payment Reference
                          </p>
                          <p className="text-gray-600 dark:text-gray-400 break-all font-mono text-sm">
                            {selectedApplication.acceptancePaymentReference}
                          </p>
                        </div>
                      )}
                    {selectedApplication.acceptancePaidAt ? (
                      <DetailField
                        label="Acceptance Paid At"
                        value={formatDate(selectedApplication.acceptancePaidAt)}
                      />
                    ) : null}
                  </div>
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

                <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 sm:p-6 shadow-sm">
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
        <LoadErrorModal
          open={!!error}
          title="Unable to Load Applicants"
          error={error}
          onClose={() => setError(null)}
          onRetry={() => {
            setError(null);
            fetchApplications();
          }}
        />
      </div>
    </DeputyCenterLeaderLayout>
  );
}
