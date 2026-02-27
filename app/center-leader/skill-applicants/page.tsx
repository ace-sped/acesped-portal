"use client"

import React, { useState, useEffect } from 'react';
import CenterLeaderLayout from '../components/CenterLeaderLayout';
import { 
  ClipboardList, Search, Eye, Filter, 
  Check, AlertCircle, X, Download, Mail, Phone, Calendar, MapPin
} from 'lucide-react';

interface SkillApplication {
  id: string;
  surname: string;
  firstname: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  technicalInterest: string;
  hasPriorExperience: string;
  priorTechSkills: string[] | null;
  hasLaptop: string;
  hasReliableInternet: string;
  whyLearnTechSkill: string;
  careerGoalsInTech: string;
  committedToProgram: string;
  howDidYouHear: string;
  disabilitiesOrAssistance: string | null;
  informationConfirmed: boolean;
  paymentReference: string | null;
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'AWAITING_PAYMENT';
  applicationNumber: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function SkillApplicantsPage() {
  const [applications, setApplications] = useState<SkillApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<SkillApplication[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedApplication, setSelectedApplication] = useState<SkillApplication | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  useEffect(() => {
    filterApplications();
  }, [searchTerm, applications]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const url = new URL('/api/center-leader/skill-applicants', window.location.origin);
      if (statusFilter !== 'ALL') {
        url.searchParams.append('status', statusFilter);
      }
      if (searchTerm) {
        url.searchParams.append('search', searchTerm);
      }

      const response = await fetch(url.toString());
      const data = await response.json();
      if (data.success) {
        setApplications(data.applications);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = applications;

    if (searchTerm) {
      filtered = filtered.filter(app => 
        `${app.firstname} ${app.surname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (app.applicationNumber && app.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        app.technicalInterest.toLowerCase().includes(searchTerm.toLowerCase())
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

  const openDetailModal = (application: SkillApplication) => {
    setSelectedApplication(application);
    setShowDetailModal(true);
  };

  const handleStatusChange = async (newStatus: SkillApplication['status']) => {
    if (!selectedApplication) return;

    try {
      setUpdatingStatus(true);
      const response = await fetch('/api/center-leader/skill-applicants', {
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

      // Update local state
      setApplications((prev) =>
        prev.map((app) =>
          app.id === selectedApplication.id ? { ...app, status: newStatus } : app
        )
      );
      setSelectedApplication((prev) =>
        prev ? { ...prev, status: newStatus } : prev
      );
    } catch (error) {
      console.error('Error updating status:', error);
      alert(
        error instanceof Error
          ? error.message
          : 'Failed to update status. Please try again.'
      );
    } finally {
      setUpdatingStatus(false);
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
            Skill Applicants
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage skill training applications
          </p>
        </div>

        {/* Filters and Search */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, phone, or application number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white appearance-none"
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
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{applications.length}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
            <div className="text-2xl font-bold text-yellow-600">{applications.filter(a => a.status === 'PENDING').length}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">Under Review</div>
            <div className="text-2xl font-bold text-blue-600">{applications.filter(a => a.status === 'UNDER_REVIEW').length}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">Approved</div>
            <div className="text-2xl font-bold text-green-600">{applications.filter(a => a.status === 'APPROVED').length}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">Rejected</div>
            <div className="text-2xl font-bold text-red-600">{applications.filter(a => a.status === 'REJECTED').length}</div>
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Name</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Contact</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Technical Interest</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Application #</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Date</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500 dark:text-gray-400">
                      Loading...
                    </td>
                  </tr>
                ) : filteredApplications.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No applications found
                    </td>
                  </tr>
                ) : (
                  filteredApplications.map((application) => (
                    <tr key={application.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="py-4 px-6">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {application.firstname} {application.surname}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{application.gender}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-gray-900 dark:text-white flex items-center gap-1">
                          <Mail className="h-4 w-4 text-gray-400" />
                          {application.email}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-1">
                          <Phone className="h-4 w-4 text-gray-400" />
                          {application.phone}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                        {application.technicalInterest}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400 font-mono">
                        {application.applicationNumber || 'N/A'}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                          {application.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(application.createdAt)}
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => openDetailModal(application)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
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
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Application Details
                </h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</label>
                      <p className="text-gray-900 dark:text-white">{selectedApplication.firstname} {selectedApplication.surname}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                      <p className="text-gray-900 dark:text-white">{selectedApplication.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</label>
                      <p className="text-gray-900 dark:text-white">{selectedApplication.phone}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Date of Birth</label>
                      <p className="text-gray-900 dark:text-white">{selectedApplication.dateOfBirth}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Gender</label>
                      <p className="text-gray-900 dark:text-white">{selectedApplication.gender}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</label>
                      <p className="text-gray-900 dark:text-white">{selectedApplication.address}</p>
                    </div>
                  </div>
                </div>

                {/* Technical Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Technical Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Technical Interest</label>
                      <p className="text-gray-900 dark:text-white">{selectedApplication.technicalInterest}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Prior Experience</label>
                      <p className="text-gray-900 dark:text-white">{selectedApplication.hasPriorExperience}</p>
                    </div>
                    {selectedApplication.hasPriorExperience === 'Yes' && selectedApplication.priorTechSkills && (
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Prior Tech Skills</label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {(selectedApplication.priorTechSkills as string[]).map((skill, index) => (
                            <span key={index} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-full text-sm">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Has Laptop</label>
                      <p className="text-gray-900 dark:text-white">{selectedApplication.hasLaptop}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Has Reliable Internet</label>
                      <p className="text-gray-900 dark:text-white">{selectedApplication.hasReliableInternet}</p>
                    </div>
                  </div>
                </div>

                {/* Motivation */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Motivation & Goals</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Why Learn Tech Skill</label>
                      <p className="text-gray-900 dark:text-white mt-1">{selectedApplication.whyLearnTechSkill}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Career Goals in Tech</label>
                      <p className="text-gray-900 dark:text-white mt-1">{selectedApplication.careerGoalsInTech}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Committed to Program</label>
                      <p className="text-gray-900 dark:text-white">{selectedApplication.committedToProgram}</p>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Additional Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">How Did You Hear About Us</label>
                      <p className="text-gray-900 dark:text-white mt-1">{selectedApplication.howDidYouHear}</p>
                    </div>
                    {selectedApplication.disabilitiesOrAssistance && (
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Disabilities or Assistance Needed</label>
                        <p className="text-gray-900 dark:text-white mt-1">{selectedApplication.disabilitiesOrAssistance}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment & Status */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment & Status</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Payment Reference</label>
                      <p className="text-gray-900 dark:text-white font-mono">{selectedApplication.paymentReference || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 block">
                        Status
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        <select
                          value={selectedApplication.status}
                          onChange={(e) =>
                            handleStatusChange(
                              e.target.value as SkillApplication['status']
                            )
                          }
                          disabled={updatingStatus}
                          className="px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Application Number</label>
                      <p className="text-gray-900 dark:text-white font-mono">{selectedApplication.applicationNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Submitted</label>
                      <p className="text-gray-900 dark:text-white">{formatDate(selectedApplication.createdAt)}</p>
                    </div>
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


