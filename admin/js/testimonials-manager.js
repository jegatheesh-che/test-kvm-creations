// ================================================
// KVM Creations — Admin Testimonials Manager
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
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

import { auth, db } from "../../js/firebase-config.js";
import { uploadImageToCloudinary } from "../../js/cloudinary-service.js";

// Firestore Collection Reference
const TESTIMONIALS_COLLECTION = "testimonials";

/**
 * Transforms Cloudinary avatarUrl to dynamic 200x200 square avatar delivery URL (f_auto,q_auto,w_200,h_200,c_fill)
 * @param {string} avatarUrl 
 * @returns {string} Transformed avatar URL
 */
export function generateAvatarThumbnailUrl(avatarUrl) {
  if (!avatarUrl) return '';
  return avatarUrl.replace('/upload/', '/upload/f_auto,q_auto,w_200,h_200,c_fill/');
}

/**
 * Fetches all testimonial documents from Firestore ordered by order ASC
 * @returns {Promise<Array>} List of testimonial document objects with IDs
 */
export async function fetchTestimonialDocuments() {
  try {
    const q = query(
      collection(db, TESTIMONIALS_COLLECTION),
      orderBy("order", "asc")
    );
    const querySnapshot = await getDocs(q);
    const documents = [];
    querySnapshot.forEach((docSnap) => {
      documents.push({ id: docSnap.id, ...docSnap.data() });
    });
    return documents;
  } catch (error) {
    console.error("Error fetching testimonials from Firestore:", error);
    throw error;
  }
}

/**
 * Uploads client avatar image to Cloudinary and saves document in Firestore testimonials collection
 * @param {Object} testimonialData - { file, clientName, reviewText, detail, rating, order, isActive }
 * @returns {Promise<Object>} Created document object
 */
export async function addTestimonial(testimonialData) {
  const { file, clientName, reviewText, detail, rating, order, isActive } = testimonialData;

  if (!clientName || clientName.trim() === "") throw new Error("Please enter client name.");
  if (!reviewText || reviewText.trim() === "") throw new Error("Please enter review text quote.");
  if (!detail || detail.trim() === "") throw new Error("Please enter category & location detail (e.g. Toronto Wedding • Casa Loma).");
  if (!file) throw new Error("Please select an avatar image file to upload.");

  const ratingVal = Number(rating) || 5;
  if (ratingVal < 1 || ratingVal > 5) throw new Error("Rating must be between 1 and 5.");

  // 1. Upload image to Cloudinary using existing service
  const uploadResult = await uploadImageToCloudinary(file);
  if (!uploadResult.success) {
    throw new Error(`Cloudinary Upload Failed: ${uploadResult.error}`);
  }

  // 2. Prepare Firestore document
  const docData = {
    clientName: clientName.trim(),
    reviewText: reviewText.trim(),
    detail: detail.trim(),
    rating: ratingVal,
    avatarUrl: uploadResult.secure_url,
    publicId: uploadResult.public_id,
    order: Number(order) || 1,
    isActive: Boolean(isActive),
    createdAt: serverTimestamp()
  };

  // 3. Save to Firestore `testimonials` collection
  const docRef = await addDoc(collection(db, TESTIMONIALS_COLLECTION), docData);
  return { id: docRef.id, ...docData };
}

/**
 * Quick toggles active state of a testimonial document
 * @param {string} docId 
 * @param {boolean} currentActiveState 
 */
export async function toggleTestimonialActive(docId, currentActiveState) {
  if (!docId) throw new Error("Missing document ID.");
  const docRef = doc(db, TESTIMONIALS_COLLECTION, docId);
  await updateDoc(docRef, { isActive: !currentActiveState });
}

/**
 * Updates metadata (and optionally replaces avatar image) of an existing testimonial document
 * @param {string} docId 
 * @param {Object} updatedFields - { clientName, reviewText, detail, rating, order, isActive, newFile, oldPublicId }
 */
export async function updateTestimonial(docId, updatedFields) {
  if (!docId) throw new Error("Missing document ID for update.");

  const docRef = doc(db, TESTIMONIALS_COLLECTION, docId);
  const { clientName, reviewText, detail, rating, order, isActive, newFile, oldPublicId } = updatedFields;

  if (!clientName || clientName.trim() === "") throw new Error("Please enter client name.");
  if (!reviewText || reviewText.trim() === "") throw new Error("Please enter review text quote.");
  if (!detail || detail.trim() === "") throw new Error("Please enter category & location detail.");

  const ratingVal = Number(rating) || 5;
  if (ratingVal < 1 || ratingVal > 5) throw new Error("Rating must be between 1 and 5.");

  const fieldsToUpdate = {
    clientName: clientName.trim(),
    reviewText: reviewText.trim(),
    detail: detail.trim(),
    rating: ratingVal,
    order: Number(order) || 1,
    isActive: Boolean(isActive)
  };

  // Case A: Avatar Image Replacement
  if (newFile) {
    // 1. Upload new avatar image to Cloudinary
    const uploadResult = await uploadImageToCloudinary(newFile);
    if (!uploadResult.success) {
      throw new Error(`Cloudinary Upload Failed: ${uploadResult.error}`);
    }

    fieldsToUpdate.avatarUrl = uploadResult.secure_url;
    fieldsToUpdate.publicId = uploadResult.public_id;

    // 2. Update Firestore with new image credentials
    await updateDoc(docRef, fieldsToUpdate);

    // 3. Only after Firestore update succeeds, delete old image from Cloudinary
    if (oldPublicId) {
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          const idToken = await currentUser.getIdToken();
          await fetch('/api/delete-image', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify({ publicId: oldPublicId, idToken })
          });
        }
      } catch (err) {
        console.warn("Old Cloudinary avatar cleanup warning:", err);
      }
    }
  } else {
    // Case B: Metadata update only
    await updateDoc(docRef, fieldsToUpdate);
  }
}

/**
 * Safely deletes a testimonial:
 * 1. Authenticates admin & requests Cloudinary deletion via /api/delete-image
 * 2. Only deletes Firestore document if Cloudinary deletion succeeds
 * @param {string} docId - Firestore document ID
 * @param {string} publicId - Cloudinary public_id
 */
export async function deleteTestimonial(docId, publicId) {
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
  const docRef = doc(db, TESTIMONIALS_COLLECTION, docId);
  await deleteDoc(docRef);
  
  return { success: true };
}
