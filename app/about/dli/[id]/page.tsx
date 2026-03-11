'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '../../../components/navbar/page';
import Footer from '../../../components/footer/page';
import {
  ArrowLeft,
  Loader2,
  FileQuestion,
  FileText,
  FileSpreadsheet,
  FileImage,
  FileType,
  Download,
  LogOut,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import * as XLSX from 'xlsx';
import { dliTypeConfig } from '@/lib/dli-milestones';
import type { DocType } from '@/lib/dli-milestones';

interface DliDetail {
  id: string;
  title: string;
  type: string;
  documentUrl?: string;
  fileLabel?: string;
  files?: { url: string; fileLabel?: string }[];
}

function getDocumentIcon(
  fileLabel?: string,
  url?: string
): { Icon: LucideIcon; color: string } {
  const s = (fileLabel ?? url ?? '').toLowerCase();
  if (s.endsWith('.pdf')) return { Icon: FileText, color: 'text-red-600 dark:text-red-400' };
  if (s.endsWith('.xls') || s.endsWith('.xlsx'))
    return { Icon: FileSpreadsheet, color: 'text-green-700 dark:text-green-400' };
  if (s.endsWith('.doc') || s.endsWith('.docx'))
    return { Icon: FileType, color: 'text-blue-600 dark:text-blue-400' };
  if (/\.(png|jpe?g|gif|webp|svg)$/.test(s))
    return { Icon: FileImage, color: 'text-purple-600 dark:text-purple-400' };
  return { Icon: FileText, color: 'text-green-600 dark:text-green-400' };
}

function isExcelFile(fileLabel?: string, url?: string): boolean {
  const s = (fileLabel ?? url ?? '').toLowerCase();
  return s.endsWith('.xls') || s.endsWith('.xlsx');
}

/** Find the row index that contains "description" (header row); otherwise 0. */
function getExcelHeaderRowIndex(rows: unknown[][]): number {
  const desc = 'description';
  const i = rows.findIndex((row) => {
    const cells = Array.isArray(row) ? row : Object.values(row);
    return cells.some((c) => String(c ?? '').trim().toLowerCase() === desc);
  });
  return i >= 0 ? i : 0;
}

function getViewerUrl(url: string, fileLabel?: string, origin?: string): string {
  if (!url || url === '#') return '';
  const lower = (fileLabel ?? url).toLowerCase();
  const isPdf = lower.endsWith('.pdf') || url.toLowerCase().includes('.pdf');
  const isWord = lower.endsWith('.doc') || lower.endsWith('.docx');

  // Excel is previewed client-side via xlsx, so no iframe URL
  if (isExcelFile(fileLabel, url)) return '';

  // Local uploads (e.g. /uploads/dli/...): PDF works in iframe
  if (url.startsWith('/')) {
    if (isPdf) return url;
    if (isWord && origin) return `https://docs.google.com/viewer?url=${encodeURIComponent(origin + url)}&embedded=true`;
    if (isWord) return '';
    return url;
  }

  if (isPdf) return `/api/view-document?url=${encodeURIComponent(url)}`;
  return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
}

export default function DLIDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [id, setId] = useState<string | null>(null);
  const [dli, setDli] = useState<DliDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [origin, setOrigin] = useState('');
  const [excelRows, setExcelRows] = useState<unknown[][] | null>(null);
  const [excelLoading, setExcelLoading] = useState(false);
  const [excelError, setExcelError] = useState<string | null>(null);
  const [accessChecked, setAccessChecked] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      const accessCode = typeof window !== 'undefined' ? sessionStorage.getItem('project_access_code') : null;
      if (!accessCode) {
        router.replace('/access');
        return;
      }
      try {
        const verifyRes = await fetch('/api/verify-access-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessCode }),
        });
        const verifyData = await verifyRes.json();
        if (!verifyRes.ok || !verifyData.valid || verifyData.accessType !== 'dli') {
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('project_access_code');
            sessionStorage.removeItem('project_access_type');
          }
          router.replace('/access');
          return;
        }
      } catch {
        router.replace('/access');
        return;
      }
      setAccessChecked(true);
    };
    checkAccess();
  }, [router]);

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  useEffect(() => {
    if (typeof window !== 'undefined') setOrigin(window.location.origin);
  }, []);

  const files = dli?.files?.length
    ? dli.files
    : dli?.documentUrl
      ? [{ url: dli.documentUrl, fileLabel: dli.fileLabel }]
      : [];
  const selectedFile = files.length > 0 ? files[Math.min(selectedIndex, files.length - 1)] : null;

  // Load Excel file and parse for preview when an Excel file is selected
  useEffect(() => {
    if (!selectedFile || !isExcelFile(selectedFile.fileLabel, selectedFile.url)) {
      setExcelRows(null);
      setExcelError(null);
      return;
    }
    let cancelled = false;
    setExcelLoading(true);
    setExcelError(null);
    setExcelRows(null);

    const loadExcel = async () => {
      try {
        const url = selectedFile!.url.startsWith('/') ? selectedFile!.url : `/api/view-document?url=${encodeURIComponent(selectedFile!.url)}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to load file');
        const ab = await res.arrayBuffer();
        const wb = XLSX.read(ab, { type: 'array' });
        const firstSheetName = wb.SheetNames[0];
        if (!firstSheetName) throw new Error('No sheet found');
        const sheet = wb.Sheets[firstSheetName];
        const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: '' });
        if (!cancelled) setExcelRows(Array.isArray(rows) ? rows : []);
      } catch (e) {
        if (!cancelled) setExcelError(e instanceof Error ? e.message : 'Could not preview spreadsheet');
      } finally {
        if (!cancelled) setExcelLoading(false);
      }
    };
    loadExcel();
    return () => {
      cancelled = true;
    };
  }, [selectedFile?.url, selectedFile?.fileLabel]);

  useEffect(() => {
    if (!accessChecked || !id) return;
    setSelectedIndex(0);
    async function fetchDli() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/ict/dlis/${id}`);
        if (res.status === 404) {
          setError('Document not found');
          setDli(null);
          return;
        }
        if (!res.ok) throw new Error('Failed to fetch document');
        const data = await res.json();
        setDli(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load document');
        setDli(null);
      } finally {
        setLoading(false);
      }
    }
    fetchDli();
  }, [accessChecked, id]);

  if (!accessChecked) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-green-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Checking access...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Hero */}
        <section className="relative bg-gradient-to-br from-green-900 to-emerald-900 text-white py-16 overflow-hidden">
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <Link
                href="/about/dli"
                className="inline-flex items-center gap-2 text-green-100 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to DLI documents
              </Link>
              <button
                type="button"
                onClick={() => {
                  sessionStorage.removeItem('project_access_code');
                  sessionStorage.removeItem('project_access_type');
                  router.replace('/access');
                }}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-green-100 hover:text-white hover:bg-white/10 transition-colors text-sm font-medium"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </div>
            {!loading && dli && (
              <div className="text-center mt-4">
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-white/20 text-white backdrop-blur-sm`}
                  >
                    {dliTypeConfig[dli.type as DocType]?.label ?? dli.type}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-white/20 text-white backdrop-blur-sm">
                    {files.length} {files.length === 1 ? 'document' : 'documents'}
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mt-3">
                  {dli.title}
                </h1>
              </div>
            )}
          </div>
        </section>

        <section className="py-12">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-500 dark:text-gray-400">
                <Loader2 className="h-12 w-12 animate-spin mb-4 text-green-600" />
                <p>Loading document...</p>
              </div>
            ) : error || !dli ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-500 dark:text-gray-400">
                <FileQuestion className="h-12 w-12 mb-4 text-amber-500" />
                <p className="mb-2">{error ?? 'Document not found'}</p>
                <Link
                  href="/about/dli"
                  className="text-green-600 dark:text-green-400 font-medium hover:underline"
                >
                  Return to DLI documents
                </Link>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                  {files.length > 0 && selectedFile && (
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                        {selectedFile.fileLabel || 'Document'}
                      </span>
                      <a
                        href={selectedFile.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={selectedFile.fileLabel}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors shrink-0"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </a>
                    </div>
                  )}
                </div>

                {files.length === 0 ? (
                  <div className="p-6 sm:p-8">
                    <p className="text-gray-500 dark:text-gray-400">No documents available.</p>
                  </div>
                ) : (
                  <div className="flex flex-col lg:flex-row min-h-[85vh]">
                    {/* Left: document list (navbar) */}
                    <nav className="lg:w-64 shrink-0 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                      <ul className="p-2">
                        {files.map((f, index) => {
                          const { Icon, color } = getDocumentIcon(f.fileLabel, f.url);
                          const isSelected = index === selectedIndex;
                          return (
                            <li key={index}>
                              <button
                                type="button"
                                onClick={() => setSelectedIndex(index)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-colors ${
                                  isSelected
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                              >
                                <Icon className={`h-4 w-4 shrink-0 ${color}`} />
                                <span className="truncate">
                                  {f.fileLabel || `Document ${index + 1}`}
                                </span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </nav>

                    {/* Right: preview only */}
                    <div className="flex-1 flex flex-col min-h-0 p-4 overflow-hidden">
                      {selectedFile && (
                        <div className="flex-1 min-h-[75vh] rounded-lg border border-gray-200 dark:border-gray-600 overflow-auto bg-white dark:bg-gray-900">
                          {isExcelFile(selectedFile.fileLabel, selectedFile.url) ? (
                            <div className="w-full h-full min-h-[75vh] flex flex-col overflow-hidden">
                              {excelLoading ? (
                                <div className="flex flex-1 flex-col items-center justify-center py-16 text-gray-500 dark:text-gray-400">
                                  <Loader2 className="h-10 w-10 animate-spin text-green-600 mb-2" />
                                  <p>Loading spreadsheet...</p>
                                </div>
                              ) : excelError ? (
                                <p className="p-4 text-amber-600 dark:text-amber-400">{excelError}</p>
                              ) : excelRows && excelRows.length > 0 ? (
                                (() => {
                                  const headerRowIndex = getExcelHeaderRowIndex(excelRows);
                                  const headerRow = excelRows[headerRowIndex];
                                  const rowsBefore = excelRows.slice(0, headerRowIndex);
                                  const rowsAfter = excelRows.slice(headerRowIndex + 1);
                                  const headerCells = Array.isArray(headerRow) ? headerRow : Object.values(headerRow);
                                  return (
                                    <>
                                      <div className="shrink-0 px-4 py-2 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/80">
                                        <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                          Spreadsheet preview
                                        </span>
                                      </div>
                                      <div className="flex-1 overflow-auto p-4">
                                        <table className="w-full min-w-max border-collapse text-sm shadow-sm rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
                                          <thead>
                                            <tr>
                                              {headerCells.map((cell, j) => (
                                                <th
                                                  key={j}
                                                  className="sticky top-0 z-10 bg-emerald-700 text-white font-semibold text-left px-4 py-3 border-b border-emerald-800 whitespace-nowrap"
                                                >
                                                  {cell != null && cell !== '' ? String(cell) : '\u00A0'}
                                                </th>
                                              ))}
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {[...rowsBefore, ...rowsAfter].map((row, i) => {
                                              const cells = Array.isArray(row) ? row : Object.values(row);
                                              return (
                                                <tr
                                                  key={i}
                                                  className={i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800/50'}
                                                >
                                                  {cells.map((cell, j) => {
                                                    const raw = cell != null && cell !== '' ? cell : '';
                                                    const str = String(raw);
                                                    const isNumeric = typeof raw === 'number' || (str && /^-?[\d,.]+%?$/.test(str.trim()));
                                                    return (
                                                      <td
                                                        key={j}
                                                        className={`border border-gray-200 dark:border-gray-600 px-4 py-2.5 align-top ${isNumeric ? 'text-right tabular-nums' : 'text-left'}`}
                                                      >
                                                        {str || '\u00A0'}
                                                      </td>
                                                    );
                                                  })}
                                                </tr>
                                              );
                                            })}
                                          </tbody>
                                        </table>
                                      </div>
                                    </>
                                  );
                                })()
                              ) : (
                                <p className="p-4 text-gray-500 dark:text-gray-400">No data to display.</p>
                              )}
                            </div>
                          ) : (
                            <iframe
                              title={selectedFile.fileLabel || 'Document preview'}
                              src={getViewerUrl(selectedFile.url, selectedFile.fileLabel, origin)}
                              className="w-full h-full min-h-[75vh]"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}
