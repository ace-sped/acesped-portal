'use client';

import React, { useState } from 'react';
import Navbar from '../components/navbar/page';
import Footer from '../components/footer/page';
import { Search, Filter, Calendar, User, FileText, Download, ExternalLink, ChevronRight, BookOpen } from 'lucide-react';
import Link from 'next/link';

// Mock Data for Publications
const publicationsData = [
    {
        id: 1,
        title: "Sustainable Energy Solutions for Sub-Saharan Africa: A Comprehensive Review",
        authors: ["Dr. Chioma Nweke", "Prof. Ibrahim Sani", "Engr. David Okafor"],
        year: 2024,
        journal: "Journal of Renewable Energy",
        type: "Journal Article",
        abstract: "This paper explores various sustainable energy strategies tailored for the unique climatic and economic conditions of Sub-Saharan Africa...",
        link: "#",
        download: "#"
    },
    {
        id: 2,
        title: "Optimizing Microgrid Performance using AI-Driven Load Balancing",
        authors: ["Engr. Michael Adebayo", "Dr. Sarah Johnson"],
        year: 2023,
        journal: "IEEE Transactions on Power Systems",
        type: "Conference Paper",
        abstract: "We present a novel approach to load balancing in islanded microgrids using reinforcement learning algorithms to enhance stability...",
        link: "#",
        download: "#"
    },
    {
        id: 3,
        title: "The Impact of Renewable Energy Policy on Rural Electrification in Nigeria",
        authors: ["Prof. Emmanuel Eze", "Chidimma Okonkwo"],
        year: 2023,
        journal: "Energy Policy Review",
        type: "Journal Article",
        abstract: "An analysis of government policies over the last decade and their direct correlation with electrification rates in rural communities...",
        link: "#",
        download: "#"
    },
    {
        id: 4,
        title: "Biofuel Production from Agricultural Waste: A Case Study of Cassava Peels",
        authors: ["Dr. Ahmed Musa", "Bisi Oalanrewaju"],
        year: 2022,
        journal: "International Journal of Biomass & Bioenergy",
        type: "Technical Report",
        abstract: "This study investigates the feasibility and efficiency of converting cassava peels, a common agricultural by-product, into bio-ethanol...",
        link: "#",
        download: "#"
    },
    {
        id: 5,
        title: "Smart Grid Technologies: Challenges and Opportunities for Developing Nations",
        authors: ["Engr. Tunde Bakare", "Prof. Ibrahim Sani"],
        year: 2024,
        journal: "African Journal of Engineering Research",
        type: "Journal Article",
        abstract: "Implementation of smart grid infrastructure faces unique challenges in developing nations including funding, infrastructure, and policy...",
        link: "#",
        download: "#"
    },
    {
        id: 6,
        title: "Solar PV Efficiency Enhancement using Cooling Systems",
        authors: ["Grace Udoh", "Dr. Chioma Nweke"],
        year: 2023,
        journal: "Solar Energy Materials and Solar Cells",
        type: "Conference Paper",
        abstract: "Experimental analysis of passive and active cooling techniques to maintain photovoltaic cell efficiency under high ambient temperatures...",
        link: "#",
        download: "#"
    }
];

const categories = ["All", "Journal Article", "Conference Paper", "Technical Report", "Book Chapter"];

