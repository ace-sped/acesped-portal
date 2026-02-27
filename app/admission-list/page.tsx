'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '../components/navbar/page';
import Footer from '../components/footer/page';
import { GraduationCap, Globe2, Loader2, Search } from 'lucide-react';

interface AdmissionRecord {
  id: string;
  firstname: string;
  surname: string;
  programChoice: string;
  admissionSession: string;
  applicationNumber: string;
  nationality: string;
  state: string;
}

const sessionOptions = ['2025/2026', '2026/2027'];

export default function AdmissionListPage() {
  const [session, setSession] = useState(sessionOptions[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [records, setRecords] = useState<AdmissionRecord[]>([]);

  useEffect(() => {
    const fetchAdmissions = async () => {
      if (!session) return;
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/admissions?session=${encodeURIComponent(session)}`);
        const data = await response.json().catch(() => null);
        if (!response.ok || !data?.success) {
          throw new Error(data?.message || 'Failed to load admission list.');
        }
        setRecords(data.admissions || []);
      } catch (err: any) {
        console.error('Admission list error:', err);
        setError(err?.message || 'Unable to load admission list at this time.');
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAdmissions();
  }, [session]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 mb-4">
            <GraduationCap className="h-4 w-4 mr-2" />
            Admission List
          </span>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Approved Applicants</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Select an admission session to view applicants who have been offered admission.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-10 border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm uppercase text-gray-500 dark:text-gray-400 mb-1">Admission Session</p>
            <select
              value={session}
              onChange={(e) => setSession(e.target.value)}
              className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
            >
              {sessionOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Search className="h-4 w-4 mr-2" />
            {records.length > 0
              ? `${records.length} applicant${records.length > 1 ? 's' : ''} admitted`
              : 'No admitted applicants for this session'}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/40">
                <tr>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Applicant Name
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Application Number
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Program
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Nationality
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    State
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-gray-500 dark:text-gray-400">
                      <div className="flex items-center justify-center space-x-3">
                        <Loader2 className="h-5 w-5 animate-spin text-green-600" />
                        <span>Loading admitted applicants...</span>
                      </div>
                    </td>
                  </tr>
                )}
                {!loading && records.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-gray-500 dark:text-gray-400">
                      No admitted applicants found for {session}.
                    </td>
                  </tr>
                )}
                {!loading &&
                  records.map((record) => (
                    <tr key={record.id} className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/20 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {record.firstname} {record.surname}
                        </div>
                      </td>
                      <td className="py-4 px-6 font-mono text-sm text-gray-700 dark:text-gray-300">{record.applicationNumber}</td>
                      <td className="py-4 px-6 text-gray-700 dark:text-gray-300">{record.programChoice || '—'}</td>
                      <td className="py-4 px-6 text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                        <Globe2 className="h-4 w-4 text-gray-400" />
                        <span>{record.nationality || '—'}</span>
                      </td>
                      <td className="py-4 px-6 text-gray-700 dark:text-gray-300">{record.state || '—'}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 text-sm text-red-700 dark:text-red-300 border-t border-red-200 dark:border-red-800">
              {error}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}













