
"use client"

import React, { useState, useEffect } from 'react';
import RoleLayout from '../components/shared/RoleLayout';
import Link from 'next/link';
import {
  BookOpen, Users, CheckCircle, CreditCard, Wallet,
  ArrowUpRight, FileText, Upload, GraduationCap
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function LecturerDashboard() {
  const [stats, setStats] = useState({
    coursesCount: 0,
    studentsCount: 0,
    superviseesCount: 0
  });
  const [showBankingModal, setShowBankingModal] = useState(false);
  const [bankingDetails, setBankingDetails] = useState({
    bankName: '',
    accountNumber: '',
    accountName: ''
  });
  const [savingBank, setSavingBank] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchBankingDetails();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch courses to get course count
      const coursesRes = await fetch('/api/lecturer/courses');
      const coursesData = await coursesRes.json();

      // Fetch supervisees
      const superviseesRes = await fetch('/api/lecturer/supervisees');
      const superviseesData = await superviseesRes.json();

      setStats({
        coursesCount: coursesData.courses?.length || 0,
        studentsCount: coursesData.courses?.reduce((acc: number, curr: any) => acc + (curr.studentsCount || 0), 0) || 0,
        superviseesCount: superviseesData.students?.length || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchBankingDetails = async () => {
    try {
      const response = await fetch('/api/lecturer/banking');
      const data = await response.json();
      if (data.success && data.banking) {
        setBankingDetails({
          bankName: data.banking.bankName || '',
          accountNumber: data.banking.accountNumber || '',
          accountName: data.banking.accountName || ''
        });
      }
    } catch (error) {
      console.error('Error fetching banking details:', error);
    }
  };

  const handleSaveBanking = async () => {
    setSavingBank(true);
    try {
      const response = await fetch('/api/lecturer/banking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bankingDetails)
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Banking details saved');
        setShowBankingModal(false);
      } else {
        toast.error('Failed to save details');
      }
    } catch (error) {
      toast.error('Error saving details');
    } finally {
      setSavingBank(false);
    }
  };

  return (
    <RoleLayout
      rolePath="lecturer"
      roleDisplayName="Lecturer"
      roleColor="green"
    >
      <div className="p-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Lecturer Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your courses, students, and materials.
            </p>
          </div>
          <button
            onClick={() => setShowBankingModal(true)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Wallet className="h-5 w-5 mr-2" />
            Banking Details
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <BookOpen className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">Active</span>
            </div>
            <h3 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">{stats.coursesCount}</h3>
            <p className="text-gray-500 text-sm">Assigned Courses</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <h3 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">{stats.studentsCount}</h3>
            <p className="text-gray-500 text-sm">Course Students</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <GraduationCap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <h3 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">{stats.superviseesCount}</h3>
            <p className="text-gray-500 text-sm">Research Supervisees (MS/PhD)</p>
          </div>
        </div>

        {/* Quick Actions */}
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/lecturer/courses" className="block group">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow h-full">
              <BookOpen className="h-8 w-8 text-green-500 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">My Courses</h3>
              <p className="text-sm text-gray-500">View registered students and upload materials</p>
            </div>
          </Link>

          <Link href="/lecturer/courses" className="block group">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow h-full">
              <Upload className="h-8 w-8 text-blue-500 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Upload Results</h3>
              <p className="text-sm text-gray-500">Submit C/A and Exam scores</p>
            </div>
          </Link>

          <Link href="/lecturer/supervision" className="block group">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow h-full">
              <GraduationCap className="h-8 w-8 text-purple-500 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">My Research Students</h3>
              <p className="text-sm text-gray-500">Track MS/PhD students supervision</p>
            </div>
          </Link>
        </div>

        {/* Banking Modal */}
        {showBankingModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full animate-in fade-in zoom-in duration-200">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Personal Banking Details</h3>
                <p className="text-sm text-gray-500 mt-1">For receiving payments securely.</p>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={bankingDetails.bankName}
                    onChange={e => setBankingDetails({ ...bankingDetails, bankName: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-green-500"
                    placeholder="e.g. First Bank"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account Number</label>
                  <input
                    type="text"
                    value={bankingDetails.accountNumber}
                    onChange={e => setBankingDetails({ ...bankingDetails, accountNumber: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-green-500"
                    placeholder="0123456789"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account Name</label>
                  <input
                    type="text"
                    value={bankingDetails.accountName}
                    onChange={e => setBankingDetails({ ...bankingDetails, accountName: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-green-500"
                    placeholder="Enter account name"
                  />
                </div>
              </div>
              <div className="p-6 bg-gray-50 dark:bg-gray-700/50 flex justify-end gap-3 rounded-b-xl">
                <button className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg" onClick={() => setShowBankingModal(false)}>Cancel</button>
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  onClick={handleSaveBanking}
                  disabled={savingBank}
                >
                  {savingBank ? 'Saving...' : 'Save Details'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleLayout>
  );
}
