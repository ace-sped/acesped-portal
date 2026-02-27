'use client'

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  User, Mail, Phone, Calendar, MapPin, Code, 
  Laptop, Wifi, Target, FileText, CheckCircle,
  ArrowRight, Loader2, X, Camera, Upload, Briefcase
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/navbar/page';
import Footer from '../components/footer/page';

interface Course {
  id: string;
  title: string;
  slug: string;
  fee: string | null;
  duration: string | null;
  studyMode: string | null;
  level: string;
}

interface Service {
  id: string;
  title: string;
  slug: string;
  subtitle?: string | null;
  description?: string | null;
}

interface SkillApplicationData {
  // Personal Information (matches SkillApplication model)
  surname: string;
  firstname: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  avatar: string; // Passport photograph (frontend-only)
  
  // Technical Interest (matches SkillApplication.technicalInterest)
  technicalInterest: string;
  courseId?: string; // Frontend-only field for course selection, not stored in DB
  
  // Technical Experience (matches SkillApplication model)
  hasPriorExperience: string; // Yes or No
  priorTechSkills: string[]; // Array of tech skills, converted to Json in DB
  
  // Device and Internet Access (matches SkillApplication model)
  hasLaptop: string; // Yes or No
  hasReliableInternet: string; // Yes or No
  
  // Motivation and Commitment (matches SkillApplication model)
  whyLearnTechSkill: string; // @db.Text
  careerGoalsInTech: string; // @db.Text
  committedToProgram: string; // Yes or No
  
  // Additional Information (matches SkillApplication model)
  howDidYouHear: string; // @db.Text
  disabilitiesOrAssistance: string; // Optional @db.Text
  
  // Declaration (matches SkillApplication model)
  informationConfirmed: boolean; // @default(false)
  
  // Note: paymentReference is handled separately in state, not in formData
  // Note: status, applicationNumber, createdAt, updatedAt are auto-generated
}

