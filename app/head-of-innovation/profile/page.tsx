"use client";

import React, { useState, useEffect } from "react";
import RoleLayout from "../../components/shared/RoleLayout";
import {
  Phone,
  Mail,
  Save,
  AlertCircle,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Camera,
  X,
  Lock,
} from "lucide-react";

interface UserData {
  id: string;
  email: string;
  firstname?: string;
  surname?: string;
  phoneNumber?: string;
  avatar?: string;
  role: string;
}

export default function HeadOfInnovationProfilePage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Phone number form
  const [phoneNumber, setPhoneNumber] = useState("");
  const [updatingPhone, setUpdatingPhone] = useState(false);

  // Password form
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Avatar state
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [updatingAvatar, setUpdatingAvatar] = useState(false);
  const [showAvatarSave, setShowAvatarSave] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          setUser(data.user);
          setPhoneNumber(data.user.phoneNumber || "");
        }
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleUpdatePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingPhone(true);

    try {
      const response = await fetch("/api/user/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        showMessage("success", "Phone number updated successfully!");
      } else {
        showMessage("error", data.message || "Failed to update phone number");
      }
    } catch (error) {
      showMessage("error", "An error occurred. Please try again.");
    } finally {
      setUpdatingPhone(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingPassword(true);

    try {
      const response = await fetch("/api/user/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwordData),
      });

      const data = await response.json();

      if (data.success) {
        showMessage("success", "Password changed successfully!");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        showMessage("error", data.message || "Failed to change password");
      }
    } catch (error) {
      showMessage("error", "An error occurred. Please try again.");
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showMessage("error", "Image size must be less than 2MB");
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
      const response = await fetch("/api/user/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar: avatarPreview }),
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setAvatarPreview("");
        setShowAvatarSave(false);
        showMessage("success", "Profile photo updated successfully!");
      } else {
        showMessage("error", data.message || "Failed to update profile photo");
      }
    } catch (error) {
      showMessage("error", "An error occurred. Please try again.");
    } finally {
      setUpdatingAvatar(false);
    }
  };

  const clearAvatarSelection = () => {
    setAvatarPreview("");
    setShowAvatarSave(false);
  };

  if (loading) {
    return (
      <RoleLayout rolePath="head-of-innovation" roleDisplayName="Head of Innovation" roleColor="indigo">
        <div className="flex min-h-screen items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      </RoleLayout>
    );
  }

  return (
    <RoleLayout rolePath="head-of-innovation" roleDisplayName="Head of Innovation" roleColor="indigo">
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your personal information and security preferences
          </p>
        </div>

        {message && (
          <div
            className={`mb-6 flex items-center rounded-lg p-4 ${
              message.type === "success"
                ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-200"
                : "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-200"
            }`}
          >
            {message.type === "success" ? (
              <Check className="mr-2 h-5 w-5 shrink-0" />
            ) : (
              <AlertCircle className="mr-2 h-5 w-5 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
              <div className="text-center">
                <div className="relative mb-4 inline-block">
                  <div className="relative mx-auto h-32 w-32 overflow-hidden rounded-full border-4 border-white shadow-lg dark:border-gray-700">
                    {avatarPreview || user?.avatar ? (
                      <img src={avatarPreview || user?.avatar} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-indigo-500 to-indigo-600 text-4xl font-bold text-white">
                        {user?.firstname?.[0]}
                        {user?.surname?.[0]}
                      </div>
                    )}
                  </div>

                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-1 right-1 cursor-pointer rounded-full bg-indigo-600 p-2 text-white shadow-md transition-colors hover:bg-indigo-700"
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
                  <div className="mb-4 flex items-center justify-center gap-2 animate-fade-in">
                    <button
                      onClick={handleSaveAvatar}
                      disabled={updatingAvatar}
                      className="flex items-center rounded-md bg-green-600 px-3 py-1 text-sm text-white transition-colors hover:bg-green-700"
                    >
                      {updatingAvatar ? (
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      ) : (
                        <Check className="mr-1 h-3 w-3" />
                      )}
                      Save
                    </button>
                    <button
                      onClick={clearAvatarSelection}
                      disabled={updatingAvatar}
                      className="flex items-center rounded-md bg-gray-200 px-3 py-1 text-sm text-gray-700 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                      <X className="mr-1 h-3 w-3" />
                      Cancel
                    </button>
                  </div>
                )}

                <h3 className="mb-1 text-xl font-bold text-gray-900 dark:text-white">
                  {user?.firstname} {user?.surname}
                </h3>
                <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">{user?.role.replace(/_/g, " ")}</p>
                <div className="mb-2 flex items-center justify-center text-sm text-gray-600 dark:text-gray-400">
                  <Mail className="mr-2 h-4 w-4" />
                  {user?.email}
                </div>
                {user?.phoneNumber && (
                  <div className="flex items-center justify-center text-sm text-gray-600 dark:text-gray-400">
                    <Phone className="mr-2 h-4 w-4" />
                    {user.phoneNumber}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
              <div className="mb-6 flex items-center">
                <div className="mr-3 rounded-lg bg-indigo-100 p-2 dark:bg-indigo-900/30">
                  <Phone className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Update Phone Number</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Keep your contact information up to date
                  </p>
                </div>
              </div>

              <form onSubmit={handleUpdatePhone}>
                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+234 XXX XXX XXXX"
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={updatingPhone}
                  className="flex w-full items-center justify-center rounded-lg bg-indigo-600 px-6 py-3 text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  {updatingPhone ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-5 w-5" />
                      Update Phone Number
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
              <div className="mb-6 flex items-center">
                <div className="mr-3 rounded-lg bg-red-100 p-2 dark:bg-red-900/30">
                  <Lock className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Change Password</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Update your password to keep your account secure
                  </p>
                </div>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, currentPassword: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 pr-12 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      minLength={8}
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 pr-12 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      minLength={8}
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 pr-12 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                  className="flex w-full items-center justify-center rounded-lg bg-red-600 px-6 py-3 text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  {updatingPassword ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-5 w-5" />
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
