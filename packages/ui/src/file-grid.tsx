import React from 'react';
import { 
  File, 
  FileText, 
  Image, 
  Film, 
  Music, 
  Archive, 
  Code,
  Download,
  Share,
  Trash2,
  Edit,
  Eye,
  Calendar,
  HardDrive,
  Tag
} from 'lucide-react';
import { cn } from './utils';

interface FileItem {
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

interface FileGridProps {
  files: FileItem[];
  onFileClick?: (file: FileItem) => void;
  onDownload?: (file: FileItem) => void;
  onShare?: (file: FileItem) => void;
  onDelete?: (file: FileItem) => void;
  onRename?: (file: FileItem) => void;
  selectedFiles?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  view?: 'grid' | 'list';
  className?: string;
}

export function FileGrid({
  files,
  onFileClick,
  onDownload,
  onShare,
  onDelete,
  onRename,
  selectedFiles = [],
  onSelectionChange,
  view = 'grid',
  className
}: FileGridProps) {
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return Image;
    if (mimeType.startsWith('video/')) return Film;
    if (mimeType.startsWith('audio/')) return Music;
    if (mimeType.includes('pdf')) return FileText;
    if (mimeType.includes('zip') || mimeType.includes('rar')) return Archive;
    if (mimeType.includes('code') || mimeType.includes('javascript') || mimeType.includes('typescript')) return Code;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleSelectionChange = (fileId: string, isSelected: boolean) => {
    if (!onSelectionChange) return;
    
    const newSelection = isSelected
      ? [...selectedFiles, fileId]
      : selectedFiles.filter(id => id !== fileId);
    
    onSelectionChange(newSelection);
  };

  const isSelected = (fileId: string) => selectedFiles.includes(fileId);

  if (view === 'list') {
    return (
      <div className={cn('ui:overflow-hidden ui:rounded-lg ui:border ui:border-gray-200', className)}>
        <table className="ui:min-w-full ui:divide-y ui:divide-gray-200">
          <thead className="ui:bg-gray-50">
            <tr>
              <th className="ui:w-4 ui:px-6 ui:py-3">
                <input
                  type="checkbox"
                  className="ui:rounded ui:border-gray-300"
                  checked={files.length > 0 && selectedFiles.length === files.length}
                  onChange={(e) => {
                    if (onSelectionChange) {
                      onSelectionChange(e.target.checked ? files.map(f => f.id) : []);
                    }
                  }}
                />
              </th>
              <th className="ui:px-6 ui:py-3 ui:text-left ui:text-xs ui:font-medium ui:uppercase ui:tracking-wider ui:text-gray-500">
                Name
              </th>
              <th className="ui:px-6 ui:py-3 ui:text-left ui:text-xs ui:font-medium ui:uppercase ui:tracking-wider ui:text-gray-500">
                Size
              </th>
              <th className="ui:px-6 ui:py-3 ui:text-left ui:text-xs ui:font-medium ui:uppercase ui:tracking-wider ui:text-gray-500">
                Modified
              </th>
              <th className="ui:px-6 ui:py-3 ui:text-left ui:text-xs ui:font-medium ui:uppercase ui:tracking-wider ui:text-gray-500">
                Tags
              </th>
              <th className="ui:relative ui:px-6 ui:py-3">
                <span className="ui:sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="ui:divide-y ui:divide-gray-200 ui:bg-white">
            {files.map((file) => {
              const IconComponent = getFileIcon(file.mimeType);
              return (
                <tr 
                  key={file.id}
                  className={cn(
                    'ui:transition-colors hover:ui:bg-gray-50',
                    {
                      'ui:bg-blue-50': isSelected(file.id)
                    }
                  )}
                >
                  <td className="ui:px-6 ui:py-4">
                    <input
                      type="checkbox"
                      className="ui:rounded ui:border-gray-300"
                      checked={isSelected(file.id)}
                      onChange={(e) => handleSelectionChange(file.id, e.target.checked)}
                    />
                  </td>
                  <td className="ui:px-6 ui:py-4">
                    <div 
                      className="ui:flex ui:items-center ui:space-x-3 ui:cursor-pointer"
                      onClick={() => onFileClick?.(file)}
                    >
                      <IconComponent className="ui:h-8 ui:w-8 ui:text-gray-400" />
                      <div>
                        <p className="ui:text-sm ui:font-medium ui:text-gray-900">{file.name}</p>
                        {file.aiSummary && (
                          <p className="ui:text-xs ui:text-gray-500 ui:truncate ui:max-w-xs">
                            {file.aiSummary}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="ui:px-6 ui:py-4 ui:text-sm ui:text-gray-500">
                    {formatFileSize(file.size)}
                  </td>
                  <td className="ui:px-6 ui:py-4 ui:text-sm ui:text-gray-500">
                    {formatDate(file.updatedAt)}
                  </td>
                  <td className="ui:px-6 ui:py-4">
                    <div className="ui:flex ui:flex-wrap ui:gap-1">
                      {file.aiTags?.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="ui:inline-flex ui:items-center ui:rounded ui:bg-blue-100 ui:px-2 ui:py-0.5 ui:text-xs ui:font-medium ui:text-blue-800"
                        >
                          {tag}
                        </span>
                      ))}
                      {(file.aiTags?.length || 0) > 3 && (
                        <span className="ui:text-xs ui:text-gray-500">
                          +{(file.aiTags?.length || 0) - 3} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="ui:px-6 ui:py-4 ui:text-right ui:text-sm ui:font-medium">
                    <div className="ui:flex ui:items-center ui:space-x-2">
                      <button
                        onClick={() => onFileClick?.(file)}
                        className="ui:text-gray-400 hover:ui:text-gray-600"
                      >
                        <Eye className="ui:h-4 ui:w-4" />
                      </button>
                      <button
                        onClick={() => onDownload?.(file)}
                        className="ui:text-gray-400 hover:ui:text-gray-600"
                      >
                        <Download className="ui:h-4 ui:w-4" />
                      </button>
                      <button
                        onClick={() => onShare?.(file)}
                        className="ui:text-gray-400 hover:ui:text-gray-600"
                      >
                        <Share className="ui:h-4 ui:w-4" />
                      </button>
                      <button
                        onClick={() => onDelete?.(file)}
                        className="ui:text-gray-400 hover:ui:text-red-600"
                      >
                        <Trash2 className="ui:h-4 ui:w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className={cn('ui:grid ui:grid-cols-1 ui:gap-4 sm:ui:grid-cols-2 lg:ui:grid-cols-3 xl:ui:grid-cols-4', className)}>
      {files.map((file) => {
        const IconComponent = getFileIcon(file.mimeType);
        return (
          <div
            key={file.id}
            className={cn(
              'ui:group ui:relative ui:rounded-lg ui:border ui:border-gray-200 ui:bg-white ui:p-4 ui:transition-all hover:ui:shadow-md',
              {
                'ui:border-blue-500 ui:bg-blue-50': isSelected(file.id)
              }
            )}
          >
            <div className="ui:absolute ui:top-3 ui:right-3">
              <input
                type="checkbox"
                className="ui:rounded ui:border-gray-300"
                checked={isSelected(file.id)}
                onChange={(e) => handleSelectionChange(file.id, e.target.checked)}
              />
            </div>

            <div 
              className="ui:cursor-pointer"
              onClick={() => onFileClick?.(file)}
            >
              <div className="ui:flex ui:items-center ui:space-x-3">
                <IconComponent className="ui:h-12 ui:w-12 ui:text-gray-400" />
                <div className="ui:flex-1 ui:min-w-0">
                  <p className="ui:text-sm ui:font-medium ui:text-gray-900 ui:truncate">
                    {file.name}
                  </p>
                  <div className="ui:mt-1 ui:flex ui:items-center ui:space-x-2 ui:text-xs ui:text-gray-500">
                    <HardDrive className="ui:h-3 ui:w-3" />
                    <span>{formatFileSize(file.size)}</span>
                    <Calendar className="ui:h-3 ui:w-3" />
                    <span>{formatDate(file.updatedAt)}</span>
                  </div>
                </div>
              </div>

              {file.aiSummary && (
                <p className="ui:mt-2 ui:text-xs ui:text-gray-600 ui:line-clamp-2">
                  {file.aiSummary}
                </p>
              )}

              {file.aiTags && file.aiTags.length > 0 && (
                <div className="ui:mt-2 ui:flex ui:flex-wrap ui:gap-1">
                  {file.aiTags.slice(0, 2).map((tag, index) => (
                    <span
                      key={index}
                      className="ui:inline-flex ui:items-center ui:rounded ui:bg-blue-100 ui:px-2 ui:py-0.5 ui:text-xs ui:font-medium ui:text-blue-800"
                    >
                      <Tag className="ui:mr-1 ui:h-2 ui:w-2" />
                      {tag}
                    </span>
                  ))}
                  {file.aiTags.length > 2 && (
                    <span className="ui:text-xs ui:text-gray-500">
                      +{file.aiTags.length - 2}
                    </span>
                  )}
                </div>
              )}

              {file.processingStatus && file.processingStatus !== 'COMPLETED' && (
                <div className="ui:mt-2">
                  <span className={cn(
                    'ui:inline-flex ui:items-center ui:rounded ui:px-2 ui:py-0.5 ui:text-xs ui:font-medium',
                    {
                      'ui:bg-yellow-100 ui:text-yellow-800': file.processingStatus === 'PENDING',
                      'ui:bg-blue-100 ui:text-blue-800': file.processingStatus === 'PROCESSING',
                      'ui:bg-red-100 ui:text-red-800': file.processingStatus === 'FAILED',
                    }
                  )}>
                    AI {file.processingStatus.toLowerCase()}
                  </span>
                </div>
              )}
            </div>

            <div className="ui:mt-3 ui:flex ui:items-center ui:justify-between ui:opacity-0 ui:transition-opacity group-hover:ui:opacity-100">
              <div className="ui:flex ui:items-center ui:space-x-2">
                <button
                  onClick={() => onDownload?.(file)}
                  className="ui:text-gray-400 hover:ui:text-gray-600"
                  title="Download"
                >
                  <Download className="ui:h-4 ui:w-4" />
                </button>
                <button
                  onClick={() => onShare?.(file)}
                  className="ui:text-gray-400 hover:ui:text-gray-600"
                  title="Share"
                >
                  <Share className="ui:h-4 ui:w-4" />
                </button>
                <button
                  onClick={() => onRename?.(file)}
                  className="ui:text-gray-400 hover:ui:text-gray-600"
                  title="Rename"
                >
                  <Edit className="ui:h-4 ui:w-4" />
                </button>
              </div>
              <button
                onClick={() => onDelete?.(file)}
                className="ui:text-gray-400 hover:ui:text-red-600"
                title="Delete"
              >
                <Trash2 className="ui:h-4 ui:w-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
