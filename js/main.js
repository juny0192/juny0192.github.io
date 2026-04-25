(function () {
  'use strict';

  /* ── Nav scroll effect ── */
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  /* ── Nav links: center section in viewport on click ── */
  document.querySelectorAll('.nav-links a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      const rect      = target.getBoundingClientRect();
      const sectionH  = Math.min(rect.height, window.innerHeight);
      const scrollTo  = window.scrollY + rect.top - (window.innerHeight - sectionH) / 2;
      window.scrollTo({ top: Math.max(0, scrollTo), behavior: 'smooth' });
    });
  });

  /* ── Build slots array (images + AON Charlotte, NC card) ── */
  const gallery = document.getElementById('gallery');
  const { totalPages, aonCharlottePages } = GALLERY_CONFIG;

  // Each slot is { type:'image', pageNum } or { type:'coming-soon' }
  const slots = [];
  for (let i = 1; i <= totalPages; i++) {
    if (!aonCharlottePages.includes(i)) {
      slots.push({ type: 'image', pageNum: i });
    }
    if (i === 20) {
      slots.push({ type: 'coming-soon' });
    }
  }

  const lastPageNum = slots.filter(s => s.type === 'image').at(-1).pageNum;

  slots.forEach((slot, index) => {
    if (slot.type === 'image') {
      const num  = String(slot.pageNum).padStart(2, '0');
      const item = document.createElement('div');
      item.className = 'gallery-item';
      if (slot.pageNum === 1 || slot.pageNum === lastPageNum) {
        item.classList.add('gallery-item--full');
      }
      const img = document.createElement('img');
      img.src     = `images/page-${num}.jpg`;
      img.alt     = `Portfolio page ${slot.pageNum}`;
      img.loading = 'lazy';
      item.appendChild(img);
      item.addEventListener('click', () => openLightbox(index));
      gallery.appendChild(item);
    } else {
      const card = document.createElement('div');
      card.className = 'gallery-coming-soon';
      card.innerHTML = `
        <div class="gallery-coming-soon-inner">
          <p class="coming-soon-project-name">AON Charlotte, NC</p>
          <p class="coming-soon-note">Completed photos coming soon</p>
        </div>`;
      card.style.cursor = 'pointer';
      card.addEventListener('click', () => openLightbox(index));
      gallery.appendChild(card);
    }
  });

  /* ── Image-download deterrents (right-click + drag) ── */
  document.addEventListener('contextmenu', (e) => {
    if (e.target.tagName === 'IMG' || e.target.classList.contains('img-protect-overlay')) {
      e.preventDefault();
    }
  });
  document.addEventListener('dragstart', (e) => {
    if (e.target.tagName === 'IMG') e.preventDefault();
  });

  /* ── Lightbox ── */
  const lb        = document.getElementById('lightbox');
  const lbImgWrap = lb.querySelector('.lb-img-wrap');
  const lbImg     = lb.querySelector('.lb-img');
  const lbClose   = lb.querySelector('.lb-close');
  const lbPrev    = lb.querySelector('.lb-prev');
  const lbNext    = lb.querySelector('.lb-next');

  // Add coming-soon panel inside lightbox
  const lbCS = document.createElement('div');
  lbCS.className = 'lb-coming-soon';
  lbCS.innerHTML = `
    <p class="lb-cs-title">AON Charlotte, NC</p>
    <p class="lb-cs-note">Completed photos coming soon</p>`;
  lb.appendChild(lbCS);

  let current = 0;

  function openLightbox(index) {
    current = index;
    showSlot(current);
    lb.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lb.classList.remove('active');
    document.body.style.overflow = '';
  }

  function showSlot(index) {
    const slot = slots[index];
    if (slot.type === 'image') {
      const num = String(slot.pageNum).padStart(2, '0');
      lbImg.src = `images/page-${num}.jpg`;
      lbImgWrap.style.display = '';
      lbCS.style.display = 'none';
    } else {
      lbImgWrap.style.display = 'none';
      lbCS.style.display = 'flex';
    }
  }

  function prev() {
    current = (current - 1 + slots.length) % slots.length;
    showSlot(current);
  }

  function next() {
    current = (current + 1) % slots.length;
    showSlot(current);
  }

  lbClose.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', prev);
  lbNext.addEventListener('click', next);

  /* ── View Resume button (hero) — opens lightbox standalone ── */
  let resumeMode = false;
  const resumeBtn = document.getElementById('view-resume-btn');
  if (resumeBtn) {
    resumeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      resumeMode = true;
      lbImg.src = 'images/resume/resume-01.jpg';
      lbImgWrap.style.display = '';
      lbCS.style.display = 'none';
      lbPrev.style.display = 'none';
      lbNext.style.display = 'none';
      lb.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  }
  // Restore prev/next visibility when closing resume mode
  const _origClose = closeLightbox;
  lbClose.addEventListener('click', () => {
    if (resumeMode) {
      lbPrev.style.display = '';
      lbNext.style.display = '';
      resumeMode = false;
    }
  });
  lb.addEventListener('click', (e) => {
    if (e.target === lb && resumeMode) {
      lbPrev.style.display = '';
      lbNext.style.display = '';
      resumeMode = false;
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && resumeMode) {
      lbPrev.style.display = '';
      lbNext.style.display = '';
      resumeMode = false;
    }
  });

  lb.addEventListener('click', (e) => {
    if (e.target === lb) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('active')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  prev();
    if (e.key === 'ArrowRight') next();
  });
})();
