// ================================================
// KVM Creations — Admin Dashboard Controller
// ================================================

import { 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import { auth, ADMIN_UID } from "../../js/firebase-config.js";
import { 
  fetchGalleryDocuments, 
  addGalleryPhoto, 
  updateGalleryPhotoMetadata, 
  deleteGalleryPhoto 
} from "./gallery-manager.js";

import {
  fetchHeroSlideDocuments,
  addHeroSlide,
  toggleHeroSlideActive,
  updateHeroSlide,
  deleteHeroSlide,
  generateHeroThumbnailUrl
} from "./hero-manager.js";

import {
  fetchTestimonialDocuments,
  addTestimonial,
  toggleTestimonialActive,
  updateTestimonial,
  deleteTestimonial,
  generateAvatarThumbnailUrl
} from "./testimonials-manager.js";

// DOM Elements
const userEmailDisplay = document.getElementById('userEmailDisplay');
const logoutBtn = document.getElementById('logoutBtn');
const sidebar = document.getElementById('sidebar');
const mobileToggle = document.getElementById('mobileToggle');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const navItems = document.querySelectorAll('.nav-item');
const pageTitle = document.getElementById('pageTitle');
const metricGalleryCount = document.getElementById('metricGalleryCount');
const metricHeroCount = document.getElementById('metricHeroCount');
const metricTestimonialsCount = document.getElementById('metricTestimonialsCount');

// Views
const viewDashboard = document.getElementById('view-dashboard');
const viewGallery = document.getElementById('view-gallery');
const viewHero = document.getElementById('view-hero');
const viewTestimonials = document.getElementById('view-testimonials');
const viewStandby = document.getElementById('view-standby');
const standbyTabTitle = document.getElementById('standbyTabTitle');
const standbyTabDesc = document.getElementById('standbyTabDesc');

// Gallery UI
const galleryContainer = document.getElementById('galleryContainer');
const openAddModalBtn = document.getElementById('openAddModalBtn');
const galleryModal = document.getElementById('galleryModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelModalBtn = document.getElementById('cancelModalBtn');
const galleryForm = document.getElementById('galleryForm');
const modalTitle = document.getElementById('modalTitle');
const saveBtnText = document.getElementById('saveBtnText');
const savePhotoBtn = document.getElementById('savePhotoBtn');
const editDocIdInput = document.getElementById('editDocId');
const fileGroup = document.getElementById('fileGroup');
const photoFileInput = document.getElementById('photoFile');
const photoTitleInput = document.getElementById('photoTitle');
const photoCategoryInput = document.getElementById('photoCategory');
const photoTiltInput = document.getElementById('photoTilt');
const photoOrderInput = document.getElementById('photoOrder');
const adminToast = document.getElementById('adminToast');

// Hero Slider UI
const heroContainer = document.getElementById('heroContainer');
const openAddHeroModalBtn = document.getElementById('openAddHeroModalBtn');
const heroModal = document.getElementById('heroModal');
const closeHeroModalBtn = document.getElementById('closeHeroModalBtn');
const cancelHeroModalBtn = document.getElementById('cancelHeroModalBtn');
const heroForm = document.getElementById('heroForm');
const heroModalTitle = document.getElementById('heroModalTitle');
const saveHeroBtnText = document.getElementById('saveHeroBtnText');
const saveHeroSlideBtn = document.getElementById('saveHeroSlideBtn');
const editHeroDocIdInput = document.getElementById('editHeroDocId');
const editHeroOldPublicIdInput = document.getElementById('editHeroOldPublicId');
const heroFileGroup = document.getElementById('heroFileGroup');
const heroSlideFileInput = document.getElementById('heroSlideFile');
const heroSlideTitleInput = document.getElementById('heroSlideTitle');
const heroSlideOrderInput = document.getElementById('heroSlideOrder');
const heroSlideIsActiveInput = document.getElementById('heroSlideIsActive');

// Testimonials UI
const testimonialsContainer = document.getElementById('testimonialsContainer');
const openAddTestimonialModalBtn = document.getElementById('openAddTestimonialModalBtn');
const testimonialModal = document.getElementById('testimonialModal');
const closeTestimonialModalBtn = document.getElementById('closeTestimonialModalBtn');
const cancelTestimonialModalBtn = document.getElementById('cancelTestimonialModalBtn');
const testimonialForm = document.getElementById('testimonialForm');
const testimonialModalTitle = document.getElementById('testimonialModalTitle');
const saveTestimonialBtnText = document.getElementById('saveTestimonialBtnText');
const saveTestimonialBtn = document.getElementById('saveTestimonialBtn');
const editTestimonialDocIdInput = document.getElementById('editTestimonialDocId');
const editTestimonialOldPublicIdInput = document.getElementById('editTestimonialOldPublicId');
const testimonialFileGroup = document.getElementById('testimonialFileGroup');
const testimonialAvatarFileInput = document.getElementById('testimonialAvatarFile');
const testimonialClientNameInput = document.getElementById('testimonialClientName');
const testimonialDetailInput = document.getElementById('testimonialDetail');
const testimonialRatingInput = document.getElementById('testimonialRating');
const testimonialReviewTextInput = document.getElementById('testimonialReviewText');
const testimonialOrderInput = document.getElementById('testimonialOrder');
const testimonialIsActiveInput = document.getElementById('testimonialIsActive');

let cachedGalleryDocuments = [];
let cachedHeroDocuments = [];
let cachedTestimonialsDocuments = [];

// ------------------------------------------------
// 1. Toast Notification Helper
// ------------------------------------------------
function showToast(message, isError = false) {
  if (!adminToast) return;
  adminToast.textContent = message;
  adminToast.style.borderColor = isError ? '#ff5252' : '#d4af37';
  adminToast.classList.add('show');
  setTimeout(() => adminToast.classList.remove('show'), 3500);
}

// ------------------------------------------------
// 2. Session Protection Observer
// ------------------------------------------------
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    const path = window.location.pathname.toLowerCase();
    if (!path.endsWith('login.html')) {
      window.location.href = '/admin/login.html';
    }
    return;
  }

  if (user.uid !== ADMIN_UID) {
    console.warn(`Unauthorized access attempt by UID: ${user.uid}`);
    await signOut(auth);
    window.location.href = '/admin/login.html';
    return;
  }

  if (userEmailDisplay) {
    userEmailDisplay.textContent = user.email || 'Studio Admin';
  }

  loadDashboardMetricsSilently();
});

