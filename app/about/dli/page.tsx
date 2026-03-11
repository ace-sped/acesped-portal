'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/navbar/page';
import Footer from '../../components/footer/page';
import { Loader2, FileQuestion, ChevronRight, LogOut } from 'lucide-react';
import { dliTypeConfig } from '@/lib/dli-milestones';
import type { DocType } from '@/lib/dli-milestones';
import type { MilestoneDocument } from '@/lib/dli-milestones';

export default function DLIPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<MilestoneDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessChecked, setAccessChecked] = useState(false);

  useEffect(() => {
    const checkAccessAndFetch = async () => {
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
    checkAccessAndFetch();
  }, [router]);

  useEffect(() => {
    if (!accessChecked) return;
    async function fetchDlis() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/ict/dlis');
        if (!res.ok) throw new Error('Failed to fetch documents');
        const data = await res.json();
        if (Array.isArray(data)) {
          setDocuments(
            data.map((d: { id: string; title: string; type: string; documentUrl?: string; fileLabel?: string; files?: { url: string; fileLabel?: string }[] }) => ({
              id: d.id,
              title: d.title,
              type: d.type,
              documentUrl: d.documentUrl ?? '#',
              fileLabel: d.fileLabel,
              files: d.files?.length ? d.files : [{ url: d.documentUrl ?? '#', fileLabel: d.fileLabel }],
              description: '',
              phase: undefined,
              date: undefined,
            }))
          );
        } else {
          setDocuments([]);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load documents');
        setDocuments([]);
      } finally {
        setLoading(false);
      }
    }
    fetchDlis();
  }, [accessChecked]);

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
        <section className="relative bg-gradient-to-br from-green-900 to-emerald-900 text-white py-20 overflow-hidden">
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-end mb-4">
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
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                DLI Milestone Documents
              </h1>
              <p className="text-xl md:text-2xl text-green-100 mb-4">
                Digital Learning Initiatives at ACE-SPED
              </p>
              <p className="text-lg text-green-200">
                Key reports, frameworks, and policy documents that track the Centre&apos;s
                Digital Learning Initiative milestones and progress.
              </p>
            </div>
          </div>
        </section>

        {/* Intro */}
        <section className="py-12 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-lg">
              Browse and download milestone documents by phase. Each document is available
              as a PDF for reference and compliance.
            </p>
          </div>
        </section>

        {/* Milestone documents grid */}
        <section className="py-16">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-500 dark:text-gray-400">
                <Loader2 className="h-12 w-12 animate-spin mb-4 text-green-600" />
                <p>Loading milestone documents...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-500 dark:text-gray-400">
                <FileQuestion className="h-12 w-12 mb-4 text-amber-500" />
                <p className="mb-2">{error}</p>
                <p className="text-sm">Please try again later.</p>
              </div>
            ) : documents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-500 dark:text-gray-400">
                <FileQuestion className="h-12 w-12 mb-4 text-gray-400" />
                <p>No milestone documents available yet.</p>
              </div>
            ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {documents.map((doc) => {
                const config = dliTypeConfig[doc.type as DocType];
                const TypeIcon = config.icon;
                const fileCount = doc.files?.length ?? (doc.documentUrl && doc.documentUrl !== '#' ? 1 : 0);
                return (
                  <article
                    key={doc.id}
                    className="group bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl hover:border-green-200 dark:hover:border-green-800 transition-all duration-200 flex flex-col h-full"
                  >
                    <div className="p-5 flex-1 flex flex-col min-h-0">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}
                        >
                          <TypeIcon className="h-3.5 w-3.5 shrink-0" />
                          {config.label}
                        </span>
                        {fileCount > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs text-gray-500 dark:text-gray-400">
                            {fileCount} {fileCount === 1 ? 'doc' : 'docs'}
                          </span>
                        )}
                      </div>
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 leading-snug">
                        {doc.title}
                      </h2>
                      {doc.description ? (
                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed flex-1 mb-4 line-clamp-2">
                          {doc.description}
                        </p>
                      ) : (
                        <div className="flex-1 min-h-[2.5rem]" />
                      )}
                      <div className="pt-4 mt-auto border-t border-gray-100 dark:border-gray-700">
                        <Link
                          href={`/about/dli/${doc.id}`}
                          className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 w-full justify-center group-hover:gap-3 transition-all duration-200"
                        >
                          Explore
                          <ChevronRight className="h-4 w-4 shrink-0" />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              For questions about DLI milestone documents or access, contact the Centre.
            </p>
            <a
              href="/contact"
              className="text-green-600 dark:text-green-400 font-medium hover:underline"
            >
              Contact us →
            </a>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}
