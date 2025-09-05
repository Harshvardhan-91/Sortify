import { useState, useCallback } from 'react';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  error?: string;
  s3Key?: string;
  fileId?: string;
  aiTags?: string[];
  aiSummary?: string;
  processingStatus?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
}

interface UseFileUploadOptions {
  apiUrl?: string;
  folderId?: string;
  onUploadComplete?: (files: UploadedFile[]) => void;
  onProgress?: (file: UploadedFile) => void;
}

export function useFileUpload({
  apiUrl = '/api/files',
  folderId,
  onUploadComplete,
  onProgress,
}: UseFileUploadOptions = {}) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const updateFileStatus = useCallback((fileId: string, updates: Partial<UploadedFile>) => {
    setUploadedFiles(prev => 
      prev.map(file => 
        file.id === fileId ? { ...file, ...updates } : file
      )
    );
  }, []);

  const pollFileStatus = useCallback(async (fileId: string, localFileId: string) => {
    const maxAttempts = 30; // 5 minutes max
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await fetch(`${apiUrl}/${fileId}`);
        if (response.ok) {
          const fileData = await response.json();
          
          updateFileStatus(localFileId, {
            processingStatus: fileData.processingStatus,
            aiTags: fileData.aiTags,
            aiSummary: fileData.aiSummary,
          });

          if (fileData.processingStatus === 'COMPLETED') {
            updateFileStatus(localFileId, { status: 'completed' });
            return;
          } else if (fileData.processingStatus === 'FAILED') {
            updateFileStatus(localFileId, { 
              status: 'error', 
              error: 'AI processing failed' 
            });
            return;
          }
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 10000); // Poll every 10 seconds
        } else {
          updateFileStatus(localFileId, { 
            status: 'error', 
            error: 'Processing timeout' 
          });
        }
      } catch (error) {
        updateFileStatus(localFileId, { 
          status: 'error', 
          error: 'Failed to check processing status' 
        });
      }
    };

    // Start polling after a short delay to allow initial processing
    setTimeout(poll, 2000);
  }, [apiUrl, updateFileStatus]);

  const uploadFile = useCallback(async (file: File): Promise<UploadedFile> => {
    const localFileId = Math.random().toString(36).substr(2, 9);
    
    const uploadedFile: UploadedFile = {
      id: localFileId,
      name: file.name,
      size: file.size,
      mimeType: file.type,
      status: 'uploading',
      progress: 0,
    };

    setUploadedFiles(prev => [...prev, uploadedFile]);

    try {
      // Step 1: Get signed upload URL
      updateFileStatus(localFileId, { progress: 10 });
      
      const urlResponse = await fetch(`${apiUrl}/upload-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          mimeType: file.type,
        }),
      });

      if (!urlResponse.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { uploadUrl, key } = await urlResponse.json();
      
      // Step 2: Upload to S3
      updateFileStatus(localFileId, { progress: 30 });
      
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file');
      }

      updateFileStatus(localFileId, { progress: 60 });

      // Step 3: Confirm upload
      const confirmResponse = await fetch(`${apiUrl}/confirm-upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key,
          fileName: file.name,
          mimeType: file.type,
          size: file.size,
          folderId,
        }),
      });

      if (!confirmResponse.ok) {
        throw new Error('Failed to confirm upload');
      }

      const result = await confirmResponse.json();
      
      updateFileStatus(localFileId, { 
        progress: 100,
        status: 'processing',
        s3Key: key,
        fileId: result.file.id,
        processingStatus: 'PENDING'
      });

      // Start polling for AI processing completion
      pollFileStatus(result.file.id, localFileId);

      onProgress?.(uploadedFile);
      
      return {
        ...uploadedFile,
        fileId: result.file.id,
        s3Key: key,
        status: 'processing',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      updateFileStatus(localFileId, { 
        status: 'error', 
        error: errorMessage,
        progress: 0 
      });
      throw error;
    }
  }, [apiUrl, folderId, updateFileStatus, onProgress, pollFileStatus]);

  const uploadFiles = useCallback(async (files: File[]) => {
    setIsUploading(true);
    
    try {
      const uploadPromises = files.map(file => uploadFile(file));
      const results = await Promise.allSettled(uploadPromises);
      
      const successfulUploads = results
        .filter((result): result is PromiseFulfilledResult<UploadedFile> => 
          result.status === 'fulfilled'
        )
        .map(result => result.value);

      onUploadComplete?.(successfulUploads);
    } finally {
      setIsUploading(false);
    }
  }, [uploadFile, onUploadComplete]);

  const removeFile = useCallback((fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  }, []);

  const clearFiles = useCallback(() => {
    setUploadedFiles([]);
  }, []);

  const getCompletedFiles = useCallback(() => {
    return uploadedFiles.filter(file => file.status === 'completed');
  }, [uploadedFiles]);

  const getProcessingFiles = useCallback(() => {
    return uploadedFiles.filter(file => 
      file.status === 'processing' || file.status === 'uploading'
    );
  }, [uploadedFiles]);

  const getFailedFiles = useCallback(() => {
    return uploadedFiles.filter(file => file.status === 'error');
  }, [uploadedFiles]);

  return {
    uploadedFiles,
    isUploading,
    uploadFile,
    uploadFiles,
    removeFile,
    clearFiles,
    getCompletedFiles,
    getProcessingFiles,
    getFailedFiles,
    updateFileStatus,
  };
}

export default useFileUpload;
