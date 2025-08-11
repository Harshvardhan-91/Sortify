'use client';

import React, { useState } from 'react';
import { 
  X,
  Download,
  Share2,
  Star,
  Edit3,
  Trash2,
  Eye,
  Tag,
  Calendar,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  Archive,
  FileX,
  Copy,
  ExternalLink,
  Info,
  Clock,
  User,
  Folder,
  Hash
} from 'lucide-react';
import { Button } from './button';
import Image from 'next/image';

interface FileDetailsPanelProps {
  file: {
    id: string;
    name: string;
    size: number;
    mimeType: string;
    createdAt: Date;
    updatedAt: Date;
    ownerId: string;
    pathOnDisk: string;
    aiSummary?: string;
    aiTags?: string[];
    ocrText?: string;
    isStarred?: boolean;
    folder?: {
      id: string;
      name: string;
    };
  } | null;
  onClose: () => void;
  onDownload: (fileId: string) => void;
  onShare: (fileId: string) => void;
  onStar: (fileId: string) => void;
  onDelete: (fileId: string) => void;
  onRename: (fileId: string, newName: string) => void;
  onUpdateTags: (fileId: string, tags: string[]) => void;
  className?: string;
}

export const FileDetailsPanel: React.FC<FileDetailsPanelProps> = ({
  file,
  onClose,
  onDownload,
  onShare,
  onStar,
  onDelete,
  onRename,
  onUpdateTags,
  className = ''
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(file?.name || '');
  const [newTag, setNewTag] = useState('');
  const [tags, setTags] = useState(file?.aiTags || []);

  if (!file) {
    return (
      <div className={`w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 ${className}`}>
        <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <FileX className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-sm">No file selected</p>
            <p className="text-xs text-gray-400 mt-1">Select a file to view details</p>
          </div>
        </div>
      </div>
    );
  }

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const getFileTypeIcon = () => {
    if (file.mimeType.startsWith('image/')) return <ImageIcon className="h-6 w-6 text-green-500" />;
    if (file.mimeType.startsWith('video/')) return <Video className="h-6 w-6 text-purple-500" />;
    if (file.mimeType.startsWith('audio/')) return <Music className="h-6 w-6 text-blue-500" />;
    if (file.mimeType.includes('pdf')) return <FileText className="h-6 w-6 text-red-500" />;
    if (file.mimeType.includes('zip') || file.mimeType.includes('rar')) return <Archive className="h-6 w-6 text-yellow-500" />;
    return <FileText className="h-6 w-6 text-gray-500" />;
  };

  const handleRename = () => {
    if (editedName.trim() && editedName !== file.name) {
      onRename(file.id, editedName.trim());
    }
    setIsEditing(false);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const updatedTags = [...tags, newTag.trim()];
      setTags(updatedTags);
      onUpdateTags(file.id, updatedTags);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = tags.filter(tag => tag !== tagToRemove);
    setTags(updatedTags);
    onUpdateTags(file.id, updatedTags);
  };

  const isImageFile = file.mimeType.startsWith('image/');

  return (
    <div className={`w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">File Details</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="p-2"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* File Preview */}
        {isImageFile && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
              <Image
                src={`/api/files/${file.id}/preview`}
                alt={file.name}
                width={300}
                height={200}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
          </div>
        )}

        {/* File Info */}
        <div className="p-4 space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              {getFileTypeIcon()}
              {isEditing ? (
                <div className="flex-1 flex items-center space-x-2">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded
                             bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    autoFocus
                    onBlur={handleRename}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRename();
                      if (e.key === 'Escape') {
                        setEditedName(file.name);
                        setIsEditing(false);
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-between">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                    {file.name}
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="p-1"
                  >
                    <Edit3 className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDownload(file.id)}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onShare(file.id)}
              className="flex-1"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onStar(file.id)}
              className={`p-2 ${file.isStarred ? 'text-yellow-500' : 'text-gray-500'}`}
            >
              <Star className={`h-4 w-4 ${file.isStarred ? 'fill-current' : ''}`} />
            </Button>
          </div>

          {/* Properties */}
          <div className="space-y-3">
            <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center">
              <Info className="h-4 w-4 mr-2" />
              Properties
            </h5>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Size</span>
                <span className="font-mono text-gray-900 dark:text-gray-100">{formatSize(file.size)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Type</span>
                <span className="text-gray-900 dark:text-gray-100">{file.mimeType}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400 flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  Created
                </span>
                <span className="text-gray-900 dark:text-gray-100">{formatDate(file.createdAt)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  Modified
                </span>
                <span className="text-gray-900 dark:text-gray-100">{formatDate(file.updatedAt)}</span>
              </div>

              {file.folder && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400 flex items-center">
                    <Folder className="h-3 w-3 mr-1" />
                    Location
                  </span>
                  <span className="text-gray-900 dark:text-gray-100 truncate ml-2">{file.folder.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* AI Summary */}
          {file.aiSummary && (
            <div className="space-y-3">
              <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100">AI Summary</h5>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {file.aiSummary}
              </p>
            </div>
          )}

          {/* Tags */}
          <div className="space-y-3">
            <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center">
              <Hash className="h-4 w-4 mr-2" />
              Tags
            </h5>
            
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 
                           text-blue-800 dark:text-blue-300 rounded-full"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:text-blue-600 dark:hover:text-blue-200"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Add tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddTag();
                }}
              />
              <Button
                size="sm"
                onClick={handleAddTag}
                disabled={!newTag.trim()}
                className="px-3 py-1 text-xs"
              >
                <Tag className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* OCR Text */}
          {file.ocrText && (
            <div className="space-y-3">
              <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100">Extracted Text</h5>
              <div className="max-h-32 overflow-y-auto p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
                  {file.ocrText}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Link
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(file.id)}
            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
