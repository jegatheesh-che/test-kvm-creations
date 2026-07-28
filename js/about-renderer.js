// ================================================
// KVM CREATIONS — DYNAMIC ABOUT PAGE RENDERER
// Syncs Mathu & Vithu bios and photos live from Firestore /about collection
// ================================================

import { db } from "./firebase-config.js?v=2";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  loadDynamicAboutContent();
});

async function loadDynamicAboutContent() {
  try {
    const docRef = doc(db, "about", "main");
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.log("[Firestore About] No custom about document found. Retaining default Mathu & Vithu story.");
      return;
    }

    const data = docSnap.data();
    const sections = data.sections || [];

    if (sections.length === 0) return;

    // 1. Hero / Studio Section
    const secHero = sections.find(s => s.id === "sec_hero") || sections[0];
    if (secHero) {
      const heroEyebrow = document.querySelector(".hero__layout .hero__eyebrow");
      const heroTitle = document.querySelector(".hero__layout .hero__title");
      const heroDesc = document.querySelector(".hero__layout .hero__desc");
      const heroImg = document.querySelector(".hero__layout .hero__image");

      if (heroEyebrow && secHero.eyebrow) heroEyebrow.textContent = secHero.eyebrow;
      if (heroTitle && secHero.title) heroTitle.innerHTML = secHero.title.includes("<em>") ? secHero.title : `About <em>${secHero.title}</em>`;
      if (heroDesc && secHero.desc) heroDesc.textContent = secHero.desc.split("\n\n")[0];
      if (heroImg && secHero.imageUrl) heroImg.src = secHero.imageUrl;
    }

    // 2. Mathu Section
    const secMathu = sections.find(s => s.id === "sec_mathu") || sections[1];
    if (secMathu) {
      const mathuSec = document.querySelectorAll(".editorial-split-section")[0];
      if (mathuSec) {
        const mathuImg = mathuSec.querySelector("img");
        const mathuEyebrow = mathuSec.querySelector(".hero__eyebrow");
        const mathuTitle = mathuSec.querySelector("h2");
        const mathuDesc = mathuSec.querySelector("p");

        if (mathuImg && secMathu.imageUrl) mathuImg.src = secMathu.imageUrl;
        if (mathuEyebrow && secMathu.eyebrow) mathuEyebrow.textContent = secMathu.eyebrow;
        if (mathuTitle && secMathu.title) mathuTitle.textContent = secMathu.title;
        if (mathuDesc && secMathu.desc) mathuDesc.textContent = secMathu.desc.split("\n\n")[0];
      }
    }

    // 3. Vithu Section
    const secVithu = sections.find(s => s.id === "sec_vithu") || sections[2];
    if (secVithu) {
      const vithuSec = document.querySelectorAll(".editorial-split-section")[1];
      if (vithuSec) {
        const vithuImg = vithuSec.querySelector("img");
        const vithuEyebrow = vithuSec.querySelector(".hero__eyebrow");
        const vithuTitle = vithuSec.querySelector("h2");
        const vithuDesc = vithuSec.querySelector("p");

        if (vithuImg && secVithu.imageUrl) vithuImg.src = secVithu.imageUrl;
        if (vithuEyebrow && secVithu.eyebrow) vithuEyebrow.textContent = secVithu.eyebrow;
        if (vithuTitle && secVithu.title) vithuTitle.textContent = secVithu.title;
        if (vithuDesc && secVithu.desc) vithuDesc.textContent = secVithu.desc.split("\n\n")[0];
      }
    }

  } catch (err) {
    console.warn("[Firestore About] Error loading dynamic about content:", err);
  }
}
