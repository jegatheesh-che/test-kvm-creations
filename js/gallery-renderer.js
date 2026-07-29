// ================================================
// KVM CREATIONS — DYNAMIC GALLERY RENDERER
// Syncs portfolio images and videos live from Firestore /gallery collection
// ================================================

import { db } from "./firebase-config.js?v=2";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  loadDynamicGallery();
});

// Utility for reliable image loading
function getOptimizedCloudinaryUrl(url, width = 800) {
  if (!url) return "";
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
      card.className = "gallery-card reveal";
      
      if (item.tiltClass) {
        card.classList.add(`gallery-card--${item.tiltClass}`);
      }
      
      const category = (item.category || "uncategorized").toLowerCase().trim();
      card.setAttribute("data-category", category);
      card.setAttribute("data-title", item.title || "");
      
      const isVideo = item.mediaType === "video" || !!item.youtubeId;
      let imgUrl = "";
      let fullResUrl = "";

      if (isVideo && item.youtubeId) {
        imgUrl = `https://img.youtube.com/vi/${item.youtubeId}/maxresdefault.jpg`;
        fullResUrl = item.youtubeId;
        card.setAttribute("data-media-type", "video");
        card.setAttribute("data-youtube-id", item.youtubeId);
      } else {
        imgUrl = getOptimizedCloudinaryUrl(item.cloudinaryUrl || item.imageUrl || item.url, 800);
        fullResUrl = item.cloudinaryUrl || item.imageUrl || item.url || imgUrl;
        card.setAttribute("data-media-type", "image");
      }

      card.setAttribute("data-full", fullResUrl);

      card.innerHTML = `
        <img src="${imgUrl}" alt="${item.title || 'Gallery Item'}" loading="lazy" />
        <div class="gallery-card__expand">&#10530;</div>
        ${isVideo ? '<div class="video-badge" style="position:absolute; top:12px; right:12px; background:rgba(10,10,8,0.85); backdrop-filter:blur(8px); color:#bd9b52; border:1px solid rgba(189,155,82,0.3); padding:5px 12px; border-radius:20px; font-size:11px; letter-spacing:1px; text-transform:uppercase; z-index:2; pointer-events:none;">▶ Video</div>' : ''}
      `;

      galleryMasonry.appendChild(card);
    });

    // Call window.reinitGalleryUI() from main.js to apply shiny wrapper, filters, etc.
    if (typeof window.reinitGalleryUI === "function") {
      window.reinitGalleryUI();
    }

  } catch (err) {
    console.error("[Firestore Gallery] Error loading dynamic gallery:", err);
  }
}
