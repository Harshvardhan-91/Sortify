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
      <div className="fixed inset-0 flex items-center justify-center p-6">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-7xl h-full max-h-[95vh] flex flex-col overflow-hidden">
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white flex-shrink-0">
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
          <div className="flex-1 bg-gray-50 overflow-hidden p-6">
            <div className="h-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="h-full flex flex-col">
                <div className="flex-1 relative">
                  {/* PDF iframe */}
                  <iframe
                    src={fileUrl}
                    className="absolute inset-0 w-full h-full border-0"
                    title={fileName}
                    style={{ display: 'block' }}
                  />
                  
                  {/* Fallback for when PDF can't load */}
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 opacity-0 pointer-events-none" id="pdf-fallback">
                    <div className="text-center max-w-md p-8">
                      <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">{fileName}</h3>
                      <p className="text-gray-600 mb-6">
                        This is a PDF document preview. In a real application, the PDF content would be displayed here.
                      </p>
                      
                      <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                        <h4 className="font-medium text-gray-900 mb-2">Document Info:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• File Type: PDF Document</li>
                          <li>• Size: 144.65 KB</li>
                          <li>• Pages: 1</li>
                          <li>• Created: {new Date().toLocaleDateString()}</li>
                        </ul>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        {onDownload && (
                          <button
                            onClick={onDownload}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download PDF
                          </button>
                        )}
                        {onShare && (
                          <button
                            onClick={onShare}
                            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                          >
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-white flex-shrink-0">
            <div className="flex items-center space-x-4 text-sm text-gray-700">
              <span>Page 1 of 1</span>
              <div className="w-px h-4 bg-gray-300" />
              <span>Zoom: 100%</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors border border-gray-300">
                Previous
              </button>
              <div className="flex items-center space-x-2">
                <input 
                  type="number" 
                  value={1} 
                  onChange={() => {}} // Read-only for demo
                  className="w-16 px-3 py-2 text-sm text-center border border-gray-300 rounded bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min={1}
                  max={1}
                  readOnly
                />
                <span className="text-sm text-gray-700 font-medium">of 1</span>
              </div>
              <button className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors border border-gray-300">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
