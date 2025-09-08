import React from 'react';
import { X, Download, Share2, Maximize2, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

interface PDFPreviewProps {
  fileUrl: string;
  fileName: string;
  isOpen: boolean;
  onClose: () => void;
  onDownload?: () => void;
  onShare?: () => void;
}

export const PDFPreview: React.FC<PDFPreviewProps> = ({
  fileUrl,
  fileName,
  isOpen,
  onClose,
  onDownload,
  onShare,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col overflow-hidden">
          
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-red-600 font-semibold text-xs">PDF</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 truncate max-w-md">
                  {fileName}
                </h3>
                <p className="text-sm text-gray-500">PDF Document</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Toolbar */}
              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                <button className="p-2 hover:bg-white rounded-lg transition-colors text-gray-600 hover:text-gray-900">
                  <ZoomOut className="h-4 w-4" />
                </button>
                <span className="text-sm text-gray-600 px-2">100%</span>
                <button className="p-2 hover:bg-white rounded-lg transition-colors text-gray-600 hover:text-gray-900">
                  <ZoomIn className="h-4 w-4" />
                </button>
                <div className="w-px h-6 bg-gray-300 mx-1" />
                <button className="p-2 hover:bg-white rounded-lg transition-colors text-gray-600 hover:text-gray-900">
                  <RotateCw className="h-4 w-4" />
                </button>
                <button className="p-2 hover:bg-white rounded-lg transition-colors text-gray-600 hover:text-gray-900">
                  <Maximize2 className="h-4 w-4" />
                </button>
              </div>
              
              <div className="w-px h-6 bg-gray-300" />
              
              {/* Action buttons */}
              {onShare && (
                <button
                  onClick={onShare}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-gray-900"
                  title="Share"
                >
                  <Share2 className="h-4 w-4" />
                </button>
              )}
              
              {onDownload && (
                <button
                  onClick={onDownload}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-gray-900"
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </button>
              )}
              
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {/* PDF Viewer */}
          <div className="flex-1 bg-gray-100 overflow-hidden">
            <div className="h-full flex items-center justify-center p-4">
              <div className="bg-white shadow-lg rounded-lg overflow-hidden max-w-full max-h-full">
                {/* PDF iframe or embed */}
                <iframe
                  src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                  className="w-full h-[70vh] border-0"
                  title={fileName}
                />
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>Page 1 of 1</span>
              <div className="w-px h-4 bg-gray-300" />
              <span>Zoom: 100%</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors">
                Previous
              </button>
              <div className="flex items-center space-x-2">
                <input 
                  type="number" 
                  value={1} 
                  className="w-12 px-2 py-1 text-sm text-center border border-gray-300 rounded"
                  min={1}
                  max={1}
                />
                <span className="text-sm text-gray-600">of 1</span>
              </div>
              <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