async function loadDashboardMetricsSilently() {
  try {
    cachedGalleryDocuments = await fetchGalleryDocuments();
    if (metricGalleryCount) metricGalleryCount.textContent = cachedGalleryDocuments.length;
  } catch (err) {
    console.error('Error loading gallery count:', err);
  }

  try {
    cachedHeroDocuments = await fetchHeroSlideDocuments();
    if (metricHeroCount) metricHeroCount.textContent = cachedHeroDocuments.length;
  } catch (err) {
    console.error('Error loading hero count:', err);
  }

  try {
    cachedTestimonialsDocuments = await fetchTestimonialDocuments();
    if (metricTestimonialsCount) metricTestimonialsCount.textContent = cachedTestimonialsDocuments.length;
  } catch (err) {
    console.error('Error loading testimonials count:', err);
  }
}

// ------------------------------------------------
// 3. Tab View Switcher
// ------------------------------------------------
function switchTab(tabName) {
  if (viewDashboard) viewDashboard.classList.remove('active');
  if (viewGallery) viewGallery.classList.remove('active');
  if (viewHero) viewHero.classList.remove('active');
  if (viewTestimonials) viewTestimonials.classList.remove('active');
  if (viewStandby) viewStandby.classList.remove('active');

  navItems.forEach(item => item.classList.remove('active'));

  const targetItem = document.querySelector(`.nav-item[data-tab="${tabName}"]`);
  if (targetItem) targetItem.classList.add('active');

  switch (tabName) {
    case 'dashboard':
      if (viewDashboard) viewDashboard.classList.add('active');
      if (pageTitle) pageTitle.textContent = 'Dashboard Overview';
      loadDashboardMetricsSilently();
      break;
    case 'gallery':
      if (viewGallery) viewGallery.classList.add('active');
      if (pageTitle) pageTitle.textContent = 'Gallery Manager';
      renderGalleryView();
      break;
    case 'hero':
      if (viewHero) viewHero.classList.add('active');
      if (pageTitle) pageTitle.textContent = 'Hero Slider Manager';
      renderHeroView();
      break;
    case 'testimonials':
      if (viewTestimonials) viewTestimonials.classList.add('active');
      if (pageTitle) pageTitle.textContent = 'Client Testimonials Manager';
      renderTestimonialsView();
      break;
    default:
      if (viewStandby) viewStandby.classList.add('active');
      const tabTitleFormatted = tabName.charAt(0).toUpperCase() + tabName.slice(1);
      if (pageTitle) pageTitle.textContent = `${tabTitleFormatted} Module`;
      if (standbyTabTitle) standbyTabTitle.textContent = `${tabTitleFormatted} Module`;
      if (standbyTabDesc) standbyTabDesc.textContent = `The ${tabTitleFormatted} manager will be connected in a future step.`;
      break;
  }
}

