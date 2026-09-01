/* ================================================
   KVM Creations Studio — main.js
   GSAP + Lenis + vanilla scroll reveal + cursor
   ================================================ */

// --- Lenis physics smooth scroll ---
const lenis = new Lenis({
  duration: 1.1,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  wheelMultiplier: 1.1,
  touchMultiplier: 1.8,
  orientation: 'vertical',
  gestureOrientation: 'vertical'
});

// --- GSAP ScrollTrigger sync ---
gsap.registerPlugin(ScrollTrigger);
gsap.ticker.add((time) => { lenis.raf(time * 1000); });
gsap.ticker.lagSmoothing(0);
lenis.on('scroll', ScrollTrigger.update);

// Body smooth load class
window.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('loaded');
});

// -----------------------------------------------
// NAV: scroll state
// -----------------------------------------------
const nav = document.querySelector('.nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  // Active link
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('.nav__link, .nav__mobile .nav__link').forEach(link => {
    const href = link.getAttribute('href');
    if (href && (href === path || (path === '' && href === 'index.html') || path.includes(href.replace('.html', '')))) {
      link.classList.add('active');
    }
  });
}

// -----------------------------------------------
// MOBILE MENU
// -----------------------------------------------
const burger = document.querySelector('.nav__burger');
const mobileMenu = document.querySelector('.nav__mobile');
const mobileLinks = document.querySelectorAll('.nav__mobile .nav__link');
const mobileSocials = document.querySelectorAll('.nav__mobile-social a');

if (burger && mobileMenu) {
  // Setup GSAP timeline
  const tl = gsap.timeline({ paused: true, reversed: true });
  
  tl.to(mobileMenu, {
    opacity: 1,
    duration: 0.5,
    ease: "power2.inOut",
    onStart: () => {
      mobileMenu.style.pointerEvents = "all";
      document.body.style.overflow = "hidden";
    },
    onReverseComplete: () => {
      mobileMenu.style.pointerEvents = "none";
      document.body.style.overflow = "";
    }
  })
  .fromTo(mobileLinks, 
    { y: 50, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power3.out" },
    "-=0.2"
  )
  .fromTo(mobileSocials,
    { y: 20, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power3.out" },
    "-=0.6"
  );

  burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    if (tl.reversed()) {
      tl.play();
    } else {
      tl.reverse();
    }
  });

  mobileMenu.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => {
      burger.classList.remove('open');
      tl.reverse();
    });
  });
}

// -----------------------------------------------
// CUSTOM CURSOR (desktop fine pointer with smooth LERP)
// -----------------------------------------------
if (window.matchMedia('(pointer: fine)').matches) {
  const ring = document.querySelector('.cursor__ring');
  const dot  = document.querySelector('.cursor__dot');
  if (ring && dot) {
    let mx = 0, my = 0;
    let rx = 0, ry = 0;
    let isHovered = false;

    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
    });

    function animateRing() {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      const scale = isHovered ? 'scale(1.9)' : 'scale(1)';
      ring.style.transform = `translate3d(${rx - 14}px, ${ry - 14}px, 0) ${scale}`;
      requestAnimationFrame(animateRing);
    }
    animateRing();

    document.querySelectorAll('a, button, .gallery-card, .collage-item, .filter-btn, .mobile-nav-item, .platform-card-item, .contact-side-card').forEach(el => {
      el.addEventListener('mouseenter', () => isHovered = true);
      el.addEventListener('mouseleave', () => isHovered = false);
    });
  }
}

// -----------------------------------------------
// SCROLL REVEAL — IntersectionObserver based
// -----------------------------------------------
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => {
  revealObserver.observe(el);
});


