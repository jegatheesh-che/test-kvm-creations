// ================================================
// KVM CREATIONS — ADMIN GALLERY MANAGER
// ================================================

import { auth, db } from "/js/firebase-config.js?v=2";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, serverTimestamp, writeBatch } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Cloudinary Configuration (KVM Creations)
const CLOUD_NAME = "vfcl8vef";
const UPLOAD_PRESET = "kvm_creations_gallery";
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

// DOM Elements - State
const loadingState = document.getElementById("adminGalleryLoading");
const errorState = document.getElementById("adminGalleryError");
const emptyState = document.getElementById("adminGalleryEmpty");
const galleryGrid = document.getElementById("adminGalleryGrid");

// DOM Elements - Modals & Forms
const btnAddNew = document.getElementById("btnAddNew");
const galleryModal = document.getElementById("galleryModal");
const galleryModalClose = document.getElementById("galleryModalClose");
const galleryModalCancel = document.getElementById("galleryModalCancel");
const galleryForm = document.getElementById("galleryForm");
const galleryModalTitle = document.getElementById("galleryModalTitle");
const galleryFormError = document.getElementById("galleryFormError");
const galleryModalSubmit = document.getElementById("galleryModalSubmit");

// Form Inputs
const inputId = document.getElementById("galleryId");
const inputTitle = document.getElementById("galleryTitle");
const inputCategory = document.getElementById("galleryCategory");
const inputMediaType = document.getElementById("galleryMediaType");
const inputImage = document.getElementById("galleryImage");
const inputYoutubeId = document.getElementById("galleryYoutubeId");
const groupImageUpload = document.getElementById("groupImageUpload");
const groupYoutubeId = document.getElementById("groupYoutubeId");

// DOM Elements - Delete Modal
const deleteModal = document.getElementById("deleteModal");
const deleteModalClose = document.getElementById("deleteModalClose");
const deleteModalCancel = document.getElementById("deleteModalCancel");
const deleteModalConfirm = document.getElementById("deleteModalConfirm");
const deleteItemTitle = document.getElementById("deleteItemTitle");
const deleteModalError = document.getElementById("deleteModalError");

// DOM Elements - Bulk Actions
const btnSelectAll = document.getElementById("btnSelectAll");
const btnDeselectAll = document.getElementById("btnDeselectAll");
const btnDeleteSelected = document.getElementById("btnDeleteSelected");
const deleteBulkModal = document.getElementById("deleteBulkModal");
const deleteBulkModalClose = document.getElementById("deleteBulkModalClose");
const deleteBulkModalCancel = document.getElementById("deleteBulkModalCancel");
const deleteBulkModalConfirm = document.getElementById("deleteBulkModalConfirm");
const deleteBulkCount = document.getElementById("deleteBulkCount");
const deleteBulkModalError = document.getElementById("deleteBulkModalError");

let currentGalleryItems = [];
let itemToDelete = null;
let selectedItemIds = new Set();

// Initialize on auth state change
onAuthStateChanged(auth, (user) => {
  if (user) {
    loadGalleryItems();
  }
});