navItems.forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    const tabName = item.getAttribute('data-tab');
    switchTab(tabName);

    if (sidebar && sidebar.classList.contains('open')) {
      toggleMobileMenu();
    }
  });
});

// ------------------------------------------------
// 4. Gallery Render Controller
// ------------------------------------------------
async function renderGalleryView() {
  if (!galleryContainer) return;

  galleryContainer.innerHTML = `
    <div style="padding: 40px; text-align: center; color: var(--clr-text-muted);">
      Loading gallery assets from Firestore...
    </div>
  `;

  try {
    cachedGalleryDocuments = await fetchGalleryDocuments();
    if (metricGalleryCount) metricGalleryCount.textContent = cachedGalleryDocuments.length;

    if (cachedGalleryDocuments.length === 0) {
      galleryContainer.innerHTML = `
        <div class="empty-state">
          <h3 class="empty-state__title">No gallery photos yet.</h3>
          <p class="empty-state__desc">Upload your first photo to populate the portfolio gallery collection.</p>
          <button class="primary-action-btn" id="emptyAddBtn">+ Add First Photo</button>
        </div>
      `;
      const emptyAddBtn = document.getElementById('emptyAddBtn');
      if (emptyAddBtn) emptyAddBtn.addEventListener('click', openAddModal);
      return;
    }

    let tableHtml = `
      <table class="gallery-table">
        <thead>
          <tr>
            <th>Preview</th>
            <th>Title</th>
            <th>Category</th>
            <th>Tilt Style</th>
            <th>Order</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
    `;

    cachedGalleryDocuments.forEach(docItem => {
      const tiltLabel = docItem.tiltClass === 'gallery-card--tilt-left' ? 'Tilt Left' :
                        docItem.tiltClass === 'gallery-card--tilt-right' ? 'Tilt Right' : 'None';

      tableHtml += `
        <tr>
          <td><img src="${docItem.thumbnailUrl || docItem.imageUrl}" alt="${docItem.title}" class="table-thumb" /></td>
          <td><strong>${docItem.title}</strong></td>
          <td><span class="table-badge">${docItem.categorySlug}</span></td>
          <td><span style="font-size:0.8rem;color:var(--clr-text-muted);">${tiltLabel}</span></td>
          <td><strong>#${docItem.order}</strong></td>
          <td>
            <div class="action-cell">
              <button class="btn-edit" data-id="${docItem.id}">Edit</button>
              <button class="btn-delete" data-id="${docItem.id}" data-publicid="${docItem.publicId}" data-title="${docItem.title}">Delete</button>
            </div>
          </td>
        </tr>
      `;
    });

    tableHtml += `</tbody></table>`;
    galleryContainer.innerHTML = tableHtml;

    galleryContainer.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', () => {
        const docId = btn.getAttribute('data-id');
        const docItem = cachedGalleryDocuments.find(d => d.id === docId);
        if (docItem) openEditModal(docItem);
      });
    });

    galleryContainer.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        const docId = btn.getAttribute('data-id');
        const publicId = btn.getAttribute('data-publicid');
        const title = btn.getAttribute('data-title');
        handleDeleteClick(docId, publicId, title);
      });
    });

  } catch (error) {
    galleryContainer.innerHTML = `
      <div style="padding: 40px; text-align: center; color: var(--clr-danger);">
        Failed to load gallery items from Firestore. Please try again.
      </div>
    `;
    showToast('Failed to fetch gallery collection.', true);
  }
}

function openAddModal() {
  if (galleryForm) galleryForm.reset();
  if (editDocIdInput) editDocIdInput.value = '';
  if (fileGroup) fileGroup.style.display = 'flex';
  if (photoFileInput) photoFileInput.required = true;
  if (modalTitle) modalTitle.textContent = 'Add Portfolio Photo';
  if (saveBtnText) saveBtnText.textContent = 'Upload & Save Photo';
  if (galleryModal) galleryModal.classList.add('open');
}