// -----------------------------------------------
// STORY THUMBNAILS
// -----------------------------------------------
document.querySelectorAll('.story-item').forEach(item => {
  const mainImg = item.querySelector('.story-item__image-main');
  const thumbs  = item.querySelectorAll('.story-item__thumb');
  if (!mainImg || !thumbs.length) return;
  thumbs[0].classList.add('active');
  thumbs.forEach((thumb, i) => {
    thumb.addEventListener('click', () => {
      thumbs.forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
      const newSrc = thumb.dataset.full || thumb.src;
      gsap.to(mainImg, { opacity: 0, duration: 0.3, onComplete: () => {
        mainImg.src = newSrc;
        gsap.to(mainImg, { opacity: 1, duration: 0.4 });
      }});
    });
  });
});

// -----------------------------------------------
// INITIAL ENTRANCE LOGIC
// -----------------------------------------------
function startWebsiteEntrance() {
  // Fade in body on load
  gsap.from('body', { opacity: 0, duration: 0.5, ease: 'power2.out' });


  // Hero title entrance if present (for other pages)
  const heroTitle = document.querySelector('.hero__title');
  if (heroTitle) {
    gsap.from(heroTitle, { y: 40, opacity: 0, duration: 1.2, ease: 'expo.out', delay: 0.3 });
  }
}

// Start immediately on load
startWebsiteEntrance();

// Page nav links with GSAP fade
document.querySelectorAll('.nav__link[href]').forEach(link => {
  link.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto') || href.startsWith('http')) return;
    e.preventDefault();
    gsap.to('body', {
      opacity: 0, duration: 0.35, ease: 'power2.in',
      onComplete: () => { window.location.href = href; }
    });
  });
});

// --- SHINY HOVER WRAPPER (initial static DOM) ---
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('img:not(.nav__logo-img, .cursor__img, .home-about__logo, .video-badge img, .round-badge img)').forEach(el => {
    if (el.closest('.hero__slide')) return;
    if (el.closest('.shiny-wrapper')) return; // already wrapped — skip
    const wrapper = document.createElement('div');
    wrapper.className = 'shiny-wrapper';
    el.parentNode.insertBefore(wrapper, el);
    wrapper.appendChild(el);
  });
});

// --- ROUND BADGE IMAGE CROSSFADE ---
document.addEventListener('DOMContentLoaded', () => {
  const badgeImages = document.querySelectorAll('.round-badge .fade-img');
  if(badgeImages.length > 0) {
    let currentIdx = 0;
    setInterval(() => {
      badgeImages[currentIdx].classList.remove('active');
      currentIdx = (currentIdx + 1) % badgeImages.length;
      badgeImages[currentIdx].classList.add('active');
    }, 2500);
  }
});

// --- FOOTER QUOTE ROTATION ---
document.addEventListener('DOMContentLoaded', () => {
  const quoteText = document.getElementById('quote-text');
  const quoteAuthor = document.getElementById('quote-author');
  const quoteBox = document.querySelector('.footer__quote');
  
  if (quoteText && quoteAuthor && quoteBox) {
    const quotes = [
      { text: '"I think... if it is true that there are as many minds as there are heads, then there are as many kinds of love as there are hearts."', author: '— Leo Tolstoy' },
      { text: '"Photography takes an instant out of time, altering life by holding it still."', author: '— Dorothea Lange' },
      { text: '"To me, photography is an art of observation. It’s about finding something interesting in an ordinary place."', author: '— Elliott Erwitt' }
    ];
    
    let currentIdx = 0;
    setInterval(() => {
      quoteBox.classList.add('fade-out');
      
      setTimeout(() => {
        currentIdx = (currentIdx + 1) % quotes.length;
        quoteText.textContent = quotes[currentIdx].text;
        quoteAuthor.textContent = quotes[currentIdx].author;
        quoteBox.classList.remove('fade-out');
      }, 800);
    }, 9000);
  }
});


// -----------------------------------------------
// HERO IMAGE SLIDESHOW CONTROLLER (GSAP Luxury Fade)
// -----------------------------------------------
let globalHeroAutoplayTimer = null;

