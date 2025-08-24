"use client";

import React, { useState } from "react";
import {
  Plus,
  Home,
  HardDrive,
  Clock,
  Database,
  ChevronRight,
  FolderPlus,
  Upload,
} from "lucide-react";
import { Button } from "./button";

interface DriveSidebarProps {
  className?: string;
  onNewFolder?: () => void;
  onFileUpload?: () => void;
  onNavigate?: (section: string) => void;
  currentSection?: string;
  storageUsed?: number;
  storageTotal?: number;
}

export const DriveSidebar: React.FC<DriveSidebarProps> = ({
  className = "",
  onNewFolder,
  onFileUpload,
  onNavigate,
  currentSection = "home",
  storageUsed = 0,
  storageTotal = 15,
}) => {
  const [isNewMenuOpen, setIsNewMenuOpen] = useState(false);

  const formatStorage = (gb: number) => {
    return gb < 1 ? `${(gb * 1024).toFixed(0)} MB` : `${gb.toFixed(1)} GB`;
  };

  const storagePercentage = (storageUsed / storageTotal) * 100;

  const menuItems = [
    {
      id: "home",
      label: "Home",
      icon: Home,
      active: currentSection === "home",
    },
    {
      id: "my-sortify",
      label: "My Sortify",
      icon: HardDrive,
      active: currentSection === "my-sortify",
    },
    {
      id: "recent",
      label: "Recent",
      icon: Clock,
      active: currentSection === "recent",
    },
    {
      id: "storage",
      label: "Storage",
      icon: Database,
      active: currentSection === "storage",
    },
  ];

  return (
    <div
      className={`w-64 bg-white border-r border-gray-200 flex flex-col h-full ${className}`}
    >
      {/* New Button */}
      <div className="p-3">
        <div className="relative">
          <Button
            onClick={() => setIsNewMenuOpen(!isNewMenuOpen)}
            className="w-full justify-start bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm rounded-2xl px-4 py-3 font-medium"
          >
            <Plus className="h-6 w-6 mr-3 text-blue-600" />
            New
          </Button>

          {/* New Menu Dropdown */}
          {isNewMenuOpen && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <div className="py-2">
                <button
                  onClick={() => {
                    onNewFolder?.();
                    setIsNewMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center text-gray-700"
                >
                  <FolderPlus className="h-5 w-5 mr-3 text-gray-500" />
                  New folder
                  <div className="ml-auto text-xs text-gray-400">
                    Alt+C then F
                  </div>
                </button>
                <button
                  onClick={() => {
                    onFileUpload?.();
                    setIsNewMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center text-gray-700"
                >
                  <Upload className="h-5 w-5 mr-3 text-gray-500" />
                  File upload
                  <div className="ml-auto text-xs text-gray-400">
                    Alt+C then U
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate?.(item.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    item.active
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 mr-3 ${item.active ? "text-blue-600" : "text-gray-500"}`}
                  />
                  {item.label}
                  {item.id === "my-sortify" && (
                    <ChevronRight className="h-4 w-4 ml-auto text-gray-400" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Storage Section */}
      <div className="p-3 border-t border-gray-200">
        <div className="mb-3">
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <Database className="h-4 w-4 mr-2" />
            Storage
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(storagePercentage, 100)}%` }}
            />
          </div>
          <div className="text-xs text-gray-500">
            {formatStorage(storageUsed)} of {formatStorage(storageTotal)} used
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs border-gray-300 hover:bg-gray-50"
        >
          Get more storage
        </Button>
      </div>
    </div>
  );
};
