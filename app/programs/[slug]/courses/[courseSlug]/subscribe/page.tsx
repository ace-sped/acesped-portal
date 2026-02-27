'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Check, Clock, Users, BookOpen, 
  Globe, Award, Calendar, FileText, Target,
  Zap, Briefcase, GraduationCap, Loader2,
  Mail, Phone, MapPin, User, CreditCard,
  CheckCircle, AlertTriangle, Info, X
} from 'lucide-react';
import { TbCurrencyNaira } from 'react-icons/tb';
import Navbar from '@/app/components/navbar/page';
import Footer from '@/app/components/footer/page';

// Helper function to get level display name
const getLevelDisplayName = (level: string) => {
  const levelMap: { [key: string]: string } = {
    'CERTIFICATE': 'Certificate',
    'DIPLOMA': 'Diploma',
    'BACHELORS': 'Bachelors',
    'MASTERS': 'Masters',
    'PHD': 'Ph.D',
    'MASTERS_AND_PHD': 'Ph.D/M.Sc.',
  };
  return levelMap[level] || level.replace(/_/g, ' ');
};

interface SubscriptionFormData {
  firstname: string;
  surname: string;
  email: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  country: string;
  dateOfBirth: string;
  gender: string;
  occupation: string;
  organization: string;
  reasonForSubscription: string;
  howDidYouHear: string;
  paymentMethod: string;
  paymentReference: string;
}

