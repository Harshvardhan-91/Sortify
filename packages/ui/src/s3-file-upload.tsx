import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, X, Check, AlertCircle, Cloud } from "lucide-react";
import { cn } from "./utils";

interface S3FileUploadProps {
  onUpload?: (files: UploadedFile[]) => void;
  apiUrl?: string;
  maxFiles?: number;
  maxSize?: number;
  accept?: Record<string, string[]>;
  disabled?: boolean;
  className?: string;
  folderId?: string;
}

interface UploadedFile {
  file: globalThis.File;
  id: string;
  status: "uploading" | "success" | "error";
  progress: number;
  error?: string;
  s3Key?: string;
  fileId?: string;
}

export function S3FileUpload({
  onUpload,
  apiUrl = "/api/files",
  maxFiles = 10,
  maxSize = 50 * 1024 * 1024, // 50MB
  accept = {
    "image/*": [".jpeg", ".jpg", ".png", ".gif", ".bmp", ".webp"],
    "application/pdf": [".pdf"],
    "text/*": [".txt", ".md", ".csv"],
    "application/msword": [".doc"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
      ".docx",
    ],
  },
  disabled = false,
  className,
  folderId,
}: S3FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const uploadToS3 = useCallback(async (file: globalThis.File) => {
    try {
      // Step 1: Get signed upload URL
      const response = await fetch(`${apiUrl}/upload-url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: file.name,
          mimeType: file.type,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get upload URL");
      }

      const { uploadUrl, key } = await response.json();

      // Step 2: Upload directly to S3
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload to S3");
      }

      // Step 3: Confirm upload and save metadata
      const confirmResponse = await fetch(`${apiUrl}/confirm-upload`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key,
          fileName: file.name,
          mimeType: file.type,
          size: file.size,
          folderId,
        }),
      });

      if (!confirmResponse.ok) {
        throw new Error("Failed to confirm upload");
      }

      const result = await confirmResponse.json();
      return { s3Key: key, fileId: result.file.id };
    } catch (error) {
      console.error("S3 upload error:", error);
      throw error;
    }
  }, [apiUrl, folderId]);

  const onDrop = useCallback(
    (acceptedFiles: globalThis.File[]) => {
      const newFiles = acceptedFiles.map((file) => ({
        file,
        id: Math.random().toString(36).substr(2, 9),
        status: "uploading" as const,
        progress: 0,
      }));

      setUploadedFiles((prev) => [...prev, ...newFiles]);

      // Upload each file
      newFiles.forEach(async (uploadFile) => {
        try {
          // Simulate progress updates
          const progressInterval = setInterval(() => {
            setUploadedFiles((prev) =>
              prev.map((f) =>
                f.id === uploadFile.id && f.progress < 90
                  ? { ...f, progress: f.progress + 10 }
                  : f
              )
            );
          }, 200);

          const { s3Key, fileId } = await uploadToS3(uploadFile.file);

          clearInterval(progressInterval);

          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.id === uploadFile.id
                ? {
                    ...f,
                    status: "success",
                    progress: 100,
                    s3Key,
                    fileId,
                  }
                : f
            )
          );
        } catch (error) {
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.id === uploadFile.id
                ? {
                    ...f,
                    status: "error",
                    progress: 0,
                    error: error instanceof Error ? error.message : "Upload failed",
                  }
                : f
            )
          );
        }
      });

      if (onUpload) {
        onUpload(newFiles);
      }
    },
    [onUpload, apiUrl, folderId]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    maxSize,
    disabled,
  });

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all",
          isDragActive
            ? "border-blue-400 bg-blue-50"
            : "border-gray-300 hover:border-gray-400",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="flex items-center space-x-2">
            <Cloud className="h-8 w-8 text-blue-500" />
            <Upload className="h-8 w-8 text-gray-400" />
          </div>
          <div>
            <p className="text-lg font-medium text-gray-900">
              {isDragActive ? "Drop files here" : "Upload to cloud storage"}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Drag and drop files here, or click to browse
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Max file size: {formatFileSize(maxSize)} • Max files: {maxFiles}
            </p>
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {uploadedFiles.length > 0 && (
        <div className="mt-6 space-y-3">
          <h3 className="text-sm font-medium text-gray-900">
            Uploading {uploadedFiles.length} file(s)
          </h3>
          <div className="space-y-2">
            {uploadedFiles.map((uploadFile) => (
              <div
                key={uploadFile.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3 flex-1">
                  <File className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {uploadFile.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(uploadFile.file.size)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {uploadFile.status === "uploading" && (
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadFile.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">
                        {uploadFile.progress}%
                      </span>
                    </div>
                  )}

                  {uploadFile.status === "success" && (
                    <div className="flex items-center space-x-2">
                      <Check className="h-5 w-5 text-green-500" />
                      <span className="text-xs text-green-600">
                        Uploaded to cloud
                      </span>
                    </div>
                  )}

                  {uploadFile.status === "error" && (
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                      <span className="text-xs text-red-600 max-w-32 truncate">
                        {uploadFile.error}
                      </span>
                    </div>
                  )}

                  <button
                    onClick={() => removeFile(uploadFile.id)}
                    className="p-1 hover:bg-gray-200 rounded"
                    type="button"
                  >
                    <X className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Success Summary */}
      {uploadedFiles.some((f) => f.status === "success") && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <Check className="h-5 w-5 text-green-500" />
            <p className="text-sm text-green-800">
              {uploadedFiles.filter((f) => f.status === "success").length} file(s) 
              successfully uploaded to cloud storage and queued for AI processing
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default S3FileUpload;
