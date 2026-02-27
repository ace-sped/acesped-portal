"use client";

import React, { useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  GraduationCap,
  Heart,
  Users,
  FileText,
  Building,
  Globe,
  CreditCard,
  AlertCircle,
  Loader2,
  Edit,
  CheckCircle,
  XCircle,
} from "lucide-react";
import StudentLayout from "../components/StudentLayout";

interface StudentProfile {
  id: string;
  matricNumber: string | null;
  status: string;
  personalInfo: {
    email: string;
    firstname: string;
    surname: string;
    middlename: string | null;
    maidenName: string | null;
    nationalId: string | null;
    maritalStatus: string | null;
    dateOfBirth: string;
    gender: string;
    nationality: string;
    phoneNumber: string;
    alternatePhone: string | null;
    address: string;
    homeAddress: string;
    homeTown: string;
    city: string;
    state: string;
    country: string;
    postalCode: string | null;
    religion: string;
    avatar: string | null;
  } | null;
  application: {
    applicationNumber: string | null;
    status: string;
    programType: string;
    programChoice: string;
    admissionSession: string;
    modeOfStudy: string;
    email?: string;
    firstname?: string;
    surname?: string;
    avatar?: string | null;
    previousDegree: string;
    previousInstitution: string;
    previousGraduationYear: string;
    previousGPA: string;
    previousFieldOfStudy: string;
    employmentStatus: string;
    currentEmployer: string | null;
    jobTitle: string | null;
    reasonForPursuing: string;
    researchTitle: string | null;
    researchAbstract: string | null;
    referee1Name: string;
    referee1Email: string;
    referee1Phone: string;
    referee1Institution: string;
    referee2Name: string;
    referee2Email: string;
    referee2Phone: string;
    referee2Institution: string;
    paymentMethod: string;
    paymentReference: string;
    acceptanceFeePaid: boolean;
    acceptancePaidAt: string | null;
  } | null;
  nextOfKin: Array<{
    firstname: string;
    surname: string;
    relationship: string;
    phone: string;
    email: string;
    address: string;
  }>;
  programmes: Array<{
    admissionSession: string;
    modeOfStudy: string;
    status: string;
    program: {
      title: string;
      level: string;
      slug: string;
    };
  }>;
  education: Array<{
    institutionName: string;
    qualification: string;
    fieldOfStudy: string;
    startYear: string | null;
    endYear: string | null;
    grade: string | null;
  }>;
  employment: Array<{
    employerName: string;
    jobTitle: string | null;
    employmentStatus: string;
    startDate: string | null;
    endDate: string | null;
  }>;
  medical: {
    hasDisability: boolean;
    disabilityDetails: string | null;
    hasChronicIllness: boolean;
    chronicIllnessDetails: string | null;
    allergies: string | null;
    bloodGroup: string | null;
    genotype: string | null;
  } | null;
}

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/students/profile");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch profile");
      }

      setProfile(data.data);
    } catch (err: any) {
      console.error("Profile fetch error:", err);
      setError(err.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = () => {
    const first = profile?.personalInfo?.firstname?.[0] || profile?.application?.firstname?.[0] || "";
    const last = profile?.personalInfo?.surname?.[0] || profile?.application?.surname?.[0] || "";
    const initials = (first + last).toUpperCase();
    return initials || "ST";
  };

  const getFullName = () => {
    if (profile?.personalInfo) {
      const { firstname, middlename, surname } = profile.personalInfo;
      return [firstname, middlename, surname].filter(Boolean).join(" ");
    }
    if (profile?.application) {
      const { firstname, surname } = profile.application;
      return [firstname, surname].filter(Boolean).join(" ") || "Student";
    }
    return "Student";
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
      PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
      APPROVED: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
      REJECTED: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
    };
    return colors[status] || "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="p-8 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  if (error || !profile) {
    return (
      <StudentLayout>
        <div className="p-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">
                  Error Loading Profile
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300">
                  {error || "Unable to load your profile. Please try again later."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            My Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage your personal information and application details
          </p>
        </div>

        {/* Profile Header Card */}
        <div className="bg-linear-to-br from-emerald-600 to-green-700 rounded-2xl p-8 mb-6 text-white shadow-xl">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="relative">
              {profile.personalInfo?.avatar || profile.application?.avatar ? (
                <img
                  src={profile.personalInfo?.avatar || profile.application?.avatar || ""}
                  alt={getFullName()}
                  className="h-24 w-24 rounded-full object-cover border-4 border-white/20"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl font-bold border-4 border-white/20">
                  {getInitials()}
                </div>
              )}
              <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
            </div>

            <div className="flex-1">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">{getFullName()}</h2>
              <div className="flex flex-wrap gap-4 text-sm text-emerald-50">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  <span>{profile.matricNumber || profile.application?.applicationNumber || "No Matric Number"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>{profile.personalInfo?.email || profile.application?.email || "No email"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>{profile.personalInfo?.phoneNumber || "No phone"}</span>
                </div>
              </div>
              <div className="mt-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(profile.status)}`}>
                  {profile.status}
                </span>
              </div>
            </div>

            <button className="flex items-center gap-2 px-6 py-3 bg-white text-emerald-700 rounded-lg font-semibold hover:bg-emerald-50 transition-colors">
              <Edit className="h-4 w-4" />
              Edit Profile
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            {profile.personalInfo && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <User className="h-5 w-5 text-emerald-600" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <InfoItem label="First Name" value={profile.personalInfo.firstname} />
                  <InfoItem label="Surname" value={profile.personalInfo.surname} />
                  <InfoItem label="Middle Name" value={profile.personalInfo.middlename} />
                  <InfoItem label="Maiden Name" value={profile.personalInfo.maidenName} />
                  <InfoItem label="Date of Birth" value={profile.personalInfo.dateOfBirth} icon={Calendar} />
                  <InfoItem label="Gender" value={profile.personalInfo.gender} />
                  <InfoItem label="Marital Status" value={profile.personalInfo.maritalStatus} />
                  <InfoItem label="Nationality" value={profile.personalInfo.nationality} icon={Globe} />
                  <InfoItem label="Religion" value={profile.personalInfo.religion} />
                  <InfoItem label="National ID" value={profile.personalInfo.nationalId} icon={CreditCard} />
                </div>
              </div>
            )}

            {/* Contact Information */}
            {profile.personalInfo && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Phone className="h-5 w-5 text-emerald-600" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <InfoItem label="Primary Phone" value={profile.personalInfo.phoneNumber} icon={Phone} />
                  <InfoItem label="Alternate Phone" value={profile.personalInfo.alternatePhone} icon={Phone} />
                  <InfoItem label="Email Address" value={profile.personalInfo.email || profile.application?.email} icon={Mail} />
                  <InfoItem label="City" value={profile.personalInfo.city} icon={MapPin} />
                  <InfoItem label="State" value={profile.personalInfo.state} icon={MapPin} />
                  <InfoItem label="Country" value={profile.personalInfo.country} icon={Globe} />
                  <div className="md:col-span-2">
                    <InfoItem label="Home Address" value={profile.personalInfo.homeAddress} icon={MapPin} />
                  </div>
                  <div className="md:col-span-2">
                    <InfoItem label="Current Address" value={profile.personalInfo.address} icon={MapPin} />
                  </div>
                </div>
              </div>
            )}

            {/* Application Details */}
            {profile.application && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-emerald-600" />
                  Application Details
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Application Number</span>
                    <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                      {profile.application.applicationNumber}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Application Status</span>
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${getStatusColor(profile.application.status)}`}>
                      {profile.application.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm pt-2">
                    <InfoItem label="Program Type" value={profile.application.programType} icon={GraduationCap} />
                    <InfoItem label="Program Choice" value={profile.application.programChoice} />
                    <InfoItem label="Admission Session" value={profile.application.admissionSession} />
                    <InfoItem label="Mode of Study" value={profile.application.modeOfStudy} />
                    <InfoItem 
                      label="Acceptance Fee" 
                      value={profile.application.acceptanceFeePaid ? "Paid" : "Not Paid"} 
                      icon={profile.application.acceptanceFeePaid ? CheckCircle : XCircle}
                    />
                    <InfoItem label="Payment Method" value={profile.application.paymentMethod} />
                  </div>
                </div>
              </div>
            )}

            {/* Educational Background */}
            {profile.application && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-emerald-600" />
                  Educational Background
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <InfoItem label="Previous Degree" value={profile.application.previousDegree} />
                  <InfoItem label="Field of Study" value={profile.application.previousFieldOfStudy} />
                  <InfoItem label="Institution" value={profile.application.previousInstitution} icon={Building} />
                  <InfoItem label="Graduation Year" value={profile.application.previousGraduationYear} />
                  <InfoItem label="GPA / Grade" value={profile.application.previousGPA} />
                </div>
              </div>
            )}

            {/* Employment Details */}
            {profile.application && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-emerald-600" />
                  Employment Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <InfoItem label="Employment Status" value={profile.application.employmentStatus} />
                  <InfoItem label="Current Employer" value={profile.application.currentEmployer} icon={Building} />
                  <InfoItem label="Job Title" value={profile.application.jobTitle} />
                  <div className="md:col-span-2">
                    <InfoItem label="Reason for Pursuing" value={profile.application.reasonForPursuing} />
                  </div>
                </div>
              </div>
            )}

            {/* Research Information */}
            {profile.application?.researchTitle && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-emerald-600" />
                  Research Proposal
                </h3>
                <div className="space-y-4 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 mb-1">Research Title</p>
                    <p className="font-medium text-gray-900 dark:text-white">{profile.application.researchTitle}</p>
                  </div>
                  {profile.application.researchAbstract && (
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 mb-1">Abstract</p>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{profile.application.researchAbstract}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Referees */}
            {profile.application && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-emerald-600" />
                  Referees
                </h3>
                <div className="space-y-6">
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Referee 1</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <InfoItem label="Name" value={profile.application.referee1Name} />
                      <InfoItem label="Institution" value={profile.application.referee1Institution} />
                      <InfoItem label="Email" value={profile.application.referee1Email} icon={Mail} />
                      <InfoItem label="Phone" value={profile.application.referee1Phone} icon={Phone} />
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Referee 2</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <InfoItem label="Name" value={profile.application.referee2Name} />
                      <InfoItem label="Institution" value={profile.application.referee2Institution} />
                      <InfoItem label="Email" value={profile.application.referee2Email} icon={Mail} />
                      <InfoItem label="Phone" value={profile.application.referee2Phone} icon={Phone} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Enrollment Status */}
            {profile.programmes && profile.programmes.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-emerald-600" />
                  Programme Enrollment
                </h3>
                <div className="space-y-4">
                  {profile.programmes.map((prog, index) => (
                    <div key={index} className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg">
                      <p className="font-semibold text-gray-900 dark:text-white mb-2">{prog.program.title}</p>
                      <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                        <p>Level: {prog.program.level}</p>
                        <p>Session: {prog.admissionSession}</p>
                        <p>Mode: {prog.modeOfStudy}</p>
                        <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(prog.status)}`}>
                          {prog.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next of Kin */}
            {profile.nextOfKin && profile.nextOfKin.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-emerald-600" />
                  Next of Kin
                </h3>
                <div className="space-y-4">
                  {profile.nextOfKin.map((kin, index) => (
                    <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <p className="font-semibold text-gray-900 dark:text-white mb-1">
                        {kin.firstname} {kin.surname}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{kin.relationship}</p>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Phone className="h-3 w-3" />
                          <span>{kin.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Mail className="h-3 w-3" />
                          <span className="break-all">{kin.email}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Medical Information */}
            {profile.medical && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Heart className="h-5 w-5 text-emerald-600" />
                  Medical Information
                </h3>
                <div className="space-y-3 text-sm">
                  <InfoItem label="Blood Group" value={profile.medical.bloodGroup} />
                  <InfoItem label="Genotype" value={profile.medical.genotype} />
                  <InfoItem label="Allergies" value={profile.medical.allergies} />
                  {profile.medical.hasDisability && (
                    <InfoItem label="Disability" value={profile.medical.disabilityDetails} />
                  )}
                  {profile.medical.hasChronicIllness && (
                    <InfoItem label="Chronic Illness" value={profile.medical.chronicIllnessDetails} />
                  )}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <button className="w-full text-left px-4 py-2 text-sm text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 rounded-lg transition-colors">
                  Update Contact Information
                </button>
                <button
                  onClick={() => window.dispatchEvent(new Event("student:open-change-password"))}
                  className="w-full text-left px-4 py-2 text-sm text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 rounded-lg transition-colors"
                >
                  Change Password
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 rounded-lg transition-colors">
                  Download Profile PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}

// Helper component for displaying info items
function InfoItem({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | null | undefined | boolean;
  icon?: any;
}) {
  const displayValue = value === null || value === undefined || value === "" 
    ? "Not provided" 
    : typeof value === "boolean"
    ? value ? "Yes" : "No"
    : value;

  return (
    <div className="flex items-start gap-2">
      {Icon && <Icon className="h-4 w-4 text-gray-400 mt-1 shrink-0" />}
      <div className="min-w-0 flex-1">
        <p className="text-gray-500 dark:text-gray-400 mb-0.5">{label}</p>
        <p className="font-medium text-gray-900 dark:text-white wrap-break-word">
          {displayValue}
        </p>
      </div>
    </div>
  );
}