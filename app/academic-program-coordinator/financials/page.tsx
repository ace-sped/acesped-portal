
"use client"

import React, { useState, useEffect } from 'react';
import RoleLayout from '../../components/shared/RoleLayout';
import {
    CreditCard,
    FileText,
    CheckCircle,
    AlertCircle,
    RefreshCw,
    DollarSign,
    Search,
    Download
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function FinancialsPage() {
    const [activeTab, setActiveTab] = useState<'payments' | 'submissions'>('payments');
    const [payments, setPayments] = useState<any[]>([]);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (activeTab === 'payments') {
            fetchPayments();
        } else {
            fetchSubmissions();
        }
    }, [activeTab]);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/academic-program-coordinator/financials/lecturer-payments');
            if (res.ok) {
                const data = await res.json();
                setPayments(data);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch payments');
        } finally {
            setLoading(false);
        }
    };

    const fetchSubmissions = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/academic-program-coordinator/financials/result-submissions');
            if (res.ok) {
                const data = await res.json();
                setSubmissions(data);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch submissions');
        } finally {
            setLoading(false);
        }
    };

    const generatePayments = async () => {
        setProcessing(true);
        try {
            const res = await fetch('/api/academic-program-coordinator/financials/lecturer-payments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'GENERATE' })
            });
            if (res.ok) {
                const data = await res.json();
                toast.success(data.message || 'Payments generated successfully');
                fetchPayments();
            } else {
                toast.error('Failed to generate payments');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error generating payments');
        } finally {
            setProcessing(false);
        }
    };

    const updatePaymentStatus = async (paymentIds: string[], action: 'APPROVE' | 'PAY') => {
        setProcessing(true);
        try {
            const res = await fetch('/api/academic-program-coordinator/financials/lecturer-payments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, paymentIds })
            });
            if (res.ok) {
                toast.success(`Payments ${action === 'APPROVE' ? 'approved' : 'marked as paid'} successfully`);
                fetchPayments();
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to update payments');
        } finally {
            setProcessing(false);
        }
    };

    const downloadReport = () => {
        const headers = ["Lecturer", "Email", "Course Code", "Course Title", "Amount", "Status", "Generated At"];
        const rows = payments.map(p => [
            `"${p.lecturer?.firstname} ${p.lecturer?.surname}"`,
            p.lecturer?.email,
            p.course?.courseCode,
            `"${p.course?.title}"`,
            p.amount,
            p.status,
            new Date(p.generatedAt).toLocaleDateString()
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "payment_schedule.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-NG', { style: 'currency', currency: currency }).format(amount);
    };

    return (
        <RoleLayout
            rolePath="academic-program-coordinator"
            roleDisplayName="Academic Program Coordinator"
            roleColor="indigo"
        >
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Management</h1>
                        <p className="text-gray-600 dark:text-gray-400">Manage lecturer payments and financial reports</p>
                    </div>
                    <button
                        onClick={downloadReport}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                        <Download className="w-4 h-4" />
                        Export Report
                    </button>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab('payments')}
                            className={`${activeTab === 'payments'
                                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                        >
                            <CreditCard className="w-4 h-4" />
                            Lecturer Payments
                        </button>
                        <button
                            onClick={() => setActiveTab('submissions')}
                            className={`${activeTab === 'submissions'
                                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                        >
                            <FileText className="w-4 h-4" />
                            Result Submissions
                        </button>
                    </nav>
                </div>

                {/* Content */}
                {activeTab === 'payments' ? (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Payment Schedule</h2>
                            <button
                                onClick={generatePayments}
                                disabled={processing}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {processing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />}
                                Generate Schedule
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Lecturer</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Course</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-4 text-center text-gray-500">Loading...</td>
                                        </tr>
                                    ) : payments.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No generated payments found. Click "Generate Schedule" to start.</td>
                                        </tr>
                                    ) : (
                                        payments.map((payment) => (
                                            <tr key={payment.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="ml-0">
                                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                {payment.lecturer?.firstname} {payment.lecturer?.surname}
                                                            </div>
                                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                                {payment.lecturer?.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900 dark:text-white">{payment.course?.courseCode}</div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">{payment.course?.title}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {formatCurrency(payment.amount, payment.currency)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                        ${payment.status === 'PAID' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                                            payment.status === 'APPROVED' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                                                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
                                                        {payment.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    {payment.status === 'PENDING' && (
                                                        <button
                                                            onClick={() => updatePaymentStatus([payment.id], 'APPROVE')}
                                                            className="text-indigo-600 hover:text-indigo-900 dark:hover:text-indigo-400 mr-4"
                                                        >
                                                            Approve
                                                        </button>
                                                    )}
                                                    {payment.status === 'APPROVED' && (
                                                        <button
                                                            onClick={() => updatePaymentStatus([payment.id], 'PAY')}
                                                            className="text-green-600 hover:text-green-900 dark:hover:text-green-400"
                                                        >
                                                            Mark Paid
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Result Submissions</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Course</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Lecturer</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Submitted At</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-4 text-center text-gray-500">Loading...</td>
                                        </tr>
                                    ) : submissions.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No result submissions found.</td>
                                        </tr>
                                    ) : (
                                        submissions.map((submission) => (
                                            <tr key={submission.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900 dark:text-white">{submission.course?.courseCode}</div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">{submission.course?.title}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {submission.lecturer?.firstname} {submission.lecturer?.surname}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900 dark:text-white">
                                                        {new Date(submission.submittedAt).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                        {submission.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">
                                                        View Details
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </RoleLayout>
    );
}
