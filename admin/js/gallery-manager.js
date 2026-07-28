// ================================================
// KVM Creations — Admin Gallery Manager
// ================================================

import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  orderBy, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import { auth, db } from "../../js/firebase-config.js";
import { uploadImageToCloudinary } from "../../js/cloudinary-service.js";

// Firestore Collection Reference
const GALLERY_COLLECTION = "gallery";

/**
 * Transforms Cloudinary secure_url to dynamic responsive delivery URL (f_auto,q_auto,w_800)
 * @param {string} secureUrl 
 * @returns {string} Transformed URL
 */
export function generateThumbnailUrl(secureUrl) {
  if (!secureUrl) return '';
  return secureUrl.replace('/upload/', '/upload/f_auto,q_auto,w_800/');
}

/**
 * Formats a Firestore Timestamp or Date object into a readable string
 * @param {Object|Date} timestamp 
 * @returns {string} Formatted date string
 */
function formatDate(timestamp) {
  if (!timestamp) return 'Just now';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

/**
 * Fetches all gallery documents from Firestore ordered by order ASC, createdAt DESC
 * @returns {Promise<Array>} List of gallery document objects with IDs
 */
export async function fetchGalleryDocuments() {
  try {
    const q = query(
      collection(db, GALLERY_COLLECTION),
      orderBy("order", "asc")
    );
    const querySnapshot = await getDocs(q);
    const documents = [];
    querySnapshot.forEach((docSnap) => {
      documents.push({ id: docSnap.id, ...docSnap.data() });
    });
    return documents;
  } catch (error) {
    console.error("Error fetching gallery items from Firestore:", error);
    throw error;
  }
}

/**
 * Uploads image file to Cloudinary and saves document in Firestore gallery collection
 * @param {Object} itemData - { file, title, categorySlug, tiltClass, order }
 * @returns {Promise<Object>} Created document object
 */
export async function addGalleryPhoto(itemData) {
  const { file, title, categorySlug, tiltClass, order } = itemData;

  if (!file) throw new Error("Please select an image file to upload.");
  if (!title || title.trim() === "") throw new Error("Please provide a photo title.");

  // 1. Upload to Cloudinary using existing service
  const uploadResult = await uploadImageToCloudinary(file);
  if (!uploadResult.success) {
    throw new Error(`Cloudinary Upload Failed: ${uploadResult.error}`);
  }

  // 2. Generate transformed thumbnailUrl
  const thumbnailUrl = generateThumbnailUrl(uploadResult.secure_url);

  // 3. Prepare Firestore document
  const docData = {
    title: title.trim(),
    categorySlug: categorySlug || "weddings",
    imageUrl: uploadResult.secure_url,
    thumbnailUrl: thumbnailUrl,
    publicId: uploadResult.public_id,
    tiltClass: tiltClass || "",
    order: Number(order) || 1,
    createdAt: serverTimestamp()
  };

  // 4. Save to Firestore `gallery` collection
  const docRef = await addDoc(collection(db, GALLERY_COLLECTION), docData);
  return { id: docRef.id, ...docData };
}

/**
 * Updates metadata of an existing gallery document in Firestore (without re-uploading image)
 * @param {string} docId 
 * @param {Object} updatedFields - { title, categorySlug, tiltClass, order }
 */
export async function updateGalleryPhotoMetadata(docId, updatedFields) {
  if (!docId) throw new Error("Missing document ID for update.");

  const docRef = doc(db, GALLERY_COLLECTION, docId);
  const fieldsToUpdate = {
    title: updatedFields.title.trim(),
    categorySlug: updatedFields.categorySlug,
    tiltClass: updatedFields.tiltClass || "",
    order: Number(updatedFields.order) || 1
  };

  await updateDoc(docRef, fieldsToUpdate);
}

/**
 * Safely deletes an image:
 * 1. Authenticates admin & requests Cloudinary deletion via /api/delete-image
 * 2. Only deletes Firestore document if Cloudinary deletion succeeds
 * @param {string} docId - Firestore document ID
 * @param {string} publicId - Cloudinary public_id
 */
export async function deleteGalleryPhoto(docId, publicId) {
  if (!docId || !publicId) {
    throw new Error("Missing document ID or Cloudinary publicId for deletion.");
  }

  // 1. Ensure authenticated user and fetch Firebase Auth ID token
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Unauthorized: Active admin session required.");
  
  const idToken = await currentUser.getIdToken();

  // 2. Call Vercel Serverless Function /api/delete-image
  const response = await fetch('/api/delete-image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
    body: JSON.stringify({ publicId, idToken })
  });

  const deleteResult = await response.json();

  if (!response.ok || !deleteResult.success) {
    const errorMsg = deleteResult.error || "Failed to delete image from Cloudinary server.";
    throw new Error(`Cloudinary Deletion Error: ${errorMsg}`);
  }

  // 3. Confirm Cloudinary deletion succeeded before deleting Firestore record
  const docRef = doc(db, GALLERY_COLLECTION, docId);
  await deleteDoc(docRef);
  
  return { success: true };
}