export default function PublicationsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedYear, setSelectedYear] = useState('All');

    // Generate unique years for filter
    const years = ['All', ...Array.from(new Set(publicationsData.map(item => item.year))).sort((a, b) => b - a)];

    const filteredPublications = publicationsData.filter(pub => {
        const matchesSearch = pub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pub.authors.some(author => author.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = selectedCategory === 'All' || pub.type === selectedCategory;
        const matchesYear = selectedYear === 'All' || pub.year.toString() === selectedYear.toString();

        return matchesSearch && matchesCategory && matchesYear;
    });

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-green-800 via-emerald-800 to-teal-900 text-white py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
                {/* Abstract Background Shapes */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
                    <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-green-400/20 blur-3xl mix-blend-screen"></div>
                    <div className="absolute top-1/2 left-1/4 w-72 h-72 rounded-full bg-emerald-400/20 blur-3xl mix-blend-screen animate-pulse"></div>
                    <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-teal-400/20 blur-3xl mix-blend-screen"></div>
                    <div className="absolute -bottom-10 left-1/2 w-64 h-64 rounded-full bg-yellow-400/10 blur-3xl mix-blend-screen"></div>
                </div>

                <div className="relative z-10 max-w-screen-2xl mx-auto text-center">
                    <div className="inline-flex items-center justify-center p-2 bg-emerald-800/50 rounded-full mb-6 backdrop-blur-sm border border-emerald-700/50">
                        <BookOpen className="w-5 h-5 text-emerald-300 mr-2" />
                        <span className="text-sm font-medium text-emerald-100">Research Output & Knowledge Base</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
                        ACE-SPED Publications
                    </h1>
                    <p className="text-lg md:text-xl text-emerald-100 max-w-2xl mx-auto leading-relaxed">
                        Explore our collection of groundbreaking research, journals, and technical reports contributing to sustainable power and energy development in Africa.
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-grow max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">

                {/* Search and Filter Section */}
                <div className="bg-white rounded-2xl shadow-xl p-6 mb-10 -mt-20 relative z-20 border border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        {/* Search Bar */}
                        <div className="md:col-span-6 lg:col-span-7 relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <input
                                type="text"
                                placeholder="Search by title, author, or keyword..."
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Category Filter */}
                        <div className="md:col-span-3 lg:col-span-3">
                            <div className="relative">
                                <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <select
                                    className="w-full pl-10 pr-8 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer"
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                >
                                    {categories.map((cat, idx) => (
                                        <option key={idx} value={cat}>{cat}</option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>

                        {/* Year Filter */}
                        <div className="md:col-span-3 lg:col-span-2">
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <select
                                    className="w-full pl-10 pr-8 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer"
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                >
                                    {years.map((year, idx) => (
                                        <option key={idx} value={year}>{year}</option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results Info */}
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-bold text-gray-800">
                        {searchTerm || selectedCategory !== 'All' || selectedYear !== 'All' ? 'Search Results' : 'Recent Publications'}
                        <span className="ml-2 text-sm font-normal text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            {filteredPublications.length} items
                        </span>
                    </h2>
                </div>

                {/* Publications Grid */}
                <div className="grid grid-cols-1 gap-6">
                    {filteredPublications.length > 0 ? (
                        filteredPublications.map((pub) => (
                            <div key={pub.id} className="group bg-white rounded-xl border border-gray-200 p-6 md:p-8 hover:shadow-lg transition-all duration-300 hover:border-emerald-500/30">
                                <div className="flex flex-col md:flex-row gap-6">

                                    {/* Icon / Thumbnail Box */}
                                    <div className="shrink-0">
                                        <div className="w-16 h-16 md:w-20 md:h-20 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                                            <FileText className="w-8 h-8 md:w-10 md:h-10" />
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-grow">
                                        <div className="flex flex-wrap items-center gap-3 mb-3 text-xs md:text-sm">
                                            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-medium">
                                                {pub.type}
                                            </span>
                                            <span className="flex items-center text-gray-500">
                                                <Calendar className="w-3 h-3 mr-1" />
                                                {pub.year}
                                            </span>
                                            <span className="flex items-center text-gray-500">
                                                <span className="w-1 h-1 bg-gray-300 rounded-full mx-2"></span>
                                                {pub.journal}
                                            </span>
                                        </div>

                                        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 group-hover:text-emerald-700 transition-colors">
                                            <Link href={pub.link} className="hover:underline">
                                                {pub.title}
                                            </Link>
                                        </h3>

                                        <div className="flex items-center gap-2 text-gray-600 mb-4 text-sm">
                                            <User className="w-4 h-4 text-gray-400" />
                                            <span>{pub.authors.join(', ')}</span>
                                        </div>

                                        <p className="text-gray-600 mb-6 leading-relaxed text-sm md:text-base line-clamp-2 md:line-clamp-3">
                                            {pub.abstract}
                                        </p>

                                        <div className="flex flex-wrap gap-4 mt-auto">
                                            <Link
                                                href={pub.link}
                                                className="inline-flex items-center px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                                            >
                                                Read Paper
                                                <ExternalLink className="ml-2 w-4 h-4" />
                                            </Link>
                                            <button className="inline-flex items-center px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors">
                                                Download PDF
                                                <Download className="ml-2 w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 border-dashed">
                            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-1">No publications found</h3>
                            <p className="text-gray-500">Try adjusting your search terms or filters.</p>
                            <button
                                onClick={() => { setSearchTerm(''); setSelectedCategory('All'); setSelectedYear('All'); }}
                                className="mt-4 text-emerald-600 hover:text-emerald-700 font-medium"
                            >
                                Clear all filters
                            </button>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