function initHeroSlider() {
  const heroSection = document.getElementById('hero');
  if (!heroSection) return;

  // Clean up any running autoplay timer before re-binding
  if (globalHeroAutoplayTimer) {
    clearInterval(globalHeroAutoplayTimer);
    globalHeroAutoplayTimer = null;
  }

  const slides = heroSection.querySelectorAll('.hero__slide');
  const dots = heroSection.querySelectorAll('.hero__dot');
  const prevBtn = heroSection.querySelector('.hero__arrow--prev');
  const nextBtn = heroSection.querySelector('.hero__arrow--next');

  if (slides.length <= 1) return;

  let currentIndex = 0;
  const INTERVAL_MS = 5500;

  // Initial slide setup with image zoom-out
  slides.forEach((slide, idx) => {
    const img = slide.querySelector('img');
    if (idx === 0) {
      slide.classList.add('active');
      gsap.set(slide, { opacity: 1, zIndex: 3 });
      if (img) gsap.fromTo(img, { scale: 1.16 }, { scale: 1.0, duration: 2.0, ease: "power1.out" });
    } else {
      slide.classList.remove('active', 'exit');
      gsap.set(slide, { opacity: 0, zIndex: 1 });
      if (img) gsap.set(img, { scale: 1.16 });
    }
  });

  function animateImageZoomOut(slide) {
    const img = slide.querySelector('img');
    if (!img) return;
    gsap.killTweensOf(img);
    gsap.fromTo(img, 
      { scale: 1.16 }, 
      { scale: 1.0, duration: 2.0, ease: "power1.out" }
    );
  }

  function showSlide(index) {
    if (index === currentIndex) return;

    if (index >= slides.length) index = 0;
    if (index < 0) index = slides.length - 1;

    const previousSlide = slides[currentIndex];
    const currentSlide = slides[index];

    currentIndex = index;

    // Update pagination dots immediately
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === index);
    });

    // Reset irrelevant slides
    slides.forEach((slide, i) => {
      gsap.killTweensOf(slide);
      if (i !== index && slide !== previousSlide) {
        slide.classList.remove('active', 'exit');
        gsap.set(slide, { opacity: 0, zIndex: 1 });
      }
    });

    if (previousSlide) {
      previousSlide.classList.remove('active');
      previousSlide.classList.add('exit');
      gsap.set(previousSlide, { zIndex: 2 });
    }

    currentSlide.classList.remove('exit');
    currentSlide.classList.add('active');
    gsap.set(currentSlide, { zIndex: 3 });
    
    // Trigger image zoom-out
    animateImageZoomOut(currentSlide);

    // Fade in current slide container on top of previous slide
    gsap.fromTo(currentSlide, 
      { opacity: 0 }, 
      { 
        opacity: 1, 
        duration: 0.8, 
        ease: "power2.out",
        onComplete: () => {
          if (previousSlide) {
            previousSlide.classList.remove('exit');
            gsap.set(previousSlide, { opacity: 0 });
          }
        }
      }
    );
  }

  function nextSlide() {
    showSlide(currentIndex + 1);
  }

  function prevSlide() {
    showSlide(currentIndex - 1);
  }

  function startAutoplay() {
    stopAutoplay();
    globalHeroAutoplayTimer = setInterval(nextSlide, INTERVAL_MS);
  }

  function stopAutoplay() {
    if (globalHeroAutoplayTimer) {
      clearInterval(globalHeroAutoplayTimer);
      globalHeroAutoplayTimer = null;
    }
  }

  if (nextBtn) {
    nextBtn.onclick = (e) => {
      e.preventDefault();
      nextSlide();
      startAutoplay();
    };
  }

  if (prevBtn) {
    prevBtn.onclick = (e) => {
      e.preventDefault();
      prevSlide();
      startAutoplay();
    };
  }

  dots.forEach((dot, i) => {
    dot.onclick = (e) => {
      e.preventDefault();
      showSlide(i);
      startAutoplay();
    };
  });

  // Touch Swipe Support for Mobile (Property binding prevents duplicate listeners)
  let touchStartX = 0;
  let touchEndX = 0;

  heroSection.ontouchstart = e => {
    touchStartX = e.changedTouches[0].screenX;
  };

  heroSection.ontouchend = e => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  };

  function handleSwipe() {
    const diff = touchEndX - touchStartX;
    if (Math.abs(diff) > 40) {
      if (diff < 0) {
        nextSlide();
      } else {
        prevSlide();
      }
      startAutoplay();
    }
  }

  startAutoplay();
}

