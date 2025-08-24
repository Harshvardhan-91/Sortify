"use client";

import React, { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Mail,
  Calendar,
  Shield,
  Bell,
  Archive,
  Trash2,
  Download,
  Settings,
  ArrowLeft,
  Camera,
  Save,
  X,
} from "lucide-react";
import { Button } from "@repo/ui/button";
import Image from "next/image";

interface UserStats {
  totalFiles: number;
  totalStorage: string;
  filesThisMonth: number;
  aiProcessedFiles: number;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [userStats] = useState<UserStats>({
    totalFiles: 0,
    totalStorage: "0 MB",
    filesThisMonth: 0,
    aiProcessedFiles: 0,
  });

  const [profileData, setProfileData] = useState({
    displayName: session?.user?.name || "",
    email: session?.user?.email || "",
    bio: "",
    location: "",
    website: "",
  });

  const handleSaveProfile = () => {
    // Here you would call your API to update the profile
    console.log("Saving profile:", profileData);
    setIsEditing(false);
  };

  const handleDeleteAccount = () => {
    if (
      confirm(
        "Are you sure you want to delete your account? This action cannot be undone.",
      )
    ) {
      // Here you would call your API to delete the account
      console.log("Deleting account");
    }
  };

  const handleExportData = () => {
    // Here you would call your API to export user data
    console.log("Exporting user data");
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Please sign in
          </h1>
          <Button onClick={() => router.push("/auth/signin")}>Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.push("/dashboard")}
                className="p-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">Profile</h1>
            </div>
            <Button
              onClick={() => router.push("/settings")}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Cover & Avatar */}
              <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 relative">
                <div className="absolute -bottom-16 left-6">
                  <div className="relative">
                    <Image
                      src={session.user?.image || "/default-avatar.png"}
                      alt="Profile picture"
                      width={128}
                      height={128}
                      className="w-32 h-32 rounded-full border-4 border-white bg-white"
                    />
                    <button className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors">
                      <Camera className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Profile Content */}
              <div className="pt-20 p-6">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={profileData.displayName}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            displayName: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500 shadow-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bio
                      </label>
                      <textarea
                        value={profileData.bio}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            bio: e.target.value,
                          }))
                        }
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500 shadow-sm"
                        placeholder="Tell us about yourself..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Location
                        </label>
                        <input
                          type="text"
                          value={profileData.location}
                          onChange={(e) =>
                            setProfileData((prev) => ({
                              ...prev,
                              location: e.target.value,
                            }))
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 shadow-sm"
                          placeholder="City, Country"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Website
                        </label>
                        <input
                          type="url"
                          value={profileData.website}
                          onChange={(e) =>
                            setProfileData((prev) => ({
                              ...prev,
                              website: e.target.value,
                            }))
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 shadow-sm"
                          placeholder="https://example.com"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 pt-4">
                      <Button
                        onClick={handleSaveProfile}
                        className="flex items-center space-x-2"
                      >
                        <Save className="h-4 w-4" />
                        <span>Save Changes</span>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-2xl font-bold text-gray-900">
                        {profileData.displayName || session.user?.name}
                      </h2>
                      <Button
                        onClick={() => setIsEditing(true)}
                        variant="outline"
                      >
                        Edit Profile
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Mail className="h-4 w-4" />
                        <span>{session.user?.email}</span>
                      </div>

                      {profileData.bio && (
                        <p className="text-gray-700">{profileData.bio}</p>
                      )}

                      <div className="flex items-center space-x-2 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>Joined {new Date().toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats & Actions */}
          <div className="space-y-6">
            {/* Stats Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Your Activity
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Files</span>
                  <span className="font-semibold text-gray-900">
                    {userStats.totalFiles}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Storage Used</span>
                  <span className="font-semibold text-gray-900">
                    {userStats.totalStorage}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Files This Month</span>
                  <span className="font-semibold text-gray-900">
                    {userStats.filesThisMonth}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">AI Processed</span>
                  <span className="font-semibold text-gray-900">
                    {userStats.aiProcessedFiles}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleExportData}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export My Data
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push("/dashboard")}
                >
                  <Archive className="h-4 w-4 mr-2" />
                  View All Files
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push("/settings")}
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Notification Settings
                </Button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
              <h3 className="text-lg font-semibold text-red-600 mb-4">
                Danger Zone
              </h3>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => signOut()}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
                  onClick={handleDeleteAccount}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
