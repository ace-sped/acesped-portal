"use client"

import React from 'react';
import { GraduationCap, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram, Youtube, ArrowRight, LogIn } from 'lucide-react';
import { FaWhatsapp } from "react-icons/fa";
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Footer() {
  const router = useRouter();
  const quickLinks = [
    { name: 'About Us', href: '/about' },
    { name: 'Programs', href: '#programs' },
    { name: 'Admissions', href: '#admissions' },
    { name: 'Research', href: '/research' },
    { name: 'Campus Life', href: '#campus' },
    { name: 'Alumni', href: '#alumni' },
  ];

  const resources = [
    { name: 'Student Portal', href: '#portal' },
    { name: 'Library', href: '#library' },
    { name: 'Academic Calendar', href: '#calendar' },
    { name: 'Career Services', href: '#careers' },
    { name: 'Financial Aid', href: '#aid' },
    { name: 'News & Events', href: '#news' },
  ];

  const programs = [
    { name: 'Undergraduate', href: '#undergrad' },
    { name: 'Graduate', href: '#graduate' },
    { name: 'Doctoral', href: '#doctoral' },
    { name: 'Online Learning', href: '#online' },
    { name: 'Continuing Education', href: '#continuing' },
    { name: 'International', href: '#international' },
  ];

  const socialLinks = [
    { icon: FaWhatsapp, href: '#', label: 'WhatsApp' },
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Youtube, href: '#', label: 'YouTube' },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer Content */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-3 group mb-6">
              <div className="relative">
                <img src="/images/ace-logo.png" alt="Ace-Sped" className="h-20 w-20 rounded-full object-contain text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-white">
                  ACE-SPED
                </span>
              </div>
            </Link>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Africa Centre of Excellence for Sustainable Power and Energy Development (ACE-SPED),
              is a World Bank assisted Higher Education Programme located at University of Nigeria Nsukka.
            </p>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm">
                <MapPin className="h-5 w-5 text-green-500 shrink-0" />
                <span>ACE-SPED, University of Nigeria Nsukka</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <Phone className="h-5 w-5 text-green-500 shrink-0" />
                <span>+2348039233432</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <Mail className="h-5 w-5 text-green-500 shrink-0" />
                <span>info@acespedunn.edu.ng</span>
              </div>
              {/* Social Links */}
              <div className="flex space-x-4 mb-4 sm:mb-0 mt-8">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      aria-label={social.label}
                      className="p-2 rounded-lg bg-gray-800 hover:bg-linear-to-r hover:from-green-600 hover:to-emerald-600 transition-all hover:scale-110"
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-green-500 transition-colors flex items-center group"
                  >
                    <ArrowRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 -ml-6 group-hover:ml-0 transition-all" />
                    <span>{link.name}</span>
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <a
                href="https://acespedunn.edu.ng:2096/cpsess4046901288/webmail/jupiter/index.html?mailclient=none"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 hover:shadow-lg hover:scale-105 transition-all duration-200 text-sm"
              >
                <Mail className="h-4 w-4 mr-2" />
                Web Mail
              </a>
            </div>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Resources</h3>
            <ul className="space-y-2">
              {resources.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-green-500 transition-colors flex items-center group"
                  >
                    <ArrowRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 -ml-6 group-hover:ml-0 transition-all" />
                    <span>{link.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Programs */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Programs</h3>
            <ul className="space-y-2">
              {programs.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-green-500 transition-colors flex items-center group"
                  >
                    <ArrowRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 -ml-6 group-hover:ml-0 transition-all" />
                    <span>{link.name}</span>
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => router.push('/login')}
                className="px-6 py-2.5 bg-linear-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Staff Login
              </button>
              <button
                onClick={() => router.push('/lecturer-login')}
                className="px-6 py-2.5 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Lecturer Login
              </button>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="mt-12 pt-10 border-t border-gray-800">
          <div className="max-w-2xl">
            <h3 className="text-white font-bold text-xl mb-3">Stay Connected</h3>
            <p className="text-gray-400 mb-4">
              Subscribe to our newsletter for the latest updates, news, and events.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
              />
              <button className="px-8 py-3 bg-linear-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all duration-200 whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-400">
              © 2025 ACE-SPED. All rights reserved.
            </div>
            <div>
              Powered by <a href="#" target="_blank" rel="noopener noreferrer" className="text-green-500 hover:text-emerald-600">ACE-SPED UNN</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
