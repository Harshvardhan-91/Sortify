"use client";

import React, { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Calendar,
  MapPin,
  Globe,
  Camera,
  Save,
  X,
  Users,
  Files,
  HardDrive,
  Brain,
  Star,
  Zap,
  TrendingUp,
  Activity,
  Award,
  Shield,
} from "lucide-react";
import { Button } from "@repo/ui/button";
import Image from "next/image";

interface UserStats {
  totalFiles: number;
  totalStorage: string;
  filesThisMonth: number;
  aiProcessedFiles: number;
  storageUsed: number;
  storageLimit: number;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [userStats] = useState<UserStats>({
    totalFiles: 247,
    totalStorage: "8.4 GB",
    filesThisMonth: 32,
    aiProcessedFiles: 186,
    storageUsed: 8.4,
    storageLimit: 15,
  });

  const [profileData, setProfileData] = useState({
    displayName: session?.user?.name || "",
    email: session?.user?.email || "",
    bio: "Building the future with AI-powered file management",
    location: "San Francisco, CA",
    website: "https://sortify.app",
    jobTitle: "Product Manager",
    company: "Tech Innovations Inc.",
  });

  const handleSaveProfile = () => {
    // Here you would call your API to update the profile
    console.log("Saving profile:", profileData);
    setIsEditing(false);
    // Show success notification
  };

  const handleCancel = () => {
    // Reset form data
    setProfileData({
      displayName: session?.user?.name || "",
      email: session?.user?.email || "",
      bio: "Building the future with AI-powered file management",
      location: "San Francisco, CA", 
      website: "https://sortify.app",
      jobTitle: "Product Manager",
      company: "Tech Innovations Inc.",
    });
    setIsEditing(false);
  };

  const achievements = [
    { icon: Files, label: "File Explorer", description: "Uploaded 100+ files", color: "blue" },
    { icon: Brain, label: "AI Pioneer", description: "Used AI features extensively", color: "purple" },
    { icon: Star, label: "Power User", description: "Active for 6+ months", color: "yellow" },
    { icon: Users, label: "Collaborator", description: "Shared files with teams", color: "green" },
  ];

  const activityData = [
    { label: "Files Uploaded", value: userStats.totalFiles, change: "+12%", trending: "up" },
    { label: "Storage Used", value: `${userStats.storageUsed} GB`, change: "+2.3 GB", trending: "up" },
    { label: "AI Processed", value: userStats.aiProcessedFiles, change: "+85%", trending: "up" },
    { label: "This Month", value: userStats.filesThisMonth, change: "+4", trending: "up" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Navigation Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/dashboard")}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-semibold text-gray-900">Profile</h1>
            </div>
            
            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Edit Profile
              </Button>
            ) : (
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveProfile}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="text-center">
                <div className="relative inline-block">
                  {session?.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt="Profile"
                      width={120}
                      height={120}
                      className="rounded-2xl"
                    />
                  ) : (
                    <div className="w-30 h-30 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                      <span className="text-white font-bold text-2xl">
                        {session?.user?.name?.[0] || session?.user?.email?.[0] || 'U'}
                      </span>
                    </div>
                  )}
                  
                  {isEditing && (
                    <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors">
                      <Camera className="h-4 w-4" />
                    </button>
                  )}
                </div>
                
