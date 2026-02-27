"use client"

import React, { useState } from 'react';
import RoleLayout from '../../components/shared/RoleLayout';
import { Plus, Search, Filter, Edit, Trash2, Folder, MoreVertical, X, Upload, Calendar, Image as ImageIcon, Video } from 'lucide-react';

// Updated Project interface with image
interface Project {
    id: string;
    title: string;
    description?: string;
    lead: string;
    dueDate: string;
    image?: string;
    images?: string[];
    video?: string;
    accessCode?: string;
}

export default function HeadOfInnovationProjects() {
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newProject, setNewProject] = useState<Partial<Project>>({});

    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);

    const fetchProjects = async () => {
        try {
            const response = await fetch('/api/head-of-innovation/projects');
            if (response.ok) {
                const data = await response.json();
                setProjects(data);
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        fetchProjects();
    }, []);

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        try {
            const url = isEditing && editId
                ? `/api/head-of-innovation/projects/${editId}`
                : '/api/head-of-innovation/projects';

            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newProject),
            });

            if (response.ok) {
                await fetchProjects();
                setShowCreateModal(false);
                setNewProject({});
                setIsEditing(false);
                setEditId(null);
            }
        } catch (error) {
            console.error('Error saving project:', error);
        } finally {
            setIsCreating(false);
        }
    };

    const handleEditProject = (project: Project) => {
        setNewProject({
            title: project.title,
            description: project.description,
            lead: project.lead,
            dueDate: project.dueDate.split('T')[0], // Extract date part for input type="date"
            images: project.images || (project.image ? [project.image] : []),
            video: project.video,
            accessCode: project.accessCode
        });
        setEditId(project.id);
        setIsEditing(true);
        setShowCreateModal(true);
    };

    const handleDeleteProject = async (id: string) => {
        if (!confirm('Are you sure you want to delete this project?')) return;

        try {
            const response = await fetch(`/api/head-of-innovation/projects/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setProjects(projects.filter(p => p.id !== id));
            }
        } catch (error) {
            console.error('Error deleting project:', error);
        }
    };

    const [uploading, setUploading] = useState<Record<string, boolean>>({});

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video', index?: number) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Client-side validation
        const maxSize = 500 * 1024 * 1024; // 500MB
        if (file.size > maxSize) {
            alert('File is too large. Maximum size is 500MB.');
            // Reset the input value so the user can select the same file again if they want (though it will fail again)
            // or select a different file.
            e.target.value = '';
            return;
        }

        const key = type === 'image' ? `image-${index}` : 'video';
        setUploading(prev => ({ ...prev, [key]: true }));

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/upload/projects', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                if (type === 'image' && typeof index === 'number') {
                    const currentImages = newProject.images || [];
                    const newImages = [...currentImages];
                    newImages[index - 1] = data.path; // index is 1-based from map
                    setNewProject(prev => ({ ...prev, images: newImages }));
                } else if (type === 'video') {
                    setNewProject(prev => ({ ...prev, video: data.path }));
                }
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.error('Upload failed:', errorData);
                alert(`Upload failed: ${errorData.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Failed to upload file. Please check your connection and try again.');
        } finally {
            setUploading(prev => ({ ...prev, [key]: false }));
            // Reset input value to allow selecting same file again
            e.target.value = '';
        }
    };

    return (
        <RoleLayout
            rolePath="head-of-innovation"
            roleDisplayName="Head of Innovation"
            roleColor="indigo"
        >
            {/* Headers and other UI code omitted for brevity as they are unchanged */}

            <div className="mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Project Management
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Oversee and track innovation projects
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            setIsEditing(false);
                            setNewProject({});
                            setShowCreateModal(true);
                        }}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 duration-200"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        New Project
                    </button>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6 border border-gray-100 dark:border-gray-700">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search projects..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
                        />
                    </div>
                    <div className="flex gap-2">
                        <select className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white">
                            <option value="All">All Status</option>
                            <option value="Active">Active</option>
                            <option value="Completed">Completed</option>
                        </select>
                        <button className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                            <Filter className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Projects Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Project</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Lead</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Due Date</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Access Code</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {projects.map((project) => (
                                <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-16 relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0 border border-gray-200 dark:border-gray-600">
                                                {project.image || (project.images && project.images.length > 0) ? (
                                                    <img
                                                        src={project.image || project.images![0]}
                                                        alt={project.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center w-full h-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500">
                                                        <Folder className="h-6 w-6" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-gray-900 dark:text-white">{project.title}</span>
                                                {project.description && (
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">{project.description}</span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                        {project.lead}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                        {new Date(project.dueDate).toLocaleDateString('en-GB')}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                        {project.accessCode ? (
                                            <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-mono text-xs">
                                                {project.accessCode}
                                            </span>
                                        ) : (
                                            <span className="text-gray-300 dark:text-gray-600 italic">None</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleEditProject(project)}
                                                className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteProject(project.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Project Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {isEditing ? 'Edit Project' : 'Create New Project'}
                            </h2>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                            >
                                <X className="h-6 w-6 text-gray-500" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateProject} className="p-6 space-y-6">
                            {/* Media Upload Section */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                {/* Image Upload slots */}
                                {[1, 2, 3, 4].map((num) => {
                                    const imageSrc = newProject.images?.[num - 1];
                                    const isUploading = uploading[`image-${num}`];

                                    return (
                                        <div key={`img-${num}`} className="space-y-2">
                                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 text-center">
                                                Image {num}
                                            </label>
                                            <div className="aspect-square rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-700/50 cursor-pointer group relative overflow-hidden">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleFileUpload(e, 'image', num)}
                                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                />
                                                {isUploading ? (
                                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                                                ) : imageSrc ? (
                                                    <div className="relative w-full h-full">
                                                        <img
                                                            src={imageSrc}
                                                            alt={`Preview ${num}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <span className="text-white text-xs">Change</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-center p-2 group-hover:scale-105 transition-transform duration-200">
                                                        <ImageIcon className="h-6 w-6 mx-auto text-gray-400 group-hover:text-indigo-500 mb-1" />
                                                        <span className="text-[10px] text-gray-400 group-hover:text-indigo-500">Upload</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Video Upload Slot - Full Width on Mobile */}
                                <div className="col-span-2 md:col-span-4 mt-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Project Video
                                    </label>
                                    <div className="w-full h-32 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-700/50 cursor-pointer group relative overflow-hidden">
                                        <input
                                            type="file"
                                            accept="video/*"
                                            onChange={(e) => handleFileUpload(e, 'video')}
                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                        />
                                        {uploading['video'] ? (
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                        ) : newProject.video ? (
                                            <div className="relative w-full h-full bg-black/90 flex items-center justify-center">
                                                <div
                                                    className="absolute top-2 right-2 z-30 cursor-pointer bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-md transition-colors"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setNewProject(prev => ({ ...prev, video: undefined }));
                                                    }}
                                                    title="Remove video"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </div>
                                                <Video className="h-8 w-8 text-white mb-2" />
                                                <span className="text-white text-xs absolute bottom-2">Video Uploaded</span>
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                    <span className="text-white text-sm">Change Video</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center group-hover:scale-105 transition-transform duration-200">
                                                <Video className="h-8 w-8 mx-auto text-gray-400 group-hover:text-indigo-500 mb-2" />
                                                <span className="text-sm text-gray-500 group-hover:text-indigo-500 font-medium">Upload Project Video</span>
                                                <p className="text-xs text-gray-400 mt-1">MP4, WebM up to 50MB</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Project Title *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={newProject.title || ''}
                                        onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
                                        placeholder="e.g. AI Research Initiative"
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Project Description
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={newProject.description || ''}
                                        onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white resize-none"
                                        placeholder="Briefly describe the project goals and scope..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Project Lead *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={newProject.lead || ''}
                                        onChange={(e) => setNewProject({ ...newProject, lead: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
                                        placeholder="Name of project lead"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Access Code
                                    </label>
                                    <input
                                        type="text"
                                        value={newProject.accessCode || ''}
                                        onChange={(e) => setNewProject({ ...newProject, accessCode: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
                                        placeholder="Optional access code"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Due Date
                                    </label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <input
                                            type="date"
                                            value={newProject.dueDate || ''}
                                            onChange={(e) => setNewProject({ ...newProject, dueDate: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-gray-800 pb-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreating}
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isCreating ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="h-4 w-4 mr-2" />
                                            {isEditing ? 'Update Project' : 'Create Project'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </RoleLayout>
    );
}
