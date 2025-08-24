'use client';

import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Share2, 
  Star, 
  Trash2, 
  Edit3,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  FileText
} from 'lucide-react';
import { Button } from './button';

interface File {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size: number;
  mimeType: string;
  createdAt: string;
  updatedAt: string;
  url?: string;
}

interface FilePreviewModalProps {
  file: File | null;
  files: File[];
  isOpen: boolean;
  onClose: () => void;
  onDownload: (file: File) => void;
  onShare: (file: File) => void;
  onDelete: (file: File) => void;
  onRename: (file: File) => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  file,
  files,
  isOpen,
  onClose,
  onDownload,
  onShare,
  onDelete,
  onRename
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  const fileIndex = files.findIndex(f => f.id === (file?.id || ''));
  
  React.useEffect(() => {
    if (fileIndex !== -1) {
      setCurrentIndex(fileIndex);
    }
  }, [file, fileIndex]);

  if (!isOpen || !file) return null;

  const currentFile = files[currentIndex] || file;

  const navigateToFile = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'next' 
      ? Math.min(currentIndex + 1, files.length - 1)
      : Math.max(currentIndex - 1, 0);
    setCurrentIndex(newIndex);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderPreview = () => {
    const mimeType = currentFile.mimeType || '';

    if (mimeType.startsWith('image/')) {
      return (
        <div className="flex-1 flex items-center justify-center bg-gray-900 relative overflow-hidden">
          <img
            src={currentFile.url || '#'}
            alt={currentFile.name}
            className="max-w-full max-h-full object-contain transition-transform duration-200"
            style={{ 
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              transformOrigin: 'center'
            }}
          />
          
          {/* Image Controls */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 bg-black bg-opacity-50 rounded-lg px-4 py-2">
            <button
              onClick={() => setZoom(Math.max(25, zoom - 25))}
              className="p-1 text-white hover:bg-white hover:bg-opacity-20 rounded"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="text-white text-sm font-medium px-2">{zoom}%</span>
            <button
              onClick={() => setZoom(Math.min(300, zoom + 25))}
              className="p-1 text-white hover:bg-white hover:bg-opacity-20 rounded"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <div className="w-px h-4 bg-white bg-opacity-30 mx-2" />
            <button
              onClick={() => setRotation((rotation + 90) % 360)}
              className="p-1 text-white hover:bg-white hover:bg-opacity-20 rounded"
            >
              <RotateCw className="h-4 w-4" />
            </button>
            <button
              onClick={() => setZoom(100)}
              className="p-1 text-white hover:bg-white hover:bg-opacity-20 rounded"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      );
    }

    if (mimeType.startsWith('video/')) {
      return (
        <div className="flex-1 flex items-center justify-center bg-gray-900">
          <video
            src={currentFile.url || '#'}
            controls
            className="max-w-full max-h-full"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    if (mimeType.startsWith('audio/')) {
      return (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <span className="text-4xl">🎵</span>
            </div>
            <audio src={currentFile.url || '#'} controls className="mb-4" />
            <h3 className="text-lg font-medium text-gray-900">{currentFile.name}</h3>
          </div>
        </div>
      );
    }

    if (mimeType.includes('pdf')) {
      return (
        <div className="flex-1 bg-gray-100 flex items-center justify-center">
          {currentFile.url ? (
            <iframe
              src={`${currentFile.url}#toolbar=1&navpanes=1&scrollbar=1&page=1&view=FitH`}
              className="w-full h-full border-0"
              title={currentFile.name}
            />
          ) : (
            <div className="text-center">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <FileText className="h-12 w-12 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">{currentFile.name}</h3>
              <p className="text-sm text-gray-500 mb-4">PDF Preview</p>
              <p className="text-xs text-gray-400">File content will load when uploaded</p>
            </div>
          )}
        </div>
      );
    }

    // Text files
    if (mimeType.startsWith('text/')) {
      return (
        <div className="flex-1 bg-white p-6 overflow-auto">
          <div className="max-w-4xl mx-auto">
            <pre className="whitespace-pre-wrap font-mono text-sm text-gray-900">
              {/* You would fetch and display file content here */}
              Loading content...
            </pre>
          </div>
        </div>
      );
    }

    // Default preview for unsupported files
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center mb-4 mx-auto">
            <span className="text-4xl">📄</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{currentFile.name}</h3>
          <p className="text-gray-600 mb-4">Preview not available for this file type</p>
          <Button
            onClick={() => onDownload(currentFile)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Download to view
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-75" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative flex flex-col w-full max-w-7xl mx-auto bg-white">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-900 truncate max-w-md">
              {currentFile.name}
            </h2>
            <span className="text-sm text-gray-500">
              {formatFileSize(currentFile.size)} • {formatDate(currentFile.createdAt)}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Navigation */}
            {files.length > 1 && (
              <>
                <button
                  onClick={() => navigateToFile('prev')}
                  disabled={currentIndex === 0}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="text-sm text-gray-500">
                  {currentIndex + 1} of {files.length}
                </span>
                <button
                  onClick={() => navigateToFile('next')}
                  disabled={currentIndex === files.length - 1}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                <div className="w-px h-6 bg-gray-300 mx-2" />
              </>
            )}
            
            {/* Actions */}
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <Star className="h-5 w-5" />
            </button>
            <button 
              onClick={() => onShare(currentFile)}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <Share2 className="h-5 w-5" />
            </button>
            <button 
              onClick={() => onDownload(currentFile)}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <Download className="h-5 w-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <MoreVertical className="h-5 w-5" />
            </button>
            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-hidden">
          {renderPreview()}
        </div>

        {/* Footer with file details */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-500">Type:</span>
              <p className="text-gray-900">{currentFile.mimeType || 'Unknown'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-500">Size:</span>
              <p className="text-gray-900">{formatFileSize(currentFile.size)}</p>
            </div>
            <div>
              <span className="font-medium text-gray-500">Created:</span>
              <p className="text-gray-900">{formatDate(currentFile.createdAt)}</p>
            </div>
            <div>
              <span className="font-medium text-gray-500">Modified:</span>
              <p className="text-gray-900">{formatDate(currentFile.updatedAt)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