function openEditModal(docItem) {
  if (galleryForm) galleryForm.reset();
  if (editDocIdInput) editDocIdInput.value = docItem.id;
  if (photoTitleInput) photoTitleInput.value = docItem.title;
  if (photoCategoryInput) photoCategoryInput.value = docItem.categorySlug;
  if (photoTiltInput) photoTiltInput.value = docItem.tiltClass || '';
  if (photoOrderInput) photoOrderInput.value = docItem.order || 1;

  if (fileGroup) fileGroup.style.display = 'none';
  if (photoFileInput) photoFileInput.required = false;

  if (modalTitle) modalTitle.textContent = 'Edit Photo Metadata';
  if (saveBtnText) saveBtnText.textContent = 'Update Metadata';
  if (galleryModal) galleryModal.classList.add('open');
}

function closeModal() {
  if (galleryModal) galleryModal.classList.remove('open');
}

if (openAddModalBtn) openAddModalBtn.addEventListener('click', openAddModal);
if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeModal);

if (galleryForm) {
  galleryForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const isEdit = editDocIdInput.value.trim() !== '';
    const title = photoTitleInput.value.trim();
    const categorySlug = photoCategoryInput.value;
    const tiltClass = photoTiltInput.value;
    const order = Number(photoOrderInput.value) || 1;

    savePhotoBtn.disabled = true;

    try {
      if (isEdit) {
        showToast('Updating photo metadata in Firestore...');
        await updateGalleryPhotoMetadata(editDocIdInput.value, { title, categorySlug, tiltClass, order });
        showToast('Photo metadata updated successfully!');
      } else {
        const file = photoFileInput.files[0];
        if (!file) throw new Error('Please select an image file to upload.');

        showToast('Uploading photo to Cloudinary & saving to Firestore...');
        await addGalleryPhoto({ file, title, categorySlug, tiltClass, order });
        showToast('New photo uploaded and added to gallery!');
      }

      closeModal();
      savePhotoBtn.disabled = false;
      renderGalleryView();

    } catch (error) {
      savePhotoBtn.disabled = false;
      console.error('Gallery Form Error:', error);
      showToast(error.message || 'Operation failed.', true);
    }
  });
}

async function handleDeleteClick(docId, publicId, title) {
  const confirmed = confirm(`Are you sure you want to delete "${title}"?\n\nThis will safely remove the image asset from Cloudinary and delete the record from Firestore.`);
  if (!confirmed) return;

  try {
    showToast(`Deleting image from Cloudinary...`);
    await deleteGalleryPhoto(docId, publicId);
    showToast('Image deleted from Cloudinary & Firestore successfully!');
    renderGalleryView();
  } catch (error) {
    console.error('Gallery Deletion Error:', error);
    showToast(error.message || 'Failed to delete photo.', true);
  }
}

