'use client'

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/navbar/page';
import Footer from '../../components/footer/page';
import { 
  Users, Mail, Phone, Linkedin, Twitter, 
  GraduationCap, Award, Briefcase, BookOpen,
  Search, Filter, ChevronDown, User, Building, Loader2
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

export default function OurTeamPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  const teamCategories = [
    { id: 'ALL', label: 'All Team', icon: Users },
    { id: 'LEADERSHIP', label: 'Leadership', icon: Award },
    { id: 'FACULTY', label: 'Faculty', icon: GraduationCap },
    { id: 'STAFF', label: 'Administrative Staff', icon: Briefcase },
    { id: 'RESEARCH', label: 'Research Team', icon: BookOpen },
  ];

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/team');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success && data.team) {
        // Convert JSON fields to arrays
        const members = Array.isArray(data.team) ? data.team.map((member: any) => ({
          ...member,
          qualifications: Array.isArray(member.qualifications) 
            ? member.qualifications 
            : typeof member.qualifications === 'string' 
              ? JSON.parse(member.qualifications) 
              : [],
          researchAreas: member.researchAreas 
            ? (Array.isArray(member.researchAreas) 
                ? member.researchAreas 
                : typeof member.researchAreas === 'string' 
                  ? JSON.parse(member.researchAreas) 
                  : null)
            : null,
        })) : [];
        setTeamMembers(members);
      } else {
        console.error('Failed to fetch team members:', data.message || data.error || 'Unknown error');
        setTeamMembers([]); // Set empty array on error
      }
    } catch (error: any) {
      console.error('Error fetching team members:', error);
      console.error('Error details:', error.message || error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = teamMembers.filter(member => {
    const matchesCategory = selectedCategory === 'ALL' || member.role === selectedCategory;
    const matchesSearch = 
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.department && member.department.toLowerCase().includes(searchTerm.toLowerCase())) ||
      member.bio.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (categoryId: string) => {
    const category = teamCategories.find(cat => cat.id === categoryId);
    return category?.icon || Users;
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
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-green-900 to-emerald-900 text-white py-20">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Our Team
              </h1>
              <p className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto">
                Meet the dedicated professionals driving excellence in sustainable power and energy development
              </p>
            </div>
          </div>
        </section>

        {/* Filters Section */}
        <section className="py-8 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-20 z-40">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                {teamCategories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                        selectedCategory === category.id
                          ? 'bg-green-600 text-white shadow-lg'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="font-medium">{category.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Search */}
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search team members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Team Members Grid */}
        <section className="py-16">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="h-12 w-12 text-green-600 animate-spin mb-4" />
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  Loading team members...
                </p>
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="text-center py-16">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  No team members found
                </h3>
                <p className="text-gray-500 dark:text-gray-500">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {filteredMembers.map((member) => {
                  const CategoryIcon = getCategoryIcon(member.role);
                  return (
                    <div
                      key={member.id}
                      onClick={() => router.push(`/about/team/${member.slug}`)}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group cursor-pointer"
                    >
                      {/* Member Image */}
                      <div className="relative h-64 bg-gradient-to-br from-green-500 to-emerald-500 overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <User className="h-32 w-32 text-white/20" />
                        </div>
                        {member.image && getImage(member.image) ? (
                          <Image
                            src={getImage(member.image)}
                            alt={member.name}
                            fill
                            className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                            unoptimized={isUnoptimizedImage(member.image)}
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <User className="h-24 w-24 text-white/40" />
                          </div>
                        )}
                        <div className="absolute bottom-4 left-4">
                          <span className="inline-flex items-center px-3 py-1 bg-white/90 dark:bg-gray-800/90 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300">
                            <CategoryIcon className="h-3 w-3 mr-1" />
                            {member.role}
                          </span>
                        </div>
                      </div>

                      {/* Member Info */}
                      <div className="p-2 text-center">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                          {member.name}
                        </h3>
                        <p className="text-green-600 dark:text-green-400 font-semibold mb-2">
                          {member.title}
                        </p> 
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Join Our Team CTA */}
        <section className="py-16 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Join Our Team
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              Are you passionate about sustainable energy and education? We're always looking for talented individuals to join our mission.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/application"
                className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors inline-flex items-center justify-center"
              >
                View Open Positions
              </a>
              <a
                href="mailto:info@acesped.unn.edu.ng"
                className="px-8 py-3 border-2 border-green-600 text-green-600 dark:text-green-400 rounded-lg font-semibold hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors inline-flex items-center justify-center"
              >
                Contact HR
              </a>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}

