// ================================================
// KVM CREATIONS — DYNAMIC ABOUT PAGE RENDERER
// Syncs custom about story sections live from Firestore /about/content
// ================================================

import { db } from "./firebase-config.js?v=2";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  loadDynamicAboutContent();
});

async function loadDynamicAboutContent() {
  try {
    const docRef = doc(db, "about", "content");
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.log("[Firestore About] No custom about document found at about/content.");
      return;
    }

    const data = docSnap.data();
    const sections = data.sections || [];

    if (sections.length === 0) return;

    const heroContainer = document.getElementById("aboutDynamicHero");
    const splitsContainer = document.getElementById("aboutDynamicSplits");

    if (!heroContainer || !splitsContainer) {
      console.error("[Firestore About] Dynamic anchors not found in HTML.");
      return;
    }

    // Clear containers
    heroContainer.innerHTML = '';
    splitsContainer.innerHTML = '';

    // Loop through all sections
    sections.forEach((sec, index) => {
      // Split description by paragraphs (double newlines)
      const paragraphs = sec.desc ? sec.desc.split('\n\n').filter(p => p.trim() !== '') : [];
      const firstPara = paragraphs.length > 0 ? paragraphs[0] : "";
      const remainingParas = paragraphs.length > 1 ? paragraphs.slice(1) : [];

      if (index === 0) {
        // Render Hero Section (Index 0)
        let moreContentHtml = '';
        let seeMoreBtnHtml = '';

        if (remainingParas.length > 0) {
          moreContentHtml = `
            <div class="about-more-content" id="heroMoreContent" style="max-height: 0; opacity: 0; overflow: hidden; transition: max-height 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease-out;">
              ${remainingParas.map(p => `<p class="hero__desc" style="margin-top: 1rem;">${p}</p>`).join('')}
            </div>
          `;
          seeMoreBtnHtml = `
            <button class="see-more-btn" data-target="heroMoreContent" aria-expanded="false" style="font-family: var(--font-sans); font-size: 0.72rem; letter-spacing: 2px; text-transform: uppercase; color: var(--clr-gold); margin-top: 1.2rem; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; font-weight: 600; border: none; background: none; padding: 0; outline: none; transition: color 0.3s;">
              See More <span class="plus-minus" style="font-size: 0.9rem;">+</span>
            </button>
          `;
        }

        const heroHtml = `
          <section class="hero__layout">
            <div class="hero__text-col">
              <p class="hero__eyebrow reveal">${sec.eyebrow || ''}</p>
              
              <p class="hero__desc reveal reveal-delay-1">${firstPara}</p>

              ${moreContentHtml}
              ${seeMoreBtnHtml}
              
              <a href="contact.html" class="hero__cta reveal reveal-delay-4" style="margin-top: 1.5rem;">Inquire Collection &rarr;</a>
            </div>
            
            <div class="hero__image-col reveal">
              <div class="hero__image-wrapper">
                <img src="${sec.imageUrl || ''}" alt="${sec.eyebrow || 'About KVM Creations'}" class="hero__image" loading="eager" />
              </div>
            </div>
          </section>
        `;
        heroContainer.innerHTML = heroHtml;

      } else {
        // Render Split Sections (Index > 0)
        // Index 1 (Mathu) -> isReverse = false (image first)
        // Index 2 (Vithu) -> isReverse = true (text first)
        const isReverse = (index % 2 === 0);
        const reverseClass = isReverse ? 'reverse' : '';

        let moreContentHtml = '';
        let seeMoreBtnHtml = '';

        if (remainingParas.length > 0) {
          moreContentHtml = `
            <div class="about-more-content" id="splitMoreContent_${index}" style="max-height: 0; opacity: 0; overflow: hidden; transition: max-height 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease-out;">
              ${remainingParas.map(p => `<p style="margin-top: 1rem; margin-bottom: 0.5rem;">${p}</p>`).join('')}
            </div>
          `;
          seeMoreBtnHtml = `
            <button class="see-more-btn" data-target="splitMoreContent_${index}" aria-expanded="false" style="font-family: var(--font-sans); font-size: 0.72rem; letter-spacing: 2px; text-transform: uppercase; color: var(--clr-gold); margin-top: 1rem; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; font-weight: 600; border: none; background: none; padding: 0; outline: none; transition: color 0.3s;">
              See More <span class="plus-minus" style="font-size: 0.9rem;">+</span>
            </button>
          `;
        }

        const imageColHtml = `
          <div class="editorial-image-wrapper">
            <img src="${sec.imageUrl || ''}" alt="${sec.eyebrow || 'Story'}" loading="lazy" />
          </div>
        `;

        const textColHtml = `
          <div class="editorial-text-col">
            <p class="hero__eyebrow">${sec.eyebrow || ''}</p>
            <p style="margin-bottom: 0.5rem;">${firstPara}</p>

            ${moreContentHtml}
            ${seeMoreBtnHtml}
          </div>
        `;

        const splitHtml = `
          <section class="editorial-split-section ${reverseClass} reveal">
            ${!isReverse ? imageColHtml : ''}
            ${textColHtml}
            ${isReverse ? imageColHtml : ''}
          </section>
        `;

        splitsContainer.innerHTML += splitHtml;
      }
    });

    // Attach "See More" functionality after DOM is generated
    attachSeeMoreListeners();

    // Re-trigger scroll animations or Lenis if needed
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh();
    }

  } catch (err) {
    console.warn("[Firestore About] Error loading dynamic about content:", err);
  }
}

// Reusable logic for expandable text
function attachSeeMoreListeners() {
  document.querySelectorAll('.see-more-btn').forEach(seeMoreBtn => {
    // Prevent duplicate listeners if this runs multiple times
    const newBtn = seeMoreBtn.cloneNode(true);
    seeMoreBtn.parentNode.replaceChild(newBtn, seeMoreBtn);

    newBtn.addEventListener('click', () => {
      const targetId = newBtn.getAttribute('data-target');
      const moreContent = document.getElementById(targetId);
      if (!moreContent) return;
      
      const isExpanded = newBtn.getAttribute('aria-expanded') === 'true';
      
      if (isExpanded) {
        moreContent.style.maxHeight = moreContent.scrollHeight + 'px';
        void moreContent.offsetHeight; // force reflow
        moreContent.style.maxHeight = '0px';
        moreContent.style.opacity = '0';
        newBtn.innerHTML = 'See More <span class="plus-minus" style="font-size: 0.9rem;">+</span>';
        newBtn.setAttribute('aria-expanded', 'false');
      } else {
        moreContent.style.maxHeight = moreContent.scrollHeight + 'px';
        moreContent.style.opacity = '1';
        newBtn.innerHTML = 'See Less <span class="plus-minus" style="font-size: 0.9rem;">&minus;</span>';
        newBtn.setAttribute('aria-expanded', 'true');
        setTimeout(() => {
          if (newBtn.getAttribute('aria-expanded') === 'true') {
            moreContent.style.maxHeight = 'none';
          }
        }, 500);
      }
      
      setTimeout(() => {
        if (typeof lenis !== 'undefined') {
          lenis.resize();
        }
        if (typeof ScrollTrigger !== 'undefined') {
          ScrollTrigger.refresh();
        }
      }, 500);
    });
  });
}