// ------------------------------------------------
// 5. Hero Slider Render Controller
// ------------------------------------------------
async function renderHeroView() {
  if (!heroContainer) return;

  heroContainer.innerHTML = `
    <div style="padding: 40px; text-align: center; color: var(--clr-text-muted);">
      Loading hero slides from Firestore...
    </div>
  `;

  try {
    cachedHeroDocuments = await fetchHeroSlideDocuments();
    if (metricHeroCount) metricHeroCount.textContent = cachedHeroDocuments.length;

    if (cachedHeroDocuments.length === 0) {
      heroContainer.innerHTML = `
        <div class="empty-state">
          <h3 class="empty-state__title">No hero slides yet.</h3>
          <p class="empty-state__desc">Upload full-screen slide assets to configure the home page hero slider.</p>
          <button class="primary-action-btn" id="emptyHeroAddBtn">+ Add Hero Slide</button>
        </div>
      `;
      const emptyHeroAddBtn = document.getElementById('emptyHeroAddBtn');
      if (emptyHeroAddBtn) emptyHeroAddBtn.addEventListener('click', openAddHeroModal);
      return;
    }

    let tableHtml = `
      <table class="gallery-table">
        <thead>
          <tr>
            <th>Slide Preview</th>
            <th>Title</th>
            <th>Order</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
    `;

    cachedHeroDocuments.forEach(docItem => {
      const thumbUrl = generateHeroThumbnailUrl(docItem.imageUrl);
      const statusBadge = docItem.isActive
        ? `<span class="table-badge" style="background:rgba(76, 175, 80, 0.15);color:#4caf50;cursor:pointer;" title="Click to disable" data-toggle-hero-id="${docItem.id}" data-active="true">Active</span>`
        : `<span class="table-badge" style="background:rgba(255, 82, 82, 0.15);color:#ff5252;cursor:pointer;" title="Click to enable" data-toggle-hero-id="${docItem.id}" data-active="false">Inactive</span>`;

      tableHtml += `
        <tr>
          <td><img src="${thumbUrl}" alt="${docItem.title}" class="table-thumb" style="width: 100px; height: 60px;" /></td>
          <td><strong>${docItem.title}</strong></td>
          <td><strong>#${docItem.order}</strong></td>
          <td>${statusBadge}</td>
          <td>
            <div class="action-cell">
              <button class="btn-edit btn-hero-edit" data-id="${docItem.id}">Edit</button>
              <button class="btn-delete btn-hero-delete" data-id="${docItem.id}" data-publicid="${docItem.publicId}" data-title="${docItem.title}">Delete</button>
            </div>
          </td>
        </tr>
      `;
    });

    tableHtml += `</tbody></table>`;
    heroContainer.innerHTML = tableHtml;

    heroContainer.querySelectorAll('[data-toggle-hero-id]').forEach(badge => {
      badge.addEventListener('click', () => {
        const docId = badge.getAttribute('data-toggle-hero-id');
        const isActive = badge.getAttribute('data-active') === 'true';
        handleToggleHeroActive(docId, isActive);
      });
    });

    heroContainer.querySelectorAll('.btn-hero-edit').forEach(btn => {
      btn.addEventListener('click', () => {
        const docId = btn.getAttribute('data-id');
        const docItem = cachedHeroDocuments.find(d => d.id === docId);
        if (docItem) openEditHeroModal(docItem);
      });
    });

    heroContainer.querySelectorAll('.btn-hero-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        const docId = btn.getAttribute('data-id');
        const publicId = btn.getAttribute('data-publicid');
        const title = btn.getAttribute('data-title');
        handleDeleteHeroClick(docId, publicId, title);
      });
    });

  } catch (error) {
    heroContainer.innerHTML = `
      <div style="padding: 40px; text-align: center; color: var(--clr-danger);">
        Failed to load hero slides from Firestore. Please try again.
      </div>
    `;
    showToast('Failed to fetch hero slides collection.', true);
  }
}

function openAddHeroModal() {
  if (heroForm) heroForm.reset();
  if (editHeroDocIdInput) editHeroDocIdInput.value = '';
  if (editHeroOldPublicIdInput) editHeroOldPublicIdInput.value = '';
  if (heroFileGroup) heroFileGroup.style.display = 'flex';
  if (heroSlideFileInput) heroSlideFileInput.required = true;
  if (heroModalTitle) heroModalTitle.textContent = 'Add Hero Slide';
  if (saveHeroBtnText) saveHeroBtnText.textContent = 'Upload & Save Slide';
  if (heroModal) heroModal.classList.add('open');
}

function openEditHeroModal(docItem) {
  if (heroForm) heroForm.reset();
  if (editHeroDocIdInput) editHeroDocIdInput.value = docItem.id;
  if (editHeroOldPublicIdInput) editHeroOldPublicIdInput.value = docItem.publicId || '';
  if (heroSlideTitleInput) heroSlideTitleInput.value = docItem.title;
  if (heroSlideOrderInput) heroSlideOrderInput.value = docItem.order || 1;
  if (heroSlideIsActiveInput) heroSlideIsActiveInput.checked = Boolean(docItem.isActive);

  if (heroSlideFileInput) heroSlideFileInput.required = false;

  if (heroModalTitle) heroModalTitle.textContent = 'Edit Hero Slide';
  if (saveHeroBtnText) saveHeroBtnText.textContent = 'Update Slide';
  if (heroModal) heroModal.classList.add('open');
}

function closeHeroModal() {
  if (heroModal) heroModal.classList.remove('open');
}

