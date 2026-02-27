'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Navbar from '../../components/navbar/page';
import Footer from '../../components/footer/page';
import { 
  Microscope, Zap, Lightbulb, Battery, 
  Wind, Sun, Droplets, Gauge, Cpu,
  Settings, TestTube, Beaker, FlaskConical,
  Wrench, Monitor, Database, Cloud,
  Award, Users, BookOpen, Target,
  CheckCircle, ArrowRight, MapPin, Phone, Mail,
  Calendar, Clock, Building2, Shield
} from 'lucide-react';
import Image4 from '@/public/images/lab.jpg';

export default function LaboratoriesPage() {
  const router = useRouter();

  const laboratories = [
    {
      name: 'Power Systems Laboratory',
      description: 'State-of-the-art facility for research and development in electric power generation, transmission, and distribution systems.',
      icon: Zap,
      color: 'from-green-500 to-emerald-500',
      image: '/images/lab.jpg', // Can be replaced with /images/labs/power-systems.jpg
      equipment: [
        'Power system simulators',
        'High-voltage testing equipment',
        'Protection relay test sets',
        'Power quality analyzers',
        'Transformer testing equipment',
        'Switchgear and circuit breakers'
      ],
      researchAreas: [
        'Power system stability and control',
        'Fault analysis and protection',
        'Grid integration of renewable energy',
        'Smart grid technologies',
        'Power quality improvement'
      ],
      capacity: '20 students',
      location: 'Building A, Floor 2'
    },
    {
      name: 'Renewable Energy Laboratory',
      description: 'Comprehensive facility for research in solar, wind, hydro, and waste-to-energy conversion technologies.',
      icon: Sun,
      color: 'from-blue-500 to-cyan-500',
      image: '/images/lab.jpg', // Can be replaced with /images/labs/renewable-energy.jpg
      equipment: [
        'Solar panel test benches',
        'Wind turbine simulators',
        'Battery storage systems',
        'Inverter testing equipment',
        'Energy monitoring systems',
        'Biomass conversion units'
      ],
      researchAreas: [
        'Solar photovoltaic systems',
        'Wind energy conversion',
        'Hydroelectric power',
        'Waste-to-energy processes',
        'Energy storage solutions'
      ],
      capacity: '25 students',
      location: 'Building B, Floor 1'
    },
    {
      name: 'Energy Materials Laboratory',
      description: 'Advanced materials research facility focusing on energy conversion, storage, and sustainable applications.',
      icon: Battery,
      color: 'from-purple-500 to-pink-500',
      image: '/images/lab.jpg', // Can be replaced with /images/labs/energy-materials.jpg
      equipment: [
        'Electrochemical workstations',
        'Material characterization tools',
        'Battery testing systems',
        'X-ray diffractometer',
        'Scanning electron microscope',
        'Thermal analysis equipment'
      ],
      researchAreas: [
        'Battery materials development',
        'Supercapacitor materials',
        'Fuel cell technologies',
        'Nanomaterials for energy',
        'Sustainable material synthesis'
      ],
      capacity: '15 students',
      location: 'Building C, Floor 3'
    },
    {
      name: 'Energy Assessment & Forecasting Lab',
      description: 'Data-driven facility for energy resource assessment, consumption analysis, and forecasting.',
      icon: Gauge,
      color: 'from-orange-500 to-red-500',
      image: '/images/lab.jpg', // Can be replaced with /images/labs/energy-assessment.jpg
      equipment: [
        'Energy monitoring systems',
        'Data acquisition systems',
        'High-performance computing clusters',
        'Statistical analysis software',
        'GIS mapping tools',
        'Weather monitoring stations'
      ],
      researchAreas: [
        'Energy demand forecasting',
        'Resource assessment',
        'Energy consumption patterns',
        'Climate impact analysis',
        'Energy policy modeling'
      ],
      capacity: '30 students',
      location: 'Building A, Floor 3'
    },
    {
      name: 'Smart Grid & Control Laboratory',
      description: 'Cutting-edge facility for smart grid technologies, automation, and intelligent energy management systems.',
      icon: Cpu,
      color: 'from-indigo-500 to-blue-500',
      image: '/images/lab.jpg', // Can be replaced with /images/labs/smart-grid.jpg
      equipment: [
        'Smart grid simulators',
        'SCADA systems',
        'IoT sensors and devices',
        'Communication protocols testbeds',
        'Microgrid controllers',
        'Energy management systems'
      ],
      researchAreas: [
        'Smart grid architecture',
        'Demand response systems',
        'Grid automation',
        'Distributed energy resources',
        'Cybersecurity for power systems'
      ],
      capacity: '20 students',
      location: 'Building B, Floor 2'
    },
    {
      name: 'Power Electronics Laboratory',
      description: 'Specialized facility for power electronics design, testing, and development of conversion systems.',
      icon: Settings,
      color: 'from-teal-500 to-green-500',
      image: '/images/lab.jpg', // Can be replaced with /images/labs/power-electronics.jpg
      equipment: [
        'Power electronics test benches',
        'Oscilloscopes and analyzers',
        'Function generators',
        'Load banks',
        'Power supplies',
        'Prototyping equipment'
      ],
      researchAreas: [
        'Power converters design',
        'Motor drives',
        'Inverter technologies',
        'Power factor correction',
        'EMI/EMC analysis'
      ],
      capacity: '18 students',
      location: 'Building C, Floor 2'
    }
  ];

  const facilities = [
    {
      title: 'Safety & Security',
      description: 'All laboratories are equipped with modern safety systems, emergency protocols, and 24/7 security monitoring.',
      icon: Shield,
      color: 'from-red-500 to-pink-500'
    },
    {
      title: 'Accessibility',
      description: 'Laboratories are accessible to students, researchers, and faculty with flexible scheduling and booking systems.',
      icon: Users,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Modern Equipment',
      description: 'State-of-the-art equipment and instruments maintained to international standards for accurate research.',
      icon: Award,
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Expert Support',
      description: 'Dedicated technical staff and faculty members available to assist with experiments and research projects.',
      icon: BookOpen,
      color: 'from-purple-500 to-pink-500'
    }
  ];

  const stats = [
    { label: 'Laboratories', value: '6+', icon: Building2 },
    { label: 'Equipment Units', value: '200+', icon: Settings },
    { label: 'Research Projects', value: '150+', icon: Target },
    { label: 'Students Served', value: '5,000+', icon: Users },
  ];

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-green-900 to-emerald-900 text-white py-20 overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute inset-0 bg-[url('/images/lab.jpg')] bg-cover bg-center opacity-10"></div>
          <div className="relative max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                ACE-SPED Laboratories
              </h1>
              <p className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto mb-8">
                World-Class Research Facilities for Sustainable Power and Energy Development
              </p>
              <p className="text-lg text-green-200 max-w-2xl mx-auto">
                Equipped with cutting-edge technology and state-of-the-art equipment to support 
                groundbreaking research and innovation in sustainable energy.
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="inline-flex p-3 rounded-full bg-green-100 dark:bg-green-900/20 mb-3">
                      <Icon className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                      {stat.value}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {stat.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Overview Section */}
        <section className="py-16 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Our Laboratory Facilities
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                ACE-SPED houses world-class laboratories designed to support cutting-edge research 
                and development across all thematic areas of sustainable power and energy. Our facilities 
                are equipped with modern equipment and staffed by experienced researchers and technicians.
              </p>
            </div>
          </div>
        </section>

        {/* Laboratories Grid */}
        <section className="py-16 bg-white dark:bg-gray-800">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-12">
              {laboratories.map((lab, index) => {
                const Icon = lab.icon;
                return (
                  <div
                    key={index}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300"
                  >
                    <div className={`h-2 bg-gradient-to-r ${lab.color}`}></div>
                    <div className="p-8">
                      <div className="flex flex-col lg:flex-row gap-8">
                        {/* Image Section */}
                        <div className="lg:w-1/3">
                          <div className="relative h-64 lg:h-full min-h-[300px] rounded-xl overflow-hidden shadow-lg">
                            <Image
                              src={lab.image}
                              alt={lab.name}
                              fill
                              className="object-cover"
                              sizes="(max-width: 1024px) 100vw, 33vw"
                            />
                            <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent`}></div>
                            <div className="absolute bottom-4 left-4 right-4">
                              <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${lab.color} mb-2`}>
                                <Icon className="h-6 w-6 text-white" />
                              </div>
                              <h3 className="text-xl font-bold text-white">
                                {lab.name}
                              </h3>
                            </div>
                          </div>
                        </div>

                        {/* Right Side - Info */}
                        <div className="flex-1">
                          <div className="mb-4">
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {lab.location}
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                Capacity: {lab.capacity}
                              </div>
                            </div>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                            {lab.description}
                          </p>

                          {/* Equipment */}
                          <div className="mb-6">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                              <Settings className="h-5 w-5 mr-2 text-green-600" />
                              Key Equipment
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {lab.equipment.map((item, idx) => (
                                <div key={idx} className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                                  <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 shrink-0" />
                                  {item}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Research Areas */}
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                              <Target className="h-5 w-5 mr-2 text-green-600" />
                              Research Areas
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {lab.researchAreas.map((area, idx) => (
                                <span
                                  key={idx}
                                  className="inline-block px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full text-sm font-medium"
                                >
                                  {area}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Facilities Features */}
        <section className="py-16 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Laboratory Features & Services
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                Our laboratories are designed to provide the best possible environment for research, 
                learning, and innovation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {facilities.map((facility, index) => {
                const Icon = facility.icon;
                return (
                  <div
                    key={index}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${facility.color} mb-4`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {facility.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {facility.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Booking & Access Section */}
        <section className="py-16 bg-white dark:bg-gray-800">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-br from-green-900 to-emerald-900 rounded-2xl p-8 md:p-12 text-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    Laboratory Access & Booking
                  </h2>
                  <p className="text-lg text-green-100 mb-6">
                    Our laboratories are available for use by students, researchers, and faculty members. 
                    Book your slot in advance to ensure availability.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-green-300 mt-1 shrink-0" />
                      <div>
                        <h4 className="font-semibold mb-1">Operating Hours</h4>
                        <p className="text-green-100 text-sm">Monday - Friday: 8:00 AM - 6:00 PM</p>
                        <p className="text-green-100 text-sm">Saturday: 9:00 AM - 2:00 PM</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-green-300 mt-1 shrink-0" />
                      <div>
                        <h4 className="font-semibold mb-1">Access Requirements</h4>
                        <p className="text-green-100 text-sm">Valid student ID or staff identification required</p>
                        <p className="text-green-100 text-sm">Safety training certification for certain laboratories</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-4">Contact Laboratory Services</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-green-300 shrink-0" />
                      <span>+234 803 923 3432</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-green-300 shrink-0" />
                      <span>labs@acespedunn.edu.ng</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-green-300 shrink-0" />
                      <span>ACE-SPED Building, UNN Campus</span>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push('/application')}
                    className="mt-6 w-full px-6 py-3 bg-white text-green-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
                  >
                    Request Laboratory Access
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to Conduct Research?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              Join our research community and leverage our world-class laboratory facilities 
              for your innovative projects.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/application')}
                className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors inline-flex items-center justify-center"
              >
                Apply for Admission
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              <button
                onClick={() => router.push('/research')}
                className="px-8 py-3 border-2 border-green-600 text-green-600 rounded-lg font-semibold hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors inline-flex items-center justify-center"
              >
                Explore Research
                <Microscope className="ml-2 h-5 w-5" />
              </button>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}