export default function CourseSubscriptionPage({ 
  params 
}: { 
  params: Promise<{ slug: string; courseSlug: string }> 
}) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const { slug, courseSlug } = resolvedParams;
  
  // State declarations
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [paymentReference, setPaymentReference] = useState<string>('');
  const [showPaymentSuccessModal, setShowPaymentSuccessModal] = useState<boolean>(false);
  const [formData, setFormData] = useState<SubscriptionFormData>({
    firstname: '',
    surname: '',
    email: '',
    phoneNumber: '',
    address: '',
    city: '',
    state: '',
    country: 'Nigeria',
    dateOfBirth: '',
    gender: '',
    occupation: '',
    organization: '',
    reasonForSubscription: '',
    howDidYouHear: '',
    paymentMethod: '',
    paymentReference: '',
  });

  useEffect(() => {
    if (courseSlug) {
      fetchCourse(courseSlug);
    }
  }, [courseSlug]);

  const fetchCourse = async (courseSlugParam: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/courses/${courseSlugParam}`);
      
      if (!response.ok) {
        let errorMessage = 'Failed to fetch course';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = response.statusText || `Server error (${response.status})`;
        }
        setError(errorMessage);
        return;
      }
      
      const data = await response.json();
      
      if (data.success && data.course) {
        setCourse(data.course);
      } else {
        setError(data.message || 'Course not found');
      }
    } catch (err: any) {
      console.error('Error fetching course:', err);
      const errorMessage = err?.message?.includes('fetch') 
        ? 'Network error. Please check your connection and try again.'
        : 'Error loading course. Please try again later.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Extract fee amount from course fee string (e.g., "₦150,000" -> 150000)
  const getFeeAmount = (): number => {
    if (!course?.fee) return 0;
    const feeString = course.fee.toString();
    // Remove currency symbols, commas, and spaces, then convert to number
    const numericValue = feeString.replace(/[₦,\s]/g, '').trim();
    const amount = parseFloat(numericValue);
    return isNaN(amount) ? 0 : amount;
  };

  // Handle Paystack payment initialization
  const handlePaystackPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Validate email
      if (!formData.email || formData.email.trim() === '') {
        setError('Please fill in your email address before proceeding to payment.');
        setSubmitting(false);
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email address.');
        setSubmitting(false);
        return;
      }

      const amountInNaira = getFeeAmount();
      if (!amountInNaira || amountInNaira <= 0) {
        setError('The subscription fee amount is unavailable. Please contact support.');
        setSubmitting(false);
        return;
      }

      // Store form data in sessionStorage before redirecting
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem('subscriptionFormData', JSON.stringify(formData));
          sessionStorage.setItem('subscriptionSlug', slug);
          sessionStorage.setItem('subscriptionCourseSlug', courseSlug);
        } catch (storageError) {
          console.error('Error saving to sessionStorage:', storageError);
        }

        // Initialize Paystack payment
        const response = await fetch('/api/payments/initialize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            amount: amountInNaira * 100, // Paystack expects kobo
            metadata: {
              custom_fields: [
                {
                  display_name: 'Course Subscription Fee',
                  variable_name: 'subscription_fee',
                  value: `Subscription for ${course?.title || courseSlug}`,
                },
              ],
            },
            callback_path: `/programs/${slug}/courses/${courseSlug}/subscribe`,
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success || !data.authorization_url) {
          console.error('Failed to initialize payment:', data);
          setError(data.message || 'Failed to initialize payment. Please try again.');
          setSubmitting(false);
          return;
        }

        console.log('Redirecting to Paystack payment page:', data.authorization_url);
        window.location.href = data.authorization_url;
      } else {
        setError('Unable to proceed with payment. Please try again.');
        setSubmitting(false);
      }
    } catch (err: any) {
      console.error('Error initializing Paystack payment:', err);
      setError('An error occurred while initializing payment. Please try again.');
      setSubmitting(false);
    }
  };

  // Submit subscription after payment
  const submitSubscription = async (paymentReference: string) => {
    try {
      const response = await fetch('/api/courses/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseSlug,
          ...formData,
          paymentMethod: 'Paystack',
          paymentReference: paymentReference,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitSuccess(true);
        // Clear sessionStorage
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('subscriptionFormData');
          sessionStorage.removeItem('subscriptionSlug');
          sessionStorage.removeItem('subscriptionCourseSlug');
        }
        setTimeout(() => {
          router.push(`/programs/${slug}/courses/${courseSlug}`);
        }, 3000);
      } else {
        setError(data.message || 'Failed to submit subscription. Please try again.');
        setSubmitting(false);
      }
    } catch (err: any) {
      console.error('Error submitting subscription:', err);
      setError('Network error. Please check your connection and try again.');
      setSubmitting(false);
    }
  };

  // Handle payment callback from Paystack
  useEffect(() => {
    if (typeof window !== 'undefined' && courseSlug) {
      const urlParams = new URLSearchParams(window.location.search);
      const paymentCallback = urlParams.get('payment_callback');
      const reference: string | null = urlParams.get('reference') || urlParams.get('trxref');

      if (paymentCallback && reference) {
        // Restore form data from sessionStorage
        const savedFormData = sessionStorage.getItem('subscriptionFormData');
        const savedSlug = sessionStorage.getItem('subscriptionSlug');
        const savedCourseSlug = sessionStorage.getItem('subscriptionCourseSlug');

        if (savedFormData && savedSlug === slug && savedCourseSlug === courseSlug && reference) {
          try {
            const restoredData = JSON.parse(savedFormData);
            setFormData(restoredData);
            // Set payment reference from Paystack callback
            setPaymentReference(reference);
            // Show success modal first
            setShowPaymentSuccessModal(true);
          } catch (error) {
            console.error('Error restoring form data:', error);
            setError('Failed to restore form data. Please try again.');
          }
        } else {
          setError('Payment completed but form data was not found. Please contact support with your payment reference: ' + reference);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseSlug, slug]);

  // Handle form submission after payment success modal is closed
  const handleSubmitAfterPayment = async () => {
    if (!paymentReference) return;

    setSubmitting(true);
    setShowPaymentSuccessModal(false);

    try {
      const savedFormData = sessionStorage.getItem('subscriptionFormData');
      if (!savedFormData) {
        setError('Form data not found. Please try again.');
        setSubmitting(false);
        return;
      }

      const restoredData = JSON.parse(savedFormData);
      const response = await fetch('/api/courses/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseSlug,
          ...restoredData,
          paymentMethod: 'Paystack',
          paymentReference: paymentReference,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitSuccess(true);
        // Save course slug for learning page
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('subscribedCourseSlug', courseSlug);
        }
        // Clear sessionStorage
        sessionStorage.removeItem('subscriptionFormData');
        sessionStorage.removeItem('subscriptionSlug');
        sessionStorage.removeItem('subscriptionCourseSlug');
        setTimeout(() => {
          router.push(`/learning?course=${courseSlug}`);
        }, 3000);
      } else {
        setError(data.message || 'Failed to submit subscription. Please try again.');
        setSubmitting(false);
      }
    } catch (err: any) {
      console.error('Error submitting subscription:', err);
      setError('Network error. Please check your connection and try again.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-green-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading course details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center py-20 px-4">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Course Not Found</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
            <button
              onClick={() => router.push(`/programs/${slug || ''}`)}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Back to Program
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const courseData = {
    programSlug: course?.program?.slug || slug,
    programTitle: course?.program?.title || '',
    title: course?.title || '',
    level: getLevelDisplayName(course?.level || ''),
    duration: course?.duration || 'N/A',
    studyMode: course?.studyMode || 'N/A',
    color: course?.program?.color || 'from-green-500 to-emerald-500',
    fee: course?.fee || 'N/A',
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh] py-20">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-6" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Subscription Submitted Successfully!
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                Thank you for subscribing to <strong>{courseData.title}</strong>. 
                We have received your subscription request and will contact you shortly.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mb-8">
                Redirecting you to the learning page...
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => router.push(`/learning?course=${courseSlug}`)}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Start Learning
                </button>
                <button
                  onClick={() => router.push(`/programs/${slug}/courses/${courseSlug}`)}
                  className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  View Course
                </button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      {/* Payment Success Modal */}
      {showPaymentSuccessModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
          onClick={() => {
            // Don't close on background click - require button click
          }}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 md:p-8 relative transform transition-all duration-300 scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleSubmitAfterPayment}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label="Close"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Success Icon */}
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-4">
                <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400" />
              </div>
            </div>

            {/* Success Message */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Payment Successful!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Your payment has been processed successfully. Click the button below to complete your subscription.
              </p>
              
              {paymentReference && (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Payment Reference
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white font-mono">
                    {paymentReference}
                  </p>
                </div>
              )}
            </div>

            {/* Action Button */}
            <div className="flex justify-center">
              <button
                onClick={handleSubmitAfterPayment}
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Complete Subscription
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-wrap items-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            <button onClick={() => router.push('/')} className="hover:text-green-600 transition-colors">
              Home
            </button>
            <span className="mx-2">/</span>
            <button onClick={() => router.push('/programs')} className="hover:text-green-600 transition-colors">
              Programs
            </button>
            <span className="mx-2">/</span>
            <button onClick={() => router.push(`/programs/${courseData.programSlug}`)} className="hover:text-green-600 transition-colors">
              {courseData.programTitle}
            </button>
            <span className="mx-2">/</span>
            <button onClick={() => router.push(`/programs/${slug}/courses/${courseSlug}`)} className="hover:text-green-600 transition-colors">
              {courseData.title}
            </button>
            <span className="mx-2">/</span>
            <span className="text-gray-900 dark:text-white font-medium">Subscribe</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className={`relative bg-gradient-to-br ${courseData.color} text-white py-12 sm:py-16 lg:py-20`}>
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <button
              onClick={() => router.push(`/programs/${slug}/courses/${courseSlug}`)}
              className="inline-flex items-center text-white/90 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Course
            </button>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Subscribe to {courseData.title}
            </h1>
            <p className="text-lg sm:text-xl text-white/90">
              Complete the form below to subscribe to this course
            </p>
          </div>
        </div>
      </section>

      {/* Course Info Card */}
      <section className="py-8 -mt-8 relative z-10">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center">
                <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg mr-4">
                  <Clock className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Duration</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{courseData.duration}</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg mr-4">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Study Mode</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{courseData.studyMode}</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-lg mr-4">
                  <TbCurrencyNaira className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Fee</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{courseData.fee}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subscription Form */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 sm:p-8 lg:p-10">
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mr-3 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            <form onSubmit={handlePaystackPayment} className="space-y-8">
              {/* Personal Information */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                  <User className="h-6 w-6 mr-2 text-green-600" />
                  Personal Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstname"
                      value={formData.firstname}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Surname <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="surname"
                      value={formData.surname}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date of Birth <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                  <MapPin className="h-6 w-6 mr-2 text-green-600" />
                  Address Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      State <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Country <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                  <Briefcase className="h-6 w-6 mr-2 text-green-600" />
                  Professional Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Occupation
                    </label>
                    <input
                      type="text"
                      name="occupation"
                      value={formData.occupation}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Organization
                    </label>
                    <input
                      type="text"
                      name="organization"
                      value={formData.organization}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Subscription Details */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                  <BookOpen className="h-6 w-6 mr-2 text-green-600" />
                  Subscription Details
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Why do you want to subscribe to this course? <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="reasonForSubscription"
                      value={formData.reasonForSubscription}
                      onChange={handleInputChange}
                      required
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Tell us about your interest in this course..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      How did you hear about us? <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="howDidYouHear"
                      value={formData.howDidYouHear}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select an option</option>
                      <option value="Website">Website</option>
                      <option value="Social Media">Social Media</option>
                      <option value="Friend/Colleague">Friend/Colleague</option>
                      <option value="Advertisement">Advertisement</option>
                      <option value="Email">Email</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              {course?.fee && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <CreditCard className="h-6 w-6 mr-2 text-green-600" />
                    Payment Information
                  </h2>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                    <div className="flex items-start">
                      <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-800 dark:text-blue-200">
                        <p className="font-semibold mb-1">Payment Instructions:</p>
                        <p>Click the "Pay with Paystack" button below to complete your subscription payment securely via Paystack.</p>
                        <p className="mt-2">You will be redirected to Paystack to complete the payment of <strong>{course.fee}</strong>.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold text-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5 mr-2" />
                      Pay {course?.fee || 'Amount'} with Paystack
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => router.push(`/programs/${slug}/courses/${courseSlug}`)}
                  className="px-8 py-4 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-semibold text-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                >
                  Cancel
                </button>
              </div>
              
              {course?.fee && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    You will be redirected to Paystack to complete payment securely
                  </p>
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

