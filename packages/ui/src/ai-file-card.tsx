import React from 'react';
import { 
  FileText, 
  Image, 
  Video, 
  Music, 
  Archive, 
  File as FileIcon,
  Brain,
  Tag,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { cn } from './utils';

interface FileCardProps {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  createdAt: string;
  updatedAt: string;
  aiTags?: string[];
  aiSummary?: string;
  aiKeywords?: string[];
  processingStatus?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  ocrText?: string;
  className?: string;
  onClick?: () => void;
  onDownload?: () => void;
  onDelete?: () => void;
}

export function AIFileCard({
  id,
  name,
  size,
  mimeType,
  createdAt,
  aiTags = [],
  aiSummary,
  aiKeywords = [],
  processingStatus = 'PENDING',
  ocrText,
  className,
  onClick,
  onDownload,
  onDelete,
}: FileCardProps) {
  const getFileIcon = () => {
    if (mimeType.startsWith('image/')) return Image;
    if (mimeType.startsWith('video/')) return Video;
    if (mimeType.startsWith('audio/')) return Music;
    if (mimeType.includes('pdf')) return FileText;
    if (mimeType.includes('zip') || mimeType.includes('archive')) return Archive;
    return FileIcon;
  };

  const Icon = getFileIcon();

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getProcessingStatusIcon = () => {
    switch (processingStatus) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'PROCESSING':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'FAILED':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getProcessingStatusText = () => {
    switch (processingStatus) {
      case 'COMPLETED':
        return 'AI processed';
      case 'PROCESSING':
        return 'Processing...';
      case 'FAILED':
        return 'Processing failed';
      default:
        return 'Queued for AI';
    }
  };

  return (
    <div 
      className={cn(
        "bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className="flex-shrink-0">
            <Icon className="h-8 w-8 text-blue-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {name}
            </h3>
            <p className="text-xs text-gray-500">
              {formatFileSize(size)} • {formatDate(createdAt)}
            </p>
          </div>
        </div>
        
        {/* Processing Status */}
        <div className="flex items-center space-x-1 text-xs">
          {getProcessingStatusIcon()}
          <span className="text-gray-600">{getProcessingStatusText()}</span>
        </div>
      </div>

      {/* AI Processing Results */}
      {processingStatus === 'COMPLETED' && (
        <div className="space-y-3">
          {/* AI Summary */}
          {aiSummary && (
            <div className="bg-blue-50 rounded-md p-3">
              <div className="flex items-center space-x-2 mb-2">
                <Brain className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-medium text-blue-800">AI Summary</span>
              </div>
              <p className="text-xs text-blue-700 leading-relaxed">
                {aiSummary.length > 200 ? `${aiSummary.substring(0, 200)}...` : aiSummary}
              </p>
            </div>
          )}

          {/* AI Tags */}
          {aiTags.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Tag className="h-4 w-4 text-gray-600" />
                <span className="text-xs font-medium text-gray-700">AI Tags</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {aiTags.slice(0, 8).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
                {aiTags.length > 8 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                    +{aiTags.length - 8} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Keywords */}
          {aiKeywords.length > 0 && (
            <div>
              <div className="text-xs font-medium text-gray-700 mb-1">
                Keywords
              </div>
              <div className="text-xs text-gray-600">
                {aiKeywords.slice(0, 6).join(', ')}
                {aiKeywords.length > 6 && '...'}
              </div>
            </div>
          )}

          {/* OCR Text Preview */}
          {ocrText && ocrText.length > 0 && (
            <div>
              <div className="text-xs font-medium text-gray-700 mb-1">
                Extracted Text
              </div>
              <div className="text-xs text-gray-600 bg-gray-50 rounded p-2 max-h-20 overflow-hidden">
                {ocrText.length > 150 ? `${ocrText.substring(0, 150)}...` : ocrText}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Processing States */}
      {processingStatus === 'PROCESSING' && (
        <div className="bg-blue-50 rounded-md p-3 text-center">
          <Loader2 className="h-6 w-6 text-blue-500 animate-spin mx-auto mb-2" />
          <p className="text-xs text-blue-700">
            AI is analyzing your file...
          </p>
        </div>
      )}

      {processingStatus === 'FAILED' && (
        <div className="bg-red-50 rounded-md p-3 text-center">
          <AlertCircle className="h-6 w-6 text-red-500 mx-auto mb-2" />
          <p className="text-xs text-red-700">
            AI processing failed. File is still accessible.
          </p>
        </div>
      )}

      {processingStatus === 'PENDING' && (
        <div className="bg-yellow-50 rounded-md p-3 text-center">
          <Clock className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
          <p className="text-xs text-yellow-700">
            Queued for AI processing...
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end space-x-2 mt-4 pt-3 border-t border-gray-100">
        {onDownload && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDownload();
            }}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            Download
          </button>
        )}
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="text-xs text-red-600 hover:text-red-800 font-medium"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}

export default AIFileCard;
