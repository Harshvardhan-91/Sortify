"use client";

import React from "react";
import {
  FileText,
  Image,
  Video,
  Music,
  Archive,
  FileSpreadsheet,
  FileX,
  Film,
  Code,
  Database,
  Book,
  Download,
} from "lucide-react";

interface FileIconProps {
  mimeType: string;
  fileName: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const FileIcon: React.FC<FileIconProps> = ({
  mimeType,
  fileName,
  size = "md",
  className = "",
}) => {
  const getIconSize = () => {
    switch (size) {
      case "sm":
        return "h-4 w-4";
      case "lg":
        return "h-6 w-6";
      default:
        return "h-5 w-5";
    }
  };

  const getFileTypeInfo = (mimeType: string, fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase() || "";

    // Images
    if (mimeType.startsWith("image/")) {
      return {
        icon: <Image className={`${getIconSize()} text-green-600`} />,
        bgColor: "bg-green-100",
        borderColor: "border-green-200",
      };
    }

    // Videos
    if (mimeType.startsWith("video/")) {
      return {
        icon: <Video className={`${getIconSize()} text-red-600`} />,
        bgColor: "bg-red-100",
        borderColor: "border-red-200",
      };
    }

    // Audio
    if (mimeType.startsWith("audio/")) {
      return {
        icon: <Music className={`${getIconSize()} text-purple-600`} />,
        bgColor: "bg-purple-100",
        borderColor: "border-purple-200",
      };
    }

    // PDFs
    if (mimeType.includes("pdf") || extension === "pdf") {
      return {
        icon: (
          <div
            className={`${getIconSize()} flex items-center justify-center bg-red-600 text-white text-xs font-bold rounded`}
          >
            PDF
          </div>
        ),
        bgColor: "bg-red-100",
        borderColor: "border-red-200",
      };
    }

    // Microsoft Office Documents
    if (
      mimeType.includes("document") ||
      mimeType.includes("word") ||
      ["doc", "docx"].includes(extension)
    ) {
      return {
        icon: (
          <div
            className={`${getIconSize()} flex items-center justify-center bg-blue-600 text-white text-xs font-bold rounded`}
          >
            DOC
          </div>
        ),
        bgColor: "bg-blue-100",
        borderColor: "border-blue-200",
      };
    }

    // Excel
    if (
      mimeType.includes("spreadsheet") ||
      mimeType.includes("excel") ||
      ["xls", "xlsx"].includes(extension)
    ) {
      return {
        icon: (
          <div
            className={`${getIconSize()} flex items-center justify-center bg-green-600 text-white text-xs font-bold rounded`}
          >
            XLS
          </div>
        ),
        bgColor: "bg-green-100",
        borderColor: "border-green-200",
      };
    }

    // PowerPoint
    if (
      mimeType.includes("presentation") ||
      mimeType.includes("powerpoint") ||
      ["ppt", "pptx"].includes(extension)
    ) {
      return {
        icon: (
          <div
            className={`${getIconSize()} flex items-center justify-center bg-orange-600 text-white text-xs font-bold rounded`}
          >
            PPT
          </div>
        ),
        bgColor: "bg-orange-100",
        borderColor: "border-orange-200",
      };
    }

    // Archives
    if (
      mimeType.includes("zip") ||
      mimeType.includes("rar") ||
      ["zip", "rar", "7z", "tar", "gz"].includes(extension)
    ) {
      return {
        icon: <Archive className={`${getIconSize()} text-yellow-600`} />,
        bgColor: "bg-yellow-100",
        borderColor: "border-yellow-200",
      };
    }

    // Code files
    if (
      [
        "js",
        "ts",
        "jsx",
        "tsx",
        "py",
        "java",
        "cpp",
        "c",
        "html",
        "css",
        "php",
        "rb",
        "go",
      ].includes(extension)
    ) {
      return {
        icon: <Code className={`${getIconSize()} text-indigo-600`} />,
        bgColor: "bg-indigo-100",
        borderColor: "border-indigo-200",
      };
    }

    // Database files
    if (["sql", "db", "sqlite", "mdb"].includes(extension)) {
      return {
        icon: <Database className={`${getIconSize()} text-gray-600`} />,
        bgColor: "bg-gray-100",
        borderColor: "border-gray-200",
      };
    }

    // Text files
    if (
      mimeType.startsWith("text/") ||
      ["txt", "md", "json", "xml", "csv"].includes(extension)
    ) {
      return {
        icon: <FileText className={`${getIconSize()} text-gray-600`} />,
        bgColor: "bg-gray-100",
        borderColor: "border-gray-200",
      };
    }

    // Default
    return {
      icon: <FileX className={`${getIconSize()} text-gray-500`} />,
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200",
    };
  };

  const fileInfo = getFileTypeInfo(mimeType, fileName);

  return (
    <div
      className={`
      inline-flex items-center justify-center
      ${size === "sm" ? "w-6 h-6" : size === "lg" ? "w-10 h-10" : "w-8 h-8"}
      ${fileInfo.bgColor} ${fileInfo.borderColor} border rounded-lg
      ${className}
    `}
    >
      {fileInfo.icon}
    </div>
  );
};
