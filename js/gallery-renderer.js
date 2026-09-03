// ================================================
// KVM CREATIONS — DYNAMIC GALLERY RENDERER (PERFORMANCE OPTIMIZED)
// Syncs portfolio images and videos live from Firestore /gallery collection.
//
// SAFETY & PERFORMANCE HIGHLIGHTS:
// - Retains static HTML until Firestore data is fully ready.
// - Performs an atomic single-operation DOM swap (replaceChildren) to prevent blank flashes or duplicates.
// - Uses loading="lazy" and decoding="async" for off-main-thread image decoding.
// - Preserves exact stored Cloudinary / media URLs to prevent 401/403 transformation errors.
// - Integrates seamlessly with existing Admin Panel, Firestore schema, and main.js UI listeners.
// ================================================

import { db } from "./firebase-config.js?v=2";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  loadDynamicGallery();
});

// Safe delivery URL resolver — returns the stored URL directly to avoid 401/403 errors
function getDeliveryUrl(url) {
  if (!url) return "";
  return url;
}

// Vimeo URL & ID Extractor (matches Admin Panel format)
function extractVimeoId(input) {
  if (!input) return "";
  input = String(input).trim();
  const match = input.match(/(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)(?:[a-zA-Z0-9_\-]+)?/i);
  if (match && match[1]) {
    return match[1];
  }
  if (/^\d+$/.test(input)) {
    return input;
  }
  return "";
}

async function loadDynamicGallery() {
  const galleryMasonry = document.getElementById("galleryMasonry");
  if (!galleryMasonry) return;

  try {
    const querySnapshot = await getDocs(collection(db, "gallery"));

    if (querySnapshot.empty) {
      console.log("[Firestore Gallery] No items in /gallery collection. Retaining static HTML portfolio.");
      return;
    }

    const items = [];
    querySnapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() });
    });

    // Sort items by custom order
    items.sort((a, b) => (a.order || 0) - (b.order || 0));

    // Build all dynamic cards in a DocumentFragment for a single atomic DOM insertion
    const fragment = document.createDocumentFragment();

    items.forEach((item, index) => {
      const card = document.createElement("div");
      card.className = "gallery-card reveal";
      card.dataset.id = item.id;

      if (item.tiltClass) {
        card.classList.add(`gallery-card--${item.tiltClass}`);
      }

      const category = (item.category || "uncategorized").toLowerCase().trim();
      card.setAttribute("data-category", category);

      const isVideo = item.mediaType === "video" || !!item.vimeoId || !!item.youtubeId;
      let imgUrl = "";
      let fullResUrl = "";

      if (isVideo && item.vimeoId) {
        const cleanVimeoId = extractVimeoId(item.vimeoId);
        imgUrl = `https://vumbnail.com/${cleanVimeoId || item.vimeoId}.jpg`;
        fullResUrl = item.vimeoId;
        card.setAttribute("data-media-type", "video");
        card.setAttribute("data-vimeo-id", cleanVimeoId || item.vimeoId);
      } else if (isVideo && item.youtubeId) {
        imgUrl = `https://img.youtube.com/vi/${item.youtubeId}/maxresdefault.jpg`;
        fullResUrl = item.youtubeId;
        card.setAttribute("data-media-type", "video");
        card.setAttribute("data-youtube-id", item.youtubeId);
      } else {
        const rawUrl = item.cloudinaryUrl || item.imageUrl || item.image || item.url || "";
        imgUrl = getDeliveryUrl(rawUrl);
        fullResUrl = rawUrl;
        card.setAttribute("data-media-type", "image");
      }

      card.setAttribute("data-full", fullResUrl);

      card.innerHTML = `
        <img src="${imgUrl}" alt="${category}" loading="lazy" decoding="async" />
        <div class="gallery-card__expand">&#10530;</div>
        ${isVideo ? '<div class="gallery-video-badge" style="position:absolute;top:12px;right:12px;background:rgba(10,10,8,0.85);backdrop-filter:blur(8px);color:#bd9b52;border:1px solid rgba(189,155,82,0.3);padding:5px 12px;border-radius:20px;font-size:11px;letter-spacing:1px;text-transform:uppercase;z-index:2;pointer-events:none;">▶ Video</div>' : ""}
      `;

      fragment.appendChild(card);
    });

    // Atomic single-operation DOM replacement — no intermediate empty state or layout thrashing
    galleryMasonry.replaceChildren(fragment);

    // Re-initialize UI interactions (shiny wrapper, filters, lightbox)
    if (typeof window.reinitGalleryUI === "function") {
      window.reinitGalleryUI();
    }

    console.log(`[Firestore Gallery] Loaded and displayed ${items.length} live portfolio items.`);

  } catch (err) {
    // If Firestore fetch encounters an error, the static HTML fallback remains safely in place
    console.error("[Firestore Gallery] Error loading dynamic gallery:", err);
  }
}
