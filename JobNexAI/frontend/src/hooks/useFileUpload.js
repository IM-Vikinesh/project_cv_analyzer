import { useState, useCallback } from 'react';
import { uploadAPI } from '../services/api';
import toast from 'react-hot-toast';

export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState(null);

  const uploadResume = useCallback(async (file) => {
    if (!file) {
      toast.error('No file selected');
      return null;
    }

    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      toast.error('Only PDF and DOCX files are allowed');
      return null;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return null;
    }

    setUploading(true);
    try {
      const response = await uploadAPI.uploadResume(file);
      if (response.data?.success) {
        setUploadedUrl(response.data.file_url);
        toast.success('Resume uploaded successfully');
        return response.data.file_url;
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to upload resume');
      return null;
    } finally {
      setUploading(false);
    }
  }, []);

  const uploadProfileImage = useCallback(async (file) => {
    if (!file) {
      toast.error('No file selected');
      return null;
    }

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Only PNG, JPG, GIF, and WebP images are allowed');
      return null;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return null;
    }

    setUploading(true);
    try {
      const response = await uploadAPI.uploadProfileImage(file);
      if (response.data?.success) {
        setUploadedUrl(response.data.file_url);
        toast.success('Profile image uploaded successfully');
        return response.data.file_url;
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to upload image');
      return null;
    } finally {
      setUploading(false);
    }
  }, []);

  const uploadApplicationResume = useCallback(async (file, jobId) => {
    if (!file) {
      toast.error('No file selected');
      return null;
    }

    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      toast.error('Only PDF and DOCX files are allowed');
      return null;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return null;
    }

    setUploading(true);
    try {
      const response = await uploadAPI.uploadApplicationResume(file, jobId);
      if (response.data?.success) {
        setUploadedUrl(response.data.file_url);
        toast.success('Resume uploaded successfully');
        return response.data.file_url;
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to upload resume');
      return null;
    } finally {
      setUploading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setUploadedUrl(null);
    setUploading(false);
  }, []);

  return {
    uploading,
    uploadedUrl,
    uploadResume,
    uploadProfileImage,
    uploadApplicationResume,
    reset,
  };
};

export default useFileUpload;