// ================================================
// DATA FETCHING
// ================================================
async function loadGalleryItems() {
  if (!galleryGrid || !loadingState) return;

  loadingState.style.display = "grid";
  errorState.style.display = "none";
  emptyState.style.display = "none";
  galleryGrid.style.display = "none";
  galleryGrid.innerHTML = "";

  try {
    const querySnapshot = await getDocs(collection(db, "gallery"));
    
    currentGalleryItems = [];
    querySnapshot.forEach((doc) => {
      currentGalleryItems.push({ id: doc.id, ...doc.data() });
    });

    currentGalleryItems.sort((a, b) => (a.order || 0) - (b.order || 0));

    selectedItemIds.clear();
    updateBulkActionUI();

const DEFAULT_SEED_GALLERY = [
  { title: "The First Glance", category: "weddings", mediaType: "image", image: "/assets/images/img1.webp", order: 1 },
  { title: "Elegance in Motion", category: "portraits", mediaType: "image", image: "/assets/images/img2.webp", order: 2 },
  { title: "Moroccan Sunrise", category: "destinations", mediaType: "image", image: "/assets/images/img3.webp", order: 3 },
  { title: "Vogue Whispers", category: "editorial", mediaType: "image", image: "/assets/images/img4.webp", order: 4 },
  { title: "Sacred Vows", category: "weddings", mediaType: "image", image: "/assets/images/img5.webp", order: 5 },
  { title: "Alpine Serenade", category: "destinations", mediaType: "image", image: "/assets/images/img6.webp", order: 6 },
  { title: "Gilded Shadows", category: "portraits", mediaType: "image", image: "/assets/images/img7.webp", order: 7 },
  { title: "Monochrome Solitude", category: "editorial", mediaType: "image", image: "/assets/images/img8.webp", order: 8 },
  { title: "Royal Celebration", category: "weddings", mediaType: "image", image: "/assets/images/img9.webp", order: 9 },
  { title: "Subtle Intimacy", category: "portraits", mediaType: "image", image: "/assets/images/img10.webp", order: 10 },
  { title: "Icelandic Breeze", category: "destinations", mediaType: "image", image: "/assets/images/img11.webp", order: 11 },
  { title: "Golden Hour Grace", category: "editorial", mediaType: "image", image: "/assets/images/img12.webp", order: 12 },
  { title: "Forever Yours", category: "weddings", mediaType: "image", image: "/assets/images/img13.webp", order: 13 },
  { title: "Radiant Essence", category: "portraits", mediaType: "image", image: "/assets/images/img14.webp", order: 14 },
  { title: "Amalfi Sunset", category: "destinations", mediaType: "image", image: "/assets/images/img15.webp", order: 15 },
  { title: "Velvet Dusk", category: "editorial", mediaType: "image", image: "/assets/images/img16.webp", order: 16 },
  { title: "Unconditional Promise", category: "weddings", mediaType: "image", image: "/assets/images/img17.webp", order: 17 },
  { title: "Poetic Silence", category: "portraits", mediaType: "image", image: "/assets/images/img18.webp", order: 18 },
  { title: "Highland Majesty", category: "destinations", mediaType: "image", image: "/assets/images/img19.webp", order: 19 },
  { title: "Architectural Form", category: "editorial", mediaType: "image", image: "/assets/images/img20.webp", order: 20 },
  { title: "Bridal Majesty", category: "weddings", mediaType: "image", image: "/assets/images/img21.webp", order: 21 },
  { title: "Timeless Gaze", category: "portraits", mediaType: "image", image: "/assets/images/img22.webp", order: 22 },
  { title: "Desert Mirage", category: "destinations", mediaType: "image", image: "/assets/images/img23.webp", order: 23 },
  { title: "Modern Nostalgia", category: "editorial", mediaType: "image", image: "/assets/images/img24.webp", order: 24 },
  { title: "First Dance Romance", category: "weddings", mediaType: "image", image: "/assets/images/img25.webp", order: 25 },
  { title: "Santorini Horizons", category: "destinations", mediaType: "image", image: "/assets/images/img28.webp", order: 26 },
  { title: "Expressive Soul", category: "portraits", mediaType: "image", image: "/assets/images/img30.webp", order: 27 }
];

async function seedDefaultGallery() {
  try {
    loadingState.style.display = "grid";
    emptyState.style.display = "none";
    for (const item of DEFAULT_SEED_GALLERY) {
      const newRef = doc(collection(db, "gallery"));
      await setDoc(newRef, { ...item, createdAt: serverTimestamp() });
    }
    await loadGalleryItems();
    if (window.showAppPopup) {
      window.showAppPopup("Gallery Seeded", "🎉 Successfully imported 27 KVM Creations portfolio items into database!", "success");
    }
  } catch (err) {
    console.error("[Admin Gallery] Seed Error:", err);
    alert("Failed to seed default gallery items: " + err.message);
    loadGalleryItems();
  }
}

    if (currentGalleryItems.length === 0) {
      loadingState.style.display = "none";
      emptyState.style.display = "block";
      emptyState.innerHTML = `
        <p>No gallery items found in KVM Creations database.</p>
        <button type="button" id="btnSeedGallery" class="btn-primary" style="margin-top: 14px;">+ Import KVM Portfolio Photos (27 Items)</button>
      `;
      const btnSeed = document.getElementById("btnSeedGallery");
      if (btnSeed) btnSeed.addEventListener("click", seedDefaultGallery);
      return;
    }

    currentGalleryItems.forEach((item, index) => {
      const card = createAdminGalleryCard(item, index);
      galleryGrid.appendChild(card);
    });

    loadingState.style.display = "none";
    galleryGrid.style.display = "grid";

  } catch (error) {
    console.error("[Admin Gallery] Error fetching gallery items:", error);
    loadingState.style.display = "none";
    errorState.style.display = "block";
    const detailMsg = error.message || error.code || "Unknown error";
    errorState.innerHTML = `
      <strong>Failed to load gallery items:</strong> ${detailMsg}<br/>
      <small style="opacity: 0.8; margin-top: 4px; display: inline-block;">
        Ensure Firestore Database is created in Firebase Console (kvm-creation-studio) and rules are published.
      </small>
    `;
  }
}

