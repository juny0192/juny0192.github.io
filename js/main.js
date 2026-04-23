(function () {
  'use strict';

  /* ── Nav scroll effect ── */
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  /* ── Gallery ── */
  const gallery = document.getElementById('gallery');
  const { totalPages, aonCharlottePages } = GALLERY_CONFIG;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (!aonCharlottePages.includes(i)) pages.push(i);
  }

  pages.forEach((pageNum) => {
    const num  = String(pageNum).padStart(2, '0');
    const src  = `images/page-${num}.jpg`;
    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.dataset.index = pages.indexOf(pageNum);
    const img = document.createElement('img');
    img.src   = src;
    img.alt   = `Portfolio page ${pageNum}`;
    img.loading = 'lazy';
    item.appendChild(img);
    item.addEventListener('click', () => openLightbox(pages.indexOf(pageNum)));
    gallery.appendChild(item);
  });

  /* ── Lightbox ── */
  const lb      = document.getElementById('lightbox');
  const lbImg   = lb.querySelector('.lb-img');
  const lbClose = lb.querySelector('.lb-close');
  const lbPrev  = lb.querySelector('.lb-prev');
  const lbNext  = lb.querySelector('.lb-next');
  let current   = 0;

  function openLightbox(index) {
    current = index;
    showImage(current);
    lb.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lb.classList.remove('active');
    document.body.style.overflow = '';
  }

  function showImage(index) {
    const num = String(pages[index]).padStart(2, '0');
    lbImg.src = `images/page-${num}.jpg`;
  }

  function prev() {
    current = (current - 1 + pages.length) % pages.length;
    showImage(current);
  }

  function next() {
    current = (current + 1) % pages.length;
    showImage(current);
  }

  lbClose.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', prev);
  lbNext.addEventListener('click', next);

  lb.addEventListener('click', (e) => {
    if (e.target === lb || e.target === lb.querySelector('.lb-img-wrap')) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('active')) return;
    if (e.key === 'Escape')      closeLightbox();
    if (e.key === 'ArrowLeft')   prev();
    if (e.key === 'ArrowRight')  next();
  });
})();
