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

  const defaultAvatar = "assets/images/img1.webp";
  const avatarSrc = item.avatarUrl || defaultAvatar;
  const starsString = renderStars(item.stars || 5);

  card.innerHTML = `
    <div>
      <div class="review-card__header">
        <div class="review-card__avatar">
          <img src="${avatarSrc}" alt="${item.name || 'Client'}" />
        </div>
        <div>
          <h3 class="review-card__name">${item.name || 'Anonymous Couple'}</h3>
          <p class="review-card__location">${item.subtitle || 'Client Story'}</p>
        </div>
      </div>
      <div class="review-card__stars">${starsString}</div>
      <p class="review-card__text">
        &ldquo;${item.text || ''}&rdquo;
      </p>
    </div>
    <div class="review-card__footer">
      <span class="review-card__badge">${item.badge || 'Verified Client'}</span>
    </div>
  `;

  return card;
}
