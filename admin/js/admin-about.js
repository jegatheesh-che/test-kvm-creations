// ================================================
// KVM CREATIONS STUDIO — ABOUT STORY BUILDER
// Native app aesthetic, smooth glassmorphism, responsive 1-box story builder
// ================================================

import { auth, db } from "/js/firebase-config.js?v=2";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Cloudinary Configuration (KVM Creations)
const CLOUD_NAME = "vfcl8vef";
const UPLOAD_PRESET = "kvm_creations_gallery";
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

// Max Sections Limit
const MAX_SECTIONS = 10;

// Navigation Tabs
const tabGallery = document.getElementById("tabGallery");
const tabReviews = document.getElementById("tabReviews");
const tabAbout = document.getElementById("tabAbout");
const sectionGallery = document.getElementById("sectionGallery");
const sectionReviews = document.getElementById("sectionReviews");
const sectionAbout = document.getElementById("sectionAbout");

// Form Elements
const aboutForm = document.getElementById("aboutContentForm");
const aboutFormError = document.getElementById("aboutFormError");
const aboutSubmitBtn = document.getElementById("aboutSubmitBtn");
const aboutLoadingState = document.getElementById("adminAboutLoading");
const sectionsContainer = document.getElementById("adminAboutSectionsContainer");
const btnAddSection = document.getElementById("btnAddAboutSection");
const sectionCounter = document.getElementById("adminAboutSectionCounter");

// State: List of About Page Sections (Max 10)
let sectionsList = [];

// KVM Creations Mathu & Vithu Default Initial Sections
const DEFAULT_SECTIONS = [
  {
    id: "sec_hero",
    eyebrow: "Visual Storytellers & Cinematographers",
    title: "About KVM Creations",
    desc: "We are Mathu & Vithu, wedding photographers and cinematographers at KVM Creations with a passion for telling love stories through timeless visuals.\n\nTogether, we bring photography and wedding cinematography under one roof—preserving every celebration through both heartfelt images and cinematic films that reflect each couple’s story in an authentic, genuine way.\n\nWhether we’re behind the camera capturing candid smiles, quiet glances, or crafting cinematic wedding films, we focus on documenting genuine emotions, beautiful details, and unforgettable memories that can be relived for generations.",
    imageUrl: "/assets/about/about.webp"
  },
  {
    id: "sec_mathu",
    eyebrow: "Wedding Photographer & Cinematographer",
    title: "Hi, I’m Mathu",
    desc: "I’m Mathu, a wedding photographer and cinematographer with a passion for telling love stories through timeless visuals. I began my photography journey in 2019 and expanded into wedding cinematography in 2022, allowing me to preserve every celebration through both heartfelt images and cinematic films.\n\nI believe every couple has a unique story, and my goal is to capture genuine emotions, meaningful moments, and the little details that make your day unforgettable. Whether I’m behind the camera capturing a candid smile or creating a cinematic wedding film, I focus on delivering memories that you’ll cherish for a lifetime.\n\nFor me, it’s more than just photography and videography—it’s about creating beautiful visual stories that let you relive your most special moments, again and again.",
    imageUrl: "/assets/about/mathu.webp"
  },
  {
    id: "sec_vithu",
    eyebrow: "Wedding Cinematographer & Photographer",
    title: "Hi, I’m Vithu",
    desc: "I’m Vithu, a wedding cinematographer and photographer with a passion for creating meaningful visual stories. My journey began in 2017 as a videographer and filmmaker, where I worked on music videos and short films, developing a strong foundation in cinematic storytelling. In 2018, I expanded into photography, combining creativity and technical expertise to capture life’s most memorable moments.\n\nWith years of experience behind the camera, I focus on documenting genuine emotions, beautiful details, and unforgettable memories. Every wedding is unique, and my goal is to create timeless photographs and cinematic films that reflect each couple’s story in an authentic and heartfelt way.\n\nFor me, photography and filmmaking are more than a profession—they’re about preserving moments that can be relived and cherished for generations.",
    imageUrl: "/assets/about/vithu.webp"
  }
];

