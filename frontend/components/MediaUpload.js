'use client';

import { useState } from 'react';

export default function MediaUpload({ tournamentId, onUploadComplete }) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleUpload = async (files) => {
    if (!files.length) return;

    setUploading(true);
    const formData = new FormData();
    
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });
    
    formData.append('type', files[0].type.startsWith('video/') ? 'video' : 'photo');
    formData.append('category', 'general');

    try {
      const response = await fetch(`/api/media/tournament/${tournamentId}`, {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        onUploadComplete?.();
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    handleUpload(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
        dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {uploading ? (
        <div className="py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Uploading...</p>
        </div>
      ) : (
        <>
          <div className="text-4xl mb-2">📸</div>
          <p className="text-gray-600 mb-2">Drag & drop photos/videos here</p>
          <p className="text-sm text-gray-500 mb-4">or</p>
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={(e) => handleUpload(e.target.files)}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 cursor-pointer"
          >
            Choose Files
          </label>
        </>
      )}
    </div>
  );
}