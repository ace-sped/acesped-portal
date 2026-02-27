'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Navbar from '../components/navbar/page';
import Footer from '../components/footer/page';
import { 
  Target, Eye, Award, Users, MapPin, Phone, Mail, 
  Globe, Lightbulb, Zap, TrendingUp, Briefcase,
  CheckCircle, ArrowRight, GraduationCap, BookOpen,
  Microscope, Heart, Star
} from 'lucide-react';
import Acesped from '@/public/images/acesped.png';
import Image4 from '@/public/images/lab.jpg';

export default function AboutPage() {
  const router = useRouter();

  const thematicAreas = [
    {
      title: 'Electric Power Systems Development',
      description: 'Advanced research and development in power generation, transmission, and distribution systems',
      icon: Zap,
      color: 'from-green-500 to-emerald-500',
    },
    {
      title: 'Renewable Energy, Waste-to-Energy and Energy Conservation',
      description: 'Innovation in sustainable energy sources including solar, wind, hydro, and waste-to-energy technologies',
      icon: Lightbulb,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Energy Resources Assessment and Forecasting',
      description: 'Comprehensive analysis and prediction of energy resources, consumption patterns, and future trends',
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Sustainable Energy Materials',
      description: 'Development of advanced materials for energy conversion, storage, and sustainable applications',
      icon: Microscope,
      color: 'from-orange-500 to-red-500',
    },
    {
      title: 'Energy Policy, Regulation and Management',
      description: 'Research in energy economics, policy formulation, regulatory frameworks, and strategic management',
      icon: Briefcase,
      color: 'from-indigo-500 to-blue-500',
    },
  ];

  const values = [
    {
      title: 'Excellence',
      description: 'Commitment to the highest standards in education, research, and innovation',
      icon: Star,
    },
    {
      title: 'Innovation',
      description: 'Fostering creativity and cutting-edge solutions to energy challenges',
      icon: Lightbulb,
    },
    {
      title: 'Sustainability',
      description: 'Promoting sustainable practices and solutions for future generations',
      icon: Heart,
    },
    {
      title: 'Collaboration',
      description: 'Building partnerships with industry, government, and international organizations',
      icon: Users,
    },
    {
      title: 'Impact',
      description: 'Creating meaningful change in Sub-Saharan Africa and beyond',
      icon: Target,
    },
    {
      title: 'Integrity',
      description: 'Maintaining ethical standards and transparency in all activities',
      icon: Award,
    },
  ];

  const achievements = [
    {
      metric: '25,000+',
      label: 'Students Enrolled',
      icon: GraduationCap,
    },
    {
      metric: '1,200+',
      label: 'Expert Faculty',
      icon: Users,
    },
    {
      metric: '500+',
      label: 'Research Projects',
      icon: Microscope,
    },
    {
      metric: '150+',
      label: 'Global Partners',
      icon: Globe,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-900 to-emerald-900 text-white py-20">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              About ACE-SPED
            </h1>
            <p className="text-xl md:text-2xl text-white/90 leading-relaxed mb-8">
              Africa Centre of Excellence for Sustainable Power and Energy Development
            </p>
            <p className="text-lg text-white/80 max-w-3xl mx-auto mb-6">
              A World Bank assisted Higher Education Programme at the University of Nigeria, Nsukka, 
              dedicated to advancing sustainable energy solutions for Sub-Saharan Africa.
            </p>
            <div className="mt-8 pt-8 border-t border-white/20">
              <p className="text-2xl md:text-3xl font-semibold text-white/95 italic">
                Motto: Dignity through Sustainable Sower and Energy
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full mb-4">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2">
                    {achievement.metric}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    {achievement.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative h-full">
              <div className="aspect-square bg-gradient-to-br from-green-900 to-emerald-900 rounded-3xl shadow-2xl flex items-center justify-center overflow-hidden">
                <Image src={Acesped} alt="ACE-SPED" fill className="object-cover" />
              </div>
            </div>
            
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Our Story
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                The Africa Centre of Excellence for Sustainable Power and Energy Development (ACE-SPED) 
                is a World Bank assisted project domiciled at the University of Nigeria, Nsukka. 
                The Centre was conceptualized to proffer sustainable solutions to some developmental 
                challenges peculiar to the Sub-Saharan Africa region.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                The fundamental aim of ACE-SPED is to carry out impactful educational research, 
                development, and training activities that address critical energy challenges while 
                building capacity for sustainable development across the continent.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                Through our comprehensive programs, cutting-edge research, and strategic partnerships, 
                we are shaping the future of sustainable energy in Africa and beyond.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl p-8 border border-blue-100 dark:border-blue-800">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-br from-blue-600 to-cyan-600 p-3 rounded-xl mr-4">
                  <Eye className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Our Vision
                </h2>
              </div>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                To establish a regional hub, focused on addressing the energy and power challenges of sub-saharan Africa
                through research, education, and collaboration with sectoral partners.
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-8 border border-green-100 dark:border-green-800">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-br from-green-600 to-emerald-600 p-3 rounded-xl mr-4">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Our Mission
                </h2>
              </div>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                To create a functional, problem-solving Center of Excellence with the capacity to impact meaningfully 
                in power systems and energy development, through knowledge transfer and human capital upgrade.
              </p>
            </div>

            
          </div>
        </div>
      </section>

      {/* Thematic Areas */}
      <section className="py-20 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Thematic Areas
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Our research and training activities focus on five major thematic areas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {thematicAreas.map((area, index) => {
              const Icon = area.icon;
              return (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                >
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${area.color} rounded-xl mb-6`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {area.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {area.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Our Core Values
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div
                  key={index}
                  className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center mb-4">
                    <div className="bg-gradient-to-br from-green-600 to-emerald-600 p-2 rounded-lg mr-4">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {value.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Location & Contact */}
      <section className="py-20 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Visit Us
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                ACE-SPED is located at the University of Nigeria, Nsukka, one of Nigeria's premier 
                institutions of higher learning. We welcome visitors, researchers, and partners 
                from around the world.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-gradient-to-br from-green-600 to-emerald-600 p-3 rounded-lg mr-4 flex-shrink-0">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Address
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      ACE-SPED<br />
                      University of Nigeria, Nsukka<br />
                      Enugu State, Nigeria
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-gradient-to-br from-green-600 to-emerald-600 p-3 rounded-lg mr-4 flex-shrink-0">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Email
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      info@ace-sped.unn.edu.ng
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-gradient-to-br from-green-600 to-emerald-600 p-3 rounded-lg mr-4 flex-shrink-0">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Phone
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      +234 (0) 803 XXX XXXX
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative h-full min-h-[400px]">
              <div className="aspect-square bg-gradient-to-br from-green-900 to-emerald-900 rounded-3xl shadow-2xl flex items-center justify-center overflow-hidden">
                <Image src={Image4} alt="ACE-SPED Location" fill className="object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-br from-green-900 to-emerald-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Join Us in Shaping the Future
          </h2>
          <p className="text-xl text-white/90 mb-8 leading-relaxed">
            Whether you're a student, researcher, or industry partner, there's a place for you at ACE-SPED. 
            Explore our programs, research opportunities, and partnerships.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/programs')}
              className="px-8 py-4 bg-white text-green-900 rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center"
            >
              <BookOpen className="h-5 w-5 mr-2" />
              Explore Programs
            </button>
            <button
              onClick={() => router.push('/research')}
              className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 rounded-xl font-semibold hover:bg-white/20 transition-all flex items-center justify-center"
            >
              <Microscope className="h-5 w-5 mr-2" />
              View Research
            </button>
            <button
              onClick={() => router.push('/services')}
              className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 rounded-xl font-semibold hover:bg-white/20 transition-all flex items-center justify-center"
            >
              <GraduationCap className="h-5 w-5 mr-2" />
              Apply Now
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}