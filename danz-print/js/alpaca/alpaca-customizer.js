/**
 * alpaca-customizer.js
 * Color picker and accessory system for the Playground page.
 * Exposes window.Alpaca3D.initCustomizer(containerEl, alpacaParts)
 */
(function() {
  'use strict';

  window.Alpaca3D = window.Alpaca3D || {};

  var defaultColors = {
    wool: '#a78bfa',
    body: '#8b5cf6',
    hooves: '#00e5ff',
    eyes: '#00e5ff',
    ears: '#e040fb',
    floof: '#f0abfc',
    tail: '#76ff03'
  };

  /**
   * Initialize the customizer UI and wire up all controls.
   * @param {HTMLElement} containerEl - The DOM element to render controls into
   * @param {Object} alpacaParts - Named references to alpaca meshes from buildAlpaca()
   */
  window.Alpaca3D.initCustomizer = function(containerEl, alpacaParts) {
    if (!containerEl || !alpacaParts) return;

    var colors = {};
    var key;
    for (key in defaultColors) {
      if (defaultColors.hasOwnProperty(key)) {
        colors[key] = defaultColors[key];
      }
    }

    var accessories = {};

    // Build UI
    var colorItems = '';
    for (key in colors) {
      if (colors.hasOwnProperty(key)) {
        var label = key.charAt(0).toUpperCase() + key.slice(1);
        colorItems += '<label class="color-picker-item">' +
          '<span>' + label + '</span>' +
          '<input type="color" value="' + colors[key] + '" data-part="' + key + '">' +
          '</label>';
      }
    }

    containerEl.innerHTML =
      '<div class="customizer-section">' +
        '<h4>Colors</h4>' +
        '<div class="color-picker-grid">' + colorItems + '</div>' +
      '</div>' +
      '<div class="customizer-section">' +
        '<h4>Accessories</h4>' +
        '<div class="accessory-toggles">' +
          '<button class="accessory-btn" data-accessory="hat">&#127913; Party Hat</button>' +
          '<button class="accessory-btn" data-accessory="sunglasses">&#128526; Shades</button>' +
          '<button class="accessory-btn" data-accessory="bowtie">&#127872; Bowtie</button>' +
          '<button class="accessory-btn" data-accessory="horn">&#127882; Horn</button>' +
        '</div>' +
      '</div>' +
      '<div class="customizer-section">' +
        '<h4>Actions</h4>' +
        '<div class="customizer-actions">' +
          '<button class="btn btn-secondary" id="randomize-btn">&#127922; Randomize</button>' +
          '<button class="btn btn-secondary" id="reset-btn">&#8634; Reset</button>' +
          '<button class="btn btn-primary" id="screenshot-btn">&#128247; Screenshot</button>' +
        '</div>' +
      '</div>';

    // ── Color picker handlers ──
    var colorInputs = containerEl.querySelectorAll('input[type="color"]');
    for (var i = 0; i < colorInputs.length; i++) {
      colorInputs[i].addEventListener('input', function(e) {
        var part = e.target.dataset.part;
        var color = e.target.value;
        applyColor(part, color, alpacaParts);
      });
    }

    // ── Accessory handlers ──
    var accBtns = containerEl.querySelectorAll('.accessory-btn');
    for (var j = 0; j < accBtns.length; j++) {
      accBtns[j].addEventListener('click', function() {
        var acc = this.dataset.accessory;
        this.classList.toggle('active');
        toggleAccessory(acc, this.classList.contains('active'), alpacaParts, accessories);
      });
    }

    // ── Randomize ──
    var randomizeBtn = document.getElementById('randomize-btn');
    if (randomizeBtn) {
      randomizeBtn.addEventListener('click', function() {
        var inputs = containerEl.querySelectorAll('input[type="color"]');
        for (var k = 0; k < inputs.length; k++) {
          var randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
          inputs[k].value = randomColor;
          applyColor(inputs[k].dataset.part, randomColor, alpacaParts);
        }
      });
    }

    // ── Reset ──
    var resetBtn = document.getElementById('reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', function() {
        for (var part in defaultColors) {
          if (defaultColors.hasOwnProperty(part)) {
            var input = containerEl.querySelector('input[data-part="' + part + '"]');
            if (input) input.value = defaultColors[part];
            applyColor(part, defaultColors[part], alpacaParts);
          }
        }
        // Remove all accessories
        var activeBtns = containerEl.querySelectorAll('.accessory-btn.active');
        for (var m = 0; m < activeBtns.length; m++) {
          activeBtns[m].classList.remove('active');
          toggleAccessory(activeBtns[m].dataset.accessory, false, alpacaParts, accessories);
        }
      });
    }

    // ── Screenshot ──
    var screenshotBtn = document.getElementById('screenshot-btn');
    if (screenshotBtn) {
      screenshotBtn.addEventListener('click', function() {
        var rendererEl = document.getElementById('playground-canvas');
        if (rendererEl) {
          // Force a render to make sure the canvas has current content
          if (window.Alpaca3D._playgroundRenderer) {
            window.Alpaca3D._playgroundRenderer.render(
              window.Alpaca3D._playgroundScene,
              window.Alpaca3D._playgroundCamera
            );
          }
          try {
            var link = document.createElement('a');
            link.download = 'alpaca3d-custom.png';
            link.href = rendererEl.toDataURL('image/png');
            link.click();
          } catch (err) {
            // Canvas may be tainted or not support toDataURL
          }
        }
      });
    }
  };

  /**
   * Apply a hex color to the appropriate alpaca part meshes.
   * @param {string} part - Part name (wool, body, hooves, eyes, ears, floof, tail)
   * @param {string} hexColor - Hex color string like '#ff00ff'
   * @param {Object} parts - Named alpaca part references
   */
  function applyColor(part, hexColor, parts) {
    var colorInt = parseInt(hexColor.slice(1), 16);

    // Build mapping from part names to actual meshes
    var targets = [];
    switch (part) {
      case 'wool':
        targets = [parts.wool, parts.neckFluff];
        break;
      case 'body':
        targets = [parts.body, parts.neck];
        break;
      case 'hooves':
        // Hooves are the 3rd child (index 2) in each leg group
        if (parts.legs && parts.legs.length) {
          for (var i = 0; i < parts.legs.length; i++) {
            if (parts.legs[i].children && parts.legs[i].children[2]) {
              targets.push(parts.legs[i].children[2]);
            }
          }
        }
        break;
      case 'eyes':
        if (Array.isArray(parts.eyes)) {
          targets = parts.eyes.slice();
        } else {
          targets = [parts.eyes];
        }
        break;
      case 'ears':
        if (Array.isArray(parts.ears)) {
          targets = parts.ears.slice();
        } else {
          targets = [parts.ears];
        }
        break;
      case 'floof':
        targets = [parts.floof, parts.snout];
        break;
      case 'tail':
        targets = [parts.tail];
        break;
    }

    for (var j = 0; j < targets.length; j++) {
      if (targets[j] && targets[j].material) {
        targets[j].material.color.setHex(colorInt);
      }
    }
  }

  /**
   * Toggle a 3D accessory on or off.
   * @param {string} type - Accessory type (hat, sunglasses, bowtie, horn)
   * @param {boolean} show - Whether to show or remove
   * @param {Object} parts - Named alpaca part references
   * @param {Object} accessories - Map of active accessory objects
   */
  function toggleAccessory(type, show, parts, accessories) {
    var group = parts.body.parent; // alpacaGroup

    if (show) {
      var acc = null;

      switch (type) {
        case 'hat':
          var hatGeo = new THREE.ConeGeometry(0.3, 0.6, 8);
          var hatMat = new THREE.MeshBasicMaterial({
            color: 0xff0000, wireframe: true, transparent: true, opacity: 0.7
          });
          acc = new THREE.Mesh(hatGeo, hatMat);
          acc.position.set(1.25, 5.85, 0);
          break;

        case 'sunglasses':
          acc = new THREE.Group();
          var offsets = [-0.2, 0.2];
          for (var i = 0; i < offsets.length; i++) {
            var lens = new THREE.Mesh(
              new THREE.TorusGeometry(0.12, 0.03, 6, 8),
              new THREE.MeshBasicMaterial({
                color: 0x00e5ff, wireframe: true, transparent: true, opacity: 0.7
              })
            );
            lens.position.set(1.75, 5.0, offsets[i]);
            lens.rotation.y = Math.PI / 2;
            acc.add(lens);
          }
          // Bridge piece
          var bridge = new THREE.Mesh(
            new THREE.CylinderGeometry(0.02, 0.02, 0.3, 4),
            new THREE.MeshBasicMaterial({
              color: 0x00e5ff, wireframe: true, transparent: true, opacity: 0.7
            })
          );
          bridge.position.set(1.75, 5.0, 0);
          bridge.rotation.x = Math.PI / 2;
          acc.add(bridge);
          break;

        case 'bowtie':
          var bowGeo = new THREE.OctahedronGeometry(0.2, 0);
          var bowMat = new THREE.MeshBasicMaterial({
            color: 0xe040fb, wireframe: true, transparent: true, opacity: 0.7
          });
          acc = new THREE.Mesh(bowGeo, bowMat);
          acc.position.set(1.2, 3.0, 0);
          acc.scale.set(1.5, 0.8, 0.5);
          break;

        case 'horn':
          var hornGeo = new THREE.ConeGeometry(0.08, 0.5, 6);
          var hornMat = new THREE.MeshBasicMaterial({
            color: 0xfbbf24, wireframe: true, transparent: true, opacity: 0.7
          });
          acc = new THREE.Mesh(hornGeo, hornMat);
          acc.position.set(1.9, 4.8, 0);
          acc.rotation.z = -Math.PI / 4;
          break;
      }

      if (acc) {
        acc.userData.accessoryType = type;
        group.add(acc);
        accessories[type] = acc;
      }
    } else {
      // Remove accessory
      if (accessories[type]) {
        group.remove(accessories[type]);
        // Dispose geometry and materials
        if (accessories[type].isMesh) {
          accessories[type].geometry.dispose();
          accessories[type].material.dispose();
        } else if (accessories[type].isGroup) {
          accessories[type].traverse(function(child) {
            if (child.isMesh) {
              child.geometry.dispose();
              child.material.dispose();
            }
          });
        }
        delete accessories[type];
      }
    }
  }

})();