// ================================================
// DOM GENERATION
// ================================================
// Utility for faster image loading
function getOptimizedCloudinaryUrl(url, width = 400) {
  // If the cloud restricts dynamic transformations, the optimized URL will return 401/403.
  // To ensure images always load, we fallback to the original URL.
  return url;
}

// YouTube URL & Shorts ID Extractor
function extractYoutubeId(input) {
  if (!input) return "";
  input = String(input).trim();
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = input.match(regExp);
  if (match && match[2] && match[2].length === 11) {
    return match[2];
  }
  const clean = input.split(/[?&#]/)[0].replace(/^.*[\\\/]/, '');
  return clean.length === 11 ? clean : input;
}

function createAdminGalleryCard(item, index = 0) {
  const card = document.createElement("div");
  card.className = "admin-gallery-item animate-in";
  card.dataset.id = item.id;
  card.style.animationDelay = `${index * 0.05}s`;

  const isVideo = item.mediaType === "video";
  const badgeClass = isVideo ? "badge-video" : "badge-image";
  const badgeText = isVideo ? "Video" : "Image";

  let thumbUrl = "";
  if (isVideo && item.youtubeId) {
    const cleanYtId = extractYoutubeId(item.youtubeId);
    thumbUrl = `https://img.youtube.com/vi/${cleanYtId}/hqdefault.jpg`;
  } else if (!isVideo && item.cloudinaryUrl) {
    thumbUrl = getOptimizedCloudinaryUrl(item.cloudinaryUrl, 400);
  }

  card.innerHTML = `
    <div class="admin-gallery-item__checkbox-wrapper">
      <input type="checkbox" class="admin-gallery-item__checkbox" data-id="${item.id}" />
    </div>
    <img src="${thumbUrl}" alt="${item.title || 'Gallery Item'}" class="admin-gallery-item__thumb" loading="lazy" />
    <div class="admin-gallery-item__info">
      <h3 class="admin-gallery-item__title" title="${item.title || ''}">${item.title || 'Untitled'}</h3>
      <div class="admin-gallery-item__meta">
        <span class="admin-gallery-item__category">${item.category || 'Uncategorized'}</span>
        <div class="admin-gallery-item__order-editor">
          <label>Order:</label>
          <input type="number" class="order-input" data-id="${item.id}" value="${item.order || 0}" min="1" max="${currentGalleryItems.length}" />
        </div>
      </div>
      <div class="admin-gallery-item__meta" style="margin-top: 4px;">
        <span class="admin-gallery-item__badge ${badgeClass}">${badgeText}</span>
      </div>
    </div>
    <div class="admin-gallery-item__actions">
      <button class="btn-action btn-edit" data-id="${item.id}">Edit</button>
      <button class="btn-action btn-action--danger btn-delete" data-id="${item.id}">Delete</button>
    </div>
  `;

  // Attach Listeners
  card.querySelector('.btn-edit').addEventListener('click', () => openEditModal(item));
  card.querySelector('.btn-delete').addEventListener('click', () => openDeleteModal(item));

  const orderInput = card.querySelector('.order-input');
  orderInput.addEventListener('change', (e) => handleOrderChange(item.id, e.target.value));

  const checkbox = card.querySelector('.admin-gallery-item__checkbox');
  checkbox.addEventListener('change', (e) => {
    if (e.target.checked) {
      selectedItemIds.add(item.id);
    } else {
      selectedItemIds.delete(item.id);
    }
    updateBulkActionUI();
  });

  const img = card.querySelector('.admin-gallery-item__thumb');
  if (img) {
    if (img.complete) {
      img.classList.add('loaded');
    } else {
      img.addEventListener('load', () => img.classList.add('loaded'));
      img.addEventListener('error', () => img.classList.add('loaded'));
    }
  }

  return card;
}

// ================================================
// MODAL LOGIC (ADD / EDIT)
// ================================================
// DOM Elements - Upload UI & Progress
const imagePreviewContainer = document.getElementById("imagePreviewContainer");
const uploadProgressWrapper = document.getElementById("uploadProgressWrapper");
const uploadProgressTitle = document.getElementById("uploadProgressTitle");
const uploadProgressCount = document.getElementById("uploadProgressCount");
const uploadProgressPercent = document.getElementById("uploadProgressPercent");
const uploadProgressBarFill = document.getElementById("uploadProgressBarFill");
const uploadProgressStepText = document.getElementById("uploadProgressStepText");

// Helper: Format bytes to human readable size
function formatFileSize(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// XHR Cloudinary Upload Helper with Real-time Byte Progress Tracking
function uploadToCloudinaryWithProgress(file, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("folder", "website-gallery");

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const percent = (e.loaded / e.total) * 100;
        if (onProgress) onProgress(percent);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          resolve(data);
        } catch (err) {
          reject(new Error("Invalid JSON response from Cloudinary."));
        }
      } else {
        try {
          const errData = JSON.parse(xhr.responseText);
          reject(new Error(errData.error?.message || "Cloudinary upload failed."));
        } catch (err) {
          reject(new Error(`Cloudinary upload failed (HTTP ${xhr.status})`));
        }
      }
    };

    xhr.onerror = () => reject(new Error("Network connection error during Cloudinary upload."));
    xhr.open("POST", CLOUDINARY_UPLOAD_URL, true);
    xhr.send(formData);
  });
}

