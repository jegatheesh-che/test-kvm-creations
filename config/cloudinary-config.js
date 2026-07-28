// ================================================
// KVM Creations — Public Cloudinary Configuration
// Project 2 Cloudinary Instance
// ================================================

export const CLOUDINARY_CONFIG = Object.freeze({
  cloudName: 'vfcl8vef',
  uploadPreset: 'kvm_creations_gallery',
  get uploadUrl() {
    return `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;
  }
});

export default CLOUDINARY_CONFIG;