// Initialize on auth state change
onAuthStateChanged(auth, (user) => {
  if (user) {
    loadAboutContent();
  }
});

// Tab Switching Setup
function setupTabs() {
  const tabs = [
    { btn: tabGallery, sec: sectionGallery },
    { btn: tabReviews, sec: sectionReviews },
    { btn: tabAbout, sec: sectionAbout }
  ];

  tabs.forEach(item => {
    if (item.btn) {
      item.btn.addEventListener("click", () => {
        tabs.forEach(t => {
          if (t.btn) t.btn.classList.remove("active");
          if (t.sec) t.sec.style.display = "none";
        });
        item.btn.classList.add("active");
        if (item.sec) item.sec.style.display = "block";
      });
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupTabs);
} else {
  setupTabs();
}

// ================================================
// LOAD ABOUT CONTENT FROM FIRESTORE
// ================================================
async function loadAboutContent() {
  if (!aboutForm) return;

  if (aboutLoadingState) aboutLoadingState.style.display = "block";
  aboutForm.style.display = "none";
  if (aboutFormError) aboutFormError.style.display = "none";

  try {
    const docRef = doc(db, "about", "content");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists() && Array.isArray(docSnap.data().sections) && docSnap.data().sections.length > 0) {
      sectionsList = docSnap.data().sections.slice(0, MAX_SECTIONS);
    } else {
      console.log("[Admin About] Using default initial sections...");
      sectionsList = JSON.parse(JSON.stringify(DEFAULT_SECTIONS));
      await setDoc(docRef, { sections: sectionsList, updatedAt: serverTimestamp() });
    }

    renderAboutSections();

    if (aboutLoadingState) aboutLoadingState.style.display = "none";
    aboutForm.style.display = "flex";

  } catch (err) {
    console.error("[Admin About] Load error:", err);
    sectionsList = JSON.parse(JSON.stringify(DEFAULT_SECTIONS));
    renderAboutSections();
    if (aboutLoadingState) aboutLoadingState.style.display = "none";
    aboutForm.style.display = "flex";
  }
}

// Update Section Counter & Add Button State
function updateCounter() {
  if (sectionCounter) {
    sectionCounter.textContent = `${sectionsList.length} / ${MAX_SECTIONS} Sections`;
  }
  if (btnAddSection) {
    btnAddSection.disabled = sectionsList.length >= MAX_SECTIONS;
  }
}

// ================================================
// RENDER APP-LIKE SECTION CARDS IN ADMIN PANEL
// ================================================
function renderAboutSections() {
  if (!sectionsContainer) return;
  sectionsContainer.innerHTML = "";

  updateCounter();

  // Inject progress bar above the section list
  const progressPct = Math.round((sectionsList.length / MAX_SECTIONS) * 100);
  const progressHtml = `
    <div class="about-section-progress">
      <div class="about-section-progress__bar">
        <div class="about-section-progress__fill" style="width: ${progressPct}%;"></div>
      </div>
      <span class="about-section-progress__label">${sectionsList.length} / ${MAX_SECTIONS}</span>
    </div>
  `;
  sectionsContainer.insertAdjacentHTML('afterbegin', progressHtml);

  sectionsList.forEach((sec, idx) => {
    const card = document.createElement("div");
    card.className = `about-section-card ${idx === 0 ? 'is-expanded' : 'is-collapsed'}`;
    card.dataset.index = idx;

    const isFirst = idx === 0;
    const isLast = idx === sectionsList.length - 1;
    const previewImg = sec.imageUrl || '/assets/about/about.webp';

    // Show tagline as primary header info (title was removed)
    const headerPrimary = escapeHtml(sec.eyebrow || 'Untitled Story Section');
    const headerSub = sec.imageUrl ? 'Photo attached' : 'No photo — click to add';

    card.innerHTML = `
      <div class="about-section-card__header" title="Click to expand/collapse section">
        <div class="about-section-card__title-group">
          <span class="about-section-card__badge">${String(idx + 1).padStart(2, '0')}</span>
          <img class="about-section-card__header-thumb" src="${previewImg}" alt="Section ${idx + 1}" />
          <div class="about-section-card__header-titles">
            <h3 class="about-section-header-title">${headerPrimary}</h3>
            <p class="about-section-header-sub">${headerSub}</p>
          </div>
        </div>

        <div class="about-section-card__actions" onclick="event.stopPropagation();">
          <button type="button" class="btn-icon-action btn-move-up" data-index="${idx}" ${isFirst ? 'disabled' : ''} title="Move Up">↑</button>
          <button type="button" class="btn-icon-action btn-move-down" data-index="${idx}" ${isLast ? 'disabled' : ''} title="Move Down">↓</button>
          <button type="button" class="btn-icon-action btn-icon-delete btn-delete-sec" data-index="${idx}" title="Delete Section">✕</button>
          <button type="button" class="btn-icon-action btn-toggle-expand" data-index="${idx}" title="Toggle Details">
            <svg class="chevron-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
        </div>
      </div>

      <div class="about-section-card__body">
        <div class="form-group">
          <label class="form-label-gold">Section Tagline / Subtitle *</label>
          <input type="text" class="sec-input-eyebrow" value="${escapeHtml(sec.eyebrow || '')}" placeholder="e.g., Visual Storytellers · About Me" required />
        </div>

        <div class="form-group">
          <label class="form-label-gold">Story Narrative</label>
          <textarea class="admin-textarea sec-input-desc" rows="7" placeholder="Write your section story here...&#10;&#10;Use double line breaks to create new paragraphs on the About page." required>${escapeHtml(sec.desc || '')}</textarea>
        </div>

        <div class="custom-upload-zone">
          <div class="custom-upload-zone__info">
            <label class="form-label-gold">Section Photo</label>
            <label class="custom-upload-btn">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              <span>Choose Photo</span>
              <input type="file" class="sec-input-file" accept="image/*" style="display: none;" />
            </label>
            <span class="file-name-indicator">No file chosen</span>
          </div>

          <div class="custom-upload-zone__preview-wrap">
            <span class="preview-label">Current</span>
            <img class="sec-img-preview" src="${previewImg}" alt="Section Preview" />
          </div>
        </div>
      </div>
    `;

    sectionsContainer.appendChild(card);
  });

  // Ghost "Add New Section" card at bottom
  const isAtMax = sectionsList.length >= MAX_SECTIONS;
  const ghostCard = document.createElement("button");
  ghostCard.type = "button";
  ghostCard.className = "about-add-section-card";
  ghostCard.disabled = isAtMax;
  ghostCard.title = isAtMax ? "Maximum 10 sections reached" : "Add a new story section";
  ghostCard.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
    Add New Story Section
  `;
  ghostCard.addEventListener("click", () => {
    if (btnAddSection) btnAddSection.click();
  });
  sectionsContainer.appendChild(ghostCard);

  attachCardEvents();
}

// Escape HTML special chars safely
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Event Listeners for Dynamic Cards
function attachCardEvents() {
  // Accordion Expand / Collapse Header Click
  document.querySelectorAll(".about-section-card__header").forEach(header => {
    header.addEventListener("click", () => {
      const card = header.closest(".about-section-card");
      if (card) {
        card.classList.toggle("is-collapsed");
        card.classList.toggle("is-expanded");
      }
    });
  });

  // Move Up
  document.querySelectorAll(".btn-move-up").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const idx = parseInt(e.currentTarget.dataset.index);
      if (idx > 0) {
        saveCurrentInputValues();
        const temp = sectionsList[idx];
        sectionsList[idx] = sectionsList[idx - 1];
        sectionsList[idx - 1] = temp;
        renderAboutSections();
      }
    });
  });

  // Move Down
  document.querySelectorAll(".btn-move-down").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const idx = parseInt(e.currentTarget.dataset.index);
      if (idx < sectionsList.length - 1) {
        saveCurrentInputValues();
        const temp = sectionsList[idx];
        sectionsList[idx] = sectionsList[idx + 1];
        sectionsList[idx + 1] = temp;
        renderAboutSections();
      }
    });
  });

  // Delete
  document.querySelectorAll(".btn-delete-sec").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const idx = parseInt(e.currentTarget.dataset.index);
      if (confirm(`Are you sure you want to delete Section ${idx + 1}?`)) {
        saveCurrentInputValues();
        sectionsList.splice(idx, 1);
        renderAboutSections();
      }
    });
  });

  // Instant Image File Preview & File Name Label Update
  document.querySelectorAll(".sec-input-file").forEach(input => {
    input.addEventListener("change", (e) => {
      const card = e.target.closest(".about-section-card");
      if (card && e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const preview = card.querySelector(".sec-img-preview");
        const fileNameIndicator = card.querySelector(".file-name-indicator");

        if (preview) {
          preview.src = URL.createObjectURL(file);
        }
        if (fileNameIndicator) {
          fileNameIndicator.textContent = file.name;
          fileNameIndicator.style.color = "var(--clr-gold)";
        }
      }
    });
  });
}

// Sync current input fields into sectionsList array memory before re-ordering/deleting
function saveCurrentInputValues() {
  const cards = document.querySelectorAll(".about-section-card");
  cards.forEach((card, idx) => {
    if (sectionsList[idx]) {
      sectionsList[idx].eyebrow = card.querySelector(".sec-input-eyebrow")?.value.trim() || "";
      sectionsList[idx].desc = card.querySelector(".sec-input-desc")?.value.trim() || "";
    }
  });
}

// Add New Section Handler (Max 10)
if (btnAddSection) {
  btnAddSection.addEventListener("click", () => {
    if (sectionsList.length >= MAX_SECTIONS) {
      alert("Maximum limit of 10 sections reached.");
      return;
    }
    saveCurrentInputValues();
    const newIdx = sectionsList.length + 1;
    sectionsList.push({
      id: `sec_${Date.now()}`,
      eyebrow: `Story Section 0${newIdx}`,
      title: "New Section Heading",
      desc: "Write your section story narrative here...",
      imageUrl: "/assets/images/excellents/slide5.webp"
    });
    renderAboutSections();
  });
}

// Upload helper for Cloudinary
async function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(CLOUDINARY_UPLOAD_URL, {
    method: "POST",
    body: formData
  });

  if (!res.ok) {
    throw new Error("Failed to upload image to Cloudinary.");
  }

  const data = await res.json();
  return data.secure_url;
}

// ================================================
// SAVE ALL ABOUT SECTIONS TO FIRESTORE
// ================================================
if (aboutForm) {
  aboutForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (aboutFormError) aboutFormError.style.display = "none";
    if (aboutSubmitBtn) {
      aboutSubmitBtn.disabled = true;
      aboutSubmitBtn.textContent = "Saving All Sections...";
    }

    try {
      saveCurrentInputValues();

      const cards = document.querySelectorAll(".about-section-card");
      
      // Process Cloudinary file uploads for each section
      for (let i = 0; i < cards.length; i++) {
        const fileInput = cards[i].querySelector(".sec-input-file");
        if (fileInput && fileInput.files && fileInput.files[0]) {
          const uploadedUrl = await uploadToCloudinary(fileInput.files[0]);
          sectionsList[i].imageUrl = uploadedUrl;
        }
      }

      const payload = {
        sections: sectionsList,
        updatedAt: serverTimestamp()
      };

      await setDoc(doc(db, "about", "content"), payload);

      renderAboutSections();

      if (window.showAppPopup) {
        window.showAppPopup("About Page Saved", `Successfully saved ${sectionsList.length} story sections!`, "edit");
      }

    } catch (err) {
      console.error("[Admin About] Save error:", err);
      if (aboutFormError) {
        aboutFormError.textContent = `Save failed: ${err.message}`;
        aboutFormError.style.display = "block";
      }
    } finally {
      if (aboutSubmitBtn) {
        aboutSubmitBtn.disabled = false;
        aboutSubmitBtn.textContent = "Save All About Sections";
      }
    }
  });
}
