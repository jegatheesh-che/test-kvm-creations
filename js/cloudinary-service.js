// ================================================
// KVM Creations — Cloudinary Upload Service
// Project 2 Unsigned Image Upload Handler
// ================================================

import { CLOUDINARY_CONFIG } from '../config/cloudinary-config.js';

export { CLOUDINARY_CONFIG };

/**
 * Uploads an image file to Cloudinary using Project 2 centralized configuration.
 * @param {File|Blob} file - The image file to upload.
 * @returns {Promise<Object>} Normalized upload result object.
 */
export async function uploadImageToCloudinary(file) {
  // 1. File Presence & Image Type Validation
  if (!file) {
    throw new Error("Upload failed: No file provided.");
  }

  const isImage = file.type ? file.type.startsWith('image/') : true;
  if (!isImage) {
    throw new Error(`Upload failed: File "${file.name || 'unnamed'}" is not a valid image format.`);
  }

  // 2. Prepare Form Data for Unsigned Upload
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);

  try {
    // 3. Post to Cloudinary REST API Endpoint
    const response = await fetch(CLOUDINARY_CONFIG.uploadUrl, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data?.error?.message || `HTTP error status: ${response.status}`;
      throw new Error(`Cloudinary API Error: ${errorMsg}`);
    }

    // 4. Return Clean Normalized Result Object
    return {
      success: true,
      secure_url: data.secure_url,
      public_id: data.public_id,
      original_filename: data.original_filename || file.name || 'uploaded_image',
      width: data.width,
      height: data.height,
      format: data.format,
      bytes: data.bytes
    };

  } catch (error) {
    console.error('Cloudinary Upload Service Error:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred during image upload.'
    };
  }
}
