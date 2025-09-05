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
        "bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-all duration-200 cursor-pointer group",
        className
      )}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className="flex-shrink-0 p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
            <Icon className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 truncate mb-1">
              {name}
            </h3>
            <p className="text-xs text-gray-500">
              {formatFileSize(size)} • {formatDate(createdAt)}
            </p>
          </div>
        </div>
        
        {/* Processing Status */}
        <div className="flex items-center space-x-1">
          {getProcessingStatusIcon()}
        </div>
      </div>

      {/* AI Processing Results */}
      {processingStatus === 'COMPLETED' && (
        <div className="space-y-4">
          {/* AI Summary */}
          {aiSummary && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
              <div className="flex items-center space-x-2 mb-2">
                <Brain className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-semibold text-blue-800">AI Summary</span>
              </div>
              <p className="text-xs text-blue-700 leading-relaxed">
                {aiSummary.length > 120 ? `${aiSummary.substring(0, 120)}...` : aiSummary}
              </p>
            </div>
          )}

          {/* AI Tags */}
          {aiTags.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Tag className="h-3 w-3 text-gray-600" />
                <span className="text-xs font-medium text-gray-700">Smart Tags</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {aiTags.slice(0, 6).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium hover:bg-gray-200 transition-colors"
                  >
                    {tag}
                  </span>
                ))}
                {aiTags.length > 6 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                    +{aiTags.length - 6}
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
                {aiKeywords.slice(0, 5).join(', ')}
                {aiKeywords.length > 5 && '...'}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Processing States */}
      {processingStatus === 'PROCESSING' && (
        <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-100">
          <Loader2 className="h-6 w-6 text-blue-500 animate-spin mx-auto mb-2" />
          <p className="text-xs text-blue-700 font-medium">
            AI is analyzing...
          </p>
        </div>
      )}

      {processingStatus === 'FAILED' && (
        <div className="bg-red-50 rounded-lg p-4 text-center border border-red-100">
          <AlertCircle className="h-6 w-6 text-red-500 mx-auto mb-2" />
          <p className="text-xs text-red-700">
            Processing failed
          </p>
        </div>
      )}

      {processingStatus === 'PENDING' && (
        <div className="bg-yellow-50 rounded-lg p-4 text-center border border-yellow-100">
          <Clock className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
          <p className="text-xs text-yellow-700">
            Queued for AI analysis
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
        <div className="text-xs text-gray-500">
          {getProcessingStatusText()}
        </div>
        <div className="flex space-x-3">
          {onDownload && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDownload();
              }}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
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
              className="text-xs text-red-600 hover:text-red-800 font-medium transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default AIFileCard;