export default function SkillApplicationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [applicationNumber, setApplicationNumber] = useState<string | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [selectedServiceSlug, setSelectedServiceSlug] = useState<string>('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [paymentSuccessful, setPaymentSuccessful] = useState(false);
  const [paymentReference, setPaymentReference] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  const fetchCourses = async (serviceSlugParam?: string) => {
    const slugToUse =
      serviceSlugParam ||
      selectedServiceSlug ||
      'ace-sped-innovation-vocational-entrepreneurship-training-ivet-hub';

    try {
      setLoadingCourses(true);
      const response = await fetch(
        `/api/skill-courses?serviceSlug=${encodeURIComponent(slugToUse)}`
      );
      const data = await response.json();

      if (data.success && data.courses) {
        setCourses(data.courses);
      } else {
        setError('Failed to load programs for the selected service. Please refresh the page.');
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to load programs for the selected service. Please refresh the page.');
    } finally {
      setLoadingCourses(false);
    }
  };

  // Fetch services on mount, then load courses for default/first service
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoadingServices(true);
        const response = await fetch('/api/services');
        const data = await response.json();

        if (data.success && Array.isArray(data.services)) {
          const allowedServices = (data.services as Service[]).filter((svc) => {
            const titleLower = (svc.title || '').toLowerCase();
            const slugLower = (svc.slug || '').toLowerCase();
            return (
              titleLower.includes('innovation, vocational & entrepreneurship') ||
              titleLower.includes('professional short courses') ||
              slugLower.includes('ivet') ||
              slugLower.includes('professional-short')
            );
          });

          setServices(allowedServices);

          const preferred =
            allowedServices.find((svc) =>
              (svc.slug || '').toLowerCase().includes('ivet')
            ) ||
            allowedServices.find((svc) =>
              (svc.slug || '').toLowerCase().includes('professional-short')
            ) ||
            allowedServices[0];

          if (preferred) {
            setSelectedServiceSlug(preferred.slug);
          }
        } else {
          setError('Failed to load services. Please refresh the page.');
        }
      } catch (err) {
        console.error('Error fetching services:', err);
        setError('Failed to load services. Please refresh the page.');
      } finally {
        setLoadingServices(false);
      }
    };

    fetchServices();
  }, []);

  // When a service is selected, load its programs
  useEffect(() => {
    if (selectedServiceSlug) {
      fetchCourses(selectedServiceSlug);
    }
  }, [selectedServiceSlug]);

  // Check for payment return status
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentCallback = params.get('payment_callback');
    const reference = params.get('reference') || params.get('trxref');
    
    if (paymentCallback === 'true' && reference) {
      // Payment was successful - set payment status
      setPaymentSuccessful(true);
      setPaymentReference(reference);
      // Restore form data from sessionStorage
      const savedData = sessionStorage.getItem('skillApplicationData');
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          setFormData(parsedData);
        } catch (err) {
          console.error('Error parsing saved form data:', err);
        }
      }
      // Remove payment parameter from URL
      window.history.replaceState({}, '', window.location.pathname);
    } else if (paymentCallback === 'true' && !reference) {
      setError('Payment was cancelled or incomplete. Please try again.');
      // Remove payment parameter from URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleSubmitApplication = async () => {
    if (!paymentSuccessful || !paymentReference) {
      setError('Payment verification required. Please complete payment first.');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/skill-applications/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          paymentReference: paymentReference,
        }),
      });

      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch (jsonError) {
          console.error('Failed to parse response as JSON:', jsonError);
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
      } else {
        // Response is not JSON, read as text
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      if (!response.ok) {
        // Show more detailed error message
        const errorMsg = data?.message || data?.error || `Failed to submit application (${response.status})`;
        
        // Log detailed error information
        const errorDetails = {
          status: response.status,
          statusText: response.statusText,
          message: errorMsg,
          error: data?.error,
          code: data?.code,
          fullResponse: data,
          hasData: !!data,
          dataKeys: data ? Object.keys(data) : [],
        };
        
        console.error('Application submission error:', errorDetails);
        throw new Error(errorMsg);
      }
      
      // Log success for debugging
      console.log('Application submitted successfully:', {
        applicationNumber: data?.applicationNumber,
        applicationId: data?.applicationId,
      });

      setSuccess(true);
      setApplicationNumber(data?.applicationNumber || null);
      setPaymentSuccessful(false);
      setPaymentReference(null);
      // Clear sessionStorage
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('skillApplicationData');
      }
      
      // Reset form after 5 seconds
      setTimeout(() => {
        setFormData({
          surname: '',
          firstname: '',
          email: '',
          phone: '',
          dateOfBirth: '',
          gender: '',
          address: '',
          avatar: '',
          technicalInterest: '',
          courseId: undefined,
          hasPriorExperience: '',
          priorTechSkills: [],
          hasLaptop: '',
          hasReliableInternet: '',
          whyLearnTechSkill: '',
          careerGoalsInTech: '',
          committedToProgram: '',
          howDidYouHear: '',
          disabilitiesOrAssistance: '',
          informationConfirmed: false,
        });
        setAvatarPreview('');
        setSuccess(false);
        setApplicationNumber(null);
      }, 5000);
    } catch (err) {
      console.error('Error in handleSubmitApplication:', err);
      const errorMessage = err instanceof Error 
        ? err.message 
        : typeof err === 'string'
        ? err
        : 'An error occurred while submitting the application';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  const [formData, setFormData] = useState<SkillApplicationData>({
    surname: '',
    firstname: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    avatar: '',
    technicalInterest: '',
    courseId: undefined,
    hasPriorExperience: '',
    priorTechSkills: [],
    hasLaptop: '',
    hasReliableInternet: '',
    whyLearnTechSkill: '',
    careerGoalsInTech: '',
    committedToProgram: '',
    howDidYouHear: '',
    disabilitiesOrAssistance: '',
    informationConfirmed: false,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAvatarUpload = (file: File) => {
    // Mirror behavior from main application form (size limit 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setFormData(prev => ({ ...prev, avatar: base64String }));
      setAvatarPreview(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleRadioChange = (name: string, value: string) => {
    if (name === 'technicalInterest') {
      // Find the course and store both title and ID
      const selectedCourse = courses.find(course => course.title === value);
      setFormData(prev => ({ 
        ...prev, 
        [name]: value,
        courseId: selectedCourse?.id || undefined,
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleTechSkillChange = (skill: string, checked: boolean) => {
    setFormData(prev => {
      if (checked) {
        return { ...prev, priorTechSkills: [...prev.priorTechSkills, skill] };
      } else {
        return { ...prev, priorTechSkills: prev.priorTechSkills.filter(s => s !== skill) };
      }
    });
  };

  const validateForm = (): boolean => {
    if (!selectedServiceSlug) {
      setError('Please select a service');
      return false;
    }
    if (!formData.surname.trim()) {
      setError('Surname is required');
      return false;
    }
    if (!formData.firstname.trim()) {
      setError('Firstname is required');
      return false;
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Valid email is required');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required');
      return false;
    }
    if (!formData.dateOfBirth) {
      setError('Date of birth is required');
      return false;
    }
    if (!formData.gender) {
      setError('Gender is required');
      return false;
    }
    if (!formData.address.trim()) {
      setError('Address is required');
      return false;
    }
    if (!formData.technicalInterest) {
      setError('Please select a technical interest');
      return false;
    }
    if (!formData.hasPriorExperience) {
      setError('Please indicate if you have prior experience');
      return false;
    }
    if (formData.hasPriorExperience === 'Yes' && formData.priorTechSkills.length === 0) {
      setError('Please select at least one tech skill you have experience with');
      return false;
    }
    if (!formData.hasLaptop) {
      setError('Please indicate if you have a laptop');
      return false;
    }
    if (!formData.hasReliableInternet) {
      setError('Please indicate if you have reliable internet');
      return false;
    }
    if (!formData.whyLearnTechSkill.trim()) {
      setError('Please explain why you want to learn this tech skill');
      return false;
    }
    if (!formData.careerGoalsInTech.trim()) {
      setError('Please describe your career goals in tech');
      return false;
    }
    if (!formData.committedToProgram) {
      setError('Please indicate your commitment to the program');
      return false;
    }
    if (!formData.howDidYouHear.trim()) {
      setError('Please tell us how you heard about us');
      return false;
    }
    if (!formData.informationConfirmed) {
      setError('Please confirm that the information provided is correct');
      return false;
    }
    return true;
  };

  // Get course price from database or return default
  const getCoursePrice = (technicalInterest: string): number => {
    if (!technicalInterest) return 0;
    
    // Find the selected course
    const selectedCourse = courses.find(course => course.title === technicalInterest);
    
    if (selectedCourse && selectedCourse.fee) {
      // Extract numeric value from fee string (e.g., "₦150,000" -> 150000)
      const feeString = selectedCourse.fee.replace(/[₦,\s]/g, '');
      const price = parseInt(feeString, 10);
      return isNaN(price) ? 0 : price;
    }
    
    return 0; // Default to 0 if no price found
  };

  // Get selected course details
  const getSelectedCourse = (): Course | undefined => {
    if (!formData.technicalInterest) return undefined;
    return courses.find(course => course.title === formData.technicalInterest);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // If payment is already successful, don't proceed to payment again
    if (paymentSuccessful) {
      return;
    }
    
    if (!validateForm()) {
      return;
    }

    // Validate course price
    const priceInNaira = getCoursePrice(formData.technicalInterest);
    if (priceInNaira <= 0) {
      setError('Invalid course price. Please select a valid course.');
      return;
    }

    setLoading(true);

    try {
      // Store form data in sessionStorage before redirecting to Paystack
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('skillApplicationData', JSON.stringify(formData));
      }

      // Convert to kobo (Paystack uses kobo as the smallest currency unit)
      const amountInKobo = priceInNaira * 100;

      // Initialize Paystack payment
      const response = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          amount: amountInKobo,
          callback_path: '/skill-application',
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to initialize payment');
      }

      if (data.authorization_url) {
        // Redirect to Paystack payment page (test or live based on API key)
        // If using test key (sk_test_), Paystack will redirect to test payment page
        // If using live key (sk_live_), Paystack will redirect to live payment page
        console.log('Redirecting to Paystack payment page:', data.authorization_url);
        if (typeof window !== 'undefined') {
          window.location.href = data.authorization_url;
        }
      } else {
        throw new Error('Payment initialization failed. Please try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while processing payment');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <main className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Skill Application Form
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Apply for our tech skills training program
            </p>
          </div>

          {/* Success Modal */}
          {success && (
            <div 
              className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
              onClick={() => {
                setSuccess(false);
                setApplicationNumber(null);
              }}
            >
              <div 
                className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 md:p-8 relative transform transition-all duration-300 scale-100"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  onClick={() => {
                    setSuccess(false);
                    setApplicationNumber(null);
                  }}
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
                    Application Submitted Successfully!
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Thank you for your application. We have received your submission and will get back to you soon.
                  </p>
                  
                  {applicationNumber && (
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Application Number
                      </p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white font-mono">
                        {applicationNumber}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        Please save this number for your records
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <div className="flex justify-center">
                  <button
                    onClick={() => {
                      setSuccess(false);
                      setApplicationNumber(null);
                    }}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information Section */}
            <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3">
                  <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Personal Information
                </h2>
              </div>

              {/* Avatar Upload (mirrored from main application form) */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Passport Photograph
                </label>
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    {avatarPreview ? (
                      <div className="relative h-28 w-28 sm:h-32 sm:w-32 rounded-lg overflow-hidden border-2 border-gray-300 dark:border-gray-600">
                        <Image
                          src={avatarPreview}
                          alt="Avatar preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white">
                        <Camera className="h-10 w-10 sm:h-12 sm:w-12" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      id="skill-avatar-upload"
                      accept="image/*"
                      onChange={(e) =>
                        e.target.files && handleAvatarUpload(e.target.files[0])
                      }
                      className="hidden"
                    />
                    <label
                      htmlFor="skill-avatar-upload"
                      className="cursor-pointer inline-flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      <Upload className="h-5 w-5 mr-2" />
                      Upload Photo
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Max size: 5MB. Formats: JPG, PNG
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Surname <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="surname"
                    value={formData.surname}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Firstname <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstname"
                    value={formData.firstname}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                </div>
              </div>
            </section>

      {/* Service Selection Section */}
      <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8">
        <div className="flex items-center mb-6">
          <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg mr-3">
            <Briefcase className="h-6 w-6 text-teal-600 dark:text-teal-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Select Service
          </h2>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
            Choose the service you want to apply under <span className="text-red-500">*</span>
          </label>

          {loadingServices ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-green-600" />
              <span className="ml-2 text-gray-600 dark:text-gray-400">Loading services...</span>
            </div>
          ) : services.length === 0 ? (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-yellow-800 dark:text-yellow-200">
                No services available at the moment. Please check back later.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {services.map((service) => {
                const slugLower = (service.slug || '').toLowerCase();
                const displayTitle = slugLower.includes('professional-short')
                  ? 'ACE-SPED Professional Short Courses'
                  : 'ACE-SPED Innovation, Vocational & Entrepreneurship Short Courses';

                return (
                <label
                  key={service.id}
                  className="flex items-start p-4 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <input
                    type="radio"
                    name="service"
                    value={service.slug}
                    checked={selectedServiceSlug === service.slug}
                    onChange={() => {
                      setSelectedServiceSlug(service.slug);
                      // reset program selection when service changes
                      setFormData(prev => ({
                        ...prev,
                        technicalInterest: '',
                        courseId: undefined,
                      }));
                    }}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 mt-1"
                    required
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <span className="text-gray-900 dark:text-white font-medium">{displayTitle}</span>
                        {service.subtitle && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {service.subtitle}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </label>
              );
              })}
            </div>
          )}
        </div>
      </section>

            {/* Program Selection Section */}
            <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg mr-3">
                  <Code className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Select Program
                </h2>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  Select the program you want to apply for <span className="text-red-500">*</span>
                </label>
                {loadingCourses ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-green-600" />
                    <span className="ml-2 text-gray-600 dark:text-gray-400">Loading programs...</span>
                  </div>
                ) : courses.length === 0 ? (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <p className="text-yellow-800 dark:text-yellow-200">
                      No programs available at the moment. Please check back later.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {courses.map((course) => (
                      <label
                        key={course.id}
                        className="flex items-start p-4 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <input
                          type="radio"
                          name="technicalInterest"
                          value={course.title}
                          checked={formData.technicalInterest === course.title}
                          onChange={() => handleRadioChange('technicalInterest', course.title)}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 mt-1"
                          required
                        />
                        <div className="ml-3 flex-1">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <span className="text-gray-900 dark:text-white font-medium">{course.title}</span>
                              {course.duration && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  Duration: {course.duration}
                                </p>
                              )}
                              {course.studyMode && (
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Mode: {course.studyMode}
                                </p>
                              )}
                            </div>
                            {course.fee && (
                              <div className="ml-4 text-right">
                                <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                                  {course.fee}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Technical Experience Section */}
            <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg mr-3">
                  <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Technical Experience
                </h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                    Do you have prior experience? <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-6">
                    {['Yes', 'No'].map((option) => (
                      <label
                        key={option}
                        className="flex items-center cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="hasPriorExperience"
                          value={option}
                          checked={formData.hasPriorExperience === option}
                          onChange={() => {
                            handleRadioChange('hasPriorExperience', option);
                            // Clear priorTechSkills if "No" is selected
                            if (option === 'No') {
                              setFormData(prev => ({ ...prev, priorTechSkills: [] }));
                            }
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          required
                        />
                        <span className="ml-2 text-gray-700 dark:text-gray-300">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {formData.hasPriorExperience === 'Yes' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                      Select tech skill you have experience with <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {['HTML', 'CSS', 'JavaScript', 'PHP', 'Python', 'Ruby', 'C#', 'C++', 'SQL', 'Postgres', 'Figma', 'Photoshop', 'Corel Draw', '.NET', 'UI/UX'].map((skill) => (
                        <label
                          key={skill}
                          className="flex items-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <input
                            type="checkbox"
                            name="priorTechSkills"
                            value={skill}
                            checked={formData.priorTechSkills.includes(skill)}
                            onChange={(e) => handleTechSkillChange(skill, e.target.checked)}
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                          />
                          <span className="ml-3 text-gray-700 dark:text-gray-300">{skill}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Device and Internet Access Section */}
            <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg mr-3">
                  <Laptop className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Device and Internet Access
                </h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                    Do you have a laptop? <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-6">
                    {['Yes', 'No'].map((option) => (
                      <label
                        key={option}
                        className="flex items-center cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="hasLaptop"
                          value={option}
                          checked={formData.hasLaptop === option}
                          onChange={() => handleRadioChange('hasLaptop', option)}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                          required
                        />
                        <span className="ml-2 text-gray-700 dark:text-gray-300">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                    Do you have reliable internet? <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-6">
                    {['Yes', 'No'].map((option) => (
                      <label
                        key={option}
                        className="flex items-center cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="hasReliableInternet"
                          value={option}
                          checked={formData.hasReliableInternet === option}
                          onChange={() => handleRadioChange('hasReliableInternet', option)}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                          required
                        />
                        <span className="ml-2 text-gray-700 dark:text-gray-300">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Motivation and Commitment Section */}
            <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg mr-3">
                  <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Motivation and Commitment
                </h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Why do you want to learn this tech skill? <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="whyLearnTechSkill"
                    value={formData.whyLearnTechSkill}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Tell us about your motivation..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    What are your career goals in tech? <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="careerGoalsInTech"
                    value={formData.careerGoalsInTech}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Describe your career aspirations..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                    Are you committed to completing the program? <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-6">
                    {['Yes', 'No'].map((option) => (
                      <label
                        key={option}
                        className="flex items-center cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="committedToProgram"
                          value={option}
                          checked={formData.committedToProgram === option}
                          onChange={() => handleRadioChange('committedToProgram', option)}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                          required
                        />
                        <span className="ml-2 text-gray-700 dark:text-gray-300">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Additional Information Section */}
            <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg mr-3">
                  <FileText className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Additional Information
                </h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    How did you hear about us? <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="howDidYouHear"
                    value={formData.howDidYouHear}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g., Social media, friend, website, etc."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Any disabilities or assistance needed?
                  </label>
                  <textarea
                    name="disabilitiesOrAssistance"
                    value={formData.disabilitiesOrAssistance}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Please let us know if you need any special accommodations..."
                  />
                </div>
              </div>
            </section>

            {/* Declaration Section */}
            <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg mr-3">
                  <CheckCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Declaration
                </h2>
              </div>

              <div className="flex items-start">
                <input
                  type="checkbox"
                  name="informationConfirmed"
                  checked={formData.informationConfirmed}
                  onChange={(e) => handleCheckboxChange('informationConfirmed', e.target.checked)}
                  className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded mt-1"
                  required
                />
                <label className="ml-3 text-gray-700 dark:text-gray-300">
                  I confirm that the information provided is correct <span className="text-red-500">*</span>
                </label>
              </div>
            </section>

            {/* Payment Status and Submit Buttons */}
            <div className="flex flex-col items-end gap-4">
              {formData.technicalInterest && !paymentSuccessful && (() => {
                const selectedCourse = getSelectedCourse();
                const price = getCoursePrice(formData.technicalInterest);
                return (
                  <div className="text-right">
                    {selectedCourse?.fee ? (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Course Price: <span className="font-semibold text-green-600 dark:text-green-400">{selectedCourse.fee}</span>
                      </p>
                    ) : price > 0 ? (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Course Price: <span className="font-semibold text-green-600 dark:text-green-400">₦{price.toLocaleString()}</span>
                      </p>
                    ) : null}
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      You will be redirected to Paystack to complete payment
                    </p>
                  </div>
                );
              })()}

              {paymentSuccessful && (
                <div className="w-full p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                      <div>
                        <p className="text-green-800 dark:text-green-200 font-semibold">
                          Payment Successful!
                        </p>
                        {paymentReference && (
                          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                            Reference: {paymentReference}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!paymentSuccessful ? (
                <button
                  type="submit"
                  disabled={loading || !formData.informationConfirmed || !formData.technicalInterest || loadingCourses}
                  className="px-8 py-4 bg-green-500 text-white rounded-lg font-semibold hover:from-green-700 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Proceed to Paystack Payment
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmitApplication}
                  disabled={loading || !paymentReference}
                  className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Application
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}