// Render Live Image Previews in Modal
function renderImagePreviews() {
  if (!imagePreviewContainer || !inputImage) return;
  imagePreviewContainer.innerHTML = "";

  const files = inputImage.files ? Array.from(inputImage.files) : [];
  if (files.length === 0) {
    imagePreviewContainer.style.display = "none";
    return;
  }

  imagePreviewContainer.style.display = "grid";

  files.forEach((file, index) => {
    const card = document.createElement("div");
    card.className = "preview-thumb-card";
    card.dataset.index = index;

    card.innerHTML = `
      <span class="preview-status-pill" id="prevPill_${index}">Ready</span>
      <img id="prevImg_${index}" src="" alt="${file.name}" />
      <div class="preview-meta-overlay">
        <span class="preview-filename" title="${file.name}">${file.name}</span>
        <span class="preview-size">${formatFileSize(file.size)}</span>
      </div>
    `;

    imagePreviewContainer.appendChild(card);

    // Read local image file for preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const imgEl = document.getElementById(`prevImg_${index}`);
      if (imgEl) imgEl.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// Dynamic file input selection change listener
if (inputImage) {
  inputImage.addEventListener("change", () => {
    const hintEl = document.getElementById("galleryImageHint");
    const count = inputImage.files ? inputImage.files.length : 0;
    
    renderImagePreviews();

    if (count > 1) {
      if (hintEl) hintEl.textContent = `📸 Selected ${count} images for batch upload!`;
      if (galleryModalSubmit && !inputId.value) galleryModalSubmit.textContent = `Save ${count} Items`;
    } else if (count === 1) {
      if (hintEl) hintEl.textContent = `Selected photo: ${inputImage.files[0].name}`;
      if (galleryModalSubmit && !inputId.value) galleryModalSubmit.textContent = "Save Item";
    } else {
      if (hintEl) hintEl.textContent = "Select one or multiple images (WebP, JPEG, PNG) to upload at once.";
      if (galleryModalSubmit && !inputId.value) galleryModalSubmit.textContent = "Save Item";
    }
  });
}

function resetForm() {
  galleryForm.reset();
  inputId.value = "";
  galleryModalTitle.textContent = "Add New Item";
  galleryFormError.style.display = "none";
  galleryFormError.textContent = "";
  if (imagePreviewContainer) {
    imagePreviewContainer.innerHTML = "";
    imagePreviewContainer.style.display = "none";
  }
  if (uploadProgressWrapper) {
    uploadProgressWrapper.style.display = "none";
    uploadProgressBarFill.style.width = "0%";
    uploadProgressPercent.textContent = "0%";
  }
  toggleMediaFields();
  inputImage.required = true;
  document.getElementById("galleryImageHint").textContent = "Select one or multiple images (WebP, JPEG, PNG) to upload at once.";
  galleryModalSubmit.textContent = "Save Item";
  galleryModalSubmit.classList.remove('is-loading');
  galleryModalSubmit.disabled = false;
  if (galleryModalClose) galleryModalClose.style.display = "block";
  if (galleryModalCancel) galleryModalCancel.style.display = "inline-block";
}

function openAddModal() {
  resetForm();
  galleryModal.showModal();
}

function openEditModal(item) {
  resetForm();
  galleryModalTitle.textContent = "Edit Item";
  inputId.value = item.id;
  inputTitle.value = item.title;
  inputCategory.value = item.category;
  inputMediaType.value = item.mediaType;
  
  toggleMediaFields();

  if (item.mediaType === "video") {
    inputYoutubeId.value = item.youtubeId;
  } else {
    inputImage.required = false; 
    document.getElementById("galleryImageHint").textContent = "Editing image file is not supported. Please delete and recreate if you need to change the photo.";
    inputImage.disabled = true;
  }

  galleryModal.showModal();
}

function closeModals() {
  galleryModal.close();
  deleteModal.close();
}

inputMediaType.addEventListener("change", toggleMediaFields);

function toggleMediaFields() {
  if (inputMediaType.value === "video") {
    groupImageUpload.style.display = "none";
    inputImage.required = false;
    groupYoutubeId.style.display = "flex";
    inputYoutubeId.required = true;
  } else {
    groupImageUpload.style.display = "flex";
    inputImage.required = !inputId.value; // Required only on Add
    inputImage.disabled = !!inputId.value; // Disabled on Edit
    groupYoutubeId.style.display = "none";
    inputYoutubeId.required = false;
  }
}

// Utility to convert filename to readable title
function filenameToTitle(filename) {
  if (!filename) return "Gallery Item";
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
  const cleanName = nameWithoutExt.replace(/[-_]+/g, " ").trim();
  return cleanName.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

// ================================================
// FORM SUBMISSION (WITH VISUAL UPLOAD LOADING PROCESS UI)
// ================================================
galleryForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  galleryFormError.style.display = "none";
  
  const isEdit = !!inputId.value;
  const baseTitle = inputTitle.value.trim();
  const category = inputCategory.value;
  const mediaType = inputMediaType.value;
  
  if (!category || !mediaType || (!isEdit && mediaType === "video" && !inputYoutubeId.value.trim())) {
    showFormError("Please fill in all required fields.");
    return;
  }

  try {
    if (isEdit) {
      // --- UPDATE EXISTING ITEM ---
      galleryModalSubmit.classList.add('is-loading');
      galleryModalSubmit.textContent = "Saving...";

      const updateData = { title: baseTitle, category };
      if (mediaType === "video") {
        const rawYt = inputYoutubeId.value.trim();
        const yId = extractYoutubeId(rawYt);
        if (!yId) throw new Error("YouTube link or ID is required.");
        updateData.youtubeId = yId;
      }

      await updateDoc(doc(db, "gallery", inputId.value), updateData);
      
      closeModals();
      if (window.showToast) {
        window.showToast(`✏️ Gallery item "${baseTitle}" updated!`, "info");
      }
      loadGalleryItems();

    } else if (mediaType === "image" && inputImage.files && inputImage.files.length > 0) {
      // --- VISUAL UPLOAD PROCESS FOR SINGLE / MULTIPLE IMAGES ---
      const files = Array.from(inputImage.files);
      const totalFiles = files.length;
      
      // Activate Upload Loading UI Wrapper
      uploadProgressWrapper.style.display = "block";
      uploadProgressTitle.textContent = totalFiles > 1 ? "Batch Uploading Images" : "Uploading Image";
      uploadProgressCount.textContent = `0 / ${totalFiles}`;
      uploadProgressPercent.textContent = "0%";
      uploadProgressBarFill.style.width = "0%";
      uploadProgressStepText.textContent = "Connecting to Cloudinary server...";

      // Disable modal controls while uploading
      galleryModalSubmit.disabled = true;
      galleryModalSubmit.classList.add('is-loading');
      galleryModalSubmit.textContent = "Uploading...";
      if (galleryModalClose) galleryModalClose.style.display = "none";
      if (galleryModalCancel) galleryModalCancel.style.display = "none";

      let currentMaxOrder = currentGalleryItems.reduce((max, item) => Math.max(max, item.order || 0), 0);
      let uploadedCount = 0;

      for (let i = 0; i < totalFiles; i++) {
        const file = files[i];
        const cardEl = document.querySelector(`.preview-thumb-card[data-index="${i}"]`);
        const pillEl = document.getElementById(`prevPill_${i}`);

        if (cardEl) {
          cardEl.classList.remove('ready', 'done', 'error');
          cardEl.classList.add('uploading');
        }
        if (pillEl) pillEl.textContent = "Uploading...";

        uploadProgressCount.textContent = `${i + 1} / ${totalFiles}`;
        uploadProgressStepText.textContent = `Uploading "${file.name}"...`;

        // Upload with byte-level progress
        const uploadData = await uploadToCloudinaryWithProgress(file, (filePercent) => {
          const overallPercent = Math.round(((i + (filePercent / 100)) / totalFiles) * 100);
          uploadProgressPercent.textContent = `${overallPercent}%`;
          uploadProgressBarFill.style.width = `${overallPercent}%`;
        });

        // Update Card UI to Done
        if (cardEl) {
          cardEl.classList.remove('uploading');
          cardEl.classList.add('done');
        }
        if (pillEl) pillEl.textContent = "✓ Done";

        // Save Firestore Document
        uploadProgressStepText.textContent = `Saving "${file.name}" to database...`;

        const itemTitle = baseTitle ? (totalFiles > 1 ? `${baseTitle} #${i + 1}` : baseTitle) : "";
        const itemOrder = currentMaxOrder + i + 1;
        const mod = itemOrder % 4;
        const tiltClass = mod === 1 ? "tilt-left" : mod === 3 ? "tilt-right" : "";

        const docData = {
          title: itemTitle,
          category,
          mediaType: "image",
          cloudinaryUrl: uploadData.secure_url,
          cloudinaryPublicId: uploadData.public_id,
          tiltClass,
          order: itemOrder,
          createdAt: serverTimestamp()
        };

        const newDocRef = doc(collection(db, "gallery"));
        await setDoc(newDocRef, docData);
        uploadedCount++;
      }

      // Finish Progress Loading UI
      uploadProgressPercent.textContent = "100%";
      uploadProgressBarFill.style.width = "100%";
      uploadProgressStepText.textContent = "✨ Upload complete! Publishing portfolio archive...";

      setTimeout(() => {
        closeModals();
        if (window.showToast) {
          window.showToast(
            totalFiles > 1 
              ? `✨ Successfully uploaded and published ${uploadedCount} photos!` 
              : `✨ Photo uploaded and published to gallery!`, 
            "success"
          );
        }
        if (window.showAppPopup && totalFiles > 1) {
          window.showAppPopup("Batch Upload Complete", `Uploaded ${uploadedCount} images to portfolio archive under ${category.toUpperCase()}.`, "success");
        }
        loadGalleryItems();
      }, 700);

    } else {
      // --- CREATE SINGLE VIDEO ITEM ---
      galleryModalSubmit.classList.add('is-loading');
      galleryModalSubmit.textContent = "Saving Video...";

      const rawYt = inputYoutubeId.value.trim();
      const youtubeId = extractYoutubeId(rawYt);
      if (!youtubeId) throw new Error("YouTube link or ID is required.");
      const title = baseTitle || "Cinematic Video Showcase";

      const maxOrder = currentGalleryItems.reduce((max, item) => Math.max(max, item.order || 0), 0);
      const newOrder = maxOrder + 1;
      const mod = newOrder % 4;
      const tiltClass = mod === 1 ? "tilt-left" : mod === 3 ? "tilt-right" : "";

      const docData = {
        title,
        category,
        mediaType: "video",
        youtubeId,
        tiltClass,
        order: newOrder,
        createdAt: serverTimestamp()
      };

      const newDocRef = doc(collection(db, "gallery"));
      await setDoc(newDocRef, docData);

      closeModals();
      if (window.showToast) {
        window.showToast(`✨ Video item "${title}" added successfully!`, "success");
      }
      loadGalleryItems();
    }

  } catch (error) {
    console.error("[Admin Gallery] Save error:", error);
    showFormError(error.message);
    if (uploadProgressWrapper) uploadProgressWrapper.style.display = "none";
  } finally {
    galleryModalSubmit.classList.remove('is-loading');
    galleryModalSubmit.disabled = false;
    galleryModalSubmit.textContent = isEdit ? "Save Changes" : "Save Item";
    if (galleryModalClose) galleryModalClose.style.display = "block";
    if (galleryModalCancel) galleryModalCancel.style.display = "inline-block";
  }
});

function showFormError(msg) {
  galleryFormError.textContent = msg;
  galleryFormError.style.display = "block";
  galleryModalSubmit.classList.remove('is-loading');
  galleryModalSubmit.textContent = inputId.value ? "Save Changes" : "Save Item";
}

// ================================================
// REORDERING (DIRECT NUMBER INPUT)
// ================================================
async function handleOrderChange(id, newOrderStr) {
  const newOrder = parseInt(newOrderStr, 10);
  const targetItem = currentGalleryItems.find(item => item.id === id);
  if (!targetItem || isNaN(newOrder)) return;

  const oldOrder = targetItem.order;
  if (oldOrder === newOrder) return;
  if (newOrder < 1 || newOrder > currentGalleryItems.length) {
    alert(`Please enter a valid position between 1 and ${currentGalleryItems.length}`);
    loadGalleryItems(); // Reset UI
    return;
  }

  galleryGrid.style.opacity = "0.5";
  galleryGrid.style.pointerEvents = "none";

  try {
    const batch = writeBatch(db);
    const getTilt = (order) => (order % 4 === 1) ? "tilt-left" : (order % 4 === 3) ? "tilt-right" : "";

    // Calculate new order for all items
    currentGalleryItems.forEach(item => {
      let updatedOrder = item.order;

      if (item.id === id) {
        updatedOrder = newOrder;
      } else if (oldOrder < newOrder) {
        // Target item moved down the list; shift intermediate items up
        if (item.order > oldOrder && item.order <= newOrder) {
          updatedOrder--;
        }
      } else if (oldOrder > newOrder) {
        // Target item moved up the list; shift intermediate items down
        if (item.order >= newOrder && item.order < oldOrder) {
          updatedOrder++;
        }
      }

      // If the order changed, add to batch
      if (updatedOrder !== item.order || item.id === id) {
        batch.update(doc(db, "gallery", item.id), {
          order: updatedOrder,
          tiltClass: getTilt(updatedOrder)
        });
      }
    });

    await batch.commit();
    await loadGalleryItems();
  } catch (error) {
    console.error("[Admin Gallery] Reorder error:", error);
    alert("Failed to save new order. Please try again.");
    await loadGalleryItems(); // Revert UI
  } finally {
    galleryGrid.style.opacity = "1";
    galleryGrid.style.pointerEvents = "auto";
  }
}

// ================================================
// DELETION LOGIC
// ================================================
function openDeleteModal(item) {
  itemToDelete = item;
  deleteItemTitle.textContent = `"${item.title}"`;
  deleteModalError.style.display = "none";
  deleteModalConfirm.textContent = "Delete Permanently";
  deleteModalConfirm.classList.remove("is-loading");
  deleteModal.showModal();
}

deleteModalConfirm.addEventListener("click", async () => {
  if (!itemToDelete) return;
  
  deleteModalError.style.display = "none";
  deleteModalConfirm.classList.add("is-loading");
  deleteModalConfirm.textContent = "Deleting...";

  try {
    if (itemToDelete.mediaType === "image" && itemToDelete.cloudinaryPublicId) {
      // 1. Authenticate with Vercel API
      const user = auth.currentUser;
      if (!user) throw new Error("You must be logged in.");
      
      const idToken = await user.getIdToken();
      
      // 2. Call secure serverless deletion endpoint
      const res = await fetch("/api/delete-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idToken: idToken,
          publicId: itemToDelete.cloudinaryPublicId
        })
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Failed to delete image from Cloudinary.");
      }
    }

    // 3. Delete from Firestore (Only reached if Image Delete succeeded, or if it's a Video)
    await deleteDoc(doc(db, "gallery", itemToDelete.id));

    // 4. Cleanup and Refresh
    closeModals();
    if (window.showToast) {
      window.showToast(`🗑️ Gallery item deleted successfully!`, "delete");
    }
    itemToDelete = null;
    loadGalleryItems();

  } catch (error) {
    console.error("[Admin Gallery] Delete error:", error);
    deleteModalError.textContent = error.message;
    deleteModalError.style.display = "block";
    deleteModalConfirm.classList.remove("is-loading");
    deleteModalConfirm.textContent = "Delete Permanently";
  }
});

