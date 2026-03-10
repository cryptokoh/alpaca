/**
 * alpaca-scene.js
 * Sets up the Three.js renderer, scene, camera, and animation loop.
 * Auto-initializes if #wireframe-bg canvas exists on the page.
 * Exposes window.Alpaca3D.initScene(canvasId, options)
 */
(function() {
  'use strict';

  window.Alpaca3D = window.Alpaca3D || {};

  /**
   * Initialize the full alpaca 3D scene.
   * @param {string} canvasId - ID of the canvas element (without #)
   * @param {Object} [options] - Configuration options
   * @param {boolean} [options.enableSpit=true] - Enable rainbow spit on scroll
   * @param {number} [options.particleCount=120] - Number of floating particles
   * @param {number[]} [options.cameraPos=[0,2,12]] - Camera position [x, y, z]
   * @returns {{ scene, camera, renderer, alpacaGroup, alpacaParts, particles, spitSystem }}
   */
  window.Alpaca3D.initScene = function(canvasId, options) {
    if (typeof THREE === 'undefined') return null;

    options = options || {};
    var enableSpit = options.enableSpit !== undefined ? options.enableSpit : true;
    var particleCount = options.particleCount || 120;
    var cameraPos = options.cameraPos || [0, 2, 12];

    var canvas = document.getElementById(canvasId);
    if (!canvas) return null;

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: false,
        powerPreference: 'low-power'
      });
    } catch(e) {
      return null;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(cameraPos[0], cameraPos[1], cameraPos[2]);
    camera.lookAt(0, 1, 0);

    // Build the alpaca
    var alpaca = window.Alpaca3D.buildAlpaca(options);
    var alpacaGroup = alpaca.group;
    var alpacaParts = alpaca.parts;

    // Center the group
    alpacaGroup.position.set(0, -2.2, 0);
    scene.add(alpacaGroup);

    // Create floating particles
    var particles = window.Alpaca3D.createParticles(scene, particleCount);

    // Create rainbow spit system
    var spitSystem = null;
    if (enableSpit) {
      spitSystem = window.Alpaca3D.createSpitSystem(scene, alpacaGroup);
    }

    // ── Mouse tracking ──
    var mouseX = 0;
    var mouseY = 0;
    document.addEventListener('mousemove', function(e) {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    // ── Animation loop ──
    var clock = new THREE.Clock();
    function animate() {
      requestAnimationFrame(animate);
      var t = clock.getElapsedTime();

      // Slow auto-rotation
      alpacaGroup.rotation.y += 0.003;
      // Gentle floating motion
      alpacaGroup.position.y = -2.2 + Math.sin(t * 0.5) * 0.3;
      // Mouse parallax
      alpacaGroup.rotation.x += (mouseY * 0.15 - alpacaGroup.rotation.x) * 0.02;
      alpacaGroup.rotation.z += (mouseX * -0.08 - alpacaGroup.rotation.z) * 0.02;

      // Animate wool to "breathe"
      var breathe = 1 + Math.sin(t * 1.2) * 0.03;
      alpacaParts.wool.scale.set(breathe, breathe, breathe);

      // Rotate particles slowly
      particles.rotation.y = t * 0.05;
      particles.rotation.x = t * 0.02;

      // Ear wiggle
      alpacaGroup.children.forEach(function(child) {
        if (child.geometry && child.geometry.type === 'ConeGeometry') {
          child.rotation.z = 0.3 + Math.sin(t * 2 + child.position.z * 5) * 0.1;
        }
      });

      // Update rainbow spit particles
      if (spitSystem) {
        spitSystem.update();
      }

      renderer.render(scene, camera);
    }
    animate();

    // ── Handle resize ──
    window.addEventListener('resize', function() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    var result = {
      scene: scene,
      camera: camera,
      renderer: renderer,
      alpacaGroup: alpacaGroup,
      alpacaParts: alpacaParts,
      particles: particles,
      spitSystem: spitSystem
    };

    // Store reference globally for other modules
    window.Alpaca3D._activeScene = result;

    return result;
  };

  // ── Auto-initialize if #wireframe-bg canvas exists ──
  function autoInit() {
    if (document.getElementById('wireframe-bg')) {
      window.Alpaca3D.initScene('wireframe-bg', {
        enableSpit: true,
        particleCount: 120,
        cameraPos: [0, 2, 12]
      });
    }
  }

  // Run auto-init when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    autoInit();
  }

})();
