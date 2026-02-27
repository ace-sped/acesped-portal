'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle, CreditCard, Mail, ShieldCheck, User, Loader2, AlertTriangle } from 'lucide-react';
import Navbar from '../components/navbar/page';
import Footer from '../components/footer/page';

const ACCEPTANCE_FEE_NAIRA = 26000;
const ACCEPTANCE_CONTEXT_KEY = 'aceAcceptanceContext';

interface VerifiedApplication {
  id: string;
  firstname: string;
  surname: string;
  email: string;
  programChoice: string;
  admissionSession: string;
  applicationNumber: string;
  status: string;
  acceptanceFeePaid?: boolean;
  acceptancePaidAt?: string | null;
  acceptancePaymentReference?: string | null;
}

export default function AcceptancePage() {
  const [email, setEmail] = useState('');
  const [applicationNumber, setApplicationNumber] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifiedApplication, setVerifiedApplication] = useState<VerifiedApplication | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [modalMessage, setModalMessage] = useState<{ title: string; body: string; variant: 'success' | 'error' } | null>(null);
  const [paymentAlert, setPaymentAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const formatFriendlyDate = useCallback((value?: string | null) => {
    if (!value) return null;
    try {
      return new Date(value).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return value;
    }
  }, []);
  const acceptancePaidDateLabel = useMemo(
    () => formatFriendlyDate(verifiedApplication?.acceptancePaidAt),
    [formatFriendlyDate, verifiedApplication?.acceptancePaidAt]
  );
  const acceptanceConfirmed = Boolean(verifiedApplication?.acceptanceFeePaid);

  const confirmAcceptancePayment = useCallback(
    async (paymentReference: string, applicationNumber?: string) => {
      setPaymentProcessing(true);
      setPaymentAlert(null);

      try {
        const response = await fetch('/api/acceptance/payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reference: paymentReference,
            ...(applicationNumber ? { applicationNumber: applicationNumber.toUpperCase() } : {}),
          }),
        });

        const data = await response.json().catch(() => null);

        if (!response.ok || !data?.success) {
          throw new Error(data?.message || 'Unable to confirm acceptance payment at this time.');
        }

        const applicantName =
          data?.application && (data.application.firstname || data.application.surname)
            ? `${data.application.firstname || ''} ${data.application.surname || ''}`.trim()
            : '';
        if (data?.application) {
          setVerifiedApplication((prev) =>
            prev
              ? {
                ...prev,
                acceptanceFeePaid: data.application.acceptanceFeePaid,
                acceptancePaidAt: data.application.acceptancePaidAt,
                acceptancePaymentReference: data.application.acceptancePaymentReference,
              }
              : prev
          );
        }

        setModalMessage({
          title: 'Payment Successful',
          body: 'Your acceptance fee payment was successful, the ACE-SPED Admission Officer will notify you through email for your ACE-SPED Registration Number and temporal Password for your portal login within 2 to 3 working days.',
          variant: 'success',
        });
        setPaymentAlert({
          type: 'success',
          message: 'Acceptance fee payment confirmed.',
        });
      } catch (error: any) {
        console.error('Acceptance payment verification error:', error);
        setPaymentAlert({
          type: 'error',
          message: error?.message || 'We could not verify this payment reference. Please try again or contact support.',
        });
      } finally {
        setPaymentProcessing(false);
      }
    },
    []
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const reference = params.get('reference') || params.get('trxref');
    if (!reference) return;

    let storedApplicationNumber: string | undefined;
    try {
      const stored = localStorage.getItem(ACCEPTANCE_CONTEXT_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.applicationNumber) {
          storedApplicationNumber = String(parsed.applicationNumber).trim().toUpperCase();
        }
        localStorage.removeItem(ACCEPTANCE_CONTEXT_KEY);
      }
    } catch (storageError) {
      console.error('Error parsing acceptance context:', storageError);
    }

    confirmAcceptancePayment(reference, storedApplicationNumber);

    params.delete('reference');
    params.delete('trxref');
    params.delete('status');
    params.delete('payment_callback');
    const query = params.toString();
    const sanitizedUrl = `${window.location.pathname}${query ? `?${query}` : ''}`;
    window.history.replaceState({}, '', sanitizedUrl);
  }, [confirmAcceptancePayment]);

  const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setVerifying(true);
    setVerifyError(null);
    setVerifiedApplication(null);
    setPaymentAlert(null);

    try {
      const response = await fetch('/api/acceptance/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), applicationNumber: applicationNumber.trim() }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || 'Unable to find an admitted application with the provided details.');
      }

      const verified = data.application as VerifiedApplication;
      setVerifiedApplication(verified);

      if (verified.acceptanceFeePaid) {
        const paidDate = formatFriendlyDate(verified.acceptancePaidAt);
        setPaymentAlert({
          type: 'success',
          message: paidDate
            ? `Acceptance fee already confirmed on ${paidDate}. You may proceed to download your admission letter.`
            : 'Acceptance fee already confirmed. You may proceed to download your admission letter.',
        });
      }
    } catch (error: any) {
      console.error('Acceptance verification error:', error);
      setVerifyError(error?.message || 'Unable to verify your application at the moment.');
    } finally {
      setVerifying(false);
    }
  };

  const handleAcceptancePayment = async () => {
    if (!verifiedApplication) {
      setModalMessage({
        title: 'Verification Required',
        body: 'Please verify your admission before proceeding to payment.',
        variant: 'error',
      });
      return;
    }

    if (verifiedApplication.acceptanceFeePaid) {
      const paidDate = formatFriendlyDate(verifiedApplication.acceptancePaidAt);
      setModalMessage({
        title: 'Acceptance Already Confirmed',
        body: paidDate
          ? `Our records show that your acceptance fee was confirmed on ${paidDate}. You do not need to make this payment again.`
          : 'Our records show that your acceptance fee has already been confirmed. You do not need to make this payment again.',
        variant: 'success',
      });
      return;
    }

    try {
      setPaymentAlert(null);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(
            ACCEPTANCE_CONTEXT_KEY,
            JSON.stringify({
              applicationNumber: verifiedApplication.applicationNumber,
              email: verifiedApplication.email,
            })
          );
        } catch (storageError) {
          console.warn('Unable to persist acceptance context:', storageError);
        }
      }

      const response = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: verifiedApplication.email,
          amount: ACCEPTANCE_FEE_NAIRA * 100,
          callback_path: '/acceptance',
          metadata: {
            purpose: 'ACE-SPED Acceptance Fee',
            applicationNumber: verifiedApplication.applicationNumber,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success || !data.authorization_url) {
        throw new Error(data?.message || 'Unable to initialize acceptance fee payment. Please try again.');
      }

      window.location.href = data.authorization_url;
    } catch (error: any) {
      console.error('Acceptance payment error:', error);
      setModalMessage({
        title: 'Payment Error',
        body: error?.message || 'An error occurred while initializing payment. Please try again.',
        variant: 'error',
      });
    }
  };

  const renderModal = () => {
    if (!modalMessage) return null;
    const isSuccess = modalMessage.variant === 'success';
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6 text-center border border-gray-100 dark:border-gray-800">
          <div
            className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4 ${isSuccess ? 'bg-green-100 dark:bg-green-900/40' : 'bg-red-100 dark:bg-red-900/30'
              }`}
          >
            {isSuccess ? <CheckCircle className="h-7 w-7 text-green-600" /> : <AlertTriangle className="h-7 w-7 text-red-600" />}
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{modalMessage.title}</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">{modalMessage.body}</p>
          <button
            onClick={() => setModalMessage(null)}
            className="w-full px-5 py-3 rounded-xl bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 font-semibold hover:shadow-lg hover:scale-[1.02] transition-all"
          >
            Close
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 mb-4">
            <ShieldCheck className="h-4 w-4 mr-2" />
            Admission Acceptance
          </span>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Secure Your Admission</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Confirm your admission by paying the acceptance fee. Enter the email you used during application and your unique application number to begin.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Verify Admission Details</h2>
            <form onSubmit={handleVerify} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Registered Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                    placeholder="applicant@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Application Number *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={applicationNumber}
                    onChange={(e) => setApplicationNumber(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white uppercase tracking-wider"
                    placeholder="Enter your application number"
                  />
                </div>
              </div>
              {verifyError && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-200">
                  {verifyError}
                </div>
              )}
              <button
                type="submit"
                disabled={verifying}
                className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-[1.01] transition-all disabled:opacity-50"
              >
                {verifying ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Verify Admission'}
              </button>
            </form>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Acceptance Fee</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Confirmed students are required to pay the acceptance fee to secure their spot for the upcoming session.
              </p>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-100 dark:border-green-900/40 mb-6">
                <p className="text-sm text-gray-500 dark:text-gray-300">Acceptance Fee</p>
                <p className="text-4xl font-bold text-green-700 dark:text-green-300 mt-2">
                  ₦{ACCEPTANCE_FEE_NAIRA.toLocaleString()}
                </p>
              </div>
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-start space-x-2">
                  <CreditCard className="h-5 w-5 text-green-600 mt-0.5" />
                  <span>Pay securely through Paystack (Card, Bank Transfer, USSD, Mobile Money).</span>
                </div>
                <div className="flex items-start space-x-2">
                  <ShieldCheck className="h-5 w-5 text-green-600 mt-0.5" />
                  <span>Receipt and confirmation are sent instantly to your registered email.</span>
                </div>
              </div>
              <button
                onClick={handleAcceptancePayment}
                disabled={!verifiedApplication || acceptanceConfirmed || paymentProcessing}
                className="mt-6 w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {paymentProcessing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Confirming payment...</span>
                  </>
                ) : acceptanceConfirmed ? (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    <span>Acceptance Confirmed</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5" />
                    <span>Pay Acceptance Fee</span>
                  </>
                )}
              </button>
              {!verifiedApplication && (
                <p className="mt-3 text-xs text-red-600 dark:text-red-400 text-center">
                  Please verify your admission details to enable payment.
                </p>
              )}
              {acceptanceConfirmed && (
                <p className="mt-3 text-sm text-green-700 dark:text-green-300 text-center">
                  Acceptance fee confirmed{acceptancePaidDateLabel ? ` on ${acceptancePaidDateLabel}` : ''}. No further payment is required.
                </p>
              )}
              {paymentProcessing && (
                <div className="mt-6 flex items-center justify-center text-sm text-gray-600 dark:text-gray-300">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  <span>Confirming acceptance payment...</span>
                </div>
              )}
              {paymentAlert && (
                <div
                  className={`mt-6 p-4 rounded-xl text-sm border ${paymentAlert.type === 'success'
                      ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-200'
                      : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-900 dark:text-red-100'
                    }`}
                >
                  {paymentAlert.message}
                </div>
              )}
              <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
                Note: Each application number can complete the acceptance payment only once per admission session. Contact the
                admissions office if you need assistance.
              </p>
            </div>

            {verifiedApplication && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-green-100 dark:border-green-800">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Admission Verified</span>
                </h3>
                <div className="space-y-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Applicant</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {verifiedApplication.firstname} {verifiedApplication.surname}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Program</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{verifiedApplication.programChoice}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Admission Session</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{verifiedApplication.admissionSession}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Application Number</span>
                    <span className="font-mono text-sm text-gray-900 dark:text-white">{verifiedApplication.applicationNumber}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Acceptance Status</span>
                    <span
                      className={`font-semibold ${acceptanceConfirmed ? 'text-green-600 dark:text-green-300' : 'text-yellow-600 dark:text-yellow-300'
                        }`}
                    >
                      {acceptanceConfirmed ? 'Confirmed' : 'Pending'}
                    </span>
                  </div>
                  {acceptanceConfirmed && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Confirmed On</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {acceptancePaidDateLabel || '—'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
      {renderModal()}
    </div>
  );
}

