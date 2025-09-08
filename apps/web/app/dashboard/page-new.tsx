"use client";

import React, { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Upload,
  Grid,
  List,
  Folder,
  Settings,
  Filter,
  SortAsc,
  LogOut,
} from "lucide-react";
import { S3FileUpload } from "@repo/ui/s3-file-upload";
import { SearchBar } from "@repo/ui/search-bar";
import { AISearch } from "@repo/ui/ai-search";
import { FileTree } from "@repo/ui/file-tree";
import { AIFileCard } from "@repo/ui/ai-file-card";
import { Button } from "@repo/ui/button";
import Image from "next/image";
import { simulateAIProcessing } from "./ai-simulation";

interface File {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  createdAt: string;
  updatedAt: string;
  aiTags?: string[];
  aiSummary?: string;
  aiKeywords?: string[];
  processingStatus?: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  folder?: {
    id: string;
    name: string;
  };
}

interface Folder {
  id: string;
  name: string;
  fileCount: number;
  subfolderCount: number;
}

interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  size?: number;
  mimeType?: string;
  createdAt: Date;
  updatedAt: Date;
  children?: FileNode[];
  isExpanded?: boolean;
  parentId?: string;
  tags?: string[];
  isStarred?: boolean;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [selectedTreeItems, setSelectedTreeItems] = useState<string[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<File[]>([]);
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [showUpload, setShowUpload] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (!session) {
      router.push("/auth/signin");
      return;
    }
  }, [session, status, router]);

  // Utility function to build file tree from flat data
  const buildFileTree = (files: File[], folders: Folder[]): FileNode[] => {
    const tree: FileNode[] = [];

    // Add folders first
    folders.forEach((folder) => {
      tree.push({
        id: folder.id,
        name: folder.name,
        type: "folder",
        createdAt: new Date(),
        updatedAt: new Date(),
        children: [],
      });
    });

    // Add files
    files.forEach((file) => {
      tree.push({
        id: file.id,
        name: file.name,
        type: "file",
        size: file.size,
        mimeType: file.mimeType,
        createdAt: new Date(file.createdAt),
        updatedAt: new Date(file.updatedAt),
      });
    });

    return tree;
  };

  // Load real data from API
  useEffect(() => {
    if (!session) return;

    const loadData = async () => {
      try {
        // In a real app, you would fetch from your API
        console.log("Loading files and folders...");
        
        // Demo data with AI processing results
        const demoFiles: File[] = [
          {
            id: 'demo-1',
            name: 'Marketing_Strategy_2024.pdf',
            size: 2450000,
            mimeType: 'application/pdf',
            createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            updatedAt: new Date(Date.now() - 86400000).toISOString(),
            processingStatus: 'COMPLETED',
            aiTags: ['business', 'marketing', 'strategy', 'planning', '2024', 'commercial'],
            aiSummary: 'Comprehensive marketing strategy document outlining plans for 2024, including target demographics, budget allocation, and campaign strategies across digital and traditional channels.',
            aiKeywords: ['marketing', 'strategy', 'digital', 'campaigns', 'budget', 'ROI']
          },
          {
            id: 'demo-2',
            name: 'Product_Screenshot_Dashboard.png',
            size: 1250000,
            mimeType: 'image/png',
            createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
            updatedAt: new Date(Date.now() - 172800000).toISOString(),
            processingStatus: 'COMPLETED',
            aiTags: ['screenshot', 'dashboard', 'ui', 'interface', 'analytics', 'charts'],
            aiSummary: 'Dashboard interface screenshot showing analytics data with charts, graphs, and key performance indicators for business metrics monitoring.',
            aiKeywords: ['dashboard', 'analytics', 'ui', 'charts', 'metrics', 'interface']
          },
          {
            id: 'demo-3',
            name: 'Meeting_Notes_Nov_2024.docx',
            size: 150000,
            mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
            updatedAt: new Date(Date.now() - 259200000).toISOString(),
            processingStatus: 'PROCESSING',
          },
          {
            id: 'demo-4',
            name: 'Financial_Report_Q3.xlsx',
            size: 850000,
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            createdAt: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
            updatedAt: new Date(Date.now() - 345600000).toISOString(),
            processingStatus: 'PENDING',
          }
        ];
        
        const demoFolders: Folder[] = [
          {
            id: 'folder-1',
            name: 'Marketing Materials',
            fileCount: 12,
            subfolderCount: 3
          },
          {
            id: 'folder-2',
            name: 'Project Documentation',
            fileCount: 8,
            subfolderCount: 2
          }
        ];

        setFiles(demoFiles);
        setFolders(demoFolders);
        
        // Simulate processing completion for the processing file
        setTimeout(() => {
          setFiles(prev => prev.map(f => 
            f.id === 'demo-3' 
              ? { 
                  ...f, 
                  processingStatus: 'COMPLETED' as const,
                  aiTags: ['meeting', 'notes', 'discussion', 'action-items', 'collaboration'],
                  aiSummary: 'Meeting notes from November 2024 discussing project updates, action items, and team collaboration strategies.',
                  aiKeywords: ['meeting', 'notes', 'action-items', 'collaboration', 'updates']
                }
              : f
          ));
        }, 3000);
      } catch (error) {
        console.error("Error loading data:", error);
        setFiles([]);
        setFolders([]);
        setFileTree([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [session]);

  // Build file tree when files or folders change
  useEffect(() => {
    const treeData = buildFileTree(files, folders);
    setFileTree(treeData);
    setFilteredFiles(files); // Initialize filtered files
  }, [files, folders]);

  // AI Processing function
  const processFileWithAI = async (fileId: string, file: { name: string; mimeType: string }) => {
    // Set processing status
    setFiles(prev => prev.map(f => 
      f.id === fileId 
        ? { ...f, processingStatus: 'PROCESSING' as const }
        : f
    ));

    try {
      const aiResult = await simulateAIProcessing(file);
      
      // Update file with AI results
      setFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { 
              ...f, 
              processingStatus: 'COMPLETED' as const,
              aiTags: aiResult.aiTags,
              aiSummary: aiResult.aiSummary,
              aiKeywords: aiResult.aiKeywords,
            }
          : f
      ));
    } catch (error) {
      console.error('AI processing failed:', error);
      setFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { ...f, processingStatus: 'FAILED' as const }
          : f
      ));
    }
  };

  // File tree handlers
  const handleTreeItemSelect = (id: string, multiSelect?: boolean) => {
    if (multiSelect) {
      setSelectedTreeItems((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
      );
    } else {
      setSelectedTreeItems([id]);
    }
  };

  const handleCreateFolder = (parentId?: string) => {
    console.log("Creating folder in:", parentId);
    // Here you would call your API to create a new folder
  };

  const handleUploadToFolder = (parentId?: string) => {
    console.log("Uploading to folder:", parentId);
    setShowUpload(true);
    // You could pass the parentId to the upload modal
  };

  const handleDeleteItem = (id: string) => {
    console.log("Deleting item:", id);
    // Here you would call your API to delete the item
  };

  const handleRenameItem = (id: string, newName: string) => {
    console.log("Renaming item:", id, "to:", newName);
    // Here you would call your API to rename the item
  };

  const handleSearch = (
    query: string,
    filters?: {
      fileTypes?: string[];
      dateRange?: string;
      hasAI?: boolean;
      tags?: string[];
    },
  ) => {
    setSearchQuery(query);
    console.log("AI-powered search:", query, filters);

    // Here you would implement AI-powered search logic:
    // 1. Send query to AI search API
    // 2. Include semantic search, content analysis, tag matching
    // 3. Filter by file types, date ranges, etc.
    // 4. Return ranked results based on relevance

    // For now, simple text matching
    if (query.trim()) {
      const filtered = files.filter(
        (file) =>
          file.name.toLowerCase().includes(query.toLowerCase()) ||
          (file.mimeType &&
            file.mimeType.toLowerCase().includes(query.toLowerCase())),
      );
      setFilteredFiles(filtered);
    } else {
      setFilteredFiles(files);
    }
  };

  const handleFileClick = (file: File) => {
    console.log("File clicked:", file);
    // Here you would open file preview/details
  };

  const handleFileDownload = (file: File) => {
    console.log("Downloading file:", file);
    // Here you would trigger file download
  };

  const handleFileDelete = (file: File) => {
    console.log("Deleting file:", file);
    setFiles((prev) => prev.filter((f) => f.id !== file.id));
  };

  if (loading || !session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <div className="ml-3">
                  <h1 className="text-lg font-semibold text-gray-900">Sortify</h1>
                  <p className="text-xs text-gray-500">AI-Powered Cloud Storage</p>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <AISearch
                onSearch={handleSearch}
                className="w-full"
                placeholder="Search files, folders, and content..."
                recentSearches={["documents", "images", "receipts"]}
              />
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setShowUpload(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
              
              {session?.user?.image && (
                <Image
                  src={session.user.image}
                  alt="Profile"
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              )}
              
              <Button
                onClick={() => signOut()}
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-900"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-72 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setShowUpload(true)}
                    className="w-full flex items-center px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors"
                  >
                    <Upload className="h-5 w-5 mr-3 text-blue-600" />
                    Upload Files
                  </button>
                  <button
                    onClick={() => handleCreateFolder()}
                    className="w-full flex items-center px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-lg transition-colors"
                  >
                    <Folder className="h-5 w-5 mr-3 text-green-600" />
                    New Folder
                  </button>
                </div>
              </div>

              {/* File Tree */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Files & Folders</h3>
                </div>
                <div className="p-2">
                  <FileTree
                    files={fileTree}
                    selectedItems={selectedTreeItems}
                    onSelectItem={handleTreeItemSelect}
                    onCreateFolder={handleCreateFolder}
                    onUploadFile={handleUploadToFolder}
                    onDeleteItem={handleDeleteItem}
                    onRenameItem={handleRenameItem}
                    className="max-h-96 overflow-y-auto"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              {/* Content Header */}
              <div className="border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">My Files</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {filteredFiles.length} file{filteredFiles.length !== 1 ? "s" : ""}
                      {selectedFiles.length > 0 && (
                        <span className="ml-2 text-blue-600">
                          • {selectedFiles.length} selected
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="flex items-center bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => setView("grid")}
                        className={`p-2 rounded-md transition-colors ${
                          view === "grid" 
                            ? "bg-white text-gray-900 shadow-sm" 
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        <Grid className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setView("list")}
                        className={`p-2 rounded-md transition-colors ${
                          view === "list" 
                            ? "bg-white text-gray-900 shadow-sm" 
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        <List className="h-4 w-4" />
                      </button>
                    </div>

                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    
                    <Button variant="outline" size="sm">
                      <SortAsc className="h-4 w-4 mr-2" />
                      Sort
                    </Button>
                  </div>
                </div>
              </div>

              {/* File Content */}
              <div className="p-6">
                {filteredFiles.length > 0 ? (
                  <div className={
                    view === "grid" 
                      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                      : "space-y-4"
                  }>
                    {filteredFiles.map((file) => (
                      <AIFileCard
                        key={file.id}
                        id={file.id}
                        name={file.name}
                        size={file.size}
                        mimeType={file.mimeType}
                        createdAt={file.createdAt}
                        updatedAt={file.updatedAt}
                        aiTags={file.aiTags}
                        aiSummary={file.aiSummary}
                        aiKeywords={file.aiKeywords}
                        processingStatus={file.processingStatus}
                        onClick={() => {
                          handleFileClick(file);
                          // Handle selection
                          setSelectedFiles(prev => 
                            prev.includes(file.id) 
                              ? prev.filter(id => id !== file.id)
                              : [...prev, file.id]
                          );
                        }}
                        onDownload={() => handleFileDownload(file)}
                        onDelete={() => handleFileDelete(file)}
                        className={
                          selectedFiles.includes(file.id) 
                            ? "ring-2 ring-blue-500 bg-blue-50" 
                            : ""
                        }
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Upload className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No files yet
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                      Get started by uploading your first file or creating a new folder
                    </p>
                    <Button
                      onClick={() => setShowUpload(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Files
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
            <div
              className="fixed inset-0 transition-opacity bg-black bg-opacity-50"
              onClick={() => setShowUpload(false)}
            />

            <div className="relative inline-block w-full max-w-2xl p-8 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900">
                    Upload Files
                  </h3>
                  <p className="text-gray-600 mt-1">
                    Add files to your Sortify storage with AI processing
                  </p>
                </div>
                <button
                  onClick={() => setShowUpload(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <span className="sr-only">Close</span>
                  ✕
                </button>
              </div>

              <S3FileUpload 
                onUpload={(uploadedFiles) => {
                  console.log('Files uploaded:', uploadedFiles);
                  // Convert uploaded files to our File interface
                  const newFiles: File[] = uploadedFiles.map((upload) => ({
                    id: upload.fileId || upload.id,
                    name: upload.file.name,
                    size: upload.file.size,
                    mimeType: upload.file.type,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    processingStatus: 'PENDING'
                  }));
                  
                  // Add files to state
                  setFiles(prev => [...prev, ...newFiles]);
                  
                  // Start AI processing for each file
                  newFiles.forEach(file => {
                    processFileWithAI(file.id, { name: file.name, mimeType: file.mimeType });
                  });
                  
                  setShowUpload(false);
                }}
                maxFiles={10}
                maxSize={100 * 1024 * 1024} // 100MB
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
