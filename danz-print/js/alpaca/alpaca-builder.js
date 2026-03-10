/**
 * alpaca-builder.js
 * Builds the wireframe alpaca geometry from Three.js primitives.
 * Exposes window.Alpaca3D.buildAlpaca(options)
 */
(function() {
  'use strict';

  window.Alpaca3D = window.Alpaca3D || {};

  /**
   * Creates a wireframe material with consistent defaults.
   * @param {number} color - Hex color value
   * @param {number} [opacity=0.6] - Material opacity
   * @returns {THREE.MeshBasicMaterial}
   */
  function wireMat(color, opacity) {
    return new THREE.MeshBasicMaterial({
      color: color,
      wireframe: true,
      transparent: true,
      opacity: opacity !== undefined ? opacity : 0.6
    });
  }

  /**
   * Build a complete wireframe alpaca and return the group with named part references.
   * @param {Object} [options] - Build options (reserved for future customization)
   * @returns {{ group: THREE.Group, parts: Object }}
   */
  window.Alpaca3D.buildAlpaca = function(options) {
    options = options || {};
    var alpacaGroup = new THREE.Group();

    // ── Body - elongated ellipsoid ──
    var bodyGeo = new THREE.SphereGeometry(1.4, 16, 12);
    bodyGeo.scale(1.3, 0.9, 0.85);
    var body = new THREE.Mesh(bodyGeo, wireMat(0x8b5cf6));
    body.position.set(0, 2.2, 0);
    alpacaGroup.add(body);

    // ── Fluffy wool layer ──
    var woolGeo = new THREE.IcosahedronGeometry(1.55, 1);
    woolGeo.scale(1.2, 0.85, 0.8);
    var wool = new THREE.Mesh(woolGeo, wireMat(0xa78bfa));
    wool.position.set(0, 2.35, 0);
    alpacaGroup.add(wool);

    // ── Neck ──
    var neckGeo = new THREE.CylinderGeometry(0.35, 0.5, 2.2, 10);
    var neck = new THREE.Mesh(neckGeo, wireMat(0xc084fc));
    neck.position.set(1.1, 3.6, 0);
    neck.rotation.z = -0.25;
    alpacaGroup.add(neck);

    // ── Neck fluff ──
    var neckFluffGeo = new THREE.IcosahedronGeometry(0.55, 1);
    neckFluffGeo.scale(0.7, 1.6, 0.7);
    var neckFluff = new THREE.Mesh(neckFluffGeo, wireMat(0xd8b4fe));
    neckFluff.position.set(1.0, 3.5, 0);
    alpacaGroup.add(neckFluff);

    // ── Head ──
    var headGeo = new THREE.SphereGeometry(0.6, 12, 10);
    headGeo.scale(0.85, 1, 0.8);
    var head = new THREE.Mesh(headGeo, wireMat(0xe879f9));
    head.position.set(1.35, 4.9, 0);
    alpacaGroup.add(head);

    // ── Head floof (top tuft) ──
    var floofGeo = new THREE.IcosahedronGeometry(0.5, 1);
    floofGeo.scale(0.8, 0.6, 0.7);
    var floof = new THREE.Mesh(floofGeo, wireMat(0xf0abfc));
    floof.position.set(1.25, 5.45, 0);
    alpacaGroup.add(floof);

    // ── Snout ──
    var snoutGeo = new THREE.SphereGeometry(0.3, 10, 8);
    snoutGeo.scale(0.7, 0.65, 0.7);
    var snout = new THREE.Mesh(snoutGeo, wireMat(0xf9a8d4));
    snout.position.set(1.8, 4.7, 0);
    alpacaGroup.add(snout);

    // ── Ears ──
    function makeEar(zOff) {
      var earGeo = new THREE.ConeGeometry(0.15, 0.55, 6);
      var ear = new THREE.Mesh(earGeo, wireMat(0xe040fb));
      ear.position.set(1.15, 5.45, zOff);
      ear.rotation.z = 0.3;
      ear.rotation.x = zOff > 0 ? -0.2 : 0.2;
      return ear;
    }
    var ear1 = makeEar(0.35);
    var ear2 = makeEar(-0.35);
    alpacaGroup.add(ear1);
    alpacaGroup.add(ear2);

    // ── Eyes (small spheres) ──
    function makeEye(zOff) {
      var eyeGeo = new THREE.SphereGeometry(0.06, 6, 6);
      var eye = new THREE.Mesh(eyeGeo, wireMat(0x00e5ff));
      eye.position.set(1.7, 5.0, zOff);
      return eye;
    }
    var eye1 = makeEye(0.2);
    var eye2 = makeEye(-0.2);
    alpacaGroup.add(eye1);
    alpacaGroup.add(eye2);

    // ── Legs ──
    function makeLeg(x, z) {
      var legGroup = new THREE.Group();
      // Upper leg
      var upperGeo = new THREE.CylinderGeometry(0.18, 0.22, 1.1, 8);
      var upper = new THREE.Mesh(upperGeo, wireMat(0x7c3aed));
      upper.position.set(0, -0.55, 0);
      legGroup.add(upper);
      // Lower leg
      var lowerGeo = new THREE.CylinderGeometry(0.14, 0.16, 0.9, 8);
      var lower = new THREE.Mesh(lowerGeo, wireMat(0x6d28d9));
      lower.position.set(0, -1.35, 0);
      legGroup.add(lower);
      // Hoof
      var hoofGeo = new THREE.CylinderGeometry(0.18, 0.2, 0.15, 8);
      var hoof = new THREE.Mesh(hoofGeo, wireMat(0x00e5ff));
      hoof.position.set(0, -1.87, 0);
      legGroup.add(hoof);
      legGroup.position.set(x, 1.5, z);
      return legGroup;
    }
    var leg1 = makeLeg(0.8, 0.4);   // front-right
    var leg2 = makeLeg(0.8, -0.4);  // front-left
    var leg3 = makeLeg(-0.8, 0.4);  // back-right
    var leg4 = makeLeg(-0.8, -0.4); // back-left
    alpacaGroup.add(leg1);
    alpacaGroup.add(leg2);
    alpacaGroup.add(leg3);
    alpacaGroup.add(leg4);

    // ── Tail ──
    var tailGeo = new THREE.SphereGeometry(0.35, 8, 6);
    tailGeo.scale(0.6, 0.8, 0.5);
    var tail = new THREE.Mesh(tailGeo, wireMat(0x76ff03));
    tail.position.set(-1.6, 2.6, 0);
    alpacaGroup.add(tail);

    return {
      group: alpacaGroup,
      parts: {
        body: body,
        wool: wool,
        neck: neck,
        neckFluff: neckFluff,
        head: head,
        floof: floof,
        snout: snout,
        ears: [ear1, ear2],
        eyes: [eye1, eye2],
        legs: [leg1, leg2, leg3, leg4],
        tail: tail
      }
    };
  };

  // Also expose wireMat for external use (e.g., customizer)
  window.Alpaca3D.wireMat = wireMat;

})();
