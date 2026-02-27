'use client'

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '../../../components/navbar/page';
import Footer from '../../../components/footer/page';
import { 
  ArrowLeft, Mail, Phone, Linkedin, Twitter, 
  GraduationCap, Award, Briefcase, BookOpen,
  Building, User, MapPin, Calendar, FileText, Loader2
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  title: string;
  department?: string | null;
  email: string;
  phone?: string | null;
  image: string;
  bio: string;
  qualifications: any; // JSON array
  researchAreas?: any | null; // JSON array
  linkedin?: string | null;
  twitter?: string | null;
  slug: string;
}

export default function TeamDetailPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;
  const [member, setMember] = useState<TeamMember | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchTeamMember();
    }
  }, [slug]);

  const fetchTeamMember = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/team/${slug}`);
      const data = await response.json();
      if (data.success) {
        // Convert JSON fields to arrays
        const teamMember = {
          ...data.team,
          qualifications: Array.isArray(data.team.qualifications) 
            ? data.team.qualifications 
            : typeof data.team.qualifications === 'string' 
              ? JSON.parse(data.team.qualifications) 
              : [],
          researchAreas: data.team.researchAreas 
            ? (Array.isArray(data.team.researchAreas) 
                ? data.team.researchAreas 
                : typeof data.team.researchAreas === 'string' 
                  ? JSON.parse(data.team.researchAreas) 
                  : null)
            : null,
        };
        setMember(teamMember);
      } else {
        setMember(null);
      }
    } catch (error) {
      console.error('Error fetching team member:', error);
      setMember(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-16 w-16 text-green-600 mx-auto mb-4 animate-spin" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Loading...</h1>
            <p className="text-gray-600 dark:text-gray-400">Fetching team member details</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!member) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Team Member Not Found</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">The team member you're looking for doesn't exist.</p>
            <Link
              href="/about/team"
              className="inline-flex items-center px-6 py-3 from-green-900 to-emerald-900 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Team
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'LEADERSHIP':
        return 'from-green-900 to-emerald-900 text-white';
      case 'FACULTY':
        return 'from-green-900 to-emerald-900 text-white';
      case 'STAFF':
        return 'from-green-900 to-emerald-900 text-white';
      case 'RESEARCH':
        return 'from-green-900 to-emerald-900 text-white';
      default:
        return 'from-green-900 to-emerald-900 text-white';
    }
  };

  // Helper function to get image
  const getImage = (imagePath: string | null | undefined): string => {
    if (!imagePath) return '';
    
    // If it's a base64 encoded image (starts with data:image/), return it directly
    if (typeof imagePath === 'string' && imagePath.startsWith('data:image/')) {
      return imagePath;
    }
    
    // If it's a string path starting with /, it's a public path - use it directly
    if (typeof imagePath === 'string' && imagePath.startsWith('/')) {
      return imagePath;
    }
    
    // If it's a full URL (http:// or https://), use it directly
    if (typeof imagePath === 'string' && (imagePath.startsWith('http://') || imagePath.startsWith('https://'))) {
      return imagePath;
    }
    
    // If it's a relative path without leading slash, prepend /
    if (typeof imagePath === 'string' && !imagePath.startsWith('http') && !imagePath.startsWith('data:')) {
      return '/' + imagePath;
    }
    
    // Return as-is for other cases
    return imagePath || '';
  };

  // Helper function to check if image needs unoptimized prop
  const isUnoptimizedImage = (imageSrc: string | null | undefined): boolean => {
    if (!imageSrc) return false;
    if (typeof imageSrc === 'string') {
      // Base64 images or external URLs need unoptimized
      return imageSrc.startsWith('data:') || 
             imageSrc.startsWith('http://') || 
             imageSrc.startsWith('https://');
    }
    return false;
  };

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Back Button */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link
              href="/about/team"
              className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Team
            </Link>
          </div>
        </div>

        {/* Hero Section */}
        <section className={`bg-gradient-to-br ${getRoleColor(member.role)} text-white py-16`}>
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              {/* Profile Image */}
              <div className="md:col-span-1">
                <div className="relative w-64 h-64 mx-auto md:mx-0 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20">
                  {member.image && getImage(member.image) ? (
                    <Image
                      src={getImage(member.image)}
                      alt={member.name}
                      fill
                      className="object-cover w-full h-full"
                      unoptimized={isUnoptimizedImage(member.image)}
                    />
                  ) : (
                    <div className="w-full h-full bg-white/10 flex items-center justify-center">
                      <User className="h-32 w-32 text-white/30" />
                    </div>
                  )}
                </div>
              </div>

              {/* Member Info */}
              <div className="md:col-span-2 text-center md:text-left">
                <div className="inline-block px-4 py-2 bg-white/20 rounded-full text-sm font-medium mb-4">
                  {member.role}
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  {member.name}
                </h1>
                <p className="text-2xl text-white/90 mb-2">
                  {member.title}
                </p>
                {member.department && (
                  <p className="text-lg text-white/80 flex items-center justify-center md:justify-start">
                    <Building className="h-5 w-5 mr-2" />
                    {member.department}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Biography */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                    <User className="h-6 w-6 mr-2 text-green-600" />
                    Biography
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
                    {member.bio}
                  </p>
                </div>

                {/* Qualifications */}
                {member.qualifications && Array.isArray(member.qualifications) && member.qualifications.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                      <GraduationCap className="h-6 w-6 mr-2 text-green-600" />
                      Qualifications
                    </h2>
                    <ul className="space-y-4">
                      {member.qualifications.map((qual: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <Award className="h-5 w-5 mr-3 mt-1 text-green-600 shrink-0" />
                          <span className="text-gray-600 dark:text-gray-400 text-lg">{qual}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Research Areas */}
                {member.researchAreas && Array.isArray(member.researchAreas) && member.researchAreas.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                      <BookOpen className="h-6 w-6 mr-2 text-green-600" />
                      Research Areas
                    </h2>
                    <div className="flex flex-wrap gap-3">
                      {member.researchAreas.map((area: string, index: number) => (
                        <span
                          key={index}
                          className="inline-block px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg text-sm font-medium"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1 space-y-6">
                {/* Contact Information */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Contact Information
                  </h3>
                  <div className="space-y-4">
                    <a
                      href={`mailto:${member.email}`}
                      className="flex items-center text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                    >
                      <Mail className="h-5 w-5 mr-3 text-green-600" />
                      <span className="break-all">{member.email}</span>
                    </a>
                    {member.phone && (
                      <a
                        href={`tel:${member.phone}`}
                        className="flex items-center text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                      >
                        <Phone className="h-5 w-5 mr-3 text-green-600" />
                        <span>{member.phone}</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Social Links */}
                {(member.linkedin || member.twitter) && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      Connect
                    </h3>
                    <div className="flex space-x-4">
                      {member.linkedin && (
                        <a
                          href={member.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                          title="LinkedIn"
                        >
                          <Linkedin className="h-6 w-6" />
                        </a>
                      )}
                      {member.twitter && (
                        <a
                          href={member.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-400 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                          title="Twitter"
                        >
                          <Twitter className="h-6 w-6" />
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Quick Actions
                  </h3>
                  <div className="space-y-3">
                    <a
                      href={`mailto:${member.email}?subject=Inquiry`}
                      className="block w-full px-4 py-3 bg-green-600 text-white rounded-lg text-center font-medium hover:bg-green-700 transition-colors"
                    >
                      Send Message
                    </a>
                    <Link
                      href="/about/team"
                      className="block w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-center font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      View All Team
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}

