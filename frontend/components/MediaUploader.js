'use client';

import { useRef, useState } from 'react';
import { useUpload } from '../hooks/useUpload';

export function MediaUploader({ onMediaAdded, onMultipleFilesSelected }) {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const { upload, isUploading, uploadProgress, error } = useUpload();

  const handleFileSelect = async (files) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);

    console.log("ALL FILES:", fileArray);
    console.log("FILE TYPES:", fileArray.map(f => f.type));

    // If multiple images → trigger comparison flow
    const imageFiles = fileArray.filter(file => file.type.startsWith("image/"));

    console.log("IMAGE FILES:", imageFiles);
    console.log("IMAGE COUNT:", imageFiles.length);

    if (imageFiles.length > 1 && onMultipleFilesSelected) {
      onMultipleFilesSelected(imageFiles);
      return; // STOP normal upload flow
    }

    // ================= EXISTING FLOW (UNCHANGED) =================
    const uploadPromises = fileArray.map(async (file) => {
      const isValid =
        file.type.startsWith("image/") ||
        file.type.startsWith("video/") ||
        file.type.startsWith("audio/") ||
        file.type === "application/pdf";

      if (!isValid) return null;

      const result = await upload(file);
      return result;
    });

    const results = await Promise.all(uploadPromises);

    results.forEach((result) => {
      if (result && result.url) {
        onMediaAdded(result);
      }
    });
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === 'dragenter' || e.type === 'dragover') {
      if (!dragActive) setDragActive(true); // avoid unnecessary state update
    } else if (e.type === 'dragleave') {
      if (dragActive) setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (isUploading) return; // prevent during upload

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e) => {
    if (isUploading) return; // prevent during upload

    if (e.target.files) {
      handleFileSelect(e.target.files);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => {
          if (!isUploading) {
            fileInputRef.current?.click();
          }
        }}
        className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all"
        style={{
          borderColor: dragActive ? 'var(--accent-color)' : 'var(--border-color)',
          backgroundColor: dragActive ? 'var(--accent-light)' : 'transparent',
          opacity: isUploading ? 0.5 : 1,
          cursor: isUploading ? 'not-allowed' : 'pointer',
        }}
      >
        <div className="flex flex-col items-center gap-2">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{
              color: dragActive ? 'var(--accent-color)' : 'var(--text-tertiary)',
            }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>

          <div className="text-sm">
            {isUploading ? (
              <div>
                <p style={{ color: 'var(--text-primary)' }}>Uploading...</p>
                <div
                  className="w-full rounded-full h-2 mt-2"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                  }}
                >
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${uploadProgress}%`,
                      backgroundColor: 'var(--accent-color)',
                    }}
                  />
                </div>
              </div>
            ) : (
              <>
                <p style={{ color: 'var(--text-primary)' }}>
                  Drag files here or click to upload
                </p>
                <p
                  className="text-xs"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  Images, videos, audio, PDF
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div
          className="text-sm rounded px-3 py-2"
          style={{
            color: '#ff6b6b',
            backgroundColor: 'rgba(255, 107, 107, 0.1)',
            borderLeft: '3px solid #ff6b6b',
          }}
        >
          {error}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*,audio/*,.pdf"
        onChange={handleInputChange}
        className="hidden"
        disabled={isUploading}
      />
    </div>
  );
}