// ================================================
// BULK DELETE LOGIC
// ================================================
function updateBulkActionUI() {
  const count = selectedItemIds.size;
  if (count > 0) {
    if (btnSelectAll) btnSelectAll.style.display = "none";
    if (btnDeselectAll) btnDeselectAll.style.display = "inline-block";
    if (btnDeleteSelected) {
      btnDeleteSelected.style.display = "inline-block";
      btnDeleteSelected.textContent = `Delete Selected (${count})`;
      btnDeleteSelected.disabled = false;
    }
  } else {
    if (btnSelectAll) btnSelectAll.style.display = "inline-block";
    if (btnDeselectAll) btnDeselectAll.style.display = "none";
    if (btnDeleteSelected) {
      btnDeleteSelected.style.display = "inline-block";
      btnDeleteSelected.textContent = `Delete Selected (0)`;
      btnDeleteSelected.disabled = true;
    }
  }
}

if (btnSelectAll) {
  btnSelectAll.addEventListener("click", () => {
    document.querySelectorAll('.admin-gallery-item__checkbox').forEach(cb => {
      cb.checked = true;
      selectedItemIds.add(cb.dataset.id);
    });
    updateBulkActionUI();
  });
}

if (btnDeselectAll) {
  btnDeselectAll.addEventListener("click", () => {
    document.querySelectorAll('.admin-gallery-item__checkbox').forEach(cb => {
      cb.checked = false;
    });
    selectedItemIds.clear();
    updateBulkActionUI();
  });
}

