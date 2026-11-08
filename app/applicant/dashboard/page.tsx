'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  CreditCard,
  GraduationCap,
  Loader2,
  LogOut,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { hasPaidApplicationFee } from '@/lib/application-fee';
import { getFriendlyErrorMessage } from '@/lib/friendly-error';
import {
  safeSessionStorageGet,
  safeSessionStorageRemove,
  safeSessionStorageSet,
} from '@/lib/safe-browser-storage';

const APPLICANT_SESSION_KEY = 'acesped_applicant_session';

interface ApplicantApplication {
  applicationNumber: string;
  firstname: string;
  surname: string;
  email: string;
  avatar?: string | null;
  nationality: string;
  programType: string;
  programChoice: string;
  admissionSession: string;
  modeOfStudy: string;
  status: string;
  paymentReference: string;
  paymentMethod?: string;
  acceptanceFeePaid: boolean;
  submittedAt: string;
  isNigerian: boolean;
  applicationFeeRequired: boolean;
  applicationFeePaid: boolean;
  applicationFeeWaived: boolean;
  applicationFeeAmount: number;
  paymentProof?: string | null;
}

export default function ApplicantDashboardPage() {
  const router = useRouter();
  const [application, setApplication] = useState<ApplicantApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(
    null
  );

  const loadApplication = useCallback(async (applicationNumber: string) => {
    const response = await fetch(
      `/api/applicant/application?applicationNumber=${encodeURIComponent(applicationNumber)}`
    );
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Unable to load application.');
    }
    setApplication(data.application);
    safeSessionStorageSet(APPLICANT_SESSION_KEY, JSON.stringify(data.application));
    return data.application as ApplicantApplication;
  }, []);

  const verifyPayment = useCallback(
    async (reference: string, applicationNumber: string, silent = false) => {
      if (!silent) setMessage(null);

      try {
        const response = await fetch('/api/applicant/payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reference, applicationNumber }),
        });
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Payment verification failed.');
        }

        await loadApplication(applicationNumber);
        setMessage({
          type: 'success',
          text: data.alreadyPaid
            ? 'Application fee already paid. Only one payment is allowed.'
            : `Payment verified. Reference: ${reference}`,
        });
        try {
          localStorage.removeItem('acePaymentRecord');
        } catch {
          // ignore
        }
      } catch (err) {
        if (!silent) {
          setMessage({
            type: 'error',
            text: getFriendlyErrorMessage(err, 'Unable to verify this payment reference.'),
          });
        }
      }
    },
    [loadApplication]
  );

  const tryLinkStoredPayment = useCallback(
    async (app: ApplicantApplication) => {
      if (
        app.applicationFeeWaived ||
        app.applicationFeePaid ||
        hasPaidApplicationFee(app.paymentReference, app.paymentProof)
      ) {
        return false;
      }

      let stored: { reference?: string; email?: string; confirmed?: boolean } | null = null;
      try {
        const raw = localStorage.getItem('acePaymentRecord');
        if (raw) stored = JSON.parse(raw);
      } catch {
        stored = null;
      }

      if (!stored?.reference || !stored.confirmed) return false;

      const storedEmail = String(stored.email || '')
        .trim()
        .toLowerCase();
      const appEmail = String(app.email || '')
        .trim()
        .toLowerCase();
      if (storedEmail && appEmail && storedEmail !== appEmail) return false;

      await verifyPayment(stored.reference, app.applicationNumber, true);
      return true;
    },
    [verifyPayment]
  );

  useEffect(() => {
    const boot = async () => {
      const raw = safeSessionStorageGet(APPLICANT_SESSION_KEY);
      if (!raw) {
        router.replace('/applicant/login');
        return;
      }

      let sessionAppNumber = '';
      try {
        const parsed = JSON.parse(raw);
        sessionAppNumber = parsed.applicationNumber || '';
      } catch {
        safeSessionStorageRemove(APPLICANT_SESSION_KEY);
        router.replace('/applicant/login');
        return;
      }

      if (!sessionAppNumber) {
        router.replace('/applicant/login');
        return;
      }

      try {
        let app = await loadApplication(sessionAppNumber);

        const params = new URLSearchParams(window.location.search);
        const paymentCallback = params.get('payment_callback') === 'true';
        const urlReference = params.get('reference') || params.get('trxref');

        if (paymentCallback && urlReference) {
          await verifyPayment(urlReference, app.applicationNumber, false);
          safeSessionStorageRemove('aceApplicantPendingPayment');
          window.history.replaceState({}, '', '/applicant/dashboard');
          app = (await loadApplication(app.applicationNumber)) || app;
        } else if (
          !hasPaidApplicationFee(app.paymentReference, app.paymentProof) &&
          !app.applicationFeePaid
        ) {
          // Recover pending Paystack redirect if callback query params were lost
          const pendingRaw = safeSessionStorageGet('aceApplicantPendingPayment');
          let recovered = false;
          if (pendingRaw) {
            try {
              const pending = JSON.parse(pendingRaw) as {
                reference?: string;
                applicationNumber?: string;
              };
              if (
                pending.reference &&
                pending.applicationNumber === app.applicationNumber
              ) {
                await verifyPayment(pending.reference, app.applicationNumber, true);
                safeSessionStorageRemove('aceApplicantPendingPayment');
                recovered = true;
                app = (await loadApplication(app.applicationNumber)) || app;
              }
            } catch {
              // ignore malformed pending payment cache
            }
          }

          // Link a payment completed on /application (stored in localStorage)
          if (!recovered) {
            await tryLinkStoredPayment(app);
          }
        }
      } catch (err) {
        setMessage({
          type: 'error',
          text: getFriendlyErrorMessage(err, 'Unable to load your dashboard.'),
        });
      } finally {
        setLoading(false);
      }
    };

    void boot();
  }, [loadApplication, router, tryLinkStoredPayment, verifyPayment]);

  const feeDisplay = useMemo(() => {
    if (!application) return '';
    return `₦${application.applicationFeeAmount.toLocaleString()}`;
  }, [application]);

  const hasPaidFee = useMemo(() => {
    if (!application) return false;
    if (application.applicationFeeWaived) return true;
    return (
      Boolean(application.applicationFeePaid) ||
      hasPaidApplicationFee(application.paymentReference, application.paymentProof)
    );
  }, [application]);

  const handlePayApplicationFee = async () => {
    if (!application) return;
    if (
      application.applicationFeePaid ||
      hasPaidApplicationFee(application.paymentReference, application.paymentProof)
    ) {
      setMessage({
        type: 'info',
        text: 'Application fee already paid. Only one payment is allowed.',
      });
      return;
    }

    setPaying(true);
    setMessage(null);

    try {
      // Server-side gate — only one payment allowed
      const response = await fetch('/api/applicant/payment/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationNumber: application.applicationNumber,
        }),
      });

      const data = await response.json();

      if (data.alreadyPaid || response.status === 409) {
        await loadApplication(application.applicationNumber);
        setMessage({
          type: 'info',
          text: data.message || 'Application fee already paid. Only one payment is allowed.',
        });
        setPaying(false);
        return;
      }

      if (!response.ok || !data.success || !data.authorization_url) {
        throw new Error(data.message || 'Failed to initialize payment.');
      }

      if (data.reference) {
        safeSessionStorageSet(
          'aceApplicantPendingPayment',
          JSON.stringify({
            reference: data.reference,
            applicationNumber: application.applicationNumber,
          })
        );
      }

      window.location.href = data.authorization_url;
    } catch (err) {
      setMessage({
        type: 'error',
        text: getFriendlyErrorMessage(err, 'Unable to start payment. Please try again.'),
      });
      setPaying(false);
    }
  };

  const handleLogout = () => {
    safeSessionStorageRemove(APPLICANT_SESSION_KEY);
    safeSessionStorageRemove('aceApplicantPendingPayment');
    router.push('/applicant/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-950 via-emerald-900 to-green-800 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-white">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm text-green-100">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-950 via-emerald-900 to-green-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
          <p className="text-gray-700 mb-4">Unable to load your application session.</p>
          <button
            type="button"
            onClick={() => router.push('/applicant/login')}
            className="px-5 py-2.5 rounded-xl bg-green-600 text-white font-semibold"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  const statusBanner: {
    label: string;
    hint: React.ReactNode;
    tone: string;
    icon: typeof Clock;
  } = hasPaidFee
    ? {
        label: 'Application Status',
        hint: 'Congratulations! Your application has been received.',
        tone: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200',
        icon: CheckCircle2,
      }
    : {
        label: 'Application Status',
        hint: (
          <>
            Pending Review. Click on{' '}
            <span className="font-bold underline decoration-2 underline-offset-2 bg-amber-200/80 dark:bg-amber-800/60 px-1 rounded">
              Pay Application Fee
            </span>{' '}
            button at the bottom of this page to make Payment.
          </>
        ),
        tone: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200',
        icon: Clock,
      };
  const StatusIcon = statusBanner.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-950 via-emerald-900 to-green-800 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 text-green-100 hover:text-white text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Home
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => loadApplication(application.applicationNumber)}
              className="inline-flex items-center gap-2 text-green-100 hover:text-white text-sm"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 text-green-100 hover:text-white text-sm"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-white/10">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-7 text-white">
            <div className="flex items-start gap-4">
              {application.avatar ? (
                <img
                  src={application.avatar}
                  alt={`${application.firstname} ${application.surname}`}
                  className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl object-cover border-2 border-white/40 shadow-md bg-white/10 shrink-0"
                />
              ) : (
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl bg-white/15 border-2 border-white/30 flex items-center justify-center shrink-0">
                  <GraduationCap className="h-8 w-8" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-green-100 text-sm mb-1">Applicant Dashboard</p>
                <h1 className="text-2xl font-bold truncate">
                  {application.firstname} {application.surname}
                </h1>
                <p className="text-green-100/90 text-sm mt-1 font-mono">
                  {application.applicationNumber}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {message && (
              <div
                className={`rounded-xl px-4 py-3 text-sm ${
                  message.type === 'success'
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : message.type === 'error'
                      ? 'bg-red-50 text-red-800 border border-red-200'
                      : 'bg-blue-50 text-blue-800 border border-blue-200'
                }`}
              >
                {message.text}
              </div>
            )}

            <div className={`rounded-xl px-4 py-4 flex items-start gap-3 ${statusBanner.tone}`}>
              <StatusIcon className="h-5 w-5 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">{statusBanner.label}</p>
                <p className="text-sm mt-1 opacity-90">{statusBanner.hint}</p>
              </div>
            </div>

            <section>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                Application Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  ['Program Type', application.programType],
                  ['Program Choice', application.programChoice],
                  ['Admission Session', application.admissionSession],
                  ['Mode of Study', application.modeOfStudy],
                  ['Nationality', application.nationality],
                  ['Email', application.email],
                  [
                    'Submitted',
                    application.submittedAt
                      ? new Date(application.submittedAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : '—',
                  ],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 px-4 py-3"
                  >
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      {label}
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white break-words">
                      {value || '—'}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-5 py-4 bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-green-600" />
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Application Fee
                </h2>
              </div>

              <div className="p-5 space-y-4">
                {application.applicationFeeWaived ? (
                  <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-4 py-4 flex items-start gap-3">
                    <ShieldCheck className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-emerald-800 dark:text-emerald-200">
                        Fee waived for international applicants
                      </p>
                      <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">
                        Applicants whose nationality is not Nigeria do not pay an application fee.
                        Your application will proceed without payment.
                      </p>
                    </div>
                  </div>
                ) : hasPaidFee ? (
                  <div className="rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-4 py-4 space-y-2">
                    <div className="flex items-center gap-2 text-green-800 dark:text-green-200 font-bold text-base uppercase tracking-wide">
                      <CheckCircle2 className="h-5 w-5" />
                      Application Fee Paid
                    </div>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      This application has already been paid. Only one application fee payment is allowed.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Amount</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{feeDisplay}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Payment Reference</p>
                        <p className="font-mono font-semibold text-gray-900 dark:text-white break-all">
                          {application.paymentReference || 'Recorded'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Tracked with</p>
                        <p className="font-mono font-semibold text-gray-900 dark:text-white">
                          {application.applicationNumber}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Method</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {application.paymentMethod || 'Paystack'}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-4 py-4">
                      <p className="font-semibold text-amber-900 dark:text-amber-100">
                        Application fee required
                      </p>
                      <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                        Nigerian applicants must pay the application fee of{' '}
                        <span className="font-bold">{feeDisplay}</span> before processing continues.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handlePayApplicationFee}
                      disabled={paying || hasPaidFee}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold hover:shadow-lg disabled:opacity-60 transition-all"
                    >
                      {paying ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Redirecting to Paystack...
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4" />
                          Pay Application Fee ({feeDisplay})
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
