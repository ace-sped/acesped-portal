'use client';

import React from 'react';
import Navbar from '../../components/navbar/page';
import Footer from '../../components/footer/page';
import { Calendar, Download, ExternalLink } from 'lucide-react';
import { milestoneDocuments, dliTypeConfig } from '@/lib/dli-milestones';
import type { DocType } from '@/lib/dli-milestones';

export default function DLIPage() {
  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Hero */}
        <section className="relative bg-gradient-to-br from-green-900 to-emerald-900 text-white py-20 overflow-hidden">
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
              {milestoneDocuments.map((doc) => {
                const config = dliTypeConfig[doc.type as DocType];
                const TypeIcon = config.icon;
                return (
                  <article
                    key={doc.id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
                  >
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                          <Calendar className="h-3.5 w-3.5" />
                          {doc.phase ?? 'Phase 1'} · {doc.date ?? '—'}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}
                        >
                          <TypeIcon className="h-3.5 w-3.5" />
                          {config.label}
                        </span>
                      </div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {doc.title}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed flex-1 mb-4">
                        {doc.description ?? ''}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                        {(doc.files ?? [{ url: doc.documentUrl, fileLabel: doc.fileLabel }]).map((f, i) => (
                          <span key={i} className="inline-flex gap-2">
                            <a
                              href={f.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                            >
                              <ExternalLink className="h-4 w-4" />
                              {f.fileLabel ? `View ${f.fileLabel}` : 'View document'}
                            </a>
                            <a
                              href={f.url}
                              download={f.fileLabel}
                              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                              <Download className="h-4 w-4" />
                              Download
                            </a>
                          </span>
                        ))}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
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
