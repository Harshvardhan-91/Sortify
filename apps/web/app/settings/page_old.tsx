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
  Key,
  Eye,
  EyeOff,
  Smartphone,
  Lock,
  Users,
  Credit_card as CreditCard,
  Zap,
  Activity,
  BarChart3,
  FileText,
  Camera,
  Mic,
  Video,
  HardDrive,
  Cloud,
  Wifi,
  CheckCircle,
  AlertTriangle,
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
  profileVisibility: "public" | "private";
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

  const tabs = [
    { id: "general", label: "General", icon: Monitor },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy", icon: Shield },
    { id: "ai", label: "AI Settings", icon: Brain },
    { id: "security", label: "Security", icon: Lock },
    { id: "billing", label: "Billing", icon: CreditCard },
  ];

  const ToggleSwitch = ({ enabled, onChange, label, description }: {
    enabled: boolean;
    onChange: () => void;
    label: string;
    description?: string;
  }) => (
    <div className="flex items-center justify-between py-4">
      <div className="flex-1">
        <div className="font-medium text-gray-900">{label}</div>
        {description && <div className="text-sm text-gray-500 mt-1">{description}</div>}
      </div>
      <button
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
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Appearance</h3>
        <div className="space-y-4">
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
                    onClick={() => setTheme(option.value as any)}
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="ja">日本語</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">File Management</h3>
        <div className="space-y-4">
          <ToggleSwitch
            enabled={true}
            onChange={() => {}}
            label="Auto-sync"
            description="Automatically sync files across devices"
          />
          <ToggleSwitch
            enabled={false}
            onChange={() => {}}
            label="Auto-backup"
            description="Automatically backup files to cloud storage"
          />
          <ToggleSwitch
            enabled={true}
            onChange={() => {}}
            label="Compression"
            description="Compress files to save storage space"
          />
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Notifications</h3>
        <div className="divide-y divide-gray-200">
          <ToggleSwitch
            enabled={notifications.emailNotifications}
            onChange={() => handleNotificationChange("emailNotifications")}
            label="Email notifications"
            description="Receive notifications via email"
          />
          <ToggleSwitch
            enabled={notifications.aiProcessingComplete}
            onChange={() => handleNotificationChange("aiProcessingComplete")}
            label="AI processing complete"
            description="Get notified when AI finishes processing your files"
          />
          <ToggleSwitch
            enabled={notifications.weeklyDigest}
            onChange={() => handleNotificationChange("weeklyDigest")}
            label="Weekly digest"
            description="Weekly summary of your activity and insights"
          />
          <ToggleSwitch
            enabled={notifications.fileShared}
            onChange={() => handleNotificationChange("fileShared")}
            label="File sharing"
            description="Notifications when files are shared with you"
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Push Notifications</h3>
        <div className="divide-y divide-gray-200">
          <ToggleSwitch
            enabled={notifications.pushNotifications}
            onChange={() => handleNotificationChange("pushNotifications")}
            label="Push notifications"
            description="Receive push notifications on your devices"
          />
          <ToggleSwitch
            enabled={notifications.securityAlerts}
            onChange={() => handleNotificationChange("securityAlerts")}
            label="Security alerts"
            description="Important security notifications"
          />
          <ToggleSwitch
            enabled={notifications.storageAlerts}
            onChange={() => handleNotificationChange("storageAlerts")}
            label="Storage alerts"
            description="Alerts when storage is running low"
          />
        </div>
      </div>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Privacy</h3>
        <div className="divide-y divide-gray-200">
          <div className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">Profile visibility</div>
                <div className="text-sm text-gray-500">Control who can see your profile</div>
              </div>
              <select
                value={privacy.profileVisibility}
                onChange={(e) => setPrivacy(prev => ({ ...prev, profileVisibility: e.target.value as "public" | "private" }))}
                className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>
          <ToggleSwitch
            enabled={privacy.showEmailInProfile}
            onChange={() => handlePrivacyChange("showEmailInProfile")}
            label="Show email in profile"
            description="Display your email address in your public profile"
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Data & Analytics</h3>
        <div className="divide-y divide-gray-200">
          <ToggleSwitch
            enabled={privacy.allowDataAnalytics}
            onChange={() => handlePrivacyChange("allowDataAnalytics")}
            label="Analytics"
            description="Help improve Sortify by sharing anonymous usage data"
          />
          <ToggleSwitch
            enabled={privacy.shareUsageStats}
            onChange={() => handlePrivacyChange("shareUsageStats")}
            label="Usage statistics"
            description="Share usage statistics for product improvement"
          />
          <ToggleSwitch
            enabled={privacy.allowAITraining}
            onChange={() => handlePrivacyChange("allowAITraining")}
            label="AI training"
            description="Allow your data to help improve AI models (anonymized)"
          />
          <ToggleSwitch
            enabled={privacy.searchIndexing}
            onChange={() => handlePrivacyChange("searchIndexing")}
            label="Search indexing"
            description="Index your files for better search results"
          />
        </div>
      </div>
    </div>
  );

  const renderAISettings = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Processing</h3>
        <div className="divide-y divide-gray-200">
          <ToggleSwitch
            enabled={aiSettings.autoTagging}
            onChange={() => handleAIChange("autoTagging")}
            label="Auto-tagging"
            description="Automatically tag files with AI-generated labels"
          />
          <ToggleSwitch
            enabled={aiSettings.autoSummaries}
            onChange={() => handleAIChange("autoSummaries")}
            label="Auto-summaries"
            description="Generate automatic summaries for documents"
          />
          <ToggleSwitch
            enabled={aiSettings.smartSearch}
            onChange={() => handleAIChange("smartSearch")}
            label="Smart search"
            description="Enhanced search with AI understanding"
          />
          <ToggleSwitch
            enabled={aiSettings.contentModeration}
            onChange={() => handleAIChange("contentModeration")}
            label="Content moderation"
            description="Automatically flag inappropriate content"
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Insights</h3>
        <div className="divide-y divide-gray-200">
          <ToggleSwitch
            enabled={aiSettings.aiInsights}
            onChange={() => handleAIChange("aiInsights")}
            label="AI insights"
            description="Get intelligent insights about your files and usage"
          />
          <ToggleSwitch
            enabled={aiSettings.smartSuggestions}
            onChange={() => handleAIChange("smartSuggestions")}
            label="Smart suggestions"
            description="Receive AI-powered organization suggestions"
          />
          <ToggleSwitch
            enabled={aiSettings.autoOrganization}
            onChange={() => handleAIChange("autoOrganization")}
            label="Auto-organization"
            description="Let AI automatically organize your files"
          />
          <ToggleSwitch
            enabled={aiSettings.faceRecognition}
            onChange={() => handleAIChange("faceRecognition")}
            label="Face recognition"
            description="Identify people in photos and videos"
          />
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Authentication</h3>
        <div className="divide-y divide-gray-200">
          <ToggleSwitch
            enabled={security.twoFactorAuth}
            onChange={() => handleSecurityChange("twoFactorAuth")}
            label="Two-factor authentication"
            description="Add an extra layer of security to your account"
          />
          <ToggleSwitch
            enabled={security.biometricAuth}
            onChange={() => handleSecurityChange("biometricAuth")}
            label="Biometric authentication"
            description="Use fingerprint or face recognition to unlock"
          />
          <ToggleSwitch
            enabled={security.loginNotifications}
            onChange={() => handleSecurityChange("loginNotifications")}
            label="Login notifications"
            description="Get notified of new device logins"
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Management</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Session timeout</label>
            <select
              value={security.sessionTimeout}
              onChange={(e) => setSecurity(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={120}>2 hours</option>
              <option value={-1}>Never</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Password Security</h3>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <div className="font-medium text-green-900">Password strength: Strong</div>
              <div className="text-sm text-green-700">Your password meets all security requirements</div>
            </div>
          </div>
        </div>
        
        <Button
          variant="outline"
          className="mt-4 border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          <Key className="h-4 w-4 mr-2" />
          Change Password
        </Button>
      </div>
    </div>
  );

  const renderBillingSettings = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Plan</h3>
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-xl font-bold text-gray-900">Pro Plan</h4>
              <p className="text-gray-600">Perfect for professionals and teams</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">$29</div>
              <div className="text-sm text-gray-500">per month</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-gray-600">100 GB storage</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-gray-600">Advanced AI features</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-gray-600">Team collaboration</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-gray-600">Priority support</span>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
              Change Plan
            </Button>
            <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
              Cancel Subscription
            </Button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage This Month</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <HardDrive className="h-5 w-5 text-gray-500" />
              <span className="text-sm text-green-600 font-medium">56%</span>
            </div>
            <div className="text-xl font-bold text-gray-900">56 GB</div>
            <div className="text-sm text-gray-500">of 100 GB used</div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <Brain className="h-5 w-5 text-purple-500" />
              <span className="text-sm text-blue-600 font-medium">147</span>
            </div>
            <div className="text-xl font-bold text-gray-900">147</div>
            <div className="text-sm text-gray-500">AI processes used</div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <Activity className="h-5 w-5 text-green-500" />
              <span className="text-sm text-purple-600 font-medium">23</span>
            </div>
            <div className="text-xl font-bold text-gray-900">23 days</div>
            <div className="text-sm text-gray-500">active this month</div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded flex items-center justify-center">
                <CreditCard className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="font-medium text-gray-900">•••• •••• •••• 4242</div>
                <div className="text-sm text-gray-500">Expires 12/26</div>
              </div>
            </div>
            <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
              Update
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
              className={`transition-all duration-300 ${
                saveStatus === "saved" 
                  ? "bg-green-600 hover:bg-green-700" 
                  : "bg-blue-600 hover:bg-blue-700"
              } text-white`}
            >
              {saveStatus === "saving" ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                  Saving...
                </>
              ) : saveStatus === "saved" ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Saved!
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-2">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-xl transition-all ${
                        activeTab === tab.id
                          ? "bg-blue-50 text-blue-600 border border-blue-200"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <IconComponent className="h-5 w-5" />
                      <span className="font-medium">{tab.label}</span>
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
