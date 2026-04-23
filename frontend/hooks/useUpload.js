import { useState, useCallback } from 'react';
import { normalizeMediaUrl, uploadMedia } from '../lib/api';
import { showSuccessToast, showErrorToast } from '../hooks/use-toast';

export const useUpload = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const upload = useCallback(async (file) => {
    if (!file) return null;

    const maxSize = 100 * 1024 * 1024;

    if (file.size > maxSize) {
      const message = 'File size should be less than 100MB';
      setError(message);
      showErrorToast(message);
      return null;
    }

    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const result = await uploadMedia(file, (progress) => {
        setUploadProgress(progress);
      });

      const fileData = result;

      // FIXED URL extraction
      const fileUrl =
        fileData?.url ||
        fileData?.fileUrl ||
        fileData?.path ||
        fileData?.data?.url;

      if (!fileUrl) {
        throw new Error("File URL not received from server");
      }

      const uploadedFile = {
        url: normalizeMediaUrl(fileUrl),
        type: file.type,
        name: file.name,
        size: file.size,
      };

      showSuccessToast("File uploaded successfully");

      return uploadedFile;

    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Upload failed';

      setError(message);
      showErrorToast(message);
      console.error('Upload error:', err);

      return null;
    } finally {
      setIsUploading(false);

      setTimeout(() => {
        setUploadProgress(0);
      }, 500);
    }
  }, []);

  return {
    upload,
    isUploading,
    uploadProgress,
    error,
  };
};
