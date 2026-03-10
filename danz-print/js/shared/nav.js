/**
 * nav.js
 * Injects shared navigation and footer into placeholder elements.
 * Expects <nav id="site-nav"></nav> and <footer id="site-footer"></footer> in the page.
 */
(function() {
  'use strict';

  var currentPage = window.location.pathname.split('/').pop() || 'index.html';

  function isActive(page) {
    if (page === 'index.html' && (currentPage === '' || currentPage === '/' || currentPage === 'index.html')) return true;
    return currentPage === page;
  }

  var navHTML = '' +
    '<div class="nav-logo"><a href="index.html" style="text-decoration:none;-webkit-text-fill-color:inherit;">Alpaca3D</a></div>' +
    '<button class="hamburger" id="hamburger" aria-label="Toggle menu">' +
      '<span></span><span></span><span></span>' +
    '</button>' +
    '<ul class="nav-links" id="nav-links">' +
      '<li><a href="index.html" class="' + (isActive('index.html') ? 'active' : '') + '">Home</a></li>' +
      '<li><a href="playground.html" class="' + (isActive('playground.html') ? 'active' : '') + '">Playground</a></li>' +
      '<li><a href="gallery.html" class="' + (isActive('gallery.html') ? 'active' : '') + '">Gallery</a></li>' +
      '<li><a href="dashboard.html" class="' + (isActive('dashboard.html') ? 'active' : '') + '">Dashboard</a></li>' +
      '<li><a href="about.html" class="' + (isActive('about.html') ? 'active' : '') + '">About</a></li>' +
      '<li><a href="https://github.com/cryptokoh/alpacca3d" target="_blank">GitHub</a></li>' +
    '</ul>' +
    '<button class="sound-toggle" id="sound-toggle" aria-label="Toggle ambient sound" title="Toggle ambient sound">' +
      '<span class="sound-icon">&#128264;</span>' +
    '</button>';

  var footerHTML = '' +
    '<div class="footer-brand">Alpaca3D</div>' +
    '<ul class="footer-links">' +
      '<li><a href="index.html">Home</a></li>' +
      '<li><a href="playground.html">Playground</a></li>' +
      '<li><a href="gallery.html">Gallery</a></li>' +
      '<li><a href="dashboard.html">Dashboard</a></li>' +
      '<li><a href="about.html">About</a></li>' +
      '<li><a href="https://github.com/cryptokoh/alpacca3d" target="_blank">GitHub</a></li>' +
    '</ul>' +
    '<p class="footer-copy">Built with Claude Code. Powered by caffeine and filament.</p>';

  function init() {
    // Inject nav
    var navEl = document.getElementById('site-nav');
    if (navEl) navEl.innerHTML = navHTML;

    // Inject footer
    var footerEl = document.getElementById('site-footer');
    if (footerEl) footerEl.innerHTML = footerHTML;

    // Hamburger toggle
    var hamburger = document.getElementById('hamburger');
    var navLinks = document.getElementById('nav-links');
    if (hamburger && navLinks) {
      hamburger.addEventListener('click', function() {
        navLinks.classList.toggle('open');
        hamburger.classList.toggle('open');
      });
    }
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