window.reinitHeroSlider = function() {
  initHeroSlider();
};

document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('loaded');
  initHeroSlider();
});


// -----------------------------------------------
// ABOUT SECTION - VOGUE REVEAL
// -----------------------------------------------
const vogueWrap = document.querySelector('.vogue-wrap');
if (vogueWrap) {
  const mask = vogueWrap.querySelector('.vogue-mask');
  const img = vogueWrap.querySelector('.vogue-parallax img');

  // 1. The Mask Reveal
  gsap.to(mask, {
    scaleY: 0,
    transformOrigin: 'top',
    ease: 'power3.inOut',
    duration: 1.5,
    scrollTrigger: {
      trigger: vogueWrap,
      start: 'top 80%'
    }
  });

  // 2. The Image Parallax
  gsap.fromTo(img, 
    { yPercent: -10 },
    {
      yPercent: 10,
      ease: 'none',
      scrollTrigger: {
        trigger: vogueWrap,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    }
  );
}

// -----------------------------------------------
// GALLERY PAGE FILTERING & LIGHTBOX MODAL
// -----------------------------------------------
function bindGalleryFilters() {
  const filterBtns = document.querySelectorAll('.gallery-filters .filter-btn');
  
  if (filterBtns.length > 0) {
    filterBtns.forEach(btn => {
      btn.onclick = (e) => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const filterValue = (btn.getAttribute('data-filter') || 'all').toLowerCase().trim();
        const currentCards = document.querySelectorAll('.gallery-masonry .gallery-card');
        
        currentCards.forEach(card => {
          gsap.killTweensOf(card);
          const cardCategory = (card.getAttribute('data-category') || '').toLowerCase().trim();
          
          if (filterValue === 'all' || cardCategory === filterValue) {
            card.style.display = 'inline-block';
            gsap.to(card, {
              opacity: 1,
              scale: 1,
              duration: 0.35,
              ease: 'power2.out'
            });
          } else {
            gsap.to(card, {
              opacity: 0,
              scale: 0.9,
              duration: 0.25,
              ease: 'power2.in',
              onComplete: () => {
                card.style.display = 'none';
              }
            });
          }
        });

        // Center active filter button in viewport on small screens
        if (window.innerWidth <= 768) {
          btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }

        if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
        if (typeof lenis !== 'undefined') lenis.resize();
      };
    });
  }
}

// Global UI re-initialization helper for dynamic Firestore card rendering.
// Accepts an optional array of newly-created card elements.
// When newCards is provided, only processes those specific elements (incremental).
// When called with no args, falls back to scanning the full DOM (legacy path).
window.reinitGalleryUI = function(newCards) {
  // 1. Wrap images in shiny-wrapper — only for new/unwrapped elements
  const scope = (newCards && newCards.length > 0)
    ? newCards  // incremental: only new cards
    : Array.from(document.querySelectorAll('.gallery-card, .collage-item')); // full scan fallback

  scope.forEach(card => {
    const img = card.querySelector('img');
    if (!img) return;
    if (img.closest('.shiny-wrapper')) return; // already wrapped
    const wrapper = document.createElement('div');
    wrapper.className = 'shiny-wrapper';
    img.parentNode.insertBefore(wrapper, img);
    wrapper.appendChild(img);
  });

  // 2. Register new cards with the reveal observer
  if (newCards && newCards.length > 0) {
    newCards.forEach(card => {
      if (card.classList.contains('reveal') && !card.classList.contains('revealed')) {
        revealObserver.observe(card);
      }
    });
  }

  // 3. Re-bind gallery filters (always needed — filter array needs current cards)
  bindGalleryFilters();

  // 4. Refresh scroll physics (lightweight — only runs if needed)
  if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
  if (typeof lenis !== 'undefined') lenis.resize();
};

