/* ── GALLERY ──
   Filterable masonry gallery with lightbox detail view.
   Reads data from window.Alpaca3D.galleryItems.
*/

(function() {
  'use strict';

  var items = (window.Alpaca3D && window.Alpaca3D.galleryItems) || [];
  var grid = document.getElementById('gallery-grid');
  var filterBtns = document.querySelectorAll('.filter-btn');
  var lightboxOverlay = document.getElementById('lightbox');
  var lightboxBody = document.getElementById('lightbox-body');
  var lightboxClose = document.getElementById('lightbox-close');
  var currentFilter = 'all';

  /* ── Category color map ── */
  var categoryColors = {
    functional: { bg: 'rgba(0,229,255,0.12)', color: '#67e8f9', label: 'Functional' },
    art:        { bg: 'rgba(224,64,251,0.12)', color: '#e879f9', label: 'Art' },
    figurines:  { bg: 'rgba(118,255,3,0.12)',  color: '#a3e635', label: 'Figurines' }
  };

  /* ── Render cards ── */
  function renderCards(filter) {
    var filtered = filter === 'all' ? items : items.filter(function(i) { return i.category === filter; });
    grid.innerHTML = '';

    filtered.forEach(function(item, idx) {
      var cat = categoryColors[item.category] || categoryColors.art;
      var card = document.createElement('div');
      card.className = 'gallery-card';
      card.style.animationDelay = (idx * 0.06) + 's';

      card.innerHTML =
        '<div class="gallery-card-image" style="background:' + item.gradient + '"></div>' +
        '<div class="gallery-card-body">' +
          '<div class="gallery-card-title">' + item.title + '</div>' +
          '<div class="gallery-card-meta">' +
            '<span class="gallery-card-tag" style="background:rgba(108,43,217,0.15);color:#a78bfa;">' + item.material + '</span>' +
            '<span class="gallery-card-tag" style="background:rgba(0,229,255,0.15);color:#67e8f9;">' + item.printTime + '</span>' +
            '<span class="gallery-card-tag" style="background:' + cat.bg + ';color:' + cat.color + ';">' + cat.label + '</span>' +
          '</div>' +
        '</div>';

      card.addEventListener('click', function() { openLightbox(item); });
      grid.appendChild(card);

      /* Staggered entrance animation */
      requestAnimationFrame(function() {
        card.classList.add('gallery-card-visible');
      });
    });
  }

  /* ── Lightbox ── */
  function openLightbox(item) {
    var cat = categoryColors[item.category] || categoryColors.art;

    lightboxBody.innerHTML =
      '<div class="lightbox-image" style="background:' + item.gradient + '"></div>' +
      '<h2 class="lightbox-title">' + item.title + '</h2>' +
      '<p class="lightbox-desc">' + item.description + '</p>' +
      '<div class="lightbox-specs">' +
        '<div class="lightbox-spec">' +
          '<span class="lightbox-spec-label">Material</span>' +
          '<span class="lightbox-spec-value">' + item.material + '</span>' +
        '</div>' +
        '<div class="lightbox-spec">' +
          '<span class="lightbox-spec-label">Print Time</span>' +
          '<span class="lightbox-spec-value">' + item.printTime + '</span>' +
        '</div>' +
        '<div class="lightbox-spec">' +
          '<span class="lightbox-spec-label">Layer Height</span>' +
          '<span class="lightbox-spec-value">' + item.layerHeight + '</span>' +
        '</div>' +
        '<div class="lightbox-spec">' +
          '<span class="lightbox-spec-label">Infill</span>' +
          '<span class="lightbox-spec-value">' + item.infill + '</span>' +
        '</div>' +
        '<div class="lightbox-spec">' +
          '<span class="lightbox-spec-label">Category</span>' +
          '<span class="lightbox-spec-value" style="color:' + cat.color + '">' + cat.label + '</span>' +
        '</div>' +
      '</div>';

    lightboxOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightboxOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  /* ── Event listeners ── */
  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }

  if (lightboxOverlay) {
    lightboxOverlay.addEventListener('click', function(e) {
      if (e.target === lightboxOverlay) {
        closeLightbox();
      }
    });
  }

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeLightbox();
    }
  });

  filterBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      filterBtns.forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderCards(currentFilter);
    });
  });

  /* ── Initial render ── */
  renderCards('all');
})();
