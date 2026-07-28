// ================================================
// KVM CREATIONS — DYNAMIC GALLERY RENDERER
// Syncs portfolio images and videos live from Firestore /gallery collection
// ================================================

import { db } from "./firebase-config.js?v=2";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  loadDynamicGallery();
});

// Utility for faster image loading
function getOptimizedCloudinaryUrl(url, width = 800) {
  if (!url) return "";
  if (url.includes("cloudinary.com") && url.includes("/upload/")) {
    return url.replace("/upload/", `/upload/c_scale,w_${width},q_auto,f_auto/`);
  }
  return url;
}

async function loadDynamicGallery() {
  const galleryMasonry = document.getElementById("galleryMasonry");
  if (!galleryMasonry) return;

  try {
    const querySnapshot = await getDocs(collection(db, "gallery"));
    
    if (querySnapshot.empty) {
      console.log("[Firestore Gallery] No gallery items found. Retaining static HTML fallback.");
      return;
    }

    let items = [];
    querySnapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() });
    });

    // Sort by order
    items.sort((a, b) => (a.order || 0) - (b.order || 0));

    // Clear static fallback items
    galleryMasonry.innerHTML = "";

    items.forEach((item) => {
      const card = document.createElement("div");
      // Basic classes
      card.className = "gallery-card reveal";
      
      // Add tilt class if exists
      if (item.tiltClass) {
        card.classList.add(`gallery-card--${item.tiltClass}`);
      }
      
      // Data attributes for lightbox and filtering
      card.setAttribute("data-category", item.category || "uncategorized");
      card.setAttribute("data-title", item.title || "");
      
      const isVideo = item.mediaType === "video";
      let imgUrl = "";
      let fullResUrl = "";

      if (isVideo && item.youtubeId) {
        imgUrl = `https://img.youtube.com/vi/${item.youtubeId}/maxresdefault.jpg`;
        fullResUrl = imgUrl; // Using thumbnail for lightbox for now
      } else if (!isVideo && item.cloudinaryUrl) {
        imgUrl = getOptimizedCloudinaryUrl(item.cloudinaryUrl, 800);
        fullResUrl = item.cloudinaryUrl; // full resolution for lightbox
      }

      card.setAttribute("data-full", fullResUrl);

      card.innerHTML = `
        <img src="${imgUrl}" alt="${item.title || 'Gallery Item'}" loading="lazy" />
        <div class="gallery-card__expand">&#10530;</div>
        ${isVideo ? '<div class="video-badge" style="position:absolute; top:10px; right:10px; background:rgba(0,0,0,0.6); padding:4px 8px; border-radius:4px; font-size:12px;">▶ Video</div>' : ''}
      `;

      galleryMasonry.appendChild(card);
    });

    // Call window.reinitGalleryUI() from main.js to apply shiny wrapper, filters, etc.
    if (typeof window.reinitGalleryUI === "function") {
      setTimeout(() => {
        window.reinitGalleryUI();
      }, 100);
    }

  } catch (err) {
    console.error("[Firestore Gallery] Error loading dynamic gallery:", err);
  }
}
