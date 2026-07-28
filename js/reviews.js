// ================================================
// KVM CREATIONS — DYNAMIC FIRESTORE REVIEWS RENDERER
// Syncs customer reviews live from Firestore /reviews collection
// ================================================

import { db } from "./firebase-config.js?v=2";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  loadFirestoreReviews();
});

function renderStars(rating = 5) {
  const num = parseInt(rating) || 5;
  return "★".repeat(num) + "☆".repeat(5 - num);
}

async function loadFirestoreReviews() {
  const reviewsGrid = document.querySelector(".reviews-grid");
  if (!reviewsGrid) return;

  try {
    const querySnapshot = await getDocs(collection(db, "reviews"));
    if (querySnapshot.empty) {
      console.log("[Firestore Reviews] Collection /reviews is empty. Displaying default client stories.");
      return;
    }

    const items = [];
    querySnapshot.forEach((docSnap) => {
      items.push({ id: docSnap.id, ...docSnap.data() });
    });

    items.sort((a, b) => (a.order || 0) - (b.order || 0));

    if (items.length > 0) {
      reviewsGrid.innerHTML = "";

      items.forEach((item, index) => {
        const card = createReviewCardDOM(item, index);
        reviewsGrid.appendChild(card);
      });
    }

  } catch (err) {
    console.warn("[Firestore Reviews] Retaining pre-hydrated reviews:", err);
  }
}

function createReviewCardDOM(item, index = 0) {
  const card = document.createElement("article");
  card.className = "review-card reveal";
  card.dataset.category = item.category || "wedding";
  card.style.cssText = "background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(201, 168, 76, 0.15); border-radius: 16px; padding: 32px; backdrop-filter: blur(10px); display: flex; flex-direction: column; justify-content: space-between;";

  const defaultAvatar = "assets/images/img1.webp";
  const avatarSrc = item.avatarUrl || defaultAvatar;
  const starsString = renderStars(item.stars || 5);

  card.innerHTML = `
    <div>
      <div class="review-card__header" style="display: flex; align-items: center; gap: 16px; margin-bottom: 20px;">
        <div class="review-card__avatar" style="width: 54px; height: 54px; border-radius: 50%; overflow: hidden; border: 1px solid var(--clr-gold);">
          <img src="${avatarSrc}" alt="${item.name || 'Client'}" style="width: 100%; height: 100%; object-fit: cover;" />
        </div>
        <div>
          <h3 class="review-card__name" style="font-family: var(--font-serif); font-size: 1.25rem; color: var(--clr-fg); font-weight: 400; margin: 0;">${item.name || 'Anonymous Couple'}</h3>
          <p class="review-card__location" style="font-family: var(--font-sans); font-size: 0.82rem; color: var(--clr-gold); margin-top: 4px;">${item.subtitle || 'Client Story'}</p>
        </div>
      </div>
      <div class="review-card__stars" style="color: var(--clr-gold); font-size: 1.1rem; margin-bottom: 16px;">${starsString}</div>
      <p class="review-card__text" style="font-family: var(--font-sans); font-size: 0.96rem; color: var(--clr-fg-muted); line-height: 1.7; font-style: italic; margin-bottom: 24px;">
        &ldquo;${item.text || ''}&rdquo;
      </p>
    </div>
    <div class="review-card__footer" style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 16px;">
      <span class="review-card__badge" style="font-family: var(--font-sans); font-size: 0.75rem; letter-spacing: 1px; text-transform: uppercase; color: var(--clr-gold); font-weight: 600;">${item.badge || 'Verified Client'}</span>
    </div>
  `;

  return card;
}
