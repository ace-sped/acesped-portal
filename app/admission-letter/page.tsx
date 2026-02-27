'use client';

import React, { useMemo, useState } from 'react';
import { Download, FileText, Loader2, ShieldCheck } from 'lucide-react';
import jsPDF from 'jspdf';
import Link from 'next/link';
import Navbar from '../components/navbar/page';
import Footer from '../components/footer/page';

interface AdmissionLetterPayload {
  applicationNumber: string;
  firstname: string;
  middlename?: string | null;
  surname: string;
  applicantName: string;
  programChoice: string;
  programType: string;
  admissionSession: string;
  modeOfStudy: string;
  email: string;
  phoneNumber: string;
  address: string;
  state: string;
  country: string;
  gender: string;
  dateOfBirth: string;
  issuedOn: string;
  acceptanceFeePaid?: boolean;
  acceptancePaidAt?: string | null;
  acceptancePaymentReference?: string | null;
}

const nextSteps = [
  'Pay the ACE-SPED acceptance fee immediately to secure your seat.',
  'Complete academic clearance by uploading all mandatory credentials.',
  'Visit the ACE-SPED Admissions Office for physical verification when notified.',
  'Report for orientation and registration on or before resumption.',
];

const formatDisplayDate = (isoDate: string) => {
  try {
    return new Date(isoDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return isoDate;
  }
};

const buildPdf = (letter: AdmissionLetterPayload) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const marginX = 48;
  let cursorY = 70;
  const acceptancePaymentDate = letter.acceptancePaidAt ? formatDisplayDate(letter.acceptancePaidAt) : null;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('ACE-SPED', marginX, cursorY);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  cursorY += 18;
  doc.text(
    'Africa Centre of Excellence for Sustainable Power & Energy Development',
    marginX,
    cursorY
  );

  cursorY += 24;
  doc.setDrawColor(22, 163, 74);
  doc.setLineWidth(1);
  doc.line(marginX, cursorY, 547, cursorY);

  cursorY += 30;
  doc.setFontSize(11);
  doc.text(`Date: ${formatDisplayDate(letter.issuedOn)}`, marginX, cursorY);
  doc.text(`Application No: ${letter.applicationNumber}`, marginX + 260, cursorY);

  cursorY += 30;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('OFFER OF PROVISIONAL ADMISSION', marginX, cursorY);

  cursorY += 26;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  const greeting = `Dear ${letter.applicantName},`;
  doc.text(greeting, marginX, cursorY);

  cursorY += 22;
  const paragraphs = [
    `We are pleased to inform you that after a successful review of your application, you have been offered provisional admission into the ${letter.programChoice} (${letter.programType}) programme for the ${letter.admissionSession} academic session.`,
    `Your mode of study is ${letter.modeOfStudy}. Kindly note that this offer is contingent on completing all registration, clearance, and financial obligations within the stipulated timelines.`,
    acceptancePaymentDate
      ? `Our records confirm that your acceptance fee was received on ${acceptancePaymentDate}. Please retain the payment receipt alongside this letter.`
      : 'This letter remains valid only after the acceptance fee payment has been confirmed by ACE-SPED.',
    'Please find below a summary of the key details associated with this offer and the immediate actions required to retain your place.',
  ];

  paragraphs.forEach((paragraph) => {
    const lines = doc.splitTextToSize(paragraph, 500);
    doc.text(lines, marginX, cursorY);
    cursorY += lines.length * 16 + 8;
  });

  cursorY += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Next Steps', marginX, cursorY);

  cursorY += 18;
  doc.setFont('helvetica', 'normal');
  nextSteps.forEach((step) => {
    const lines = doc.splitTextToSize(step, 480);
    doc.text(`• ${lines[0]}`, marginX, cursorY);
    if (lines.length > 1) {
      lines.slice(1).forEach((line: string, index: number) => {
        doc.text(line, marginX + 16, cursorY + (index + 1) * 14);
      });
      cursorY += lines.length * 14 + 4;
    } else {
      cursorY += 18;
    }
  });

  cursorY += 10;
  const closing = [
    'Congratulations on your admission to ACE-SPED. We look forward to welcoming you to campus and supporting your journey toward excellence.',
    'For enquiries, contact admissions@ace-sped.edu.ng or call +234 (0) 800-000-ACE.',
  ];
  closing.forEach((text) => {
    const lines = doc.splitTextToSize(text, 500);
    doc.text(lines, marginX, cursorY);
    cursorY += lines.length * 16;
  });

  cursorY += 30;
  doc.setFont('helvetica', 'bold');
  doc.text('ACE-SPED Admissions Office', marginX, cursorY);

  doc.save(`ACE-SPED-admission-letter-${letter.applicationNumber}.pdf`);
};