document.addEventListener('DOMContentLoaded', () => {
  bindGalleryFilters();

  // LIGHTBOX MODAL LOGIC (Images & YouTube Videos)
  const lightbox = document.getElementById('galleryLightbox');
  if (lightbox) {
    const lightboxImg = lightbox.querySelector('.lightbox-img');
    const lightboxVideo = lightbox.querySelector('.lightbox-video');
    const lightboxTitle = lightbox.querySelector('.lightbox-title');
    const lightboxSub = lightbox.querySelector('.lightbox-sub');
    const closeBtn = lightbox.querySelector('.lightbox-close');
    const prevBtn = lightbox.querySelector('.lightbox-nav--prev');
    const nextBtn = lightbox.querySelector('.lightbox-nav--next');
    
    let activeCardsArray = [];
    let currentIndex = 0;
    
    function updateLightboxContent(idx) {
      if (idx < 0 || idx >= activeCardsArray.length) return;
      currentIndex = idx;
      const card = activeCardsArray[currentIndex];
      const img = card.querySelector('img');
      const rawCat = card.getAttribute('data-category') || 'Portfolio';
      const cat = rawCat.charAt(0).toUpperCase() + rawCat.slice(1);
      
      const vimeoId = card.getAttribute('data-vimeo-id');
      const youtubeId = card.getAttribute('data-youtube-id');
      const isVideo = card.getAttribute('data-media-type') === 'video' || !!vimeoId || !!youtubeId;
      const fullResUrl = card.getAttribute('data-full') || (img ? img.src : '');

      if (isVideo && (vimeoId || youtubeId)) {
        if (lightboxImg) lightboxImg.style.display = 'none';
        if (lightboxVideo) {
          lightboxVideo.style.display = 'block';
          if (vimeoId) {
            lightboxVideo.src = `https://player.vimeo.com/video/${vimeoId}?autoplay=1&title=0&byline=0&portrait=0`;
          } else {
            lightboxVideo.src = `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`;
          }
        }
      } else {
        if (lightboxVideo) {
          lightboxVideo.style.display = 'none';
          lightboxVideo.src = '';
        }
        if (lightboxImg) {
          lightboxImg.style.display = 'block';
          lightboxImg.src = fullResUrl;
          lightboxImg.alt = cat;
        }
      }

      if (lightboxSub) lightboxSub.textContent = cat;
    }

    function openLightbox(card) {
      const activeFilterBtn = document.querySelector('.gallery-filters .filter-btn.active');
      const currentFilter = activeFilterBtn ? activeFilterBtn.getAttribute('data-filter') : 'all';
      const allCards = Array.from(document.querySelectorAll('.gallery-masonry .gallery-card'));

      const visibleCards = allCards.filter(c => {
        if (currentFilter === 'all') return true;
        const cat = (c.getAttribute('data-category') || '').toLowerCase().trim();
        return cat === currentFilter.toLowerCase().trim();
      });

      activeCardsArray = visibleCards.length > 0 ? visibleCards : allCards;
      if (!activeCardsArray.includes(card)) {
        activeCardsArray = [card, ...activeCardsArray];
      }
      
      currentIndex = activeCardsArray.indexOf(card);
      if (currentIndex === -1) currentIndex = 0;
      
      updateLightboxContent(currentIndex);
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
      if (lightboxVideo) {
        lightboxVideo.src = '';
        lightboxVideo.style.display = 'none';
      }
    }

    // Delegation click listener to support static and dynamic Firestore cards
    document.addEventListener('click', (e) => {
      const card = e.target.closest('.gallery-card, .collage-item, .home-featured__item, .contact-split-media, .hero__image-wrapper, .editorial-image-wrapper');
      if (card && lightbox && !e.target.closest('.lightbox-modal')) {
        openLightbox(card);
      }
    });

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    
    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const prevIdx = (currentIndex - 1 + activeCardsArray.length) % activeCardsArray.length;
        updateLightboxContent(prevIdx);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const nextIdx = (currentIndex + 1) % activeCardsArray.length;
        updateLightboxContent(nextIdx);
      });
    }

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft' && prevBtn) prevBtn.click();
      if (e.key === 'ArrowRight' && nextBtn) nextBtn.click();
    });
  }
});

