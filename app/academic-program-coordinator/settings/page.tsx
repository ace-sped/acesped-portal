"use client"

import React, { useState, useEffect } from 'react';
import RoleLayout from '../../components/shared/RoleLayout';
import {
    User, Lock, Phone, Mail, Save, AlertCircle, Check, Eye, EyeOff, Loader2, Camera, Upload, X
} from 'lucide-react';

interface UserData {
    id: string;
    email: string;
    firstname?: string;
    surname?: string;
    phoneNumber?: string;
    avatar?: string;
    role: string;
}

export default function SettingsPage() {
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Phone number form
    const [phoneNumber, setPhoneNumber] = useState('');
    const [updatingPhone, setUpdatingPhone] = useState(false);

    // Password form
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });
    const [updatingPassword, setUpdatingPassword] = useState(false);

    // Avatar state
    const [avatarPreview, setAvatarPreview] = useState<string>('');
    const [updatingAvatar, setUpdatingAvatar] = useState(false);
    const [showAvatarSave, setShowAvatarSave] = useState(false);

    // Fetch user data on mount
    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const response = await fetch('/api/auth/me');
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.user) {
                    setUser(data.user);
                    setPhoneNumber(data.user.phoneNumber || '');
                }
            }
        } catch (error) {
            console.error('Failed to fetch user data:', error);
        } finally {
            setLoading(false);
        }
    };

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 5000);
    };

    const handleUpdatePhone = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdatingPhone(true);

        try {
            const response = await fetch('/api/user/update-profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumber }),
            });

            const data = await response.json();

            if (data.success) {
                setUser(data.user);
                showMessage('success', 'Phone number updated successfully!');
            } else {
                showMessage('error', data.message || 'Failed to update phone number');
            }
        } catch (error) {
            showMessage('error', 'An error occurred. Please try again.');
        } finally {
            setUpdatingPhone(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdatingPassword(true);

        try {
            const response = await fetch('/api/user/change-password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(passwordData),
            });

            const data = await response.json();

            if (data.success) {
                showMessage('success', 'Password changed successfully!');
                setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                });
            } else {
                showMessage('error', data.message || 'Failed to change password');
            }
        } catch (error) {
            showMessage('error', 'An error occurred. Please try again.');
        } finally {
            setUpdatingPassword(false);
        }

    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                showMessage('error', 'Image size must be less than 2MB');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
                setShowAvatarSave(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveAvatar = async () => {
        setUpdatingAvatar(true);
        try {
            const response = await fetch('/api/user/update-profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ avatar: avatarPreview }),
            });

            const data = await response.json();

            if (data.success) {
                setUser(data.user);
                setAvatarPreview('');
                setShowAvatarSave(false);
                showMessage('success', 'Profile photo updated successfully!');
            } else {
                showMessage('error', data.message || 'Failed to update profile photo');
            }
        } catch (error) {
            showMessage('error', 'An error occurred. Please try again.');
        } finally {
            setUpdatingAvatar(false);
        }
    };

    const clearAvatarSelection = () => {
        setAvatarPreview('');
        setShowAvatarSave(false);
    };

    if (loading) {
        return (
            <RoleLayout
                rolePath="academic-program-coordinator"
                roleDisplayName="Academic Program Coordinator"
                roleColor="indigo"
            >
                <div className="p-8 flex items-center justify-center min-h-screen">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                </div>
            </RoleLayout>
        );
    }

    return (
        <RoleLayout
            rolePath="academic-program-coordinator"
            roleDisplayName="Academic Program Coordinator"
            roleColor="indigo"
        >
            <div className="space-y-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Profile Settings
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Manage your personal information and security preferences
                    </p>
                </div>

                {/* Message Alert */}
                {message && (
                    <div className={`mb-6 p-4 rounded-lg flex items-center ${message.type === 'success'
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                        : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                        }`}>
                        {message.type === 'success' ? (
                            <Check className="h-5 w-5 mr-2 flex-shrink-0" />
                        ) : (
                            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                        )}
                        <span>{message.text}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Profile Info Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                            <div className="text-center">
                                <div className="relative inline-block mb-4">
                                    <div className="relative h-32 w-32 rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-lg mx-auto">
                                        {avatarPreview || user?.avatar ? (
                                            <img
                                                src={avatarPreview || user?.avatar}
                                                alt="Profile"
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="h-full w-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold">
                                                {user?.firstname?.[0]}{user?.surname?.[0]}
                                            </div>
                                        )}
                                    </div>

                                    {/* Upload Button */}
                                    <label
                                        htmlFor="avatar-upload"
                                        className="absolute bottom-1 right-1 p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 cursor-pointer shadow-md transition-colors"
                                        title="Change Profile Photo"
                                    >
                                        <Camera className="h-4 w-4" />
                                        <input
                                            type="file"
                                            id="avatar-upload"
                                            accept="image/*"
                                            onChange={handleAvatarChange}
                                            className="hidden"
                                        />
                                    </label>
                                </div>

                                {showAvatarSave && (
                                    <div className="flex items-center justify-center gap-2 mb-4 animate-fade-in">
                                        <button
                                            onClick={handleSaveAvatar}
                                            disabled={updatingAvatar}
                                            className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors flex items-center"
                                        >
                                            {updatingAvatar ? (
                                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                            ) : (
                                                <Check className="h-3 w-3 mr-1" />
                                            )}
                                            Save
                                        </button>
                                        <button
                                            onClick={clearAvatarSelection}
                                            disabled={updatingAvatar}
                                            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center"
                                        >
                                            <X className="h-3 w-3 mr-1" />
                                            Cancel
                                        </button>
                                    </div>
                                )}

                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                                    {user?.firstname} {user?.surname}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                    {user?.role.replace(/_/g, ' ')}
                                </p>
                                <div className="flex items-center justify-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                                    <Mail className="h-4 w-4 mr-2" />
                                    {user?.email}
                                </div>
                                {user?.phoneNumber && (
                                    <div className="flex items-center justify-center text-sm text-gray-600 dark:text-gray-400">
                                        <Phone className="h-4 w-4 mr-2" />
                                        {user.phoneNumber}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Settings Forms */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Update Phone Number */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                            <div className="flex items-center mb-6">
                                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg mr-3">
                                    <Phone className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                        Update Phone Number
                                    </h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Keep your contact information up to date
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleUpdatePhone}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        placeholder="+234 XXX XXX XXXX"
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={updatingPhone}
                                    className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {updatingPhone ? (
                                        <>
                                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-5 w-5 mr-2" />
                                            Update Phone Number
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* Change Password */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                            <div className="flex items-center mb-6">
                                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg mr-3">
                                    <Lock className="h-6 w-6 text-red-600 dark:text-red-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                        Change Password
                                    </h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Update your password to keep your account secure
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleChangePassword} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Current Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords.current ? "text" : "password"}
                                            value={passwordData.currentPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white pr-12"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                        >
                                            {showPasswords.current ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords.new ? "text" : "password"}
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                            minLength={8}
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white pr-12"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                        >
                                            {showPasswords.new ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        Must be at least 8 characters long
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Confirm New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords.confirm ? "text" : "password"}
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                            minLength={8}
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white pr-12"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                        >
                                            {showPasswords.confirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={updatingPassword}
                                    className="w-full sm:w-auto px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {updatingPassword ? (
                                        <>
                                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <Lock className="h-5 w-5 mr-2" />
                                            Change Password
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </RoleLayout>
    );
}