export default function AdmissionLetterPage() {
  const [applicationNumber, setApplicationNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [letter, setLetter] = useState<AdmissionLetterPayload | null>(null);
  const [requiresAcceptance, setRequiresAcceptance] = useState(false);

  const formattedIssueDate = useMemo(
    () => (letter ? formatDisplayDate(letter.issuedOn) : null),
    [letter]
  );
  const formattedAcceptancePaidDate = useMemo(
    () => (letter?.acceptancePaidAt ? formatDisplayDate(letter.acceptancePaidAt) : null),
    [letter]
  );

  const handleLookup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLetter(null);
    setLoading(true);
    setRequiresAcceptance(false);

    try {
      const response = await fetch('/api/admission-letter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ applicationNumber: applicationNumber.trim().toUpperCase() }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        if (response.status === 403) {
          setRequiresAcceptance(true);
        }
        throw new Error(
          response.status === 403
            ? data?.message ||
                'You must accept your admission before requesting an admission letter. Please complete and confirm the acceptance fee payment.'
            : data?.message || 'Unable to find an admission letter for this application number.'
        );
      }

      setLetter(data.letter as AdmissionLetterPayload);
      setRequiresAcceptance(false);
    } catch (lookupError: any) {
      console.error('Admission letter lookup failed:', lookupError);
      setError(lookupError?.message || 'Unable to fetch your admission letter right now.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!letter) return;
    try {
      buildPdf(letter);
    } catch (pdfError) {
      console.error('PDF generation error:', pdfError);
      setError('Unable to generate the admission letter PDF. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 mb-4">
            <ShieldCheck className="h-4 w-4 mr-2" />
            ACE-SPED Admission Letter
          </span>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Download Your Admission Letter</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Provide your application number to generate an official, printable admission letter confirming your offer of
            provisional admission into ACE-SPED. Only applicants who have successfully paid the acceptance fee are eligible
            to download this document.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
              <FileText className="h-6 w-6 text-green-600" />
              <span>Get Your Letter</span>
            </h2>
            <form onSubmit={handleLookup} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Application Number *
                </label>
                <input
                  type="text"
                  value={applicationNumber}
                  onChange={(event) => setApplicationNumber(event.target.value.toUpperCase())}
                  placeholder="Enter your application number"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white font-mono tracking-wide uppercase"
                  required
                />
              </div>
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-200">
                  {error}
                </div>
              )}
              {requiresAcceptance && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg text-sm text-yellow-900 dark:text-yellow-100 space-y-2">
                  <p>You must accept your admission by paying and confirming the ACE-SPED acceptance fee before generating the admission letter.</p>
                  <Link
                    href="/acceptance"
                    className="inline-flex items-center justify-center px-4 py-2 mt-1 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors"
                  >
                    Go to Acceptance Portal
                  </Link>
                </div>
              )}
              <button
                type="submit"
                disabled={!applicationNumber || loading}
                className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-[1.01] transition-all disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="h-5 w-5 mr-2" />
                    <span>Fetch Admission Letter</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 space-y-4 text-sm text-gray-600 dark:text-gray-400">
              <p className="font-semibold text-gray-900 dark:text-white">Need help?</p>
              <p>Ensure you enter the exact application number provided after submission (e.g., ACE2025ABC1234).</p>
              <p>
                Only applicants who have been officially approved will be able to download their admission letters. Please
                contact admissions if you believe this is an error.
              </p>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/10 border border-green-100 dark:border-green-900/50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">Digital & Printable</h3>
              <p className="text-sm text-green-800 dark:text-green-200">
                Once generated, download a PDF copy and keep both a digital and printed version for your records, clearance, and
                visa processing requirements.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                  <p className="text-sm uppercase text-gray-500 dark:text-gray-400">Admission Letter Preview</p>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">ACE-SPED Offer of Admission</h2>
                  {letter && formattedIssueDate && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Issued on {formattedIssueDate}</p>
                  )}
                </div>
                {letter && (
                  <button
                    onClick={handleDownloadPdf}
                    className="inline-flex items-center px-5 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors"
                  >
                    <Download className="h-5 w-5 mr-2" />
                    Download PDF
                  </button>
                )}
              </div>

              {letter ? (
                <article className="border border-gray-200 dark:border-gray-700 rounded-2xl p-6 bg-white dark:bg-gray-900 print:border-0 print:p-0">
                  <header className="text-center mb-6">
                    <p className="text-xs font-semibold tracking-[0.3em] text-green-600 uppercase">ACE-SPED</p>
                    <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-2">Offer of Provisional Admission</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Africa Centre of Excellence for Sustainable Power and Energy Development
                    </p>
                  </header>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300 mb-6">
                    <div>
                      <p className="uppercase text-xs tracking-wide text-gray-400">Applicant</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{letter.applicantName}</p>
                    </div>
                    <div>
                      <p className="uppercase text-xs tracking-wide text-gray-400">Application Number</p>
                      <p className="font-mono text-gray-900 dark:text-white">{letter.applicationNumber}</p>
                    </div>
                    <div>
                      <p className="uppercase text-xs tracking-wide text-gray-400">Programme</p>
                      <p className="text-gray-900 dark:text-white">
                        {letter.programChoice} ({letter.programType})
                      </p>
                    </div>
                    <div>
                      <p className="uppercase text-xs tracking-wide text-gray-400">Study Mode</p>
                      <p className="text-gray-900 dark:text-white">{letter.modeOfStudy}</p>
                    </div>
                    <div>
                      <p className="uppercase text-xs tracking-wide text-gray-400">Session</p>
                      <p className="text-gray-900 dark:text-white">{letter.admissionSession}</p>
                    </div>
                    <div>
                      <p className="uppercase text-xs tracking-wide text-gray-400">Issued On</p>
                      <p className="text-gray-900 dark:text-white">{formattedIssueDate}</p>
                    </div>
                    <div>
                      <p className="uppercase text-xs tracking-wide text-gray-400">Acceptance Fee</p>
                      <p className="text-gray-900 dark:text-white">
                        {formattedAcceptancePaidDate ? `Paid on ${formattedAcceptancePaidDate}` : 'Pending'}
                      </p>
                    </div>
                    <div>
                      <p className="uppercase text-xs tracking-wide text-gray-400">Payment Reference</p>
                      <p className="font-mono text-gray-900 dark:text-white">
                        {letter.acceptancePaymentReference || '—'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 text-gray-700 dark:text-gray-200 leading-relaxed text-sm">
                    <p>Dear {letter.applicantName},</p>
                    <p>
                      Congratulations! Following a successful review of your application, ACE-SPED is delighted to offer you
                      provisional admission into the {letter.programChoice} ({letter.programType}) for the{' '}
                      {letter.admissionSession} academic session.
                    </p>
                    <p>
                      This offer is conditional upon the completion of all required registration, documentation, and financial
                      obligations. Your recorded contact details remain {letter.email} and {letter.phoneNumber}. Kindly notify the
                      Admissions Office if any detail has changed.
                    </p>
                    <p>Please take note of the following immediate actions:</p>
                    <ul className="list-disc pl-5 space-y-2">
                      {nextSteps.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ul>
                    <p>
                      Keep a copy of this letter for visa processing, sponsorship, and clearance activities. Additional
                      information, including matriculation schedules, will be communicated to your registered email address.
                    </p>
                    <p>We eagerly anticipate welcoming you to the ACE-SPED community.</p>
                  </div>

                  <footer className="mt-8 pt-6 border-t border-dashed border-gray-200 dark:border-gray-700">
                    <p className="font-semibold text-gray-900 dark:text-white">ACE-SPED Admissions Office</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">admissions@ace-sped.edu.ng | +234 (0) 800-000-ACE</p>
                  </footer>
                </article>
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <p>Your admission letter preview will appear here once you verify your application number.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}