// -----------------------------------------------
// LUXURY EDITORIAL SPLIT ANIMATIONS (002-LUXURY-EDITORIAL-SPLIT)
// -----------------------------------------------
if (document.querySelector('.hero__layout')) {
  window.addEventListener('DOMContentLoaded', () => {
    const editorialTl = gsap.timeline({ defaults: { ease: "power2.out" } });

    // 1. Reveal image via clip-path
    editorialTl.fromTo('.hero__image-wrapper', 
      { clipPath: "inset(100% 0% 0% 0%)" },
      { clipPath: "inset(0% 0% 0% 0%)", duration: 0.9 }
    );

    // 2. Line-by-line staggered title reveal
    editorialTl.fromTo('.hero__title',
      { opacity: 0, y: 28 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.1 },
      "-=0.7"
    );

    // 3. Staggered reveal of eyebrow, description, and CTA
    editorialTl.fromTo(['.hero__eyebrow', '.hero__desc', '.hero__cta'],
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.7, stagger: 0.06 },
      "-=0.6"
    );
  });
}

// -----------------------------------------------
// CLICK TO COPY CONTACT INTERACTIVITY
// -----------------------------------------------
document.querySelectorAll('.js-copy-card').forEach(card => {
  card.addEventListener('click', () => {
    const textToCopy = card.getAttribute('data-copy');
    const typeLabel = card.getAttribute('data-type') || 'Contact';
    
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        const toast = document.getElementById('copyToast');
        if (toast) {
          toast.textContent = `Copied ${typeLabel} to Clipboard!`;
          toast.classList.add('show');
          setTimeout(() => toast.classList.remove('show'), 2500);
        }
      }).catch(() => {
        const toast = document.getElementById('copyToast');
        if (toast) {
          toast.textContent = `${textToCopy}`;
          toast.classList.add('show');
          setTimeout(() => toast.classList.remove('show'), 2500);
        }
      });
    }
  });
});

// -----------------------------------------------
// MOBILE APP BOTTOM DOCK SCROLL LOGIC
// -----------------------------------------------
let lastScrollYVal = window.scrollY;
const bottomNavEl = document.getElementById('mobileBottomNav');
if (bottomNavEl) {
  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    if (currentScrollY > 120 && currentScrollY > lastScrollYVal + 10) {
      bottomNavEl.classList.add('nav-hidden');
    } else {
      bottomNavEl.classList.remove('nav-hidden');
    }
    lastScrollYVal = currentScrollY;
  }, { passive: true });
}

