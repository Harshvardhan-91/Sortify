"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  Shield,
  Database,
  Brain,
  Globe,
  Download,
  Upload,
  Trash2,
  Save,
  Moon,
  Sun,
  Monitor,
} from "lucide-react";
import { Button } from "@repo/ui/button";

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  aiProcessingComplete: boolean;
  weeklyDigest: boolean;
  securityAlerts: boolean;
}

interface PrivacySettings {
  profileVisibility: "public" | "private";
  showEmailInProfile: boolean;
  allowDataAnalytics: boolean;
  shareUsageStats: boolean;
}

interface AISettings {
  autoTagging: boolean;
  autoSummaries: boolean;
  smartSearch: boolean;
  contentModeration: boolean;
  aiInsights: boolean;
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("general");
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");

  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    aiProcessingComplete: true,
    weeklyDigest: false,
    securityAlerts: true,
  });

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisibility: "private",
    showEmailInProfile: false,
    allowDataAnalytics: true,
    shareUsageStats: false,
  });

  const [aiSettings, setAISettings] = useState<AISettings>({
    autoTagging: true,
    autoSummaries: true,
    smartSearch: true,
    contentModeration: true,
    aiInsights: true,
  });

  const handleSaveSettings = () => {
    console.log("Saving settings:", {
      notifications,
      privacy,
      aiSettings,
      theme,
    });
    // Here you would call your API to save settings
  };

  const handleExportData = () => {
    console.log("Exporting user data");
    // Here you would call your API to export user data
  };

  const handleImportData = () => {
    console.log("Importing user data");
    // Here you would handle file upload and import
  };

  const handleClearCache = () => {
    console.log("Clearing cache");
    // Here you would clear local storage, cache, etc.
  };

  const tabs = [
    { id: "general", name: "General", icon: Globe },
    { id: "notifications", name: "Notifications", icon: Bell },
    { id: "privacy", name: "Privacy & Security", icon: Shield },
    { id: "ai", name: "AI Features", icon: Brain },
    { id: "data", name: "Data & Storage", icon: Database },
  ];

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
              <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
            </div>
            <Button
              onClick={handleSaveSettings}
              className="flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>Save Changes</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{tab.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {/* General Settings */}
              {activeTab === "general" && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    General Settings
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Theme Preference
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { value: "light", label: "Light", icon: Sun },
                          { value: "dark", label: "Dark", icon: Moon },
                          { value: "system", label: "System", icon: Monitor },
                        ].map(({ value, label, icon: Icon }) => (
                          <button
                            key={value}
                            onClick={() => setTheme(value as typeof theme)}
                            className={`flex flex-col items-center space-y-2 p-4 border rounded-xl transition-all hover:scale-105 ${
                              theme === value
                                ? "border-blue-500 bg-blue-50 text-blue-600 shadow-md"
                                : "border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                            }`}
                          >
                            <Icon className="h-6 w-6" />
                            <span className="text-sm font-medium">{label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Language
                        </label>
                        <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 shadow-sm appearance-none">
                          <option value="en" className="text-gray-900">
                            English
                          </option>
                          <option value="es" className="text-gray-900">
                            Spanish
                          </option>
                          <option value="fr" className="text-gray-900">
                            French
                          </option>
                          <option value="de" className="text-gray-900">
                            German
                          </option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Timezone
                        </label>
                        <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 shadow-sm appearance-none">
                          <option value="UTC" className="text-gray-900">
                            UTC
                          </option>
                          <option
                            value="America/New_York"
                            className="text-gray-900"
                          >
                            Eastern Time
                          </option>
                          <option
                            value="America/Los_Angeles"
                            className="text-gray-900"
                          >
                            Pacific Time
                          </option>
                          <option
                            value="Europe/London"
                            className="text-gray-900"
                          >
                            London
                          </option>
                          <option value="Asia/Tokyo" className="text-gray-900">
                            Tokyo
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications */}
              {activeTab === "notifications" && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Notification Settings
                  </h2>

                  <div className="space-y-4">
                    {Object.entries(notifications).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between py-2"
                      >
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 capitalize">
                            {key.replace(/([A-Z])/g, " $1").toLowerCase()}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {getNotificationDescription(key)}
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) =>
                              setNotifications((prev) => ({
                                ...prev,
                                [key]: e.target.checked,
                              }))
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Privacy & Security */}
              {activeTab === "privacy" && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Privacy & Security
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Profile Visibility
                      </label>
                      <select
                        value={privacy.profileVisibility}
                        onChange={(e) =>
                          setPrivacy((prev) => ({
                            ...prev,
                            profileVisibility: e.target.value as
                              | "public"
                              | "private",
                          }))
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 shadow-sm appearance-none"
                      >
                        <option value="private" className="text-gray-900">
                          Private
                        </option>
                        <option value="public" className="text-gray-900">
                          Public
                        </option>
                      </select>
                    </div>

                    <div className="space-y-4">
                      {Object.entries(privacy)
                        .filter(([key]) => key !== "profileVisibility")
                        .map(([key, value]) => (
                          <div
                            key={key}
                            className="flex items-center justify-between py-2"
                          >
                            <div>
                              <h3 className="text-sm font-medium text-gray-900 capitalize">
                                {key.replace(/([A-Z])/g, " $1").toLowerCase()}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {getPrivacyDescription(key)}
                              </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={value as boolean}
                                onChange={(e) =>
                                  setPrivacy((prev) => ({
                                    ...prev,
                                    [key]: e.target.checked,
                                  }))
                                }
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}

              {/* AI Features */}
              {activeTab === "ai" && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    AI Features
                  </h2>

                  <div className="space-y-4">
                    {Object.entries(aiSettings).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between py-2"
                      >
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 capitalize">
                            {key.replace(/([A-Z])/g, " $1").toLowerCase()}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {getAIDescription(key)}
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) =>
                              setAISettings((prev) => ({
                                ...prev,
                                [key]: e.target.checked,
                              }))
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Data & Storage */}
              {activeTab === "data" && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Data & Storage
                  </h2>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button
                        variant="outline"
                        onClick={handleExportData}
                        className="flex items-center justify-center space-x-2 py-3"
                      >
                        <Download className="h-4 w-4" />
                        <span>Export Data</span>
                      </Button>

                      <Button
                        variant="outline"
                        onClick={handleImportData}
                        className="flex items-center justify-center space-x-2 py-3"
                      >
                        <Upload className="h-4 w-4" />
                        <span>Import Data</span>
                      </Button>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Storage Usage
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Files</span>
                          <span className="text-sm font-medium">
                            0 MB of 10 GB used
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: "0%" }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-lg font-medium text-red-600 mb-4">
                        Danger Zone
                      </h3>
                      <div className="space-y-3">
                        <Button
                          variant="outline"
                          onClick={handleClearCache}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Clear Cache
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getNotificationDescription(key: string): string {
  const descriptions: Record<string, string> = {
    emailNotifications: "Receive notifications via email",
    pushNotifications: "Receive push notifications in your browser",
    aiProcessingComplete: "Get notified when AI processing is complete",
    weeklyDigest: "Receive a weekly summary of your activity",
    securityAlerts: "Important security and account alerts",
  };
  return descriptions[key] || "";
}

function getPrivacyDescription(key: string): string {
  const descriptions: Record<string, string> = {
    showEmailInProfile: "Display your email address on your public profile",
    allowDataAnalytics: "Help improve our service with anonymous usage data",
    shareUsageStats: "Share anonymized usage statistics with third parties",
  };
  return descriptions[key] || "";
}

function getAIDescription(key: string): string {
  const descriptions: Record<string, string> = {
    autoTagging: "Automatically tag files using AI analysis",
    autoSummaries: "Generate AI-powered summaries for documents",
    smartSearch: "Enhanced search with AI understanding",
    contentModeration: "Automatic content moderation and filtering",
    aiInsights: "Receive AI-powered insights about your files",
  };
  return descriptions[key] || "";
}
