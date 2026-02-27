'use client';

import React, { useState, useEffect } from 'react';
import { Menu, X, GraduationCap, BookOpen, Users, Search, ChevronDown } from 'lucide-react';
import { FaGraduationCap, FaUsers, FaSearch, FaBookReader, FaRegNewspaper, FaProjectDiagram } from "react-icons/fa";
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false);
  const [isAdmissionOpen, setIsAdmissionOpen] = useState(false);
  const [isMobileAdmissionOpen, setIsMobileAdmissionOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isMobileAboutOpen, setIsMobileAboutOpen] = useState(false);
  const [isApplicationOpen, setIsApplicationOpen] = useState(false);
  const [isMobileApplicationOpen, setIsMobileApplicationOpen] = useState(false);

  // Refs for timeout management
  const admissionTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const servicesTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const aboutTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const applicationTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      // Cleanup timeouts on unmount
      if (admissionTimeoutRef.current) clearTimeout(admissionTimeoutRef.current);
      if (servicesTimeoutRef.current) clearTimeout(servicesTimeoutRef.current);
      if (aboutTimeoutRef.current) clearTimeout(aboutTimeoutRef.current);
      if (applicationTimeoutRef.current) clearTimeout(applicationTimeoutRef.current);
    };
  }, []);

  // Handle admission dropdown with delay
  const handleAdmissionMouseEnter = () => {
    if (admissionTimeoutRef.current) {
      clearTimeout(admissionTimeoutRef.current);
    }
    setIsAdmissionOpen(true);
  };

  const handleAdmissionMouseLeave = () => {
    admissionTimeoutRef.current = setTimeout(() => {
      setIsAdmissionOpen(false);
    }, 200); // 200ms delay before closing
  };

  // Handle services dropdown with delay
  const handleServicesMouseEnter = () => {
    if (servicesTimeoutRef.current) {
      clearTimeout(servicesTimeoutRef.current);
    }
    setIsServicesOpen(true);
  };

  const handleServicesMouseLeave = () => {
    servicesTimeoutRef.current = setTimeout(() => {
      setIsServicesOpen(false);
    }, 200); // 200ms delay before closing
  };

  // Handle about dropdown with delay
  const handleAboutMouseEnter = () => {
    if (aboutTimeoutRef.current) {
      clearTimeout(aboutTimeoutRef.current);
    }
    setIsAboutOpen(true);
  };

  const handleAboutMouseLeave = () => {
    aboutTimeoutRef.current = setTimeout(() => {
      setIsAboutOpen(false);
    }, 200); // 200ms delay before closing
  };

  // Handle application dropdown with delay
  const handleApplicationMouseEnter = () => {
    if (applicationTimeoutRef.current) {
      clearTimeout(applicationTimeoutRef.current);
    }
    setIsApplicationOpen(true);
  };

  const handleApplicationMouseLeave = () => {
    applicationTimeoutRef.current = setTimeout(() => {
      setIsApplicationOpen(false);
    }, 200); // 200ms delay before closing
  };

  const navLinksBeforeAdmission: any[] = [];

  const navLinksAfterServices = [
    { name: 'Projects', href: '/projects', icon: FaProjectDiagram },
    { name: 'Publications', href: '/publications', icon: FaBookReader },
    { name: 'Research', href: '/research', icon: FaSearch },
    { name: 'News', href: '/news', icon: FaRegNewspaper },
  ];

  const admissionDropdown = [
    { name: 'Admission Exercise', href: '/services', onClick: () => router.push('/exercise') },
    { name: 'Admission List', href: '/admission-list', onClick: () => router.push('/admission-list') },
    { name: 'Accept Admission', href: '/acceptance', onClick: () => router.push('/acceptance') },
    { name: 'Admission Letter', href: '/admission-letter', onClick: () => router.push('/admission-letter') },
  ];

  const servicesDropdown = [
    { name: 'All Services', href: '/services', onClick: () => router.push('/services') },
    { name: 'All Programs', href: '/programs', onClick: () => router.push('/programs') },
  ];

  const aboutDropdown = [
    { name: 'About Us', href: '/about', onClick: () => router.push('/about') },
    { name: 'Ace-SPED Laboratories', href: '/about/laboratories', onClick: () => router.push('/about/laboratories') },
    { name: 'DLIs', href: '/about/dis', onClick: () => router.push('/about/dis') },
    { name: 'Our Team', href: '/about/team', onClick: () => router.push('/about/team') },
  ];

  const applicationDropdown = [
    { name: 'MSc/PhD', href: '/application', onClick: () => router.push('/application') },
    { name: 'Certificate', href: '/skill-application', onClick: () => router.push('/skill-application') },
    { name: 'PGD', href: '/application', onClick: () => router.push('/application') },
  ];

  return (
    <nav
      className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
        ? 'bg-white/95 backdrop-blur-md shadow-lg'
        : 'bg-white/90 backdrop-blur-sm shadow-md'
        }`}
    >
      <div className="max-w-screen-2xl mx-auto px-1 sm:px-2 lg:px-1">
        <div className="flex justify-between items-center h-30">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <img src="/images/ace-logo.png" alt="Ace-Sped" className="h-24 w-24 rounded-full object-contain text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-linear-to-r from-green-800 to-emerald-800 bg-clip-text text-transparent">
                ACE-SPED
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {/* About Dropdown */}
            <div
              className="relative"
              onMouseEnter={handleAboutMouseEnter}
              onMouseLeave={handleAboutMouseLeave}
            >
              <button className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors group">
                {/* <FaUsers className="h-4 w-4 group-hover:scale-110 transition-transform" /> */}
                <span className="font-medium">About</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isAboutOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isAboutOpen && (
                <div className="absolute top-full left-0 mt-0 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  {aboutDropdown.map((item) => (
                    item.onClick ? (
                      <button
                        key={item.name}
                        onClick={() => {
                          item.onClick();
                          if (aboutTimeoutRef.current) {
                            clearTimeout(aboutTimeoutRef.current);
                          }
                          setIsAboutOpen(false);
                        }}
                        className="w-full text-left block px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        {item.name}
                      </button>
                    ) : (
                      <a
                        key={item.name}
                        href={item.href}
                        className="block px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        {item.name}
                      </a>
                    )
                  ))}
                </div>
              )}
            </div>

            {/* Admission Dropdown */}
            <div
              className="relative"
              onMouseEnter={handleAdmissionMouseEnter}
              onMouseLeave={handleAdmissionMouseLeave}
            >
              <button className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors group">
                {/* <FaGraduationCap className="h-4 w-4 group-hover:scale-110 transition-transform" /> */}
                <span className="font-medium">Admission</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isAdmissionOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isAdmissionOpen && (
                <div className="absolute top-full left-0 mt-0 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  {admissionDropdown.map((item) => (
                    item.onClick ? (
                      <button
                        key={item.name}
                        onClick={() => {
                          item.onClick();
                          if (admissionTimeoutRef.current) {
                            clearTimeout(admissionTimeoutRef.current);
                          }
                          setIsAdmissionOpen(false);
                        }}
                        className="w-full text-left block px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        {item.name}
                      </button>
                    ) : (
                      <a
                        key={item.name}
                        href={item.href}
                        className="block px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        {item.name}
                      </a>
                    )
                  ))}
                </div>
              )}
            </div>

            {/* Services Dropdown */}
            <div
              className="relative"
              onMouseEnter={handleServicesMouseEnter}
              onMouseLeave={handleServicesMouseLeave}
            >
              <button className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors group">
                {/* <FaBookReader className="h-4 w-4 group-hover:scale-110 transition-transform" /> */}
                <span className="font-medium">Services</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isServicesOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isServicesOpen && (
                <div className="absolute top-full left-0 mt-0 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  {servicesDropdown.map((item) => (
                    item.onClick ? (
                      <button
                        key={item.name}
                        onClick={() => {
                          item.onClick();
                          if (servicesTimeoutRef.current) {
                            clearTimeout(servicesTimeoutRef.current);
                          }
                          setIsServicesOpen(false);
                        }}
                        className="w-full text-left block px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        {item.name}
                      </button>
                    ) : (
                      <a
                        key={item.name}
                        href={item.href}
                        className="block px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        {item.name}
                      </a>
                    )
                  ))}
                </div>
              )}
            </div>

            {/* Links After Services */}
            {navLinksAfterServices.map((link) => {
              const Icon = link.icon;
              if (link.href.startsWith('/')) {
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors group"
                  >
                    {/* <Icon className="h-4 w-4 group-hover:scale-110 transition-transform" /> */}
                    <span className="font-medium">{link.name}</span>
                  </Link>
                );
              }
              return (
                <a
                  key={link.name}
                  href={link.href}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors group"
                >
                  {/* <Icon className="h-4 w-4 group-hover:scale-110 transition-transform" /> */}
                  <span className="font-medium">{link.name}</span>
                </a>
              );
            })}

            {/* Application Dropdown Button */}
            <div
              className="relative ml-4"
              onMouseEnter={handleApplicationMouseEnter}
              onMouseLeave={handleApplicationMouseLeave}
            >
              <button
                className="flex items-center space-x-2 px-6 py-2.5 bg-linear-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all duration-200"
              >
                <span>Application</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isApplicationOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isApplicationOpen && (
                <div className="absolute top-full right-0 mt-0 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  {applicationDropdown.map((item) => (
                    item.onClick ? (
                      <button
                        key={item.name}
                        onClick={() => {
                          item.onClick();
                          if (applicationTimeoutRef.current) {
                            clearTimeout(applicationTimeoutRef.current);
                          }
                          setIsApplicationOpen(false);
                        }}
                        className="w-full text-left block px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        {item.name}
                      </button>
                    ) : (
                      <a
                        key={item.name}
                        href={item.href}
                        className="block px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        {item.name}
                      </a>
                    )
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => router.push('/students/login')}
              className="ml-2 px-6 py-2.5 bg-linear-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              Portal
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden absolute top-20 left-0 right-0 bg-white shadow-lg border-t border-gray-200">
            <div className="px-4 py-6 space-y-3">
              {/* Mobile About Dropdown */}
              <div>
                <button
                  onClick={() => setIsMobileAboutOpen(!isMobileAboutOpen)}
                  className="flex items-center justify-between w-full px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <FaUsers className="h-5 w-5" />
                    <span className="font-medium">About</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isMobileAboutOpen ? 'rotate-180' : ''}`} />
                </button>

                {isMobileAboutOpen && (
                  <div className="mt-2 ml-4 space-y-2">
                    {aboutDropdown.map((item) => (
                      item.onClick ? (
                        <button
                          key={item.name}
                          onClick={() => {
                            item.onClick();
                            setIsOpen(false);
                            setIsMobileAboutOpen(false);
                          }}
                          className="w-full text-left block px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                          {item.name}
                        </button>
                      ) : (
                        <a
                          key={item.name}
                          href={item.href}
                          className="block px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                          onClick={() => {
                            setIsOpen(false);
                            setIsMobileAboutOpen(false);
                          }}
                        >
                          {item.name}
                        </a>
                      )
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Admission Dropdown */}
              <div>
                <button
                  onClick={() => setIsMobileAdmissionOpen(!isMobileAdmissionOpen)}
                  className="flex items-center justify-between w-full px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <FaGraduationCap className="h-5 w-5" />
                    <span className="font-medium">Admission</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isMobileAdmissionOpen ? 'rotate-180' : ''}`} />
                </button>

                {isMobileAdmissionOpen && (
                  <div className="mt-2 ml-4 space-y-2">
                    {admissionDropdown.map((item) => (
                      item.onClick ? (
                        <button
                          key={item.name}
                          onClick={() => {
                            item.onClick();
                            setIsOpen(false);
                            setIsMobileAdmissionOpen(false);
                          }}
                          className="w-full text-left block px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                          {item.name}
                        </button>
                      ) : (
                        <a
                          key={item.name}
                          href={item.href}
                          className="block px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                          onClick={() => {
                            setIsOpen(false);
                            setIsMobileAdmissionOpen(false);
                          }}
                        >
                          {item.name}
                        </a>
                      )
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Services Dropdown */}
              <div>
                <button
                  onClick={() => setIsMobileServicesOpen(!isMobileServicesOpen)}
                  className="flex items-center justify-between w-full px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <FaBookReader className="h-5 w-5" />
                    <span className="font-medium">Services</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isMobileServicesOpen ? 'rotate-180' : ''}`} />
                </button>

                {isMobileServicesOpen && (
                  <div className="mt-2 ml-4 space-y-2">
                    {servicesDropdown.map((item) => (
                      item.onClick ? (
                        <button
                          key={item.name}
                          onClick={() => {
                            item.onClick();
                            setIsOpen(false);
                            setIsMobileServicesOpen(false);
                          }}
                          className="w-full text-left block px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                          {item.name}
                        </button>
                      ) : (
                        <a
                          key={item.name}
                          href={item.href}
                          className="block px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                          onClick={() => {
                            setIsOpen(false);
                            setIsMobileServicesOpen(false);
                          }}
                        >
                          {item.name}
                        </a>
                      )
                    ))}
                  </div>
                )}
              </div>

              {/* Links After Services */}
              {navLinksAfterServices.map((link) => {
                const Icon = link.icon;
                if (link.href.startsWith('/')) {
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{link.name}</span>
                    </Link>
                  );
                }
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{link.name}</span>
                  </a>
                );
              })}

              {/* Mobile Application Dropdown */}
              <div>
                <button
                  onClick={() => setIsMobileApplicationOpen(!isMobileApplicationOpen)}
                  className="flex items-center justify-between w-full px-4 py-3 rounded-lg bg-linear-to-r from-green-600 to-emerald-600 text-white hover:opacity-90 transition-opacity"
                >
                  <span className="font-medium">Application</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isMobileApplicationOpen ? 'rotate-180' : ''}`} />
                </button>

                {isMobileApplicationOpen && (
                  <div className="mt-2 ml-4 space-y-2 border-l-2 border-green-200 pl-2">
                    {applicationDropdown.map((item) => (
                      item.onClick ? (
                        <button
                          key={item.name}
                          onClick={() => {
                            item.onClick();
                            setIsOpen(false);
                            setIsMobileApplicationOpen(false);
                          }}
                          className="w-full text-left block px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                          {item.name}
                        </button>
                      ) : (
                        <a
                          key={item.name}
                          href={item.href}
                          className="block px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                          onClick={() => {
                            setIsOpen(false);
                            setIsMobileApplicationOpen(false);
                          }}
                        >
                          {item.name}
                        </a>
                      )
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  router.push('/students/login');
                  setIsOpen(false);
                }}
                className="w-full px-6 py-3 bg-linear-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
              >
                Portal
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