                <div className="mt-4">
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.displayName}
                      onChange={(e) => setProfileData({...profileData, displayName: e.target.value})}
                      className="text-center text-xl font-bold text-gray-900 bg-transparent border-b-2 border-blue-500 focus:outline-none focus:border-blue-600 w-full"
                    />
                  ) : (
                    <h2 className="text-xl font-bold text-gray-900">{profileData.displayName}</h2>
                  )}
                  
                  <div className="flex items-center justify-center mt-2">
                    <Mail className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-sm text-gray-600">{profileData.email}</span>
                  </div>
                </div>
              </div>
              
              {/* Profile Details */}
              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  {isEditing ? (
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      placeholder="Tell us about yourself..."
                    />
                  ) : (
                    <p className="text-gray-600">{profileData.bio}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.jobTitle}
                      onChange={(e) => setProfileData({...profileData, jobTitle: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Your job title"
                    />
                  ) : (
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-gray-600">{profileData.jobTitle}</span>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.company}
                      onChange={(e) => setProfileData({...profileData, company: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Your company"
                    />
                  ) : (
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-gray-600">{profileData.company}</span>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.location}
                      onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Your location"
                    />
                  ) : (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-gray-600">{profileData.location}</span>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  {isEditing ? (
                    <input
                      type="url"
                      value={profileData.website}
                      onChange={(e) => setProfileData({...profileData, website: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://your-website.com"
                    />
                  ) : (
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 text-gray-500 mr-2" />
                      <a 
                        href={profileData.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {profileData.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Account Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h3>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  onClick={() => router.push("/settings")}
                  className="w-full justify-start border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <Shield className="h-4 w-4 mr-3" />
                  Settings & Privacy
                </Button>
                <Button
                  variant="outline"
                  onClick={() => signOut()}
                  className="w-full justify-start border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                >
                  <ArrowLeft className="h-4 w-4 mr-3" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
          
          {/* Right Column - Stats & Activity */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Activity Overview */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Activity Overview</h3>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Activity className="h-4 w-4" />
                  <span>Last 30 days</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {activityData.map((item, index) => (
                  <div key={index} className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-2xl font-bold text-gray-900">{item.value}</div>
                      <TrendingUp className={`h-4 w-4 ${item.trending === 'up' ? 'text-green-500' : 'text-red-500'}`} />
                    </div>
                    <div className="text-sm text-gray-600 mb-1">{item.label}</div>
                    <div className={`text-xs font-medium ${item.trending === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {item.change}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Storage Overview */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Storage Overview</h3>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <HardDrive className="h-4 w-4" />
                  <span>{userStats.storageUsed} GB of {userStats.storageLimit} GB used</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(userStats.storageUsed / userStats.storageLimit) * 100}%` }}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Documents</div>
                      <div className="text-xs text-gray-500">3.2 GB</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Images</div>
                      <div className="text-xs text-gray-500">2.8 GB</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Videos</div>
                      <div className="text-xs text-gray-500">1.9 GB</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-purple-500 rounded-full" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Others</div>
                      <div className="text-xs text-gray-500">0.5 GB</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Achievements */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Achievements</h3>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Award className="h-4 w-4" />
                  <span>4 earned</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement, index) => {
                  const IconComponent = achievement.icon;
                  const colorClasses = {
                    blue: "from-blue-500 to-blue-600 text-white",
                    purple: "from-purple-500 to-purple-600 text-white", 
                    yellow: "from-yellow-500 to-yellow-600 text-white",
                    green: "from-green-500 to-green-600 text-white",
                  };
                  
                  return (
                    <div key={index} className="flex items-center space-x-4 p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[achievement.color as keyof typeof colorClasses]} flex items-center justify-center`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{achievement.label}</div>
                        <div className="text-sm text-gray-500">{achievement.description}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* AI Insights */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl border border-purple-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
                <div className="flex items-center space-x-2 text-sm text-purple-600">
                  <Brain className="h-4 w-4" />
                  <span>Powered by AI</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    <span className="font-medium text-gray-900">Most Active Time</span>
                  </div>
                  <p className="text-sm text-gray-600">You're most productive between 9 AM - 11 AM. Consider scheduling important file organization during this time.</p>
                </div>
                
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <Files className="h-5 w-5 text-blue-500" />
                    <span className="font-medium text-gray-900">File Patterns</span>
                  </div>
                  <p className="text-sm text-gray-600">75% of your files are work-related documents. Consider creating a dedicated work folder for better organization.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
