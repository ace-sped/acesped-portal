"use client"

import React, { useState, useRef } from 'react';
import CenterLeaderLayout from '../components/CenterLeaderLayout';
import { Search, Printer, FileText, Download, Loader2, ChevronLeft } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';

interface Student {
    id: string;
    name: string;
    matricNumber: string | null;
    program: string;
    gender: string;
}

export default function RecommendationPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Student[]>([]);
    const [searching, setSearching] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [currentUser, setCurrentUser] = useState<{ signature?: string } | null>(null);

    // Fetch current user for signature
    React.useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch('/api/auth/me');
                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        setCurrentUser(data.user);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch user", error);
            }
        };
        fetchUser();
    }, []);

    // Form State
    const [recipientName, setRecipientName] = useState('');
    const [recipientTitle, setRecipientTitle] = useState('');
    const [recipientOrg, setRecipientOrg] = useState('');
    const [recipientAddress, setRecipientAddress] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [customBody, setCustomBody] = useState('');

    const componentRef = useRef<HTMLDivElement>(null);

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        setSearching(true);
        try {
            const response = await fetch(`/api/center-leader/students/search?q=${encodeURIComponent(query)}`);
            const data = await response.json();
            if (data.success) {
                setSearchResults(data.students);
            }
        } catch (error) {
            console.error("Search failed", error);
        } finally {
            setSearching(false);
        }
    };

    const selectStudent = (student: Student) => {
        setSelectedStudent(student);
        setSearchResults([]);
        setSearchQuery('');

        // Set default body content
        const pronouns = student.gender?.toLowerCase() === 'female' ? { sub: 'she', obj: 'her', pos: 'her' } : { sub: 'he', obj: 'him', pos: 'his' };
        const defaultBody = `I am writing to highly recommend ${student.name}, a student in the ${student.program} program at the Africa Centre of Excellence for Sustainable Power and Energy Development (ACE-SPED), University of Nigeria, Nsukka.

${student.name} has consistently demonstrated a strong commitment to academic excellence and research. Throughout ${pronouns.pos} time in the program, ${pronouns.sub} has shown remarkable dedication, intellectual curiosity, and the ability to grasp complex concepts in sustainable power and energy development.

I am confident that ${pronouns.sub} will be a valuable asset to your organization and will continue to uphold the high standards of excellence that ACE-SPED represents.

Please do not hesitate to contact me should you require any further information regarding ${pronouns.pos} candidacy.`;

        setCustomBody(defaultBody);
    };

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `Recommendation_${selectedStudent?.name || 'Letter'}`,
    });

    return (
        <CenterLeaderLayout>
            <style jsx global>{`
                @media print {
                    @page {
                        size: A4;
                        margin: 0;
                    }
                    body {
                        margin: 0;
                        padding: 0;
                    }
                }
            `}</style>
            <div className="p-8 max-w-screen-2xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Recommendation Letter</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Generate endorsed recommendation letters for students</p>
                    </div>
                    {selectedStudent && (
                        <button
                            onClick={() => setSelectedStudent(null)}
                            className="flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Back to Search
                        </button>
                    )}
                </div>

                {!selectedStudent ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-2xl mx-auto text-center">
                        <FileText className="h-16 w-16 mx-auto text-purple-200 mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Select a Student</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">Search for a student to generate a recommendation letter for.</p>

                        <div className="relative max-w-md mx-auto">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-150 ease-in-out sm:text-sm"
                                placeholder="Search by name or matric number..."
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                            {searching && (
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    <Loader2 className="h-5 w-5 text-purple-600 animate-spin" />
                                </div>
                            )}

                            {/* Search Results Dropdown */}
                            {searchResults.length > 0 && (
                                <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto max-h-60 focus:outline-none sm:text-sm text-left">
                                    {searchResults.map((student) => (
                                        <button
                                            key={student.id}
                                            onClick={() => selectStudent(student)}
                                            className="w-full px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 flex flex-col items-start border-b border-gray-100 dark:border-gray-700 last:border-0"
                                        >
                                            <span className="font-medium text-gray-900 dark:text-white">{student.name}</span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {student.matricNumber || 'No Matric'} • {student.program}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Controls */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Letter Details</h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                                        <input
                                            type="date"
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-purple-500 focus:border-purple-500"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Recipient Title</label>
                                            <input
                                                type="text"
                                                value={recipientTitle}
                                                onChange={(e) => setRecipientTitle(e.target.value)}
                                                placeholder="e.g. Prof/Dr/Mr"
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-purple-500 focus:border-purple-500"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Recipient Name</label>
                                            <input
                                                type="text"
                                                value={recipientName}
                                                onChange={(e) => setRecipientName(e.target.value)}
                                                placeholder="e.g. John Doe"
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-purple-500 focus:border-purple-500"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Organization</label>
                                        <input
                                            type="text"
                                            value={recipientOrg}
                                            onChange={(e) => setRecipientOrg(e.target.value)}
                                            placeholder="e.g. Shell Nigeria"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-purple-500 focus:border-purple-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                                        <textarea
                                            value={recipientAddress}
                                            onChange={(e) => setRecipientAddress(e.target.value)}
                                            placeholder="e.g. 123 Main St, Lagos"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-purple-500 focus:border-purple-500 h-20 resize-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Body Content</label>
                                        <textarea
                                            value={customBody}
                                            onChange={(e) => setCustomBody(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-purple-500 focus:border-purple-500 h-48"
                                        />
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <button
                                        onClick={handlePrint}
                                        className="w-full flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                                    >
                                        <Printer className="h-4 w-4 mr-2" />
                                        Print / Save PDF
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Preview */}
                        <div className="lg:col-span-2">
                            <div className="bg-gray-500 p-8 rounded-xl shadow-inner overflow-auto h-[800px] flex items-start justify-center">
                                <div
                                    ref={componentRef}
                                    className="bg-white text-black p-12 shadow-xl shrink-0"
                                    style={{
                                        width: '210mm',
                                        minHeight: '297mm',
                                        fontSize: '12pt',
                                        fontFamily: '"Times New Roman", Times, serif',
                                        lineHeight: '1.5'
                                    }}
                                >
                                    {/* Header */}
                                    <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-green-700">
                                        <img src="/images/ace-logo.png" alt="Logo" className="h-20 w-auto" />
                                        <div className="text-right">
                                            <h1 className="text-xl font-bold text-green-800 uppercase leading-tight">Africa Centre of Excellence for<br />Sustainable Power and Energy Development</h1>
                                            <p className="text-sm font-bold">University of Nigeria, Nsukka</p>
                                            <p className="text-xs text-gray-600">www.ace-sped.unn.edu.ng | info@ace-sped.unn.edu.ng</p>
                                        </div>
                                    </div>

                                    {/* Date */}
                                    <div className="mb-8 text-right">
                                        {new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </div>

                                    {/* Recipient */}
                                    <div className="mb-8">
                                        <p className="font-bold">
                                            {recipientTitle && <span className="mr-1">{recipientTitle}</span>}
                                            {recipientName || '[Recipient Name]'}
                                        </p>
                                        {recipientOrg && <p>{recipientOrg}</p>}
                                        <div className="whitespace-pre-line">{recipientAddress || '[Recipient Address]'}</div>
                                    </div>

                                    {/* Salutation */}
                                    <div className="mb-6">
                                        Dear {recipientName ? recipientName.split(' ').pop() : 'Sir/Madam'},
                                    </div>

                                    {/* Subject */}
                                    <div className="mb-6 font-bold uppercase underline text-center">
                                        LETTER OF RECOMMENDATION FOR {selectedStudent.name.toUpperCase()}
                                    </div>

                                    {/* Body */}
                                    <div className="mb-8 whitespace-pre-wrap text-justify">
                                        {customBody}
                                    </div>

                                    {/* Closing */}
                                    <div className="mt-12">
                                        <p className="mb-4">Sincerely,</p>

                                        {/* Signature Area */}
                                        <div className="h-20 mb-2">
                                            {currentUser?.signature ? (
                                                <img
                                                    src={currentUser.signature}
                                                    className="h-full object-contain"
                                                    alt="Signature"
                                                />
                                            ) : (
                                                <div className="text-gray-400 italic font-cursive text-lg">[Signature]</div>
                                            )}
                                        </div>

                                        <p className="font-bold">Prof. Emenike Ejiogu</p>
                                        <p>Centre Leader, ACE-SPED</p>
                                        <p>University of Nigeria, Nsukka</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </CenterLeaderLayout>
    );
}
