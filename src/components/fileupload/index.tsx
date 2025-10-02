// src/components/ui/file-upload.tsx

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, File, FileText, X } from "lucide-react";

interface FileUploadProps {
  label?: string;
  onFileChange: (file: File | null) => void;
  file: File | null;
  error?: string;
}

export function FileUpload({
  label,
  onFileChange,
  file,
  error,
}: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  }, [file]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0] || null;
    onFileChange(uploadedFile);
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileChange(null);
  };

  const renderFilePreview = () => {
    if (!file) {
      return (
        <>
          <UploadCloud className="mb-2 h-12 w-12 text-gray-400" />
          <span className="text-sm font-medium text-gray-600">
            Click to upload or drag and drop
          </span>
          <span className="mt-1 text-xs text-gray-400">{label}</span>
        </>
      );
    }

    const fileType = file.type.split("/")[1]?.toUpperCase() || "FILE";

    if (preview) {
      return (
        <div className="relative flex h-full w-full items-center justify-center p-2">
          <img
            src={preview}
            alt="File preview"
            className="max-h-32 max-w-full rounded-md object-contain"
          />
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center p-4 text-center">
        {file.type.includes("pdf") ? (
          <FileText className="mb-2 h-12 w-12 text-blue-500" />
        ) : (
          <File className="mb-2 h-12 w-12 text-gray-500" />
        )}
        <p className="w-full truncate px-2 text-sm font-medium text-gray-700">
          {file.name}
        </p>
        <p className="mt-1 text-xs text-gray-400">File Type: {fileType}</p>
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {label && <label className="font-medium text-[#001360]">{label}</label>}
      <motion.div
        className={`relative w-full border-2 p-4 ${
          error ? "border-red-300" : "border-dashed border-gray-300"
        } rounded-xl transition-colors duration-300 hover:border-[#143ad0]`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
      >
        {/* Upload Zone */}
        <label
          htmlFor={`file-upload-${label}`}
          className="flex h-full min-h-[120px] w-full cursor-pointer flex-col items-center justify-center"
        >
          <input
            id={`file-upload-${label}`}
            type="file"
            onChange={handleFileChange}
            className="sr-only"
          />
          <AnimatePresence mode="wait">{renderFilePreview()}</AnimatePresence>
        </label>

        {/* Remove button OUTSIDE the label */}
        {file && (
          <motion.button
            type="button"
            onClick={handleRemoveFile}
            className="absolute top-2 right-2 rounded-full bg-red-500 p-1 text-white shadow-md transition-colors hover:bg-red-600"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="h-4 w-4" />
          </motion.button>
        )}
      </motion.div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-500"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}
