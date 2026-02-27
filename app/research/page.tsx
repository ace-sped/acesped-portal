'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Navbar from '../components/navbar/page';
import Footer from '../components/footer/page';
import { 
  Microscope, Lightbulb, Award, TrendingUp, BookOpen, 
  Users, Target, Zap, Globe, FileText, Calendar, 
  ArrowRight, GraduationCap, Briefcase, Star, CheckCircle
} from 'lucide-react';
import Image4 from '@/public/images/lab.jpg';

export default function ResearchPage() {
  const router = useRouter();

  const researchCenters = [
    {
      name: 'Electric Power Systems Development',
      description: 'Advanced research in power generation, transmission, and distribution systems',
      focus: ['Smart Grid Technologies', 'Power System Stability', 'Renewable Energy Integration', 'Grid Modernization'],
      icon: Zap,
      color: 'from-green-500 to-emerald-500',
    },
    {
      name: 'Renewable Energy Systems',
      description: 'Innovation in solar, wind, hydro, and emerging renewable energy technologies',
      focus: ['Solar Photovoltaics', 'Wind Energy Systems', 'Biomass Energy', 'Energy Storage'],
      icon: Lightbulb,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      name: 'Energy Resources Assessment',
      description: 'Comprehensive analysis and forecasting of energy resources and consumption',
      focus: ['Energy Modeling', 'Resource Mapping', 'Demand Forecasting', 'Policy Analysis'],
      icon: Target,
      color: 'from-purple-500 to-pink-500',
    },
    {
      name: 'Sustainable Energy Materials',
      description: 'Development of advanced materials for energy conversion and storage',
      focus: ['Battery Technologies', 'Fuel Cells', 'Solar Cell Materials', 'Nanomaterials'],
      icon: Microscope,
      color: 'from-orange-500 to-red-500',
    },
    {
      name: 'Energy Policy & Management',
      description: 'Research in energy economics, policy formulation, and strategic management',
      focus: ['Energy Economics', 'Regulatory Frameworks', 'Strategic Planning', 'Sustainability'],
      icon: Briefcase,
      color: 'from-indigo-500 to-blue-500',
    },
  ];

  const researchProjects = [
    {
      title: 'Smart Grid Implementation for Rural Electrification',
      description: 'Developing intelligent grid systems to improve electricity access in rural communities',
      status: 'Ongoing',
      funding: '$2.5M',
      duration: '2023-2026',
      researchers: 12,
    },
    {
      title: 'Solar-Powered Microgrids for Off-Grid Communities',
      description: 'Designing and deploying sustainable microgrid solutions for remote areas',
      status: 'Ongoing',
      funding: '$1.8M',
      duration: '2024-2027',
      researchers: 8,
    },
    {
      title: 'Advanced Battery Storage Systems',
      description: 'Research on next-generation battery technologies for renewable energy storage',
      status: 'Ongoing',
      funding: '$3.2M',
      duration: '2023-2026',
      researchers: 15,
    },
    {
      title: 'Energy Efficiency in Industrial Processes',
      description: 'Optimizing energy consumption in manufacturing and industrial operations',
      status: 'Completed',
      funding: '$1.2M',
      duration: '2021-2024',
      researchers: 10,
    },
    {
      title: 'Wind Energy Potential Assessment',
      description: 'Comprehensive study of wind energy resources across Nigeria',
      status: 'Ongoing',
      funding: '$950K',
      duration: '2024-2026',
      researchers: 6,
    },
    {
      title: 'Biomass to Energy Conversion',
      description: 'Developing efficient methods to convert agricultural waste to energy',
      status: 'Ongoing',
      funding: '$1.5M',
      duration: '2023-2025',
      researchers: 9,
    },
  ];

  const publications = [
    {
      title: 'Smart Grid Technologies for Sustainable Energy Distribution',
      authors: 'Dr. John Doe, Dr. Jane Smith, et al.',
      journal: 'IEEE Transactions on Power Systems',
      year: 2024,
      type: 'Journal Article',
    },
    {
      title: 'Renewable Energy Integration in Developing Economies',
      authors: 'Dr. Michael Johnson, Dr. Sarah Williams',
      journal: 'Energy Policy Journal',
      year: 2024,
      type: 'Journal Article',
    },
    {
      title: 'Advanced Materials for Next-Generation Solar Cells',
      authors: 'Dr. Robert Brown, Dr. Emily Davis',
      journal: 'Materials Science & Engineering',
      year: 2023,
      type: 'Journal Article',
    },
    {
      title: 'Energy Storage Solutions for Grid Stability',
      authors: 'Dr. David Wilson, Dr. Lisa Anderson',
      journal: 'Renewable Energy Review',
      year: 2023,
      type: 'Journal Article',
    },
  ];

  const achievements = [
    {
      metric: '500+',
      label: 'Research Projects',
      icon: Microscope,
    },
    {
      metric: '$100M+',
      label: 'Research Funding',
      icon: Award,
    },
    {
      metric: '1,200+',
      label: 'Publications',
      icon: BookOpen,
    },
    {
      metric: '150+',
      label: 'Industry Partners',
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
              Research & Innovation
            </h1>
            <p className="text-xl md:text-2xl text-white/90 leading-relaxed mb-8">
              Advancing sustainable power and energy development through cutting-edge research
            </p>
            <p className="text-lg text-white/80 max-w-3xl mx-auto">
              ACE-SPED is at the forefront of scientific discovery and technological innovation, 
              conducting groundbreaking research that addresses real-world energy challenges and 
              shapes the future of sustainable development.
            </p>
          </div>
        </div>
      </section>

      {/* Research Achievements */}
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

      {/* Research Centers */}
      <section className="py-20 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Research Centers
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Our specialized research centers focus on key areas of sustainable energy development
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {researchCenters.map((center, index) => {
              const Icon = center.icon;
              return (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                >
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${center.color} rounded-xl mb-6`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    {center.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                    {center.description}
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Research Focus:
                    </p>
                    {center.focus.map((item, idx) => (
                      <div key={idx} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Research Projects */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Active Research Projects
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Explore our ongoing and completed research initiatives
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {researchProjects.map((project, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    project.status === 'Ongoing' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                  }`}>
                    {project.status}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {project.duration}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {project.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                  {project.description}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Users className="h-4 w-4 mr-2" />
                    <span>{project.researchers} Researchers</span>
                  </div>
                  <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                    {project.funding}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Publications */}
      <section className="py-20 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Recent Publications
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Our research contributions to the global scientific community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {publications.map((publication, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-full text-xs font-semibold">
                    {publication.type}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {publication.year}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {publication.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {publication.authors}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 italic">
                  {publication.journal}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all flex items-center mx-auto">
              View All Publications
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Research Opportunities */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-green-900 to-emerald-900 rounded-3xl p-12 text-white">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Join Our Research Team
              </h2>
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                Are you passionate about sustainable energy research? Explore opportunities to 
                collaborate with our world-class researchers and contribute to groundbreaking discoveries.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => router.push('/application')}
                  className="px-8 py-4 bg-white text-green-900 rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center"
                >
                  <GraduationCap className="h-5 w-5 mr-2" />
                  Apply for Research Program
                </button>
                <button className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 rounded-xl font-semibold hover:bg-white/20 transition-all flex items-center justify-center">
                  <FileText className="h-5 w-5 mr-2" />
                  View Research Opportunities
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

