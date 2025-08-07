import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, Check, AlertCircle } from 'lucide-react';
import { cn } from './utils';

interface FileUploadProps {
  onUpload?: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number;
  accept?: Record<string, string[]>;
  disabled?: boolean;
  className?: string;
}

interface UploadedFile {
  file: File;
  id: string;
  status: 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

export function FileUpload({
  onUpload,
  maxFiles = 10,
  maxSize = 50 * 1024 * 1024, // 50MB
  accept = {
    'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp'],
    'application/pdf': ['.pdf'],
    'text/*': ['.txt', '.md', '.csv'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  },
  disabled = false,
  className
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Add accepted files to upload queue
    const newFiles = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      status: 'uploading' as const,
      progress: 0,
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);

    // Simulate upload progress
    newFiles.forEach(uploadFile => {
      simulateUpload(uploadFile.id);
    });

    if (onUpload) {
      onUpload(acceptedFiles);
    }
  }, [onUpload]);

  const simulateUpload = (fileId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setUploadedFiles(prev =>
          prev.map(file =>
            file.id === fileId
              ? { ...file, progress: 100, status: 'success' }
              : file
          )
        );
      } else {
        setUploadedFiles(prev =>
          prev.map(file =>
            file.id === fileId ? { ...file, progress } : file
          )
        );
      }
    }, 200);
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    maxFiles,
    maxSize,
    accept,
    disabled,
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn('w-full', className)}>
      <div
        {...getRootProps()}
        className={cn(
          'ui:relative ui:cursor-pointer ui:rounded-lg ui:border-2 ui:border-dashed ui:p-8 ui:text-center ui:transition-colors',
          {
            'ui:border-blue-300 ui:bg-blue-50': isDragActive && !isDragReject,
            'ui:border-red-300 ui:bg-red-50': isDragReject,
            'ui:border-gray-300 ui:bg-gray-50 hover:ui:bg-gray-100': !isDragActive && !disabled,
            'ui:border-gray-200 ui:bg-gray-100 ui:cursor-not-allowed ui:opacity-60': disabled,
          }
        )}
      >
        <input {...getInputProps()} />
        
        <div className="ui:flex ui:flex-col ui:items-center ui:space-y-4">
          <Upload className="ui:h-12 ui:w-12 ui:text-gray-400" />
          
          <div className="ui:text-lg ui:font-medium ui:text-gray-900">
            {isDragActive ? (
              isDragReject ? (
                'Some files are not supported'
              ) : (
                'Drop files here'
              )
            ) : (
              'Drop files here or click to browse'
            )}
          </div>
          
          <p className="ui:text-sm ui:text-gray-500">
            Support for images, PDFs, documents, and more. Max {maxFiles} files, {formatFileSize(maxSize)} each.
          </p>
        </div>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="ui:mt-6 ui:space-y-3">
          <h4 className="ui:text-sm ui:font-medium ui:text-gray-900">
            Uploading {uploadedFiles.length} file{uploadedFiles.length > 1 ? 's' : ''}
          </h4>
          
          {uploadedFiles.map(uploadFile => (
            <div
              key={uploadFile.id}
              className="ui:flex ui:items-center ui:space-x-3 ui:rounded-md ui:border ui:p-3"
            >
              <File className="ui:h-8 ui:w-8 ui:text-gray-400" />
              
              <div className="ui:flex-1 ui:min-w-0">
                <p className="ui:text-sm ui:font-medium ui:text-gray-900 ui:truncate">
                  {uploadFile.file.name}
                </p>
                <p className="ui:text-xs ui:text-gray-500">
                  {formatFileSize(uploadFile.file.size)}
                </p>
                
                {uploadFile.status === 'uploading' && (
                  <div className="ui:mt-1">
                    <div className="ui:w-full ui:bg-gray-200 ui:rounded-full ui:h-2">
                      <div
                        className="ui:bg-blue-600 ui:h-2 ui:rounded-full ui:transition-all"
                        style={{ width: `${uploadFile.progress}%` }}
                      />
                    </div>
                    <p className="ui:text-xs ui:text-gray-500 ui:mt-1">
                      {Math.round(uploadFile.progress)}% uploaded
                    </p>
                  </div>
                )}
              </div>
              
              <div className="ui:flex ui:items-center ui:space-x-2">
                {uploadFile.status === 'success' && (
                  <Check className="ui:h-5 ui:w-5 ui:text-green-500" />
                )}
                {uploadFile.status === 'error' && (
                  <AlertCircle className="ui:h-5 ui:w-5 ui:text-red-500" />
                )}
                
                <button
                  onClick={() => removeFile(uploadFile.id)}
                  className="ui:text-gray-400 hover:ui:text-gray-600"
                >
                  <X className="ui:h-4 ui:w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
