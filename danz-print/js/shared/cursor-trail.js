/**
 * cursor-trail.js
 * Rainbow cursor trail using pooled divs. Disabled on mobile/touch devices.
 */
(function() {
  // Skip on touch devices
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;

  var POOL_SIZE = 20;
  var colors = [
    '#6c2bd9', '#8b5cf6', '#a78bfa', '#c084fc', '#e040fb',
    '#e879f9', '#f0abfc', '#00e5ff', '#67e8f9', '#76ff03',
    '#a3e635', '#fbbf24', '#f97316', '#ef4444', '#ec4899',
    '#8b5cf6', '#6366f1', '#3b82f6', '#06b6d4', '#14b8a6'
  ];

  var dots = [];
  for (var i = 0; i < POOL_SIZE; i++) {
    var dot = document.createElement('div');
    dot.style.cssText =
      'position:fixed;' +
      'pointer-events:none;' +
      'z-index:9999;' +
      'width:8px;' +
      'height:8px;' +
      'border-radius:50%;' +
      'opacity:0;' +
      'transition:opacity 0.3s,transform 0.3s;' +
      'transform:scale(0);';
    document.body.appendChild(dot);
    dots.push({ el: dot, timeout: null });
  }

  var currentIndex = 0;
  var lastX = 0;
  var lastY = 0;
  var frameCount = 0;

  document.addEventListener('mousemove', function(e) {
    // Only spawn every 3rd frame for performance
    frameCount++;
    if (frameCount % 3 !== 0) return;

    var dx = e.clientX - lastX;
    var dy = e.clientY - lastY;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 5) return; // Skip if mouse barely moved

    lastX = e.clientX;
    lastY = e.clientY;

    var d = dots[currentIndex];
    var size = Math.min(12, 6 + dist * 0.1) + 'px';
    d.el.style.left = e.clientX - 4 + 'px';
    d.el.style.top = e.clientY - 4 + 'px';
    d.el.style.background = colors[currentIndex % colors.length];
    d.el.style.opacity = '0.7';
    d.el.style.transform = 'scale(1)';
    d.el.style.width = size;
    d.el.style.height = size;

    // Fade out after delay
    clearTimeout(d.timeout);
    d.timeout = setTimeout(function() {
      d.el.style.opacity = '0';
      d.el.style.transform = 'scale(0)';
    }, 200);

    currentIndex = (currentIndex + 1) % POOL_SIZE;
  });
})();
