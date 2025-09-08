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
  CheckCircle,
} from "lucide-react";
import { Button } from "@repo/ui/button";

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  aiProcessingComplete: boolean;
  weeklyDigest: boolean;
  securityAlerts: boolean;
  fileShared: boolean;
  storageAlerts: boolean;
  teamUpdates: boolean;
}

interface PrivacySettings {
  profileVisibility: "public" | "private" | "friends";
  showEmailInProfile: boolean;
  allowDataAnalytics: boolean;
  shareUsageStats: boolean;
  allowAITraining: boolean;
  searchIndexing: boolean;
}

interface AISettings {
  autoTagging: boolean;
  autoSummaries: boolean;
  smartSearch: boolean;
  contentModeration: boolean;
  aiInsights: boolean;
  smartSuggestions: boolean;
  autoOrganization: boolean;
  faceRecognition: boolean;
}

interface SecuritySettings {
  twoFactorAuth: boolean;
  biometricAuth: boolean;
  sessionTimeout: number;
  loginNotifications: boolean;
  passwordStrength: "weak" | "medium" | "strong";
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("general");
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const [language, setLanguage] = useState("en");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    aiProcessingComplete: true,
    weeklyDigest: false,
    securityAlerts: true,
    fileShared: true,
    storageAlerts: true,
    teamUpdates: false,
  });

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisibility: "private",
    showEmailInProfile: false,
    allowDataAnalytics: true,
    shareUsageStats: false,
    allowAITraining: true,
    searchIndexing: true,
  });

  const [aiSettings, setAISettings] = useState<AISettings>({
    autoTagging: true,
    autoSummaries: true,
    smartSearch: true,
    contentModeration: true,
    aiInsights: true,
    smartSuggestions: true,
    autoOrganization: false,
    faceRecognition: false,
  });

  const [security, setSecurity] = useState<SecuritySettings>({
    twoFactorAuth: false,
    biometricAuth: false,
    sessionTimeout: 30,
    loginNotifications: true,
    passwordStrength: "medium",
  });

  const handleSaveSettings = () => {
    setSaveStatus("saving");
    // Simulate API call
    setTimeout(() => {
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    }, 1000);
  };

  const handleNotificationChange = (key: keyof NotificationSettings) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePrivacyChange = (key: keyof PrivacySettings) => {
    setPrivacy(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAIChange = (key: keyof AISettings) => {
    setAISettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSecurityChange = (key: keyof SecuritySettings) => {
    setSecurity(prev => ({ ...prev, [key]: !prev[key] }));
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

  const ToggleSwitch = ({ enabled, onChange, label, description }: {
    enabled: boolean;
    onChange: () => void;
    label: string;
    description?: string;
  }) => (
    <div className="flex items-start justify-between py-3">
      <div className="flex-1">
        <h3 className="text-sm font-medium text-gray-900">{label}</h3>
        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          enabled ? "bg-blue-600" : "bg-gray-200"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );

  const renderGeneralSettings = () => (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">General Settings</h2>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Theme</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: "light", label: "Light", icon: Sun },
              { value: "dark", label: "Dark", icon: Moon },
              { value: "system", label: "System", icon: Monitor },
            ].map((option) => {
              const IconComponent = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => setTheme(option.value as "light" | "dark" | "system")}
                  className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                    theme === option.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <IconComponent className="h-6 w-6 mb-2" />
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Language</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
          </select>
        </div>

        <ToggleSwitch
          enabled={notifications.emailNotifications}
          onChange={() => handleNotificationChange("emailNotifications")}
          label="Email Notifications"
          description="Receive notifications via email"
        />

        <ToggleSwitch
          enabled={notifications.pushNotifications}
          onChange={() => handleNotificationChange("pushNotifications")}
          label="Push Notifications"
          description="Receive push notifications in your browser"
        />

        <ToggleSwitch
          enabled={notifications.aiProcessingComplete}
          onChange={() => handleNotificationChange("aiProcessingComplete")}
          label="AI Processing Complete"
          description="Get notified when AI processing is complete"
        />
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Notification Settings</h2>
      <div className="space-y-6">
        <div className="space-y-4">
          {Object.entries(notifications).map(([key, enabled]) => (
            <ToggleSwitch
              key={key}
              enabled={enabled}
              onChange={() => handleNotificationChange(key as keyof NotificationSettings)}
              label={key.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())}
              description={getNotificationDescription(key)}
            />
          ))}
        </div>
      </div>
    </div>
  );

  const renderPrivacySettings = () => (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Privacy & Security</h2>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Profile Visibility</label>
          <select
            value={privacy.profileVisibility}
            onChange={(e) => setPrivacy(prev => ({ ...prev, profileVisibility: e.target.value as "public" | "private" | "friends" }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
            <option value="friends">Friends Only</option>
          </select>
        </div>

        <ToggleSwitch
          enabled={privacy.showEmailInProfile}
          onChange={() => handlePrivacyChange("showEmailInProfile")}
          label="Show Email in Profile"
          description={getPrivacyDescription("showEmailInProfile")}
        />

        <ToggleSwitch
          enabled={privacy.allowDataAnalytics}
          onChange={() => handlePrivacyChange("allowDataAnalytics")}
          label="Allow Data Analytics"
          description={getPrivacyDescription("allowDataAnalytics")}
        />

        <ToggleSwitch
          enabled={privacy.shareUsageStats}
          onChange={() => handlePrivacyChange("shareUsageStats")}
          label="Share Usage Stats"
          description={getPrivacyDescription("shareUsageStats")}
        />

        <ToggleSwitch
          enabled={privacy.allowAITraining}
          onChange={() => handlePrivacyChange("allowAITraining")}
          label="Allow AI Training"
          description="Use your data to improve AI models"
        />

        <ToggleSwitch
          enabled={privacy.searchIndexing}
          onChange={() => handlePrivacyChange("searchIndexing")}
          label="Search Indexing"
          description="Allow search engines to index your public content"
        />
      </div>
    </div>
  );

  const renderAISettings = () => (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">AI Features</h2>
      <div className="space-y-6">
        <div className="space-y-4">
          {Object.entries(aiSettings).map(([key, enabled]) => (
            <ToggleSwitch
              key={key}
              enabled={enabled}
              onChange={() => handleAIChange(key as keyof AISettings)}
              label={key.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())}
              description={getAIDescription(key)}
            />
          ))}
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Security Settings</h2>
      <div className="space-y-6">
        <div className="space-y-4">
          {Object.entries(security).map(([key, value]) => {
            if (typeof value === 'boolean') {
              return (
                <ToggleSwitch
                  key={key}
                  enabled={value}
                  onChange={() => handleSecurityChange(key as keyof SecuritySettings)}
                  label={key.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())}
                />
              );
            }
            return null;
          })}
        </div>
      </div>
    </div>
  );

  const renderBillingSettings = () => (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Data & Storage</h2>
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
          <h3 className="text-lg font-medium text-gray-900 mb-4">Storage Usage</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Files</span>
              <span className="text-sm font-medium">0 MB of 10 GB used</span>
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
          <h3 className="text-lg font-medium text-red-600 mb-4">Danger Zone</h3>
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
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "general": return renderGeneralSettings();
      case "notifications": return renderNotificationSettings();
      case "privacy": return renderPrivacySettings();
      case "ai": return renderAISettings();
      case "security": return renderSecuritySettings();
      case "billing": return renderBillingSettings();
      default: return renderGeneralSettings();
    }
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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in</h1>
          <Button onClick={() => router.push("/auth/signin")}>Sign In</Button>
        </div>
      </div>
    );
  }

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
              <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
            </div>
            
            <Button
              onClick={handleSaveSettings}
              disabled={saveStatus === "saving"}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
            >
              {saveStatus === "saving" ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : saveStatus === "saved" ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Saved
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-xl transition-all duration-200 ${
                        activeTab === tab.id
                          ? "bg-blue-50 text-blue-700 shadow-sm border border-blue-200"
                          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{tab.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              {renderTabContent()}
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
