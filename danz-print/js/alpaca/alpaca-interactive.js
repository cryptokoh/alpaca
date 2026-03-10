/**
 * alpaca-interactive.js
 * Raycaster-based interaction for the wireframe alpaca.
 * Click for rainbow burst, drag to rotate, hover for cursor changes.
 * Exposes window.Alpaca3D.makeInteractive(canvas, scene, camera, alpacaGroup)
 */
(function() {
  'use strict';

  window.Alpaca3D = window.Alpaca3D || {};

  /**
   * Make an alpaca group interactive with mouse and touch controls.
   * @param {HTMLCanvasElement} canvas - The renderer's canvas element
   * @param {THREE.Scene} scene - The Three.js scene
   * @param {THREE.Camera} camera - The Three.js camera
   * @param {THREE.Group} alpacaGroup - The alpaca group to interact with
   * @returns {{ isAutoRotating: Function }}
   */
  window.Alpaca3D.makeInteractive = function(canvas, scene, camera, alpacaGroup) {
    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2();
    var isDragging = false;
    var dragMoved = false;
    var previousMouse = { x: 0, y: 0 };
    var autoRotate = true;
    var autoRotateTimer = null;

    /**
     * Recursively collect all meshes from a group for raycasting.
     * @param {THREE.Group} group
     * @returns {THREE.Mesh[]}
     */
    function getAllMeshes(group) {
      var meshes = [];
      group.traverse(function(child) {
        if (child.isMesh) meshes.push(child);
      });
      return meshes;
    }

    /**
     * Update mouse coordinates from an event.
     * @param {MouseEvent|Touch} e
     */
    function updateMouse(e) {
      var rect = canvas.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    }

    /**
     * Schedules auto-rotate to resume after user stops dragging.
     */
    function scheduleAutoRotate() {
      if (autoRotateTimer) clearTimeout(autoRotateTimer);
      autoRotateTimer = setTimeout(function() {
        autoRotate = true;
      }, 3000);
    }

    // ── Click: rainbow burst ──
    canvas.addEventListener('click', function(e) {
      // Only fire burst if user did not drag
      if (dragMoved) return;
      updateMouse(e);
      raycaster.setFromCamera(mouse, camera);
      var hits = raycaster.intersectObjects(getAllMeshes(alpacaGroup), true);
      if (hits.length > 0) {
        // Big burst effect - multiple spit bursts
        if (window.Alpaca3D._playgroundSpit) {
          for (var i = 0; i < 5; i++) {
            window.Alpaca3D._playgroundSpit.spawnBurst();
          }
        }
        // Flash the hit mesh briefly
        var hitMesh = hits[0].object;
        if (hitMesh && hitMesh.material) {
          var origOpacity = hitMesh.material.opacity;
          hitMesh.material.opacity = 1.0;
          setTimeout(function() {
            hitMesh.material.opacity = origOpacity;
          }, 200);
        }
      }
    });

    // ── Mouse drag: user-controlled rotation ──
    canvas.addEventListener('mousedown', function(e) {
      isDragging = true;
      dragMoved = false;
      previousMouse = { x: e.clientX, y: e.clientY };

      var onMove = function(ev) {
        var dx = ev.clientX - previousMouse.x;
        var dy = ev.clientY - previousMouse.y;
        // Only count as a drag if moved more than 3px
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
          dragMoved = true;
          autoRotate = false;
          alpacaGroup.rotation.y += dx * 0.01;
          alpacaGroup.rotation.x += dy * 0.005;
          // Clamp vertical rotation
          alpacaGroup.rotation.x = Math.max(-0.5, Math.min(0.5, alpacaGroup.rotation.x));
        }
        previousMouse = { x: ev.clientX, y: ev.clientY };
      };

      var onUp = function() {
        isDragging = false;
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        scheduleAutoRotate();
      };

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });

    // ── Touch support ──
    var touchStartPos = { x: 0, y: 0 };
    var touchMoved = false;

    canvas.addEventListener('touchstart', function(e) {
      if (e.touches.length === 1) {
        e.preventDefault();
        var touch = e.touches[0];
        touchStartPos = { x: touch.clientX, y: touch.clientY };
        previousMouse = { x: touch.clientX, y: touch.clientY };
        touchMoved = false;
      }
    }, { passive: false });

    canvas.addEventListener('touchmove', function(e) {
      if (e.touches.length === 1) {
        e.preventDefault();
        var touch = e.touches[0];
        var dx = touch.clientX - previousMouse.x;
        var dy = touch.clientY - previousMouse.y;
        if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
          touchMoved = true;
          autoRotate = false;
          alpacaGroup.rotation.y += dx * 0.01;
          alpacaGroup.rotation.x += dy * 0.005;
          alpacaGroup.rotation.x = Math.max(-0.5, Math.min(0.5, alpacaGroup.rotation.x));
        }
        previousMouse = { x: touch.clientX, y: touch.clientY };
      }
    }, { passive: false });

    canvas.addEventListener('touchend', function(e) {
      if (!touchMoved) {
        // Treat as a tap - trigger burst
        updateMouse({ clientX: touchStartPos.x, clientY: touchStartPos.y });
        raycaster.setFromCamera(mouse, camera);
        var hits = raycaster.intersectObjects(getAllMeshes(alpacaGroup), true);
        if (hits.length > 0 && window.Alpaca3D._playgroundSpit) {
          for (var i = 0; i < 5; i++) {
            window.Alpaca3D._playgroundSpit.spawnBurst();
          }
        }
      }
      scheduleAutoRotate();
    });

    // ── Hover glow / cursor change ──
    canvas.addEventListener('mousemove', function(e) {
      if (isDragging) return;
      updateMouse(e);
      raycaster.setFromCamera(mouse, camera);
      var hits = raycaster.intersectObjects(getAllMeshes(alpacaGroup), true);
      canvas.style.cursor = hits.length > 0 ? 'grab' : 'default';
    });

    return {
      isAutoRotating: function() { return autoRotate; },
      setAutoRotate: function(val) { autoRotate = val; }
    };
  };

})();
