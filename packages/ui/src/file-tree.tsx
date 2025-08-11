'use client';

import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  Folder, 
  FolderOpen, 
  File, 
  Plus,
  Search,
  Filter,
  Star,
  Clock,
  Hash
} from 'lucide-react';
import { Button } from './button';

interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
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

interface FileTreeProps {
  files: FileNode[];
  selectedItems: string[];
  onSelectItem: (id: string, multiSelect?: boolean) => void;
  onCreateFolder: (parentId?: string) => void;
  onUploadFile: (parentId?: string) => void;
  onDeleteItem: (id: string) => void;
  onRenameItem: (id: string, newName: string) => void;
  className?: string;
}

const FileTreeItem: React.FC<{
  node: FileNode;
  level: number;
  isSelected: boolean;
  onSelect: (id: string, multiSelect?: boolean) => void;
  onToggle: (id: string) => void;
  onCreateFolder: (parentId: string) => void;
  onUploadFile: (parentId: string) => void;
}> = ({ node, level, isSelected, onSelect, onToggle, onCreateFolder, onUploadFile }) => {
  const [isHovered, setIsHovered] = useState(false);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('document') || mimeType.includes('word')) return '📝';
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return '📊';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📽️';
    if (mimeType.includes('zip') || mimeType.includes('rar')) return '🗜️';
    return '📄';
  };

  return (
    <div className="group">
      <div
        className={`
          flex items-center px-3 py-2 text-sm cursor-pointer transition-all duration-200 rounded-lg mx-1 mb-1
          hover:bg-gray-50
          ${isSelected ? 'bg-blue-50 border border-blue-200 text-blue-700' : 'text-gray-700'}
        `}
        style={{ paddingLeft: `${level * 16 + 12}px` }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(node.id, e.ctrlKey || e.metaKey);
        }}
      >
        {/* Expand/Collapse Icon */}
        {node.type === 'folder' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle(node.id);
            }}
            className="p-0.5 rounded hover:bg-gray-200 transition-colors mr-1"
          >
            {node.isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5 text-gray-500" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-gray-500" />
            )}
          </button>
        )}

        {/* File/Folder Icon */}
        <div className="mr-2 flex-shrink-0">
          {node.type === 'folder' ? (
            node.isExpanded ? (
              <FolderOpen className="h-4 w-4 text-blue-500" />
            ) : (
              <Folder className="h-4 w-4 text-blue-600" />
            )
          ) : (
            <div className="w-4 h-4 flex items-center justify-center">
              <span className="text-sm">{getFileIcon(node.mimeType || '')}</span>
            </div>
          )}
        </div>

        {/* Name */}
        <span className="flex-1 truncate font-medium">
          {node.name}
        </span>

        {/* Metadata */}
        <div className="flex items-center space-x-2 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {node.isStarred && (
            <Star className="h-3 w-3 text-yellow-500 fill-current" />
          )}
          
          {node.type === 'file' && node.size && (
            <span className="text-xs text-gray-400 tabular-nums">
              {formatSize(node.size)}
            </span>
          )}

          {/* Quick Actions */}
          {isHovered && node.type === 'folder' && (
            <div className="flex items-center space-x-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCreateFolder(node.id);
                }}
                className="p-1 rounded hover:bg-gray-200"
                title="Create folder"
              >
                <Folder className="h-3 w-3 text-gray-500" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onUploadFile(node.id);
                }}
                className="p-1 rounded hover:bg-gray-200"
                title="Upload file"
              >
                <Plus className="h-3 w-3 text-gray-500" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Children */}
      {node.type === 'folder' && node.isExpanded && node.children && (
        <div className="ml-4">
          {node.children.map((child) => (
            <FileTreeItem
              key={child.id}
              node={child}
              level={level + 1}
              isSelected={false}
              onSelect={onSelect}
              onToggle={onToggle}
              onCreateFolder={onCreateFolder}
              onUploadFile={onUploadFile}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const FileTree: React.FC<FileTreeProps> = ({
  files,
  selectedItems,
  onSelectItem,
  onCreateFolder,
  onUploadFile,
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [filteredFiles, setFilteredFiles] = useState<FileNode[]>(files);

  // Search functionality
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredFiles(files);
      return;
    }

    const filterNodes = (nodes: FileNode[]): FileNode[] => {
      return nodes.reduce((acc: FileNode[], node) => {
        const matchesSearch = node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (node.tags && node.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
        
        if (node.type === 'folder' && node.children) {
          const filteredChildren = filterNodes(node.children);
          if (matchesSearch || filteredChildren.length > 0) {
            acc.push({
              ...node,
              children: filteredChildren,
              isExpanded: filteredChildren.length > 0 ? true : node.isExpanded
            });
          }
        } else if (matchesSearch) {
          acc.push(node);
        }
        
        return acc;
      }, []);
    };

    setFilteredFiles(filterNodes(files));
  }, [searchQuery, files]);

  const handleToggle = (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const addExpandedState = (nodes: FileNode[]): FileNode[] => {
    return nodes.map(node => ({
      ...node,
      isExpanded: expandedItems.has(node.id),
      children: node.children ? addExpandedState(node.children) : undefined
    }));
  };

  const nodesWithState = addExpandedState(filteredFiles);

  return (
    <div className={`flex flex-col h-full bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-900">
            Files & Folders
          </h2>
          <div className="flex items-center space-x-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onCreateFolder()}
              className="p-1.5 h-7 w-7 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
              title="Create Folder"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search files and folders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 rounded-lg 
                     bg-white text-gray-900 placeholder-gray-500
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all
                     hover:border-gray-300"
          />
        </div>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {nodesWithState.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <File className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 mb-1">
              {searchQuery ? 'No files found' : 'No files uploaded yet'}
            </p>
            <p className="text-xs text-gray-500">
              {searchQuery ? 'Try a different search term' : 'Upload files to get started'}
            </p>
          </div>
        ) : (
          <div className="p-2">
            {nodesWithState.map((node) => (
              <FileTreeItem
                key={node.id}
                node={node}
                level={0}
                isSelected={selectedItems.includes(node.id)}
                onSelect={onSelectItem}
                onToggle={handleToggle}
                onCreateFolder={onCreateFolder}
                onUploadFile={onUploadFile}
              />
            ))}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{files.length} item{files.length !== 1 ? 's' : ''}</span>
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>Last updated just now</span>
          </div>
        </div>
      </div>
    </div>
  );
};
