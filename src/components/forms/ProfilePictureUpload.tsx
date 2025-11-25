'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import api from '@/lib/api';
import { toast } from 'react-toastify';

interface ProfilePictureUploadProps {
  currentPicture?: string;
  onUploadSuccess?: (url: string) => void;
}

export function ProfilePictureUpload({ currentPicture, onUploadSuccess }: ProfilePictureUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentPicture || null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);

      const response = await api.post('/profile/picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Profile picture uploaded successfully!');
      if (onUploadSuccess) {
        onUploadSuccess(response.data.profilePicture);
      }
    } catch (error) {
      toast.error('Failed to upload profile picture. Please try again.');
      setPreview(currentPicture || null);
    } finally {
      setUploading(false);
    }
  }, [currentPicture, onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${
          isDragActive
            ? 'border-[#4CAF50] bg-[#E8F5E9]'
            : 'border-gray-300 hover:border-[#4CAF50] hover:bg-gray-50'
        } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} disabled={uploading} />
        {preview ? (
          <div className="space-y-4">
            <img
              src={preview}
              alt="Profile preview"
              className="w-32 h-32 rounded-full object-cover mx-auto"
            />
            <p className="text-sm text-gray-600">
              {uploading ? 'Uploading...' : 'Click or drag to change picture'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mx-auto">
              <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">
                {isDragActive ? 'Drop the image here' : 'Click or drag to upload'}
              </p>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