if (openAddHeroModalBtn) openAddHeroModalBtn.addEventListener('click', openAddHeroModal);
if (closeHeroModalBtn) closeHeroModalBtn.addEventListener('click', closeHeroModal);
if (cancelHeroModalBtn) cancelHeroModalBtn.addEventListener('click', closeHeroModal);

if (heroForm) {
  heroForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const isEdit = editHeroDocIdInput.value.trim() !== '';
    const title = heroSlideTitleInput.value.trim();
    const order = Number(heroSlideOrderInput.value) || 1;
    const isActive = heroSlideIsActiveInput.checked;
    const newFile = heroSlideFileInput.files[0];

    saveHeroSlideBtn.disabled = true;

    try {
      if (isEdit) {
        if (newFile) {
          showToast('Uploading new slide image to Cloudinary & updating Firestore...');
        } else {
          showToast('Updating slide metadata in Firestore...');
        }

        await updateHeroSlide(editHeroDocIdInput.value, {
          title,
          order,
          isActive,
          newFile,
          oldPublicId: editHeroOldPublicIdInput.value
        });

        showToast('Hero slide updated successfully!');
      } else {
        if (!newFile) throw new Error('Please select a hero image file to upload.');

        showToast('Uploading slide image to Cloudinary & saving to Firestore...');
        await addHeroSlide({ file: newFile, title, order, isActive });
        showToast('New hero slide uploaded and saved!');
      }

      closeHeroModal();
      saveHeroSlideBtn.disabled = false;
      renderHeroView();

    } catch (error) {
      saveHeroSlideBtn.disabled = false;
      console.error('Hero Form Error:', error);
      showToast(error.message || 'Hero slide operation failed.', true);
    }
  });
}

async function handleToggleHeroActive(docId, currentActive) {
  try {
    showToast('Updating slide active state...');
    await toggleHeroSlideActive(docId, currentActive);
    showToast(`Slide status changed to ${!currentActive ? 'Active' : 'Inactive'}`);
    renderHeroView();
  } catch (err) {
    console.error('Toggle Active Error:', err);
    showToast('Failed to update active state.', true);
  }
}

async function handleDeleteHeroClick(docId, publicId, title) {
  const confirmed = confirm(`Are you sure you want to delete "${title}"?\n\nThis will safely remove the slide image asset from Cloudinary and delete the record from Firestore.`);
  if (!confirmed) return;

  try {
    showToast(`Deleting slide image from Cloudinary...`);
    await deleteHeroSlide(docId, publicId);
    showToast('Hero slide deleted from Cloudinary & Firestore successfully!');
    renderHeroView();
  } catch (error) {
    console.error('Hero Deletion Error:', error);
    showToast(error.message || 'Failed to delete hero slide.', true);
  }
}


// ================================================
// 6. TESTIMONIALS MANAGER CONTROLLER
// ================================================

