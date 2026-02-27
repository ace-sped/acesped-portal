'use client'

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, ArrowLeft, BookOpen, GraduationCap, Filter, X
} from 'lucide-react';
import Navbar from '@/app/components/navbar/page';
import Footer from '@/app/components/footer/page';

// Comprehensive course data organized by category
const allCourses = [
  // Renewable and New Energy Systems Courses
  { code: 'ACE 611', title: 'Introduction to Renewable and New Energy Technologies', category: 'Renewable Energy', level: 'Masters' },
  { code: 'ACE 711', title: 'Advanced Principles of Renewable and New Energy Technologies', category: 'Renewable Energy', level: 'PhD' },
  { code: 'ACE 612', title: 'Solar Photovoltaics and Wind Technologies', category: 'Renewable Energy', level: 'Masters' },
  { code: 'ACE 712', title: 'Solar PV and Wind Minigrids', category: 'Renewable Energy', level: 'PhD' },
  { code: 'ACE 613', title: 'Solar Thermal Engineering', category: 'Renewable Energy', level: 'Masters' },
  { code: 'ACE 623', title: 'Solar Energy Conversion', category: 'Renewable Energy', level: 'Masters' },
  { code: 'ACE 614', title: 'Bioenergy Engineering', category: 'Renewable Energy', level: 'Masters' },
  { code: 'ACE 714', title: 'Advanced Bioenergy Engineering', category: 'Renewable Energy', level: 'PhD' },
  { code: 'ACE 616', title: 'Hydropower and Geothermal Energy Technologies', category: 'Renewable Energy', level: 'Masters' },
  { code: 'ACE 617', title: 'Nuclear Energy Technology', category: 'Renewable Energy', level: 'Masters' },
  { code: 'ACE 618', title: 'Electrochemical Systems', category: 'Renewable Energy', level: 'Masters' },
  { code: 'ACE 619', title: 'Renewable Energy Financing and Portfolio Standards', category: 'Renewable Energy', level: 'Masters' },
  { code: 'ACE 666', title: 'Development of Renewable Energy Systems (Grid & Non Grid)', category: 'Renewable Energy', level: 'Masters' },
  { code: 'ACE 648', title: 'Energy Storage Technologies', category: 'Renewable Energy', level: 'Masters' },
  
  // Power Engineering Courses
  { code: 'ACE 624', title: 'Power System Analysis II', category: 'Power Engineering', level: 'Masters' },
  { code: 'ACE 625', title: 'Power System Analysis I', category: 'Power Engineering', level: 'Masters' },
  { code: 'ACE 723', title: 'Advanced Power System Analysis', category: 'Power Engineering', level: 'PhD' },
  { code: 'ACE 626', title: 'Power System Plant Design', category: 'Power Engineering', level: 'Masters' },
  { code: 'ACE 722', title: 'Advanced Power System Plant Design', category: 'Power Engineering', level: 'PhD' },
  { code: 'ACE 627', title: 'Power System Monitoring and Protection', category: 'Power Engineering', level: 'Masters' },
  { code: 'ACE 676', title: 'Power Grid Technology and Substation Design', category: 'Power Engineering', level: 'Masters' },
  { code: 'ACE 724', title: 'Advanced Power Grid Technology and Substation Design', category: 'Power Engineering', level: 'PhD' },
  { code: 'ACE 678', title: 'Power Systems Communication and Control', category: 'Power Engineering', level: 'Masters' },
  
  // Sustainable Energy Materials Courses
  { code: 'ACE 631', title: 'Materials for Energy Storage and Conversion', category: 'Energy Materials', level: 'Masters' },
  { code: 'ACE 633', title: 'Materials for Energy Sources', category: 'Energy Materials', level: 'Masters' },
  { code: 'ACE 634', title: 'Industrial Ceramics for Energy Materials', category: 'Energy Materials', level: 'Masters' },
  { code: 'ACE 635', title: 'Computational Materials Science Techniques and Applications', category: 'Energy Materials', level: 'Masters' },
  { code: 'ACE 636', title: 'Electrical, Optical, and Magnetic Properties of Materials', category: 'Energy Materials', level: 'Masters' },
  { code: 'ACE 637', title: 'Principles of Sustainable Energy', category: 'Energy Materials', level: 'Masters' },
  { code: 'ACE 638', title: 'Electrochemical Processing of Materials', category: 'Energy Materials', level: 'Masters' },
  { code: 'ACE 639', title: 'Advanced Materials Characterization Methods', category: 'Energy Materials', level: 'Masters' },
  { code: 'ACE 632', title: 'Nanotechnology and Thin Film Technology', category: 'Energy Materials', level: 'Masters' },
  { code: 'ACE 671', title: 'Nuclear Energy Materials', category: 'Energy Materials', level: 'Masters' },
  { code: 'ACE 732', title: 'Modelling and Simulation of Energy materials', category: 'Energy Materials', level: 'PhD' },
  { code: 'ACE 733', title: 'Experimental Techniques in Sustainable Energy Materials', category: 'Energy Materials', level: 'PhD' },
  { code: 'ACE 674', title: 'Principles of Conducting Polymers', category: 'Energy Materials', level: 'Masters' },
  
  // Industrial Electronics and Power Devices Courses
  { code: 'ACE 641', title: 'Power Semiconductor Devices', category: 'Industrial Electronics', level: 'Masters' },
  { code: 'ACE 642', title: 'Power Electronics Converters and Systems', category: 'Industrial Electronics', level: 'Masters' },
  { code: 'ACE 741', title: 'Advanced Power Electronics Converters and Systems', category: 'Industrial Electronics', level: 'PhD' },
  { code: 'ACE 643', title: 'Modelling of Electric Machines', category: 'Industrial Electronics', level: 'Masters' },
  { code: 'ACE 742', title: 'Advanced Modelling and Control of Electric Machines', category: 'Industrial Electronics', level: 'PhD' },
  { code: 'ACE 644', title: 'Control of Electric Machines', category: 'Industrial Electronics', level: 'Masters' },
  { code: 'ACE 646', title: 'Application of Industrial Electronics in Power and Energy Systems', category: 'Industrial Electronics', level: 'Masters' },
  { code: 'ACE 744', title: 'Advanced Application of Industrial Electronics in Power and Energy systems', category: 'Industrial Electronics', level: 'PhD' },
  { code: 'ACE 640', title: 'Electro-Heating Processes', category: 'Industrial Electronics', level: 'Masters' },
  { code: 'ACE 746', title: 'Advanced Electro-Heating Processes', category: 'Industrial Electronics', level: 'PhD' },
  { code: 'ACE 751', title: 'Advanced Power Electronics and Control', category: 'Industrial Electronics', level: 'PhD' },
  { code: 'ACE 734', title: 'Integrated Microelectronic Devices', category: 'Industrial Electronics', level: 'PhD' },
  { code: 'ACE 670', title: 'Mechatronics and Robotics', category: 'Industrial Electronics', level: 'Masters' },
  
  // Control and Instrumentation Engineering Courses
  { code: 'ACE 651', title: 'Advanced Principles of Control Systems', category: 'Control & Instrumentation', level: 'Masters' },
  { code: 'ACE 652', title: 'Logic Control Circuits in Power Engineering', category: 'Control & Instrumentation', level: 'Masters' },
  { code: 'ACE 653', title: 'Instrumentation and Control for Power Plants', category: 'Control & Instrumentation', level: 'Masters' },
  { code: 'ACE 654', title: 'Smart and Wireless Instrumentation', category: 'Control & Instrumentation', level: 'Masters' },
  { code: 'ACE 655', title: 'Piping and Instrumentation Diagram P&ID', category: 'Control & Instrumentation', level: 'Masters' },
  { code: 'ACE 656', title: 'Instrumentation System Design', category: 'Control & Instrumentation', level: 'Masters' },
  { code: 'ACE 658', title: 'Discrete Time Control System', category: 'Control & Instrumentation', level: 'Masters' },
  { code: 'ACE 754', title: 'Advanced Instrumentation Systems', category: 'Control & Instrumentation', level: 'PhD' },
  { code: 'ACE 752', title: 'Special Topics in Control System Design', category: 'Control & Instrumentation', level: 'PhD' },
  
  // Energy Policy, Regulation and Management Courses
  { code: 'ACE 661', title: 'Energy Resources for Sustainable Development', category: 'Energy Policy', level: 'Masters' },
  { code: 'ACE 662', title: 'Green Energy Policy and Planning', category: 'Energy Policy', level: 'Masters' },
  { code: 'ACE 663', title: 'Introduction to Energy Policy and Analysis', category: 'Energy Policy', level: 'Masters' },
  { code: 'ACE 664', title: 'Market Reforms and Utility Regulation (Legal and Regulatory Provisions)', category: 'Energy Policy', level: 'Masters' },
  { code: 'ACE 665', title: 'Energy Management System and Policy in the Industry', category: 'Energy Policy', level: 'Masters' },
  { code: 'ACE 668', title: 'Case Studies of Energy Incentive Programs (Mini Project)', category: 'Energy Policy', level: 'Masters' },
  { code: 'ACE 686', title: 'Infrastructure Service Procurement', category: 'Energy Policy', level: 'Masters' },
  { code: 'ACE 688', title: 'Fundamentals of Incentive Regulation of Utilities', category: 'Energy Policy', level: 'Masters' },
  
  // Energy Design & Product Development Courses
  { code: 'ACE 601', title: 'Methods of Engineering Design and Systems Analysis', category: 'Energy Design', level: 'Masters' },
  { code: 'ACE 701', title: 'Advanced Methods of Engineering Design and Systems Analysis', category: 'Energy Design', level: 'PhD' },
  { code: 'EDD 614', title: 'Computer Aided Design Engineering & Manufacture', category: 'Energy Design', level: 'Masters' },
  { code: 'EDD 621', title: 'Design of Control Systems Components', category: 'Energy Design', level: 'Masters' },
  { code: 'EDD 623', title: 'Design & Manufacture of Composites', category: 'Energy Design', level: 'Masters' },
  { code: 'ACE 731', title: 'Design and Fabrication of Electromechanical Devices', category: 'Energy Design', level: 'PhD' },
  { code: 'ACE 684', title: 'Direct Energy Conversion', category: 'Energy Design', level: 'Masters' },
  { code: 'ACE 615', title: 'Energy Conversion and Storage Processes', category: 'Energy Design', level: 'Masters' },
  
  // Management of Technology and Innovation Courses
  { code: 'MTI 601', title: 'Methods of Business Design and Innovation', category: 'Technology Management', level: 'PGD' },
  { code: 'MTI 611', title: 'Organizational Behaviour', category: 'Technology Management', level: 'PGD' },
  { code: 'MTI 715', title: 'Advanced Organizational Behaviour', category: 'Technology Management', level: 'Masters' },
  { code: 'MTI 612', title: 'Operations Management', category: 'Technology Management', level: 'PGD' },
  { code: 'MTI 717', title: 'Advanced Operations Management', category: 'Technology Management', level: 'Masters' },
  { code: 'MTI 613', title: 'Economics and Strategies of Technology Management', category: 'Technology Management', level: 'PGD' },
  { code: 'MTI 711', title: 'Advanced Economics and Strategies of Technology Management', category: 'Technology Management', level: 'Masters' },
  { code: 'MTI 614', title: 'Human Resource Management', category: 'Technology Management', level: 'PGD' },
  { code: 'MTI 719', title: 'Advanced Human Resource Management', category: 'Technology Management', level: 'Masters' },
  { code: 'MTI 616', title: 'Financial Analysis for Technology Managers', category: 'Technology Management', level: 'PGD' },
  { code: 'MTI 710', title: 'Advanced Financial Analysis for Technology Managers', category: 'Technology Management', level: 'Masters' },
  { code: 'MTI 618', title: 'Global Innovation', category: 'Technology Management', level: 'PGD' },
  { code: 'MTI 621', title: 'Management of Information and Information Systems', category: 'Technology Management', level: 'PGD' },
  { code: 'MTI 623', title: 'Statistics for Data Analysts', category: 'Technology Management', level: 'PGD' },
  { code: 'MTI 713', title: 'Advanced Statistics for Data Analysts', category: 'Technology Management', level: 'Masters' },
  { code: 'MTI 625', title: 'Digital Strategies and Innovation', category: 'Technology Management', level: 'PGD' },
  { code: 'MTI 627', title: 'Data Visualization for Business Intelligence', category: 'Technology Management', level: 'PGD' },
  { code: 'MTI 629', title: 'Information Security for Managers', category: 'Technology Management', level: 'PGD' },
  { code: 'MTI 633', title: 'Entrepreneurship', category: 'Technology Management', level: 'PGD' },
  { code: 'MTI 634', title: 'Management of Technological Change and Innovation', category: 'Technology Management', level: 'PGD' },
  { code: 'MTI 712', title: 'Advanced Management of Technological Change and Innovation', category: 'Technology Management', level: 'Masters' },
  { code: 'MTI 635', title: 'Digital Business Management', category: 'Technology Management', level: 'PGD' },
  { code: 'MTI 636', title: 'Economies and Strategies for Digital Platform', category: 'Technology Management', level: 'PGD' },
  { code: 'MTI 637', title: 'Marketing of Technology and Innovation', category: 'Technology Management', level: 'PGD' },
  { code: 'MTI 718', title: 'Advanced Marketing of Technology and Innovation', category: 'Technology Management', level: 'Masters' },
  { code: 'MTI 642', title: 'Project Management', category: 'Technology Management', level: 'PGD' },
  { code: 'MTI 714', title: 'Advanced Project Management', category: 'Technology Management', level: 'Masters' },
  { code: 'MTI 644', title: 'Cyber Security', category: 'Technology Management', level: 'PGD' },
  { code: 'MTI 716', title: 'Advanced Cyber Security', category: 'Technology Management', level: 'Masters' },
  { code: 'MTI 646', title: 'People Analytics and Management', category: 'Technology Management', level: 'PGD' },
  
  // Core Engineering Courses
  { code: 'ACE 621', title: 'Advanced Thermodynamics I', category: 'Core Engineering', level: 'Masters' },
  { code: 'ACE 622', title: 'Advanced Thermodynamics II', category: 'Core Engineering', level: 'Masters' },
  { code: 'ACE 721', title: 'Advanced Thermodynamics III', category: 'Core Engineering', level: 'PhD' },
  { code: 'ACE 628', title: 'Advanced Fluid Mechanics', category: 'Core Engineering', level: 'Masters' },
  { code: 'ACE 728', title: 'Advanced Fluid Mechanics II', category: 'Core Engineering', level: 'PhD' },
  { code: 'ACE 682', title: 'Advanced Heat and Mass Transfer', category: 'Core Engineering', level: 'Masters' },
  { code: 'EDD 611', title: 'Production Technology', category: 'Core Engineering', level: 'Masters' },
  { code: 'EDD 612', title: 'Mechanical Properties of Metals & Alloys', category: 'Core Engineering', level: 'Masters' },
  { code: 'EDD 613', title: 'Machine Tool Engineering', category: 'Core Engineering', level: 'Masters' },
  { code: 'EDD 615', title: 'Analysis of Manufacturing Processes and Machines', category: 'Core Engineering', level: 'Masters' },
  { code: 'EDD 616', title: 'Advanced Mechanical Vibrations', category: 'Core Engineering', level: 'Masters' },
  { code: 'EDD 617', title: 'Analytical Methods in Engineering', category: 'Core Engineering', level: 'Masters' },
  { code: 'EDD 622', title: 'Computing and Programming for Engineers', category: 'Core Engineering', level: 'Masters' },
  { code: 'EDD 624', title: 'Advanced Method of Applied Mathematics', category: 'Core Engineering', level: 'Masters' },
  { code: 'EDD 711', title: 'Applied Numerical Methods', category: 'Core Engineering', level: 'PhD' },
  { code: 'EDD 712', title: 'Linear Statistical Models and Multivariate Analysis', category: 'Core Engineering', level: 'PhD' },
  { code: 'EDD 713', title: 'Continuum Mechanics', category: 'Core Engineering', level: 'PhD' },
  { code: 'EDD 714', title: 'Applied Dynamics', category: 'Core Engineering', level: 'PhD' },
  
  // Additive Manufacturing Courses
  { code: 'AMT 0611', title: 'Principle of Additive Manufacturing Processes', category: 'Additive Manufacturing', level: 'Certificate' },
  { code: 'AMT 0612', title: 'Value chain and Economic aspects OF AM', category: 'Additive Manufacturing', level: 'Certificate' },
  { code: 'AMT 0613', title: 'Additive Manufacturing Systems', category: 'Additive Manufacturing', level: 'Certificate' },
  { code: 'AMT 0614', title: 'Quality and Non-destructive Evaluation of Additive Manufacturing', category: 'Additive Manufacturing', level: 'Certificate' },
  { code: 'AMT 0615', title: 'Materials Properties and Metallurgy of Additive Manufacturing', category: 'Additive Manufacturing', level: 'Certificate' },
  { code: 'AMT 0616', title: 'Application, Business and Future of Additive Manufacturing', category: 'Additive Manufacturing', level: 'Certificate' },
  { code: 'AMT 0617', title: 'Simulation for Additive Manufacturing', category: 'Additive Manufacturing', level: 'Certificate' },
  { code: 'AMT 0618', title: 'Legal and Cyber-Security Issues with Additive Manufacturing', category: 'Additive Manufacturing', level: 'Certificate' },
  { code: 'AMT 0619', title: 'Design of Additive Manufacturing', category: 'Additive Manufacturing', level: 'Certificate' },
  { code: 'AMT 0621', title: 'Workshop Practices 1', category: 'Additive Manufacturing', level: 'Certificate' },
  { code: 'AMT 0622', title: 'Workshop Practices II', category: 'Additive Manufacturing', level: 'Certificate' },
  { code: 'ACE 672', title: 'Additive Manufacturing', category: 'Additive Manufacturing', level: 'Masters' },
  
  // Research and Academic Courses
  { code: 'PGC 601', title: 'Research Methodology and ICT in Engineering', category: 'Research', level: 'Masters' },
  { code: 'PGC 701', title: 'Synopsis and Research Grant Writing', category: 'Research', level: 'PhD' },
  { code: 'ACE 603', title: 'Masters Seminar', category: 'Research', level: 'Masters' },
  { code: 'ACE 703', title: 'Doctoral Seminar I', category: 'Research', level: 'PhD' },
  { code: 'ACE 706', title: 'Doctoral Seminar II', category: 'Research', level: 'PhD' },
  { code: 'ACE 602', title: 'Industrial Internship', category: 'Research', level: 'Masters' },
  { code: 'ACE 702', title: 'Industrial Internship', category: 'Research', level: 'PhD' },
  { code: 'ACE 692', title: 'Masters Project', category: 'Research', level: 'Masters' },
  { code: 'ACE 792', title: 'PhD Thesis', category: 'Research', level: 'PhD' },
];

