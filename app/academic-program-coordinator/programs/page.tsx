"use client"

import React, { useState, useEffect } from 'react';
import RoleLayout from '../../components/shared/RoleLayout';
import { 
  BookOpen, Plus, Search, Edit, Trash2, Eye, 
  X, Check, AlertCircle, Filter, ChevronDown, Minus
} from 'lucide-react';

interface Program {
  id: string;
  title: string;
  slug: string;
  level?: string;
  duration?: string | null;
  studyMode?: string | null;
  fee?: string | null;
  brochure?: string | null;
  overview?: string;
  objectives?: any;
  curriculum?: any;
  requirements?: any;
  careerPaths?: any;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  courses?: any[];
  service?: {
    id: string;
    title: string;
    slug: string;
  } | null;
  headOfProgram?: {
    id: string;
    email: string;
    firstname: string | null;
    surname: string | null;
  } | null;
}

interface Service {
  id: string;
  title: string;
  slug: string;
}

interface User {
  id: string;
  email: string;
  firstname: string | null;
  surname: string | null;
}

export default function ProgramsManagement() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [filteredPrograms, setFilteredPrograms] = useState<Program[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [headOfProgramUsers, setHeadOfProgramUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    level: 'CERTIFICATE',
    duration: '',
    studyMode: '',
    fee: '',
    brochure: '',
    overview: '',
    serviceId: '',
    headOfProgramId: '',
    objectives: [] as string[],
    curriculum: [] as string[],
    requirements: [] as string[],
    careerPaths: [] as string[],
    displayOrder: 0,
    isActive: true,
  });
  const [objectiveInput, setObjectiveInput] = useState('');
  const [curriculumInput, setCurriculumInput] = useState('');
  const [requirementInput, setRequirementInput] = useState('');
  const [careerPathInput, setCareerPathInput] = useState('');
  const [brochureFile, setBrochureFile] = useState<File | null>(null);
  const [brochureFileName, setBrochureFileName] = useState<string>('');

  useEffect(() => {
    fetchPrograms();
    fetchServices();
    fetchHeadOfProgramUsers();
  }, []);

  useEffect(() => {
    filterPrograms();
  }, [searchTerm, programs]);

  const fetchPrograms = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/programs');
      const data = await response.json();
      if (data.success) {
        setPrograms(data.programs);
      } else {
        showMessage('error', 'Failed to fetch programs');
      }
    } catch (error) {
      showMessage('error', 'Error fetching programs');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/admin/services');
      if (!response.ok) {
        throw new Error(`Failed to fetch services: ${response.status}`);
      }
      const data = await response.json();
      if (data.success && data.services) {
        // Filter only active services for the dropdown
        const activeServices = data.services.filter((service: any) => service.isActive === true);
        setServices(activeServices || []);
      } else {
        console.error('Failed to fetch services:', data.message);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      // Don't show error message as it's not critical for form functionality
    }
  };

  const fetchHeadOfProgramUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`);
      }
      const data = await response.json();
      if (data.success && data.users) {
        // Include all users in the dropdown, but show Head_of_Program-role users first
        const users: any[] = data.users || [];
        const sorted = [...users].sort((a, b) => {
          const aIsHead = a.role === 'Head_of_Program';
          const bIsHead = b.role === 'Head_of_Program';
          if (aIsHead === bIsHead) return 0;
          return aIsHead ? -1 : 1;
        });
        setHeadOfProgramUsers(sorted);
      } else {
        console.error('Failed to fetch users:', data.message);
      }
    } catch (error) {
      console.error('Error fetching Head of Program users:', error);
      // Don't show error message as it's not critical for form functionality
    }
  };

  const filterPrograms = () => {
    let filtered = programs;

    if (searchTerm) {
      filtered = filtered.filter(program => 
        program.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        program.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (program.level && program.level.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredPrograms(filtered);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleCreateProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all required fields
    if (!formData.title || !formData.slug || !formData.level || !formData.overview) {
      showMessage('error', 'Please fill in all required fields (Title, Slug, Level, Overview)');
      return;
    }
    
    if (!formData.serviceId) {
      showMessage('error', 'Please select a service');
      return;
    }
    
    if (!formData.duration) {
      showMessage('error', 'Please enter a duration');
      return;
    }
    
    if (!formData.studyMode) {
      showMessage('error', 'Please select a study mode');
      return;
    }
    
    if (!formData.fee) {
      showMessage('error', 'Please enter a fee');
      return;
    }
    
    if (!formData.brochure) {
      showMessage('error', 'Please upload a brochure');
      return;
    }
    
    if (formData.objectives.length === 0) {
      showMessage('error', 'Please add at least one learning objective');
      return;
    }
    
    if (formData.curriculum.length === 0) {
      showMessage('error', 'Please add at least one curriculum module');
      return;
    }
    
    if (formData.requirements.length === 0) {
      showMessage('error', 'Please add at least one requirement');
      return;
    }
    
    if (formData.careerPaths.length === 0) {
      showMessage('error', 'Please add at least one career path');
      return;
    }
    
    setLoading(true);

    try {
      const slug = formData.slug || generateSlug(formData.title);
      const response = await fetch('/api/admin/programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          slug,
          level: formData.level,
          duration: formData.duration,
          studyMode: formData.studyMode,
          fee: formData.fee,
          brochure: formData.brochure,
          overview: formData.overview,
          objectives: formData.objectives,
          curriculum: formData.curriculum,
          requirements: formData.requirements,
          careerPaths: formData.careerPaths,
          serviceId: formData.serviceId,
          headOfProgramId: formData.headOfProgramId || null,
          displayOrder: formData.displayOrder,
          isActive: formData.isActive,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText || `HTTP ${response.status}: ${response.statusText}` };
        }
        throw new Error(errorData.message || `Failed to create program: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        showMessage('success', 'Program created successfully');
        setShowCreateModal(false);
        fetchPrograms();
        resetForm();
      } else {
        const errorMsg = data.error || data.message || 'Failed to create program';
        const details = data.details ? ` Details: ${JSON.stringify(data.details)}` : '';
        showMessage('error', `${errorMsg}${details}`);
        console.error('API Error:', data);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error creating program';
      showMessage('error', errorMessage);
      console.error('Error creating program:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProgram) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/admin/programs/${selectedProgram.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          slug: formData.slug,
          level: formData.level,
          duration: formData.duration || null,
          studyMode: formData.studyMode || null,
          fee: formData.fee || null,
          brochure: formData.brochure || null,
          overview: formData.overview,
          objectives: formData.objectives.length > 0 ? formData.objectives : [],
          curriculum: formData.curriculum.length > 0 ? formData.curriculum : [],
          requirements: formData.requirements.length > 0 ? formData.requirements : [],
          careerPaths: formData.careerPaths.length > 0 ? formData.careerPaths : [],
          serviceId: formData.serviceId || null,
          headOfProgramId: formData.headOfProgramId || null,
          displayOrder: formData.displayOrder,
          isActive: formData.isActive,
        }),
      });

      const data = await response.json();

      if (data.success) {
        showMessage('success', 'Program updated successfully');
        setShowEditModal(false);
        fetchPrograms();
        resetForm();
      } else {
        showMessage('error', data.message || 'Failed to update program');
      }
    } catch (error) {
      showMessage('error', 'Error updating program');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProgram = async () => {
    if (!selectedProgram) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/admin/programs/${selectedProgram.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        showMessage('success', 'Program deleted successfully');
        setShowDeleteModal(false);
        fetchPrograms();
      } else {
        showMessage('error', data.message || 'Failed to delete program');
      }
    } catch (error) {
      showMessage('error', 'Error deleting program');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (program: Program) => {
    setSelectedProgram(program);
    const objectives = (program as any).objectives;
    const curriculum = (program as any).curriculum;
    const requirements = (program as any).requirements;
    const careerPaths = (program as any).careerPaths;
    
    setFormData({
      title: program.title || '',
      slug: program.slug || '',
      level: (program as any).level || 'CERTIFICATE',
      duration: (program as any).duration || '',
      studyMode: (program as any).studyMode || '',
      fee: (program as any).fee || '',
      brochure: (program as any).brochure || '',
      overview: (program as any).overview || '',
      serviceId: (program as any).serviceId || '',
      headOfProgramId: (program as any).headOfProgramId || '',
      objectives: Array.isArray(objectives) ? objectives : [],
      curriculum: Array.isArray(curriculum) ? curriculum : [],
      requirements: Array.isArray(requirements) ? requirements : [],
      careerPaths: Array.isArray(careerPaths) ? careerPaths : [],
      displayOrder: program.displayOrder || 0,
      isActive: program.isActive,
    });
    setObjectiveInput('');
    setCurriculumInput('');
    setRequirementInput('');
    setCareerPathInput('');
    setBrochureFile(null);
    setBrochureFileName((program as any).brochure ? 'Current brochure' : '');
    setShowEditModal(true);
  };

  const openDeleteModal = (program: Program) => {
    setSelectedProgram(program);
    setShowDeleteModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      level: 'CERTIFICATE',
      duration: '',
      studyMode: '',
      fee: '',
      brochure: '',
      overview: '',
      serviceId: '',
      headOfProgramId: '',
      objectives: [],
      curriculum: [],
      requirements: [],
      careerPaths: [],
      displayOrder: 0,
      isActive: true,
    });
    setObjectiveInput('');
    setCurriculumInput('');
    setRequirementInput('');
    setCareerPathInput('');
    setBrochureFile(null);
    setBrochureFileName('');
    setSelectedProgram(null);
  };

  // Helper function to convert textarea string to JSON array
  const textToJsonArray = (text: string): string[] => {
    if (!text.trim()) return [];
    return text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  };

  // Helper function to convert JSON array to textarea string
  const jsonArrayToText = (arr: any): string => {
    if (!arr) return '';
    if (Array.isArray(arr)) {
      return arr.join('\n');
    }
    return '';
  };

  // Handle adding objective
  const addObjective = () => {
    const trimmed = objectiveInput.trim();
    if (trimmed && !formData.objectives.includes(trimmed)) {
      setFormData({
        ...formData,
        objectives: [...formData.objectives, trimmed],
      });
      setObjectiveInput('');
    }
  };

  // Handle removing objective
  const removeObjective = (index: number) => {
    setFormData({
      ...formData,
      objectives: formData.objectives.filter((_, i) => i !== index),
    });
  };

  // Handle Enter key press for objectives
  const handleObjectiveKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addObjective();
    }
  };

  // Handle adding curriculum module
  const addCurriculum = () => {
    const trimmed = curriculumInput.trim();
    if (trimmed && !formData.curriculum.includes(trimmed)) {
      setFormData({
        ...formData,
        curriculum: [...formData.curriculum, trimmed],
      });
      setCurriculumInput('');
    }
  };

  // Handle removing curriculum module
  const removeCurriculum = (index: number) => {
    setFormData({
      ...formData,
      curriculum: formData.curriculum.filter((_, i) => i !== index),
    });
  };

  // Handle Enter key press for curriculum
  const handleCurriculumKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCurriculum();
    }
  };

  // Handle adding requirement
  const addRequirement = () => {
    const trimmed = requirementInput.trim();
    if (trimmed && !formData.requirements.includes(trimmed)) {
      setFormData({
        ...formData,
        requirements: [...formData.requirements, trimmed],
      });
      setRequirementInput('');
    }
  };

  // Handle removing requirement
  const removeRequirement = (index: number) => {
    setFormData({
      ...formData,
      requirements: formData.requirements.filter((_, i) => i !== index),
    });
  };

  // Handle Enter key press for requirements
  const handleRequirementKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addRequirement();
    }
  };

  // Handle adding career path
  const addCareerPath = () => {
    const trimmed = careerPathInput.trim();
    if (trimmed && !formData.careerPaths.includes(trimmed)) {
      setFormData({
        ...formData,
        careerPaths: [...formData.careerPaths, trimmed],
      });
      setCareerPathInput('');
    }
  };

  // Handle removing career path
  const removeCareerPath = (index: number) => {
    setFormData({
      ...formData,
      careerPaths: formData.careerPaths.filter((_, i) => i !== index),
    });
  };

  // Handle Enter key press for career paths
  const handleCareerPathKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCareerPath();
    }
  };

  // Handle brochure file upload
  const handleBrochureUpload = async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload/brochure', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        return data.path;
      } else {
        throw new Error(data.message || 'Failed to upload brochure');
      }
    } catch (error) {
      console.error('Error uploading brochure:', error);
      // Fallback to base64 if upload fails
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleBrochureFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBrochureFile(file);
      setBrochureFileName(file.name);
      // Upload file immediately
      const uploadedPath = await handleBrochureUpload(file);
      setFormData({ ...formData, brochure: uploadedPath });
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };


  return (
    <RoleLayout 
      rolePath="academic-program-coordinator" 
      roleDisplayName="Academic Program Coordinator" 
      roleColor="indigo"
    >
      <div className="p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Manage Programs
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Create, edit, and manage academic programs
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Program
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center ${
            message.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300' 
              : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'
          }`}>
            {message.type === 'success' ? (
              <Check className="h-5 w-5 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-2" />
            )}
            {message.text}
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search programs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Programs Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Title</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Service</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Head of Program</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Level</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">
                      Loading...
                    </td>
                  </tr>
                ) : filteredPrograms.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No programs found
                    </td>
                  </tr>
                ) : (
                  filteredPrograms.map((program) => (
                    <tr key={program.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="py-4 px-6">
                        <div className="font-medium text-gray-900 dark:text-white">{program.title}</div>
                        {program.duration && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">{program.duration}</div>
                        )}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                        {program.service?.title || 'N/A'}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                        {program.headOfProgram
                          ? `${program.headOfProgram.firstname || ''} ${program.headOfProgram.surname || ''}`.trim() ||
                            program.headOfProgram.email
                          : 'Not set'}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                        {program.level ? program.level.replace(/_/g, ' ') : 'N/A'}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          program.isActive 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        }`}>
                          {program.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openEditModal(program)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(program)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create/Edit Modal */}
        {(showCreateModal || showEditModal) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {showCreateModal ? 'Create Program' : 'Edit Program'}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={showCreateModal ? handleCreateProgram : handleUpdateProgram} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => {
                        setFormData({ ...formData, title: e.target.value });
                        if (!formData.slug || formData.slug === generateSlug(formData.title)) {
                          setFormData({ ...formData, title: e.target.value, slug: generateSlug(e.target.value) });
                        } else {
                          setFormData({ ...formData, title: e.target.value });
                        }
                      }}
                      className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Slug *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Level *
                    </label>
                    <select
                      required
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                      className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                    >
                      <option value="CERTIFICATE">Certificate</option>
                      <option value="DIPLOMA">Diploma</option>
                      <option value="BACHELORS">Bachelors</option>
                      <option value="MASTERS">Masters</option>
                      <option value="PHD">Ph.D</option>
                      <option value="MASTERS_AND_PHD">Masters & Ph.D</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Service *
                    </label>
                    <select
                      required
                      value={formData.serviceId}
                      onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                      className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                    >
                      <option value="">Select a Service</option>
                      {services.map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Head of Program
                    </label>
                    <select
                      value={formData.headOfProgramId}
                      onChange={(e) => setFormData({ ...formData, headOfProgramId: e.target.value })}
                      className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                    >
                      <option value="">Select Head of Program (Optional)</option>
                      {headOfProgramUsers.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.firstname && user.surname 
                            ? `${user.firstname} ${user.surname} (${user.email})`
                            : user.email}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Duration *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      placeholder="e.g., 6 Months, 18-24 Months"
                      className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Study Mode *
                    </label>
                    <select
                      required
                      value={formData.studyMode}
                      onChange={(e) => setFormData({ ...formData, studyMode: e.target.value })}
                      className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                    >
                      <option value="">Select Study Mode</option>
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Online">Online</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="Full-time / Part-time">Full-time / Part-time</option>
                      <option value="Full-time / Part-time / Online">Full-time / Part-time / Online</option>
                      <option value="Full-time / Online">Full-time / Online</option>
                      <option value="Part-time / Online">Part-time / Online</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Fee *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fee}
                      onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                      placeholder="E.g: 150,000"
                      className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Upload Brochure *
                    </label>
                    <input
                      type="file"
                      required={!formData.brochure}
                      accept=".pdf,.doc,.docx"
                      onChange={handleBrochureFileChange}
                      className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 dark:file:bg-green-900/20 dark:file:text-green-300"
                    />
                    {brochureFileName && (
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Selected: {brochureFileName}
                      </p>
                    )}
                    {formData.brochure && !brochureFile && (
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Current brochure: {formData.brochure.substring(0, 50)}...
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Display Order
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.displayOrder}
                      onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                      className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Lower numbers appear first. Use this to control the order programs are displayed.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Overview *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.overview}
                    onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
                    placeholder="Program overview and description"
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Learning Objectives * <span className="text-xs text-gray-500">(At least one required)</span>
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={objectiveInput}
                      onChange={(e) => setObjectiveInput(e.target.value)}
                      onKeyPress={handleObjectiveKeyPress}
                      placeholder="Type an objective and press Enter or click Add"
                      className="flex-1 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={addObjective}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {formData.objectives.map((objective, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <span className="flex-1 text-sm text-gray-900 dark:text-white">{objective}</span>
                        <button
                          type="button"
                          onClick={() => removeObjective(index)}
                          className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors flex-shrink-0"
                          title="Remove objective"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    {formData.objectives.length === 0 && (
                      <p className="col-span-full text-sm text-gray-500 dark:text-gray-400 italic">
                        No objectives added yet. Type an objective above and press Enter or click Add.
                      </p>
                    )}
                  </div>
                </div>

                {/* Curriculum Modules */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Curriculum Modules * <span className="text-xs text-gray-500">(At least one required)</span>
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={curriculumInput}
                      onChange={(e) => setCurriculumInput(e.target.value)}
                      onKeyPress={handleCurriculumKeyPress}
                      placeholder="Type a module and press Enter or click Add"
                      className="flex-1 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={addCurriculum}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {formData.curriculum.map((module, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <span className="flex-1 text-sm text-gray-900 dark:text-white">{module}</span>
                        <button
                          type="button"
                          onClick={() => removeCurriculum(index)}
                          className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors flex-shrink-0"
                          title="Remove module"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    {formData.curriculum.length === 0 && (
                      <p className="col-span-full text-sm text-gray-500 dark:text-gray-400 italic">
                        No modules added yet. Type a module above and press Enter or click Add.
                      </p>
                    )}
                  </div>
                </div>

                {/* Requirements */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Requirements * <span className="text-xs text-gray-500">(At least one required)</span>
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={requirementInput}
                      onChange={(e) => setRequirementInput(e.target.value)}
                      onKeyPress={handleRequirementKeyPress}
                      placeholder="Type a requirement and press Enter or click Add"
                      className="flex-1 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={addRequirement}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {formData.requirements.map((requirement, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <span className="flex-1 text-sm text-gray-900 dark:text-white">{requirement}</span>
                        <button
                          type="button"
                          onClick={() => removeRequirement(index)}
                          className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors flex-shrink-0"
                          title="Remove requirement"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    {formData.requirements.length === 0 && (
                      <p className="col-span-full text-sm text-gray-500 dark:text-gray-400 italic">
                        No requirements added yet. Type a requirement above and press Enter or click Add.
                      </p>
                    )}
                  </div>
                </div>

                {/* Career Paths */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Career Paths * <span className="text-xs text-gray-500">(At least one required)</span>
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={careerPathInput}
                      onChange={(e) => setCareerPathInput(e.target.value)}
                      onKeyPress={handleCareerPathKeyPress}
                      placeholder="Type a career path and press Enter or click Add"
                      className="flex-1 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={addCareerPath}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {formData.careerPaths.map((path, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <span className="flex-1 text-sm text-gray-900 dark:text-white">{path}</span>
                        <button
                          type="button"
                          onClick={() => removeCareerPath(index)}
                          className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors flex-shrink-0"
                          title="Remove career path"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    {formData.careerPaths.length === 0 && (
                      <p className="col-span-full text-sm text-gray-500 dark:text-gray-400 italic">
                        No career paths added yet. Type a career path above and press Enter or click Add.
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Active
                  </label>
                </div>

                <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setShowEditModal(false);
                      resetForm();
                    }}
                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : showCreateModal ? 'Create Program' : 'Update Program'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && selectedProgram && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Delete Program
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete "{selectedProgram.title}"? This action cannot be undone and will also delete all associated courses.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteProgram}
                  disabled={loading}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleLayout>
  );
}




