'use client';

import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  Grid, 
  List, 
  Folder,
  Plus,
  Settings,
  User,
  Filter,
  SortAsc,
  Tags,
  Brain
} from 'lucide-react';
import { FileUpload } from '@repo/ui/file-upload';
import { SearchBar } from '@repo/ui/search-bar';
import { FileGrid } from '@repo/ui/file-grid';
import { Button } from '@repo/ui/button';

interface File {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  createdAt: string;
  updatedAt: string;
  aiTags?: string[];
  aiSummary?: string;
  processingStatus?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
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

export default function DashboardPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [showUpload, setShowUpload] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock data for demo
  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setFiles([
        {
          id: '1',
          name: 'Project Proposal.pdf',
          size: 2048576,
          mimeType: 'application/pdf',
          createdAt: '2025-01-15T10:30:00Z',
          updatedAt: '2025-01-15T10:30:00Z',
          aiTags: ['document', 'proposal', 'business'],
          aiSummary: 'A comprehensive project proposal outlining the development timeline and budget requirements.',
          processingStatus: 'COMPLETED'
        },
        {
          id: '2',
          name: 'Team Photo.jpg',
          size: 1048576,
          mimeType: 'image/jpeg',
          createdAt: '2025-01-14T15:20:00Z',
          updatedAt: '2025-01-14T15:20:00Z',
          aiTags: ['photo', 'people', 'team'],
          aiSummary: 'Team photo showing 8 people in an office setting.',
          processingStatus: 'COMPLETED'
        },
        {
          id: '3',
          name: 'Budget Spreadsheet.xlsx',
          size: 512000,
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          createdAt: '2025-01-13T09:15:00Z',
          updatedAt: '2025-01-13T09:15:00Z',
          aiTags: ['spreadsheet', 'budget', 'finance'],
          processingStatus: 'PROCESSING'
        }
      ]);

      setFolders([
        { id: '1', name: 'Documents', fileCount: 15, subfolderCount: 3 },
        { id: '2', name: 'Images', fileCount: 42, subfolderCount: 1 },
        { id: '3', name: 'Projects', fileCount: 8, subfolderCount: 5 }
      ]);

      setLoading(false);
    }, 1000);
  }, []);

  const handleFileUpload = (uploadedFiles: globalThis.File[]) => {
    console.log('Files uploaded:', uploadedFiles);
    // Here you would upload to your backend
    setShowUpload(false);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    console.log('Searching for:', query);
    // Here you would call your search API
  };

  const handleFileClick = (file: File) => {
    console.log('File clicked:', file);
    // Here you would open file preview/details
  };

  const handleFileDownload = (file: File) => {
    console.log('Downloading file:', file);
    // Here you would trigger file download
  };

  const handleFileShare = (file: File) => {
    console.log('Sharing file:', file);
    // Here you would open share dialog
  };

  const handleFileDelete = (file: File) => {
    console.log('Deleting file:', file);
    // Here you would delete the file
    setFiles(prev => prev.filter(f => f.id !== file.id));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your files...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Brain className="h-8 w-8 text-blue-600" />
                <span className="text-2xl font-bold text-gray-900">Sortify</span>
              </div>
            </div>

            <div className="flex-1 max-w-2xl mx-8">
              <SearchBar
                value={searchQuery}
                onSearch={handleSearch}
                onClear={() => setSearchQuery('')}
                placeholder="Search files, folders, or ask AI about your content..."
              />
            </div>

            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setShowUpload(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>

              <div className="flex items-center space-x-2 border border-gray-200 rounded-lg p-1">
                <button
                  onClick={() => setView('grid')}
                  className={`p-1.5 rounded ${view === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`p-1.5 rounded ${view === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Settings className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <User className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Folders</h3>
                <button className="text-gray-400 hover:text-gray-600">
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => setCurrentFolder(null)}
                  className={`flex items-center space-x-3 w-full text-left p-2 rounded-lg transition-colors ${
                    currentFolder === null ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Folder className="h-4 w-4" />
                  <span>All Files</span>
                  <span className="ml-auto text-sm text-gray-500">{files.length}</span>
                </button>

                {folders.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => setCurrentFolder(folder.id)}
                    className={`flex items-center space-x-3 w-full text-left p-2 rounded-lg transition-colors ${
                      currentFolder === folder.id ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Folder className="h-4 w-4" />
                    <span>{folder.name}</span>
                    <span className="ml-auto text-sm text-gray-500">{folder.fileCount}</span>
                  </button>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h4>
                <div className="space-y-2">
                  <button className="flex items-center space-x-3 w-full text-left p-2 rounded-lg text-gray-700 hover:bg-gray-50">
                    <Tags className="h-4 w-4" />
                    <span>Browse Tags</span>
                  </button>
                  <button className="flex items-center space-x-3 w-full text-left p-2 rounded-lg text-gray-700 hover:bg-gray-50">
                    <Brain className="h-4 w-4" />
                    <span>AI Insights</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {currentFolder ? folders.find(f => f.id === currentFolder)?.name : 'All Files'}
                </h1>
                <p className="text-gray-600 mt-1">
                  {files.length} file{files.length !== 1 ? 's' : ''} 
                  {selectedFiles.length > 0 && ` • ${selectedFiles.length} selected`}
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <button className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Filter className="h-4 w-4" />
                    <span>Filter</span>
                  </button>
                  <button className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                    <SortAsc className="h-4 w-4" />
                    <span>Sort</span>
                  </button>
                </div>
              </div>
            </div>

            {/* File Grid/List */}
            {files.length > 0 ? (
              <FileGrid
                files={files}
                onFileClick={handleFileClick}
                onDownload={handleFileDownload}
                onShare={handleFileShare}
                onDelete={handleFileDelete}
                selectedFiles={selectedFiles}
                onSelectionChange={setSelectedFiles}
                view={view}
              />
            ) : (
              <div className="text-center py-12">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No files yet</h3>
                <p className="text-gray-600 mb-6">Get started by uploading your first file</p>
                <Button
                  onClick={() => setShowUpload(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Files
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowUpload(false)}></div>

            <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Upload Files</h3>
                <button
                  onClick={() => setShowUpload(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  ✕
                </button>
              </div>

              <FileUpload onUpload={handleFileUpload} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