export default function AllCoursesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');

  // Get unique categories and levels
  const categories = ['All', ...Array.from(new Set(allCourses.map(c => c.category)))];
  const levels = ['All', ...Array.from(new Set(allCourses.map(c => c.level)))];

  // Filter and sort courses alphabetically by title
  const filteredCourses = useMemo(() => {
    return allCourses
      .filter(course => {
        const matchesSearch = 
          course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.code.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
        const matchesLevel = selectedLevel === 'All' || course.level === selectedLevel;
        return matchesSearch && matchesCategory && matchesLevel;
      })
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [searchTerm, selectedCategory, selectedLevel]);

  // Group courses by first letter of title
  const groupedCourses = useMemo(() => {
    const groups: Record<string, typeof allCourses> = {};
    filteredCourses.forEach(course => {
      const firstLetter = course.title.charAt(0).toUpperCase();
      if (!groups[firstLetter]) {
        groups[firstLetter] = [];
      }
      groups[firstLetter].push(course);
    });
    return groups;
  }, [filteredCourses]);

  const letters = Object.keys(groupedCourses).sort();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-900 to-emerald-900 text-white py-16">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => router.push('/programs')}
            className="flex items-center text-white/80 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Programs
          </button>

          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 mb-6">
              <BookOpen className="h-6 w-6 mr-2" />
              <span className="font-semibold">A to Z Course Listing</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              All Courses
            </h1>
            <p className="text-xl text-green-100">
              Browse through all {allCourses.length}+ courses offered at ACE-SPED
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-20 z-40">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative md:col-span-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-10 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white appearance-none"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Level Filter */}
            <div className="relative">
              <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white appearance-none"
              >
                {levels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Showing <span className="font-bold text-green-600 dark:text-green-400">{filteredCourses.length}</span> courses
            </p>
          </div>
        </div>
      </section>

      {/* Alphabetical Index */}
      <section className="py-6 bg-gray-100 dark:bg-gray-800/50 sticky top-36 z-30 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-2">
            {letters.map(letter => (
              <a
                key={letter}
                href={`#section-${letter}`}
                className="w-10 h-10 flex items-center justify-center bg-white dark:bg-gray-700 hover:bg-green-600 hover:text-white dark:hover:bg-green-600 rounded-lg font-bold transition-all shadow-sm border border-gray-200 dark:border-gray-600"
              >
                {letter}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Courses Table */}
      <section className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {letters.length > 0 ? (
            <div className="space-y-12">
              {letters.map(letter => (
                <div key={letter} id={`section-${letter}`} className="scroll-mt-48">
                  <div className="flex items-center mb-6">
                    <div className="bg-gradient-to-br from-green-600 to-emerald-600 text-white w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold shadow-lg">
                      {letter}
                    </div>
                    <div className="ml-4">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {letter}
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {groupedCourses[letter].length} {groupedCourses[letter].length === 1 ? 'course' : 'courses'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Table */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                              Course Code
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                              Course Title
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                              Category
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                              Level
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {groupedCourses[letter].map((course, index) => (
                            <tr 
                              key={index}
                              className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex items-center px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-sm font-bold">
                                  {course.code}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-gray-900 dark:text-white font-medium">
                                  {course.title}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-gray-600 dark:text-gray-400 text-sm">
                                  {course.category}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                                  {course.level}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 max-w-md mx-auto">
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  No courses found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Try adjusting your search or filters
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('All');
                    setSelectedLevel('All');
                  }}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