if (btnDeleteSelected) {
  btnDeleteSelected.addEventListener("click", () => {
    if (selectedItemIds.size === 0) return;
    deleteBulkCount.textContent = selectedItemIds.size;
    deleteBulkModalError.style.display = "none";
    deleteBulkModalConfirm.textContent = "Delete Items";
    deleteBulkModalConfirm.classList.remove("is-loading");
    deleteBulkModal.showModal();
  });
}

if (deleteBulkModalConfirm) {
  deleteBulkModalConfirm.addEventListener("click", async () => {
    if (selectedItemIds.size === 0) return;

    deleteBulkModalError.style.display = "none";
    deleteBulkModalConfirm.classList.add("is-loading");
    deleteBulkModalConfirm.textContent = "Deleting...";

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("You must be logged in.");
      const idToken = await user.getIdToken();

      const itemsToDelete = currentGalleryItems.filter(item => selectedItemIds.has(item.id));
      
      const promises = itemsToDelete.map(async (item) => {
        if (item.mediaType === "image" && item.cloudinaryPublicId) {
          const res = await fetch("/api/delete-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              idToken: idToken,
              publicId: item.cloudinaryPublicId
            })
          });
          const result = await res.json();
          if (!res.ok) {
            throw new Error(result.error || `Failed to delete ${item.title} from Cloudinary.`);
          }
        }
        await deleteDoc(doc(db, "gallery", item.id));
      });

      await Promise.all(promises);

      deleteBulkModal.close();
      if (window.showToast) {
        window.showToast(`🗑️ ${itemsToDelete.length} gallery items deleted successfully!`, "delete");
      }
      
      selectedItemIds.clear();
      updateBulkActionUI();
      loadGalleryItems();
    } catch (error) {
      console.error("[Admin Gallery] Bulk Delete error:", error);
      deleteBulkModalError.textContent = error.message;
      deleteBulkModalError.style.display = "block";
      deleteBulkModalConfirm.classList.remove("is-loading");
      deleteBulkModalConfirm.textContent = "Delete Items";
    }
  });
}


// Event Listeners for Modals
if (btnAddNew) btnAddNew.addEventListener("click", openAddModal);
if (galleryModalClose) galleryModalClose.addEventListener("click", closeModals);
if (galleryModalCancel) galleryModalCancel.addEventListener("click", closeModals);
if (deleteModalClose) deleteModalClose.addEventListener("click", closeModals);
if (deleteModalCancel) deleteModalCancel.addEventListener("click", closeModals);
if (deleteBulkModalClose) deleteBulkModalClose.addEventListener("click", () => deleteBulkModal.close());
if (deleteBulkModalCancel) deleteBulkModalCancel.addEventListener("click", () => deleteBulkModal.close());

// Close on backdrop click (Escape key is native to <dialog>)
[galleryModal, deleteModal, deleteBulkModal].forEach(modal => {
  if (modal) {
    modal.addEventListener("click", (e) => {
      const rect = modal.getBoundingClientRect();
      const inDialog = (
        rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX && e.clientX <= rect.left + rect.width
      );
      if (!inDialog) {
        if (modal === deleteBulkModal) modal.close();
        else closeModals();
      }
    });
  }
});
