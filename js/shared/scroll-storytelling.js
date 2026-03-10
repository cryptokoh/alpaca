/**
 * scroll-storytelling.js
 * Pipeline sequential animation and grid stagger effects.
 * Include AFTER scroll-effects.js.
 */
(function() {
  'use strict';

  function init() {
    // Pipeline sequential animation
    var pipelineSteps = document.querySelectorAll('.pipeline-step');
    var pipelineArrows = document.querySelectorAll('.pipeline-arrow');

    if (pipelineSteps.length > 0) {
      var pipelineObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            // Animate steps sequentially with delays
            Array.prototype.forEach.call(pipelineSteps, function(step, i) {
              setTimeout(function() {
                step.classList.add('visible');
              }, i * 300);
            });
            // Animate arrows
            Array.prototype.forEach.call(pipelineArrows, function(arrow, i) {
              setTimeout(function() {
                arrow.style.opacity = '1';
                arrow.style.transform = arrow.style.transform || 'none';
              }, i * 300 + 150);
            });
            pipelineObserver.disconnect();
          }
        });
      }, { threshold: 0.3 });

      var pipelineSection = document.querySelector('.pipeline-section') || document.querySelector('.pipeline');
      if (pipelineSection) pipelineObserver.observe(pipelineSection);
    }

    // Stagger children animation for grids
    var grids = document.querySelectorAll('.stack-grid, .features-grid, .philosophy-grid');
    grids.forEach(function(grid) {
      var gridObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            var children = entry.target.children;
            Array.prototype.forEach.call(children, function(child, i) {
              setTimeout(function() {
                child.style.opacity = '1';
                child.style.transform = 'translateY(0)';
              }, i * 150);
            });
            gridObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });

      // Set initial state
      Array.prototype.forEach.call(grid.children, function(child) {
        child.style.opacity = '0';
        child.style.transform = 'translateY(30px)';
        child.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      });

      gridObserver.observe(grid);
    });

    // Parallax scroll effect for hero
    var hero = document.querySelector('.hero');
    if (hero) {
      window.addEventListener('scroll', function() {
        var scroll = window.scrollY;
        var heroHeight = hero.offsetHeight;
        if (scroll < heroHeight) {
          var opacity = 1 - (scroll / heroHeight) * 0.5;
          var translateY = scroll * 0.3;
          hero.style.opacity = opacity;
          hero.style.transform = 'translateY(' + translateY + 'px)';
        }
      }, { passive: true });
    }
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