async function renderTestimonialsView() {
  if (!testimonialsContainer) return;

  testimonialsContainer.innerHTML = `
    <div style="padding: 40px; text-align: center; color: var(--clr-text-muted);">
      Loading testimonials from Firestore...
    </div>
  `;

  try {
    cachedTestimonialsDocuments = await fetchTestimonialDocuments();
    if (metricTestimonialsCount) metricTestimonialsCount.textContent = cachedTestimonialsDocuments.length;

    if (cachedTestimonialsDocuments.length === 0) {
      testimonialsContainer.innerHTML = `
        <div class="empty-state">
          <h3 class="empty-state__title">No testimonials yet.</h3>
          <p class="empty-state__desc">Add your first client story to populate the testimonials collection.</p>
          <button class="primary-action-btn" id="emptyTestimonialAddBtn">+ Add Testimonial</button>
        </div>
      `;
      const emptyTestimonialAddBtn = document.getElementById('emptyTestimonialAddBtn');
      if (emptyTestimonialAddBtn) emptyTestimonialAddBtn.addEventListener('click', openAddTestimonialModal);
      return;
    }

    let tableHtml = `
      <table class="gallery-table">
        <thead>
          <tr>
            <th>Avatar</th>
            <th>Client Name</th>
            <th>Detail / Category</th>
            <th>Rating</th>
            <th>Order</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
    `;

    cachedTestimonialsDocuments.forEach(docItem => {
      const avatarUrl = generateAvatarThumbnailUrl(docItem.avatarUrl);
      const ratingStars = '★'.repeat(docItem.rating || 5);
      const statusBadge = docItem.isActive
        ? `<span class="table-badge" style="background:rgba(76, 175, 80, 0.15);color:#4caf50;cursor:pointer;" title="Click to disable" data-toggle-testimonial-id="${docItem.id}" data-active="true">Active</span>`
        : `<span class="table-badge" style="background:rgba(255, 82, 82, 0.15);color:#ff5252;cursor:pointer;" title="Click to enable" data-toggle-testimonial-id="${docItem.id}" data-active="false">Inactive</span>`;

      tableHtml += `
        <tr>
          <td><img src="${avatarUrl}" alt="${docItem.clientName}" class="table-thumb" style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover;" /></td>
          <td><strong>${docItem.clientName}</strong></td>
          <td><span style="font-size:0.8rem;color:var(--clr-gold);">${docItem.detail}</span></td>
          <td><span style="color:#d4af37;letter-spacing:2px;">${ratingStars}</span></td>
          <td><strong>#${docItem.order}</strong></td>
          <td>${statusBadge}</td>
          <td>
            <div class="action-cell">
              <button class="btn-edit btn-testimonial-edit" data-id="${docItem.id}">Edit</button>
              <button class="btn-delete btn-testimonial-delete" data-id="${docItem.id}" data-publicid="${docItem.publicId}" data-name="${docItem.clientName}">Delete</button>
            </div>
          </td>
        </tr>
      `;
    });

    tableHtml += `</tbody></table>`;
    testimonialsContainer.innerHTML = tableHtml;

    testimonialsContainer.querySelectorAll('[data-toggle-testimonial-id]').forEach(badge => {
      badge.addEventListener('click', () => {
        const docId = badge.getAttribute('data-toggle-testimonial-id');
        const isActive = badge.getAttribute('data-active') === 'true';
        handleToggleTestimonialActive(docId, isActive);
      });
    });

    testimonialsContainer.querySelectorAll('.btn-testimonial-edit').forEach(btn => {
      btn.addEventListener('click', () => {
        const docId = btn.getAttribute('data-id');
        const docItem = cachedTestimonialsDocuments.find(d => d.id === docId);
        if (docItem) openEditTestimonialModal(docItem);
      });
    });

    testimonialsContainer.querySelectorAll('.btn-testimonial-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        const docId = btn.getAttribute('data-id');
        const publicId = btn.getAttribute('data-publicid');
        const name = btn.getAttribute('data-name');
        handleDeleteTestimonialClick(docId, publicId, name);
      });
    });

  } catch (error) {
    testimonialsContainer.innerHTML = `
      <div style="padding: 40px; text-align: center; color: var(--clr-danger);">
        Failed to load testimonials from Firestore. Please try again.
      </div>
    `;
    showToast('Failed to fetch testimonials collection.', true);
  }
}

function openAddTestimonialModal() {
  if (testimonialForm) testimonialForm.reset();
  if (editTestimonialDocIdInput) editTestimonialDocIdInput.value = '';
  if (editTestimonialOldPublicIdInput) editTestimonialOldPublicIdInput.value = '';
  if (testimonialFileGroup) testimonialFileGroup.style.display = 'flex';
  if (testimonialAvatarFileInput) testimonialAvatarFileInput.required = true;
  if (testimonialModalTitle) testimonialModalTitle.textContent = 'Add Client Testimonial';
  if (saveTestimonialBtnText) saveTestimonialBtnText.textContent = 'Upload & Save Testimonial';
  if (testimonialModal) testimonialModal.classList.add('open');
}

function openEditTestimonialModal(docItem) {
  if (testimonialForm) testimonialForm.reset();
  if (editTestimonialDocIdInput) editTestimonialDocIdInput.value = docItem.id;
  if (editTestimonialOldPublicIdInput) editTestimonialOldPublicIdInput.value = docItem.publicId || '';
  if (testimonialClientNameInput) testimonialClientNameInput.value = docItem.clientName;
  if (testimonialDetailInput) testimonialDetailInput.value = docItem.detail;
  if (testimonialRatingInput) testimonialRatingInput.value = docItem.rating || 5;
  if (testimonialReviewTextInput) testimonialReviewTextInput.value = docItem.reviewText;
  if (testimonialOrderInput) testimonialOrderInput.value = docItem.order || 1;
  if (testimonialIsActiveInput) testimonialIsActiveInput.checked = Boolean(docItem.isActive);

  if (testimonialAvatarFileInput) testimonialAvatarFileInput.required = false;

  if (testimonialModalTitle) testimonialModalTitle.textContent = 'Edit Client Testimonial';
  if (saveTestimonialBtnText) saveTestimonialBtnText.textContent = 'Update Testimonial';
  if (testimonialModal) testimonialModal.classList.add('open');
}