// -----------------------------------------------
// MINIMAL REVIEWS SLIDER INTERACTION & TOUCH
// -----------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  const track = document.getElementById('reviewTrack');
  const viewport = document.getElementById('reviewViewport');
  const prevBtn = document.getElementById('reviewPrevBtn');
  const nextBtn = document.getElementById('reviewNextBtn');
  const dotsContainer = document.getElementById('reviewDots');

  if (!track || !viewport) return;

  const cards = Array.from(track.children);
  let currentIndex = 0;
  let autoplayTimer = null;
  let isDragging = false;
  let startPos = 0;
  let currentTranslate = 0;
  let prevTranslate = 0;
  let animationID = 0;

  function getVisibleCards() {
    return window.innerWidth <= 992 ? 1 : 2;
  }

  function getMaxIndex() {
    const visible = getVisibleCards();
    return Math.max(0, cards.length - visible);
  }

  // Create dot indicators
  function createDots() {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    const maxIdx = getMaxIndex();
    for (let i = 0; i <= maxIdx; i++) {
      const dot = document.createElement('button');
      dot.className = `review-dot ${i === currentIndex ? 'active' : ''}`;
      dot.setAttribute('aria-label', `Go to review slide ${i + 1}`);
      dot.addEventListener('click', () => goToSlide(i));
      dotsContainer.appendChild(dot);
    }
  }

  function updateDots() {
    if (!dotsContainer) return;
    const dots = dotsContainer.querySelectorAll('.review-dot');
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentIndex);
    });
  }

  function goToSlide(index) {
    const maxIdx = getMaxIndex();
    currentIndex = Math.max(0, Math.min(index, maxIdx));

    const cardWidth = cards[0].offsetWidth;
    const gap = 32;
    const offset = currentIndex * (cardWidth + gap);

    track.style.transform = `translateX(-${offset}px)`;
    prevTranslate = -offset;
    currentTranslate = -offset;

    updateDots();
  }

  // Prev / Next button actions
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentIndex > 0) {
        goToSlide(currentIndex - 1);
      } else {
        goToSlide(getMaxIndex());
      }
      resetAutoplay();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (currentIndex < getMaxIndex()) {
        goToSlide(currentIndex + 1);
      } else {
        goToSlide(0);
      }
      resetAutoplay();
    });
  }

  // Touch / Drag events for side sliding
  function getPositionX(event) {
    return event.type.includes('mouse') ? event.clientX : event.touches[0].clientX;
  }

  function touchStart(event) {
    isDragging = true;
    startPos = getPositionX(event);
    track.style.transition = 'none';
    animationID = requestAnimationFrame(animation);
  }

  function touchMove(event) {
    if (!isDragging) return;
    const currentPosition = getPositionX(event);
    currentTranslate = prevTranslate + currentPosition - startPos;
  }

  function touchEnd() {
    isDragging = false;
    cancelAnimationFrame(animationID);
    track.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';

    const movedBy = currentTranslate - prevTranslate;
    if (movedBy < -50 && currentIndex < getMaxIndex()) {
      currentIndex += 1;
    } else if (movedBy > 50 && currentIndex > 0) {
      currentIndex -= 1;
    }

    goToSlide(currentIndex);
    resetAutoplay();
  }

  function animation() {
    track.style.transform = `translateX(${currentTranslate}px)`;
    if (isDragging) requestAnimationFrame(animation);
  }

  viewport.addEventListener('mousedown', touchStart);
  viewport.addEventListener('mousemove', touchMove);
  viewport.addEventListener('mouseup', touchEnd);
  viewport.addEventListener('mouseleave', () => { if (isDragging) touchEnd(); });

  viewport.addEventListener('touchstart', touchStart, { passive: true });
  viewport.addEventListener('touchmove', touchMove, { passive: true });
  viewport.addEventListener('touchend', touchEnd);

  // Autoplay
  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(() => {
      if (currentIndex < getMaxIndex()) {
        goToSlide(currentIndex + 1);
      } else {
        goToSlide(0);
      }
    }, 6000);
  }

  function stopAutoplay() {
    if (autoplayTimer) clearInterval(autoplayTimer);
  }

  function resetAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  viewport.addEventListener('mouseenter', stopAutoplay);
  viewport.addEventListener('mouseleave', startAutoplay);

  // Resize handler
  window.addEventListener('resize', () => {
    createDots();
    goToSlide(currentIndex);
  });

  createDots();
  goToSlide(0);
  startAutoplay();
});


