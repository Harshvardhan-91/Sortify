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
  Plus,
  FolderPlus,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  Archive,
  Brain,
  Star,
  Clock,
  Trash2,
  Cloud,
  HardDrive,
  Zap,
  BarChart3,
  Users,
  Shield,
  Download,
  Share2,
  Camera,
  Mic,
  FileCode,
  PieChart,
  TrendingUp,
  Sparkles,
  Bot,
  Scan,
  Search,
  Home,
  ChevronRight,
  ChevronDown,
  User,
} from "lucide-react";
import { S3FileUpload } from "@repo/ui/s3-file-upload";
import { SearchBar } from "@repo/ui/search-bar";
import { AISearch } from "@repo/ui/ai-search";
import { PDFPreview } from "@repo/ui/pdf-preview";
import { useToast } from "@repo/ui/toast";
import { FileTree } from "@repo/ui/file-tree";
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
  parentId?: string;
  fileCount: number;
  subfolderCount: number;
  createdAt: string;
  updatedAt: string;
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
  const { addToast } = useToast();
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
  const [showNewDropdown, setShowNewDropdown] = useState(false);
  const [activeSidebarItem, setActiveSidebarItem] = useState("my-drive");
  const [storageUsed, setStorageUsed] = useState(5.2); // GB
  const [storageTotal] = useState(15); // GB
  const [starredFiles, setStarredFiles] = useState<string[]>([]);
  const [trashedFiles, setTrashedFiles] = useState<File[]>([]);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  
  // PDF Preview
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  
  // Folder navigation
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [folderPath, setFolderPath] = useState<{ id: string; name: string }[]>([]);
  
  // Smart filtering and sorting
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size' | 'type' | 'ai-score'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterBy, setFilterBy] = useState<{
    type?: string;
    hasAI?: boolean;
    dateRange?: string;
  }>({});

  const handleSort = (newSortBy: typeof sortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  const handleFilter = (newFilter: typeof filterBy) => {
    setFilterBy(newFilter);
  };

  const getSortedAndFilteredFiles = (files: File[]) => {
    let filtered = [...files];

    // Apply filters
    if (filterBy.type) {
      filtered = filtered.filter(file => 
        file.mimeType?.includes(filterBy.type!) ||
        file.name.toLowerCase().includes(filterBy.type!.toLowerCase())
      );
    }

    if (filterBy.hasAI) {
      filtered = filtered.filter(file => 
        file.processingStatus === 'COMPLETED' && (file.aiTags?.length || 0) > 0
      );
    }

    if (filterBy.dateRange) {
      const now = new Date();
      const cutoff = new Date();
      
      switch (filterBy.dateRange) {
        case 'today':
          cutoff.setDate(now.getDate() - 1);
          break;
        case 'week':
          cutoff.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoff.setMonth(now.getMonth() - 1);
          break;
      }
      
      filtered = filtered.filter(file => 
        new Date(file.updatedAt) >= cutoff
      );
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'date':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        case 'size':
          comparison = a.size - b.size;
          break;
        case 'type':
          comparison = (a.mimeType || '').localeCompare(b.mimeType || '');
          break;
        case 'ai-score': {
          const aScore = (a.aiTags?.length || 0) + (a.aiSummary ? 1 : 0);
          const bScore = (b.aiTags?.length || 0) + (b.aiSummary ? 1 : 0);
          comparison = aScore - bScore;
          break;
        }
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  };

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
        setLoading(true);
        
        // Fetch files from API
        const filesResponse = await fetch('/api/files');
        const foldersResponse = await fetch('/api/folders');
        
        if (filesResponse.ok && foldersResponse.ok) {
          const filesData = await filesResponse.json();
          const foldersData = await foldersResponse.json();
          
          setFiles(filesData);
          setFolders(foldersData);
          
          // Auto-process files that haven't been processed yet
          filesData.forEach((file: File) => {
            if (!file.processingStatus || file.processingStatus === 'PENDING') {
              processFileWithAI(file.id, { name: file.name, mimeType: file.mimeType });
            }
          });
        } else {
          // If API fails, create sample data for demonstration
          const sampleFiles: File[] = [
            {
              id: 'file-1',
              name: 'Harshvardhan_resume.pdf',
              size: 148122,
              mimeType: 'application/pdf',
              createdAt: new Date('2025-09-08').toISOString(),
              updatedAt: new Date('2025-09-08').toISOString(),
              processingStatus: 'COMPLETED',
              aiTags: ['document', 'pdf', 'text'],
              aiSummary: 'PDF document "Harshvardhan_resume.pdf" contains structured text content with multiple pages and formatting.',
              aiKeywords: ['resume', 'cv', 'professional', 'experience'],
            },
            {
              id: 'file-2',
              name: 'Project_Presentation.pptx',
              size: 2456789,
              mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
              createdAt: new Date('2025-09-07').toISOString(),
              updatedAt: new Date('2025-09-07').toISOString(),
              processingStatus: 'COMPLETED',
              aiTags: ['presentation', 'slides', 'project'],
              aiSummary: 'PowerPoint presentation covering project milestones, achievements, and future roadmap.',
              aiKeywords: ['presentation', 'project', 'slides', 'business'],
            },
            {
              id: 'file-3',
              name: 'Financial_Report_Q3.xlsx',
              size: 567890,
              mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              createdAt: new Date('2025-09-06').toISOString(),
              updatedAt: new Date('2025-09-06').toISOString(),
              processingStatus: 'COMPLETED',
              aiTags: ['spreadsheet', 'financial', 'data'],
              aiSummary: 'Financial report containing Q3 revenue, expenses, and profit analysis with charts and tables.',
              aiKeywords: ['financial', 'report', 'quarterly', 'revenue'],
            }
          ];

          const sampleFolders: Folder[] = [
            {
              id: 'folder-1',
              name: 'Documents',
              parentId: 'root',
              fileCount: 12,
              subfolderCount: 2,
              createdAt: new Date('2025-09-01').toISOString(),
              updatedAt: new Date('2025-09-08').toISOString(),
            },
            {
              id: 'folder-2', 
              name: 'Projects',
              parentId: 'root',
              fileCount: 8,
              subfolderCount: 3,
              createdAt: new Date('2025-08-15').toISOString(),
              updatedAt: new Date('2025-09-07').toISOString(),
            }
          ];
          
          setFiles(sampleFiles);
          setFolders(sampleFolders);
          
          addToast({
            type: 'info',
            title: 'Demo Mode',
            description: 'Showing sample files for demonstration. Upload your own files to get started!',
            duration: 4000,
          });
        }
      } catch (error) {
        console.error("Error loading data:", error);
        // Create sample data for offline demo
        setFiles([
          {
            id: 'file-1',
            name: 'Harshvardhan_resume.pdf',
            size: 148122,
            mimeType: 'application/pdf',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            processingStatus: 'COMPLETED',
            aiTags: ['document', 'pdf', 'text'],
            aiSummary: 'PDF document "Harshvardhan_resume.pdf" contains structured text content with multiple pages and formatting.',
          }
        ]);
        setFolders([]);
        
        addToast({
          type: 'warning',
          title: 'Offline Mode',
          description: 'Running in offline mode with sample data.',
          duration: 3000,
        });
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

  // Helper functions for different sections
  const getCurrentSectionFiles = () => {
    let baseFiles: File[] = [];
    
    switch (activeSidebarItem) {
      case "starred":
        baseFiles = files.filter(f => starredFiles.includes(f.id));
        break;
      case "recent":
        baseFiles = [...files].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 20);
        break;
      case "trash":
        return getSortedAndFilteredFiles(trashedFiles);
      case "shared":
        baseFiles = []; // Would be implemented with shared files API
        break;
      case "ai-insights":
        baseFiles = files.filter(f => f.processingStatus === 'COMPLETED');
        break;
      case "smart-search":
        baseFiles = filteredFiles;
        break;
      default:
        baseFiles = filteredFiles;
    }

    // Filter by current folder if navigating within folders
    if (currentFolderId && activeSidebarItem !== "smart-search") {
      baseFiles = baseFiles.filter(f => f.folderId === currentFolderId);
    } else if (activeSidebarItem !== "smart-search") {
      // Show root level files (no folder or root folder)
      baseFiles = baseFiles.filter(f => !f.folderId || f.folderId === 'root');
    }
    
    return getSortedAndFilteredFiles(baseFiles);
  };

  const getCurrentSectionFolders = () => {
    if (activeSidebarItem === "trash" || activeSidebarItem === "starred" || activeSidebarItem === "recent") {
      return []; // These sections don't show folders
    }
    
    // Filter folders by current location
    if (currentFolderId) {
      return folders.filter(f => f.parentId === currentFolderId);
    }
    
    // Show root level folders
    return folders.filter(f => !f.parentId || f.parentId === 'root');
  };

  const navigateToFolder = (folderId: string, folderName: string) => {
    setCurrentFolderId(folderId);
    setFolderPath(prev => [...prev, { id: folderId, name: folderName }]);
    setActiveSidebarItem("my-drive"); // Switch to My Drive when navigating folders
  };

  const navigateUp = () => {
    if (folderPath.length > 0) {
      const newPath = [...folderPath];
      newPath.pop();
      setFolderPath(newPath);
      
      if (newPath.length === 0) {
        setCurrentFolderId(null);
      } else {
        setCurrentFolderId(newPath[newPath.length - 1].id);
      }
    }
  };

  const navigateToRoot = () => {
    setCurrentFolderId(null);
    setFolderPath([]);
    setActiveSidebarItem("my-drive");
  };

  const getSectionTitle = () => {
    if (currentFolderId && folderPath.length > 0) {
      return folderPath[folderPath.length - 1].name;
    }
    
    switch (activeSidebarItem) {
      case "starred": return "Starred";
      case "recent": return "Recent";
      case "trash": return "Trash";
      case "shared": return "Shared with me";
      case "ai-insights": return "AI Insights";
      case "smart-search": return "Smart Search";
      default: return "My Files";
    }
  };

  const renderBreadcrumb = () => {
    if (activeSidebarItem !== "my-drive" && !currentFolderId) return null;
    
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
        <button
          onClick={navigateToRoot}
          className="hover:text-blue-600 transition-colors"
        >
          <Home className="h-4 w-4" />
        </button>
        
        {folderPath.map((folder, index) => (
          <React.Fragment key={folder.id}>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <button
              onClick={() => {
                const newPath = folderPath.slice(0, index + 1);
                setFolderPath(newPath);
                setCurrentFolderId(folder.id);
              }}
              className="hover:text-blue-600 transition-colors"
            >
              {folder.name}
            </button>
          </React.Fragment>
        ))}
      </div>
    );
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
    setShowCreateFolderModal(true);
  };

  const createFolder = () => {
    if (!newFolderName.trim()) return;
    
    const newFolder: Folder = {
      id: `folder-${Date.now()}`,
      name: newFolderName,
      parentId: currentFolderId || 'root',
      fileCount: 0,
      subfolderCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setFolders(prev => [...prev, newFolder]);
    setNewFolderName("");
    setShowCreateFolderModal(false);
  };

  const handleUploadToFolder = (parentId?: string) => {
    console.log("Uploading to folder:", parentId);
    setShowUpload(true);
  };

  const handleDeleteItem = (id: string) => {
    console.log("Deleting item:", id);
  };

  const handleRenameItem = (id: string, newName: string) => {
    console.log("Renaming item:", id, "to:", newName);
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

    if (!query.trim()) {
      setFilteredFiles(files);
      return;
    }

    // Enhanced AI-powered search logic
    const searchTerms = query.toLowerCase().split(' ');
    let filtered = files.filter(file => {
      const fileName = file.name.toLowerCase();
      const fileType = file.mimeType?.toLowerCase() || '';
      const aiTags = file.aiTags?.join(' ').toLowerCase() || '';
      const aiSummary = file.aiSummary?.toLowerCase() || '';
      
      // Check if all search terms match in any field
      return searchTerms.every(term => 
        fileName.includes(term) ||
        fileType.includes(term) ||
        aiTags.includes(term) ||
        aiSummary.includes(term)
      );
    });

    // Apply additional filters
    if (filters?.fileTypes && filters.fileTypes.length > 0) {
      filtered = filtered.filter(file => 
        filters.fileTypes!.some(type => 
          file.mimeType?.includes(type) || 
          file.name.toLowerCase().includes(type.toLowerCase())
        )
      );
    }

    if (filters?.hasAI) {
      filtered = filtered.filter(file => 
        file.processingStatus === 'COMPLETED' && 
        (file.aiTags?.length || 0) > 0
      );
    }

    if (filters?.tags && filters.tags.length > 0) {
      filtered = filtered.filter(file => 
        file.aiTags?.some(tag => 
          filters.tags!.some(filterTag => 
            tag.toLowerCase().includes(filterTag.toLowerCase())
          )
        )
      );
    }

    setFilteredFiles(filtered);
    
    // Switch to smart search view if searching
    if (query.trim()) {
      setActiveSidebarItem("smart-search");
    }
  };

  const handleFileClick = (file: File) => {
    // For PDF files, open preview
    if (file.mimeType?.includes('pdf')) {
      setPreviewFile(file);
      setShowPDFPreview(true);
    } else {
      // For other files, you could open different previews or download
      addToast({
        type: 'info',
        title: 'File Preview',
        description: `Preview for ${file.name} will be available soon.`,
        duration: 3000,
      });
    }
  };

  const handleFileDownload = (file: File) => {
    // Simulate file download
    addToast({
      type: 'success',
      title: 'Download Started',
      description: `Downloading ${file.name}...`,
      duration: 3000,
    });
  };

  const handleStarFile = (file: File) => {
    const isStarred = starredFiles.includes(file.id);
    setStarredFiles(prev => 
      isStarred
        ? prev.filter(id => id !== file.id)
        : [...prev, file.id]
    );
    
    addToast({
      type: 'success',
      title: isStarred ? 'Removed from Starred' : 'Added to Starred',
      description: `${file.name} ${isStarred ? 'removed from' : 'added to'} starred files.`,
      duration: 2000,
    });
  };

  const handleShareFile = (file: File) => {
    // Generate shareable link
    const shareUrl = `${window.location.origin}/shared/${file.id}`;
    navigator.clipboard.writeText(shareUrl);
    
    addToast({
      type: 'success',
      title: 'Link Copied',
      description: 'Share link copied to clipboard!',
      duration: 3000,
    });
  };

  const handleGenerateAISummary = async (file: File) => {
    // Update file to show AI processing
    setFiles(prev => prev.map(f => 
      f.id === file.id 
        ? { ...f, processingStatus: 'PROCESSING' as const }
        : f
    ));

    addToast({
      type: 'info',
      title: 'AI Processing',
      description: `Generating AI summary for ${file.name}...`,
      duration: 2000,
    });

    try {
      // Simulate AI summary generation
      const summary = await simulateAISummary(file);
      
      setFiles(prev => prev.map(f => 
        f.id === file.id 
          ? { 
              ...f, 
              aiSummary: summary,
              processingStatus: 'COMPLETED' as const
            }
          : f
      ));
      
      addToast({
        type: 'success',
        title: 'AI Summary Generated',
        description: `AI summary for ${file.name} has been generated successfully.`,
        duration: 3000,
      });
    } catch (error) {
      console.error('AI summary generation failed:', error);
      setFiles(prev => prev.map(f => 
        f.id === file.id 
          ? { ...f, processingStatus: 'FAILED' as const }
          : f
      ));
      
      addToast({
        type: 'error',
        title: 'AI Processing Failed',
        description: `Failed to generate AI summary for ${file.name}.`,
        duration: 4000,
      });
    }
  };

  const handleAnalyzeFile = async (file: File) => {
    // Update file to show AI processing
    setFiles(prev => prev.map(f => 
      f.id === file.id 
        ? { ...f, processingStatus: 'PROCESSING' as const }
        : f
    ));

    addToast({
      type: 'info',
      title: 'AI Analysis',
      description: `Analyzing ${file.name} with AI...`,
      duration: 2000,
    });

    try {
      // Simulate AI analysis
      const aiResult = await simulateAIProcessing(file);
      
      setFiles(prev => prev.map(f => 
        f.id === file.id 
          ? { 
              ...f, 
              processingStatus: 'COMPLETED' as const,
              aiTags: aiResult.aiTags,
              aiSummary: aiResult.aiSummary,
              aiKeywords: aiResult.aiKeywords,
            }
          : f
      ));
      
      addToast({
        type: 'success',
        title: 'AI Analysis Complete',
        description: `${file.name} has been analyzed with AI successfully.`,
        duration: 3000,
      });
    } catch (error) {
      console.error('AI analysis failed:', error);
      setFiles(prev => prev.map(f => 
        f.id === file.id 
          ? { ...f, processingStatus: 'FAILED' as const }
          : f
      ));
      
      addToast({
        type: 'error',
        title: 'AI Analysis Failed',
        description: `Failed to analyze ${file.name}.`,
        duration: 4000,
      });
    }
  };

  const simulateAISummary = async (file: { name: string; mimeType?: string }): Promise<string> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (['pdf', 'doc', 'docx', 'txt'].includes(extension || '')) {
      return `This document contains important information about ${file.name.split('.')[0]}. Key topics include data analysis, recommendations, and strategic insights.`;
    } else if (['jpg', 'jpeg', 'png', 'gif'].includes(extension || '')) {
      return `This image shows visual content related to ${file.name.split('.')[0]}. Contains graphical elements and may include text or diagrams.`;
    } else {
      return `This ${extension?.toUpperCase() || 'file'} contains structured data and information that can be processed for insights.`;
    }
  };

  const handleFileDelete = (file: File) => {
    // Move to trash instead of permanent delete
    setTrashedFiles(prev => [...prev, file]);
    setFiles(prev => prev.filter(f => f.id !== file.id));
  };

  const handleRestoreFile = (file: File) => {
    setFiles(prev => [...prev, file]);
    setTrashedFiles(prev => prev.filter(f => f.id !== file.id));
  };

  const handlePermanentDelete = (file: File) => {
    setTrashedFiles(prev => prev.filter(f => f.id !== file.id));
  };

  // Render content based on active sidebar section
  const renderSectionContent = () => {
    const sectionFiles = getCurrentSectionFiles();

    // Empty states for different sections
    const renderEmptyState = () => {
      switch (activeSidebarItem) {
        case "starred":
          return (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-yellow-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No starred files
              </h3>
              <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                Add stars to files you want to easily find later
              </p>
            </div>
          );
        
        case "trash":
          return (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Trash is empty
              </h3>
              <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                Files in trash are permanently deleted after 30 days
              </p>
            </div>
          );
        
        case "shared":
          return (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No shared files
              </h3>
              <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                Files shared with you will appear here
              </p>
            </div>
          );

        case "ai-insights":
          return (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No AI insights yet
              </h3>
              <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                Upload files to get AI-powered insights and analysis
              </p>
              <Button
                onClick={() => setShowUpload(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Files
              </Button>
            </div>
          );

        default:
          return (
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
          );
      }
    };

    // Special view for AI Insights
    if (activeSidebarItem === "ai-insights" && sectionFiles.length > 0) {
      return (
        <div className="space-y-6">
          {/* AI Insights Summary */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <Sparkles className="h-6 w-6 text-purple-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">AI Analysis Summary</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{sectionFiles.length}</div>
                <div className="text-sm text-gray-600">Files Analyzed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {sectionFiles.reduce((acc, f) => acc + (f.aiTags?.length || 0), 0)}
                </div>
                <div className="text-sm text-gray-600">Tags Generated</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(sectionFiles.length / files.length * 100)}%
                </div>
                <div className="text-sm text-gray-600">Processing Rate</div>
              </div>
            </div>
          </div>

          {/* Files Grid */}
          <div className={
            view === "grid" 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4 auto-rows-max" 
              : "space-y-4"
          }>
            {sectionFiles.map((file) => (
              <AIFileCard
                key={file.id}
                id={file.id}
                name={file.name}
                size={file.size}
                updatedAt={file.updatedAt}
                aiTags={file.aiTags}
                aiSummary={file.aiSummary}
                processingStatus={file.processingStatus}
                onClick={() => handleFileClick(file)}
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
        </div>
      );
    }

    // Regular file and folder grid view
    const sectionFolders = getCurrentSectionFolders();
    if (sectionFiles.length > 0 || sectionFolders.length > 0) {
      return (
        <div className="space-y-6">
          {/* Show folders first */}
          {sectionFolders.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Folders</h3>
              <div className={
                view === "grid" 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4 auto-rows-max" 
                  : "space-y-4"
              }>
                {sectionFolders.map((folder) => (
                  <FolderCard
                    key={folder.id}
                    name={folder.name}
                    onClick={() => navigateToFolder(folder.id, folder.name)}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Show files */}
          {sectionFiles.length > 0 && (
            <div>
              {sectionFolders.length > 0 && <h3 className="text-sm font-medium text-gray-700 mb-3">Files</h3>}
              <div className={
                view === "grid" 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4 auto-rows-max" 
                  : "space-y-4"
              }>
                {sectionFiles.map((file) => (
                  <AIFileCard
                    key={file.id}
                    id={file.id}
                    name={file.name}
                    size={file.size}
                    updatedAt={file.updatedAt}
                    aiTags={file.aiTags}
                    aiSummary={file.aiSummary}
                    processingStatus={file.processingStatus}
                    onClick={() => {
                      handleFileClick(file);
                      setSelectedFiles(prev => 
                        prev.includes(file.id) 
                          ? prev.filter(id => id !== file.id)
                          : [...prev, file.id]
                      );
                    }}
                    onDownload={() => handleFileDownload(file)}
                    onDelete={() => 
                      activeSidebarItem === "trash" 
                        ? handlePermanentDelete(file)
                        : handleFileDelete(file)
                    }
                    className={
                      selectedFiles.includes(file.id) 
                        ? "ring-2 ring-blue-500 bg-blue-50" 
                        : ""
                    }
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Show restore button for trash items */}
          {activeSidebarItem === "trash" && sectionFiles.length > 0 && (
            <div className="mt-6 text-center">
              <Button
                onClick={() => {
                  sectionFiles.forEach(file => handleRestoreFile(file));
                }}
                variant="outline"
                className="mr-4"
              >
                Restore All
              </Button>
              <Button
                onClick={() => {
                  sectionFiles.forEach(file => handlePermanentDelete(file));
                }}
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                Delete Permanently
              </Button>
            </div>
          )}
        </div>
      );
    }

    return renderEmptyState();
  };

  // Folder card component
  const FolderCard = ({ 
    name, onClick, className 
  }: {
    name: string;
    onClick: () => void;
    className?: string;
  }) => (
    <div 
      className={`border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-200 cursor-pointer group bg-white ${className}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Folder className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 truncate">{name}</h3>
            <p className="text-xs text-gray-500">Folder</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={(e) => {
              e.stopPropagation();
              // Handle folder options
            }}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-4">
        <span className="text-xs text-gray-500">
          Click to open
        </span>
        
        <div className="flex items-center space-x-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 hover:bg-yellow-50"
            onClick={(e) => {
              e.stopPropagation();
              // Handle star toggle
            }}
          >
            <Star className="h-4 w-4 text-gray-400 hover:text-yellow-500" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 hover:bg-blue-50"
            onClick={(e) => {
              e.stopPropagation();
              // Handle share
            }}
          >
            <Share2 className="h-4 w-4 text-gray-400 hover:text-blue-500" />
          </Button>
        </div>
      </div>
    </div>
  );

  // AI-enhanced file card component
  const AIFileCard = ({ 
    id, name, size, updatedAt, 
    aiTags, aiSummary, processingStatus,
    onClick, onDownload, onDelete, className 
  }: {
    id: string;
    name: string;
    size: number;
    updatedAt: string;
    aiTags?: string[];
    aiSummary?: string;
    processingStatus?: string;
    onClick: () => void;
    onDownload: () => void;
    onDelete: () => void;
    className?: string;
  }) => {
    const isStarred = starredFiles.includes(id);
    
    return (
      <div 
        className={`border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-200 cursor-pointer group bg-white ${className}`}
        onClick={onClick}
        onDoubleClick={() => {
          // Handle double click for preview
          const file = files.find(f => f.id === id) || { id, name, size, updatedAt, aiTags, aiSummary, processingStatus, mimeType: name.endsWith('.pdf') ? 'application/pdf' : 'unknown' } as File;
          handleFileClick(file);
        }}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
              {getFileIcon(name)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 truncate">{name}</h3>
              <p className="text-xs text-gray-500">
                {formatFileSize(size)} • {new Date(updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onDownload();
              }}
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* AI Processing Status */}
        {processingStatus && (
          <div className="mb-3">
            <div className="flex items-center space-x-2">
              <Brain className="h-4 w-4 text-purple-500" />
              <span className="text-xs text-purple-700 font-medium">
                {processingStatus === "PROCESSING" ? "AI Processing..." : "AI Analysis Complete"}
              </span>
            </div>
          </div>
        )}

        {/* AI Tags */}
        {aiTags && aiTags.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {aiTags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  <Zap className="h-3 w-3 mr-1" />
                  {tag}
                </span>
              ))}
              {aiTags.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{aiTags.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* AI Summary */}
        {aiSummary && (
          <div className="mb-3">
            <p className="text-sm text-gray-600 line-clamp-2">
              {aiSummary}
            </p>
          </div>
        )}

        {/* AI Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-4">
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              className="text-xs px-3 py-1.5 h-auto border-blue-200 text-blue-700 hover:bg-blue-50"
              onClick={(e) => {
                e.stopPropagation();
                const file = files.find(f => f.id === id) || { id, name, size, updatedAt, aiTags, aiSummary, processingStatus } as File;
                handleGenerateAISummary(file);
              }}
              disabled={processingStatus === 'PROCESSING'}
            >
              <Sparkles className="h-3 w-3 mr-1" />
              {processingStatus === 'PROCESSING' ? 'Processing...' : 'AI Summary'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs px-3 py-1.5 h-auto border-purple-200 text-purple-700 hover:bg-purple-50"
              onClick={(e) => {
                e.stopPropagation();
                const file = files.find(f => f.id === id) || { id, name, size, updatedAt, aiTags, aiSummary, processingStatus } as File;
                handleAnalyzeFile(file);
              }}
              disabled={processingStatus === 'PROCESSING'}
            >
              <Brain className="h-3 w-3 mr-1" />
              {processingStatus === 'PROCESSING' ? 'Analyzing...' : 'Analyze'}
            </Button>
          </div>
          
          <div className="flex items-center space-x-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 hover:bg-yellow-50"
              onClick={(e) => {
                e.stopPropagation();
                const file = files.find(f => f.id === id) || { id, name, size, updatedAt, aiTags, aiSummary, processingStatus } as File;
                handleStarFile(file);
              }}
            >
              <Star className={`h-4 w-4 ${isStarred ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`} />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 hover:bg-blue-50"
              onClick={(e) => {
                e.stopPropagation();
                const file = files.find(f => f.id === id) || { id, name, size, updatedAt, aiTags, aiSummary, processingStatus } as File;
                handleShareFile(file);
              }}
            >
              <Share2 className="h-4 w-4 text-gray-400 hover:text-blue-500" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string, mimeType?: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const type = mimeType || '';

    // Folder
    if (!extension) {
      return <Folder className="h-5 w-5 text-yellow-600" />;
    }

    // Documents
    if (['pdf'].includes(extension) || type.includes('pdf')) {
      return (
        <div className="w-5 h-5 bg-red-500 rounded flex items-center justify-center">
          <span className="text-white text-xs font-bold">PDF</span>
        </div>
      );
    }

    if (['doc', 'docx'].includes(extension) || type.includes('msword') || type.includes('wordprocessingml')) {
      return (
        <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
          <span className="text-white text-xs font-bold">W</span>
        </div>
      );
    }

    if (['xls', 'xlsx'].includes(extension) || type.includes('excel') || type.includes('spreadsheetml')) {
      return (
        <div className="w-5 h-5 bg-green-600 rounded flex items-center justify-center">
          <span className="text-white text-xs font-bold">X</span>
        </div>
      );
    }

    if (['ppt', 'pptx'].includes(extension) || type.includes('presentation')) {
      return (
        <div className="w-5 h-5 bg-orange-600 rounded flex items-center justify-center">
          <span className="text-white text-xs font-bold">P</span>
        </div>
      );
    }

    if (['txt', 'rtf'].includes(extension) || type.includes('text/plain')) {
      return <FileText className="h-5 w-5 text-gray-600" />;
    }

    // Images
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'ico'].includes(extension) || type.includes('image')) {
      return <ImageIcon className="h-5 w-5 text-green-600" />;
    }

    // Videos
    if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'].includes(extension) || type.includes('video')) {
      return <Video className="h-5 w-5 text-purple-600" />;
    }

    // Audio
    if (['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma'].includes(extension) || type.includes('audio')) {
      return <Music className="h-5 w-5 text-pink-600" />;
    }

    // Archives
    if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(extension)) {
      return <Archive className="h-5 w-5 text-yellow-600" />;
    }

    // Code files
    if (['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'py', 'java', 'cpp', 'c', 'php', 'rb', 'go', 'rs'].includes(extension)) {
      return <FileCode className="h-5 w-5 text-blue-500" />;
    }

    // Default
    return <FileText className="h-5 w-5 text-gray-600" />;
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
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Modern Header */}
      <header className="bg-white border-b border-gray-200 flex-shrink-0 z-40">
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
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search files and folders..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    handleSearch(e.target.value);
                  }}
                  className="block w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 text-gray-900 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <div className="flex items-center space-x-1">
                    <kbd className="inline-flex items-center px-2 py-1 border border-gray-200 rounded text-xs font-sans font-medium text-gray-400">
                      Ctrl+K
                    </kbd>
                  </div>
                </div>
              </div>
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
              
              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  {session?.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt="Profile"
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {session?.user?.name?.[0] || session?.user?.email?.[0] || 'U'}
                      </span>
                    </div>
                  )}
                </button>
                
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <div className="text-sm font-medium text-gray-900">
                        {session?.user?.name || 'User'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {session?.user?.email}
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => { router.push("/profile"); setUserDropdownOpen(false); }}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors"
                    >
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-900 text-sm">Profile</span>
                    </button>
                    
                    <button 
                      onClick={() => { router.push("/settings"); setUserDropdownOpen(false); }}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors"
                    >
                      <Settings className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-900 text-sm">Settings</span>
                    </button>
                    
                    <hr className="my-2" />
                    
                    <button 
                      onClick={() => { signOut(); setUserDropdownOpen(false); }}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors text-red-600"
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="text-sm">Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Fixed Height with Scroll */}
      <div className="flex-1 flex overflow-hidden">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 flex gap-4 lg:gap-6 overflow-hidden">
          {/* Advanced Sidebar - Fixed Width, Scrollable Content */}
          <div className="w-72 lg:w-80 flex-shrink-0 overflow-y-auto scrollbar-hide hidden md:block">
            <div className="space-y-4 pb-6">
              
              {/* New Button with Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowNewDropdown(!showNewDropdown)}
                  className="w-full bg-white border border-gray-300 hover:bg-gray-50 rounded-xl px-6 py-4 flex items-center justify-between shadow-sm transition-all hover:shadow-md"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-4">
                      <Plus className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-semibold text-gray-900 text-lg">New</span>
                  </div>
                  <ChevronDown 
                    className={`h-5 w-5 text-gray-400 transition-transform ${showNewDropdown ? 'rotate-180' : ''}`} 
                  />
                </button>

                {/* Dropdown Menu */}
                {showNewDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                    <button
                      onClick={() => {
                        setShowUpload(true);
                        setShowNewDropdown(false);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center"
                    >
                      <Upload className="h-5 w-5 mr-3 text-blue-600" />
                      <div>
                        <div className="font-medium text-gray-900">File upload</div>
                        <div className="text-xs text-gray-500">Upload documents, images, videos</div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => {
                        handleCreateFolder();
                        setShowNewDropdown(false);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center"
                    >
                      <FolderPlus className="h-5 w-5 mr-3 text-yellow-600" />
                      <div>
                        <div className="font-medium text-gray-900">New folder</div>
                        <div className="text-xs text-gray-500">Organize your files</div>
                      </div>
                    </button>

                    <hr className="my-2" />

                    <button className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center">
                      <FileText className="h-5 w-5 mr-3 text-blue-600" />
                      <div>
                        <div className="font-medium text-gray-900">AI Document</div>
                        <div className="text-xs text-gray-500">Create with AI assistance</div>
                      </div>
                    </button>

                    <button className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center">
                      <Scan className="h-5 w-5 mr-3 text-green-600" />
                      <div>
                        <div className="font-medium text-gray-900">Scan Document</div>
                        <div className="text-xs text-gray-500">Camera scan with OCR</div>
                      </div>
                    </button>

                    <button className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center">
                      <Mic className="h-5 w-5 mr-3 text-red-600" />
                      <div>
                        <div className="font-medium text-gray-900">Voice Note</div>
                        <div className="text-xs text-gray-500">Record and transcribe</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* Navigation Menu */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <nav className="py-2">
                  <button
                    onClick={() => setActiveSidebarItem("home")}
                    className={`w-full px-6 py-3 text-left flex items-center hover:bg-gray-50 transition-colors ${
                      activeSidebarItem === "home" ? "bg-blue-50 border-r-4 border-blue-600" : ""
                    }`}
                  >
                    <Home className={`h-5 w-5 mr-4 ${activeSidebarItem === "home" ? "text-blue-600" : "text-gray-600"}`} />
                    <span className={`font-medium ${activeSidebarItem === "home" ? "text-blue-900" : "text-gray-900"}`}>
                      Home
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveSidebarItem("my-drive")}
                    className={`w-full px-6 py-3 text-left flex items-center hover:bg-gray-50 transition-colors ${
                      activeSidebarItem === "my-drive" ? "bg-blue-50 border-r-4 border-blue-600" : ""
                    }`}
                  >
                    <HardDrive className={`h-5 w-5 mr-4 ${activeSidebarItem === "my-drive" ? "text-blue-600" : "text-gray-600"}`} />
                    <span className={`font-medium ${activeSidebarItem === "my-drive" ? "text-blue-900" : "text-gray-900"}`}>
                      My Sortify
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveSidebarItem("ai-insights")}
                    className={`w-full px-6 py-3 text-left flex items-center hover:bg-gray-50 transition-colors ${
                      activeSidebarItem === "ai-insights" ? "bg-purple-50 border-r-4 border-purple-600" : ""
                    }`}
                  >
                    <Brain className={`h-5 w-5 mr-4 ${activeSidebarItem === "ai-insights" ? "text-purple-600" : "text-gray-600"}`} />
                    <span className={`font-medium ${activeSidebarItem === "ai-insights" ? "text-purple-900" : "text-gray-900"}`}>
                      AI Insights
                    </span>
                    <Sparkles className="h-3 w-3 ml-auto text-purple-500" />
                  </button>

                  <button
                    onClick={() => setActiveSidebarItem("smart-search")}
                    className={`w-full px-6 py-3 text-left flex items-center hover:bg-gray-50 transition-colors ${
                      activeSidebarItem === "smart-search" ? "bg-green-50 border-r-4 border-green-600" : ""
                    }`}
                  >
                    <Search className={`h-5 w-5 mr-4 ${activeSidebarItem === "smart-search" ? "text-green-600" : "text-gray-600"}`} />
                    <span className={`font-medium ${activeSidebarItem === "smart-search" ? "text-green-900" : "text-gray-900"}`}>
                      Smart Search
                    </span>
                  </button>
                </nav>

                <hr className="border-gray-200" />

                <nav className="py-2">
                  <button
                    onClick={() => setActiveSidebarItem("shared")}
                    className={`w-full px-6 py-3 text-left flex items-center hover:bg-gray-50 transition-colors ${
                      activeSidebarItem === "shared" ? "bg-blue-50 border-r-4 border-blue-600" : ""
                    }`}
                  >
                    <Users className={`h-5 w-5 mr-4 ${activeSidebarItem === "shared" ? "text-blue-600" : "text-gray-600"}`} />
                    <span className={`font-medium ${activeSidebarItem === "shared" ? "text-blue-900" : "text-gray-900"}`}>
                      Shared with me
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveSidebarItem("recent")}
                    className={`w-full px-6 py-3 text-left flex items-center hover:bg-gray-50 transition-colors ${
                      activeSidebarItem === "recent" ? "bg-blue-50 border-r-4 border-blue-600" : ""
                    }`}
                  >
                    <Clock className={`h-5 w-5 mr-4 ${activeSidebarItem === "recent" ? "text-blue-600" : "text-gray-600"}`} />
                    <span className={`font-medium ${activeSidebarItem === "recent" ? "text-blue-900" : "text-gray-900"}`}>
                      Recent
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveSidebarItem("starred")}
                    className={`w-full px-6 py-3 text-left flex items-center hover:bg-gray-50 transition-colors ${
                      activeSidebarItem === "starred" ? "bg-yellow-50 border-r-4 border-yellow-600" : ""
                    }`}
                  >
                    <Star className={`h-5 w-5 mr-4 ${activeSidebarItem === "starred" ? "text-yellow-600" : "text-gray-600"}`} />
                    <span className={`font-medium ${activeSidebarItem === "starred" ? "text-yellow-900" : "text-gray-900"}`}>
                      Starred
                    </span>
                  </button>
                </nav>

                <hr className="border-gray-200" />

                <nav className="py-2">
                  <button
                    onClick={() => setActiveSidebarItem("trash")}
                    className={`w-full px-6 py-3 text-left flex items-center hover:bg-gray-50 transition-colors ${
                      activeSidebarItem === "trash" ? "bg-red-50 border-r-4 border-red-600" : ""
                    }`}
                  >
                    <Trash2 className={`h-5 w-5 mr-4 ${activeSidebarItem === "trash" ? "text-red-600" : "text-gray-600"}`} />
                    <span className={`font-medium ${activeSidebarItem === "trash" ? "text-red-900" : "text-gray-900"}`}>
                      Trash
                    </span>
                  </button>
                </nav>
              </div>

              {/* AI Analytics Card */}
              <div className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl p-6 text-white">
                <div className="flex items-center mb-4">
                  <Bot className="h-6 w-6 mr-3" />
                  <h3 className="font-semibold">AI Analytics</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-purple-100 text-sm">Files Processed</span>
                    <span className="font-semibold">{files.filter(f => f.processingStatus === 'COMPLETED').length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-purple-100 text-sm">Tags Generated</span>
                    <span className="font-semibold">{files.reduce((acc, f) => acc + (f.aiTags?.length || 0), 0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-purple-100 text-sm">Smart Insights</span>
                    <span className="font-semibold">12</span>
                  </div>
                </div>
              </div>

              {/* Storage Usage */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Storage</h3>
                  <Cloud className="h-5 w-5 text-gray-600" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{storageUsed} GB of {storageTotal} GB used</span>
                    <span className="text-gray-900 font-medium">{Math.round((storageUsed / storageTotal) * 100)}%</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all"
                      style={{ width: `${(storageUsed / storageTotal) * 100}%` }}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                      <span className="text-gray-600">Documents</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                      <span className="text-gray-600">Images</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-2" />
                      <span className="text-gray-600">Videos</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-gray-400 rounded-full mr-2" />
                      <span className="text-gray-600">Other</span>
                    </div>
                  </div>

                  <button className="w-full mt-4 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-2 px-4 rounded-lg transition-colors text-sm">
                    Upgrade Storage
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Dynamic Main Content Area - Flex-1, Scrollable */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden">
              {/* Content Header - Fixed */}
              <div className="border-b border-gray-200 px-4 sm:px-6 py-4 flex-shrink-0">
                {renderBreadcrumb()}
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="min-w-0">
                    <h2 className="text-xl font-semibold text-gray-900 truncate">{getSectionTitle()}</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {getCurrentSectionFiles().length + getCurrentSectionFolders().length} item{(getCurrentSectionFiles().length + getCurrentSectionFolders().length) !== 1 ? "s" : ""}
                      {selectedFiles.length > 0 && (
                        <span className="ml-2 text-blue-600">
                          • {selectedFiles.length} selected
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center space-x-3 flex-shrink-0">
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

                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="hidden sm:flex items-center border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      onClick={() => {
                        const newFilter = { ...filterBy };
                        if (filterBy.hasAI) {
                          delete newFilter.hasAI;
                        } else {
                          newFilter.hasAI = true;
                        }
                        handleFilter(newFilter);
                      }}
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      <span className="text-gray-700">{filterBy.hasAI ? "AI Files" : "Filter"}</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="hidden sm:flex items-center border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      onClick={() => handleSort(sortBy === 'date' ? 'name' : 'date')}
                    >
                      <SortAsc className="h-4 w-4 mr-2" />
                      <span className="text-gray-700">
                        {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
                        {sortOrder === 'desc' ? ' ↓' : ' ↑'}
                      </span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Dynamic File Content - Scrollable */}
              <div className="flex-1 overflow-y-auto scrollbar-hide p-4 sm:p-6">
                {renderSectionContent()}
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
              className="fixed inset-0 transition-opacity bg-black/20 backdrop-blur-sm"
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
                    id: upload.fileId || upload.id || `file-${Date.now()}-${Math.random()}`,
                    name: upload.file.name,
                    size: upload.file.size,
                    mimeType: upload.file.type,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    processingStatus: 'PENDING',
                    folderId: currentFolderId || undefined, // Upload to current folder
                  }));
                  
                  // Add files to state
                  setFiles(prev => [...prev, ...newFiles]);
                  
                  // Start AI processing for each file
                  newFiles.forEach(file => {
                    processFileWithAI(file.id, { name: file.name, mimeType: file.mimeType });
                  });
                  
                  setShowUpload(false);
                  
                  // Show success notification
                  addToast({
                    type: 'success',
                    title: 'Files Uploaded Successfully',
                    description: `Successfully uploaded ${newFiles.length} file${newFiles.length > 1 ? 's' : ''} and started AI processing!`,
                    duration: 4000,
                  });
                }}
                maxFiles={10}
                maxSize={100 * 1024 * 1024} // 100MB
                className="w-full"
                acceptedTypes={[
                  'image/*',
                  'application/pdf',
                  'application/msword',
                  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                  'application/vnd.ms-excel',
                  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                  'text/*',
                  'video/*',
                  'audio/*'
                ]}
              />
            </div>
          </div>
        </div>
      )}

      {/* Create Folder Modal */}
      {showCreateFolderModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
            <div
              className="fixed inset-0 transition-opacity bg-black/20 backdrop-blur-sm"
              onClick={() => setShowCreateFolderModal(false)}
            />

            <div className="relative inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Create New Folder
                </h3>
                <button
                  onClick={() => setShowCreateFolderModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <span className="sr-only">Close</span>
                  ✕
                </button>
              </div>

              <div className="mb-4">
                <label htmlFor="folderName" className="block text-sm font-medium text-gray-700 mb-2">
                  Folder Name
                </label>
                <input
                  type="text"
                  id="folderName"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      createFolder();
                    }
                  }}
                  placeholder="Enter folder name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  autoFocus
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateFolderModal(false)}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                >
                  Cancel
                </Button>
                <Button
                  onClick={createFolder}
                  disabled={!newFolderName.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <FolderPlus className="h-4 w-4 mr-2" />
                  Create Folder
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PDF Preview Modal */}
      {showPDFPreview && previewFile && (
        <PDFPreview
          fileUrl={`/api/files/${previewFile.id}/preview`}
          fileName={previewFile.name}
          isOpen={showPDFPreview}
          onClose={() => {
            setShowPDFPreview(false);
            setPreviewFile(null);
          }}
          onDownload={() => handleFileDownload(previewFile)}
          onShare={() => handleShareFile(previewFile)}
        />
      )}
    </div>
  );
}