function closeTestimonialModal() {
  if (testimonialModal) testimonialModal.classList.remove('open');
}

if (openAddTestimonialModalBtn) openAddTestimonialModalBtn.addEventListener('click', openAddTestimonialModal);
if (closeTestimonialModalBtn) closeTestimonialModalBtn.addEventListener('click', closeTestimonialModal);
if (cancelTestimonialModalBtn) cancelTestimonialModalBtn.addEventListener('click', closeTestimonialModal);

if (testimonialForm) {
  testimonialForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const isEdit = editTestimonialDocIdInput.value.trim() !== '';
    const clientName = testimonialClientNameInput.value.trim();
    const detail = testimonialDetailInput.value.trim();
    const rating = Number(testimonialRatingInput.value) || 5;
    const reviewText = testimonialReviewTextInput.value.trim();
    const order = Number(testimonialOrderInput.value) || 1;
    const isActive = testimonialIsActiveInput.checked;
    const newFile = testimonialAvatarFileInput.files[0];

    saveTestimonialBtn.disabled = true;

    try {
      if (isEdit) {
        if (newFile) {
          showToast('Uploading new avatar image to Cloudinary & updating Firestore...');
        } else {
          showToast('Updating testimonial metadata in Firestore...');
        }

        await updateTestimonial(editTestimonialDocIdInput.value, {
          clientName,
          reviewText,
          detail,
          rating,
          order,
          isActive,
          newFile,
          oldPublicId: editTestimonialOldPublicIdInput.value
        });

        showToast('Testimonial updated successfully!');
      } else {
        if (!newFile) throw new Error('Please select an avatar image file to upload.');

        showToast('Uploading avatar image to Cloudinary & saving to Firestore...');
        await addTestimonial({ file: newFile, clientName, reviewText, detail, rating, order, isActive });
        showToast('New testimonial uploaded and saved!');
      }

      closeTestimonialModal();
      saveTestimonialBtn.disabled = false;
      renderTestimonialsView();

    } catch (error) {
      saveTestimonialBtn.disabled = false;
      console.error('Testimonial Form Error:', error);
      showToast(error.message || 'Testimonial operation failed.', true);
    }
  });
}

async function handleToggleTestimonialActive(docId, currentActive) {
  try {
    showToast('Updating testimonial active state...');
    await toggleTestimonialActive(docId, currentActive);
    showToast(`Testimonial status changed to ${!currentActive ? 'Active' : 'Inactive'}`);
    renderTestimonialsView();
  } catch (err) {
    console.error('Toggle Active Error:', err);
    showToast('Failed to update active state.', true);
  }
}

async function handleDeleteTestimonialClick(docId, publicId, clientName) {
  const confirmed = confirm(`Are you sure you want to delete testimonial from "${clientName}"?\n\nThis will safely remove the avatar image asset from Cloudinary and delete the record from Firestore.`);
  if (!confirmed) return;

  try {
    showToast(`Deleting avatar image from Cloudinary...`);
    await deleteTestimonial(docId, publicId);
    showToast('Testimonial deleted from Cloudinary & Firestore successfully!');
    renderTestimonialsView();
  } catch (error) {
    console.error('Testimonial Deletion Error:', error);
    showToast(error.message || 'Failed to delete testimonial.', true);
  }
}

// ------------------------------------------------
// Mobile Drawer & Logout
// ------------------------------------------------
function toggleMobileMenu() {
  if (sidebar && sidebarOverlay) {
    sidebar.classList.toggle('open');
    sidebarOverlay.classList.toggle('open');
  }
}

if (mobileToggle) mobileToggle.addEventListener('click', toggleMobileMenu);
if (sidebarOverlay) sidebarOverlay.addEventListener('click', toggleMobileMenu);

if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    try {
      await signOut(auth);
      window.location.href = '/admin/login.html';
    } catch (error) {
      window.location.href = '/admin/login.html';
    }
  });
}
