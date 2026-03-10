/**
 * alpaca-particles.js
 * Floating background particles and rainbow spit particle system.
 * Exposes window.Alpaca3D.createParticles() and window.Alpaca3D.createSpitSystem()
 */
(function() {
  'use strict';

  window.Alpaca3D = window.Alpaca3D || {};

  /**
   * Create floating background particles.
   * @param {THREE.Scene} scene - The Three.js scene to add particles to
   * @param {number} [count=120] - Number of particles
   * @returns {THREE.Points} The particle system object
   */
  window.Alpaca3D.createParticles = function(scene, count) {
    count = count || 120;
    var particleGeo = new THREE.BufferGeometry();
    var positions = new Float32Array(count * 3);
    for (var i = 0; i < count; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    var particleMat = new THREE.PointsMaterial({
      color: 0x6c2bd9,
      size: 0.04,
      transparent: true,
      opacity: 0.5
    });
    var particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);
    return particles;
  };

  /**
   * Create the rainbow spit particle system.
   * @param {THREE.Scene} scene - The Three.js scene
   * @param {THREE.Group} alpacaGroup - The alpaca group (used for snout world position)
   * @returns {{ spawnBurst: Function, update: Function }}
   */
  window.Alpaca3D.createSpitSystem = function(scene, alpacaGroup) {
    var rainbowColors = [0xff0000, 0xff8800, 0xffff00, 0x00ff00, 0x0088ff, 0x8800ff, 0xff00ff];
    var spitParticles = [];
    var lastScrollY = window.scrollY;
    var spitCooldown = 0;

    function getSnoutWorldPos() {
      var pos = new THREE.Vector3(1.8, 4.7, 0);
      alpacaGroup.localToWorld(pos);
      return pos;
    }

    function spawnBurst() {
      var origin = getSnoutWorldPos();
      var burstCount = 8 + Math.floor(Math.random() * 12);
      for (var i = 0; i < burstCount; i++) {
        var color = rainbowColors[Math.floor(Math.random() * rainbowColors.length)];
        var size = 0.04 + Math.random() * 0.1;
        var geo = Math.random() > 0.5
          ? new THREE.IcosahedronGeometry(size, 0)
          : new THREE.OctahedronGeometry(size, 0);
        var mat = new THREE.MeshBasicMaterial({
          color: color,
          wireframe: true,
          transparent: true,
          opacity: 1.0
        });
        var mesh = new THREE.Mesh(geo, mat);
        mesh.position.copy(origin);
        // Spray outward from snout direction with spread
        var dir = new THREE.Vector3(
          0.8 + Math.random() * 0.5,
          0.2 + Math.random() * 0.6 - 0.3,
          (Math.random() - 0.5) * 0.8
        );
        dir.applyQuaternion(alpacaGroup.quaternion);
        dir.normalize().multiplyScalar(0.06 + Math.random() * 0.08);
        mesh.userData.vel = dir;
        mesh.userData.life = 1.0;
        mesh.userData.decay = 0.008 + Math.random() * 0.012;
        mesh.userData.spin = new THREE.Vector3(
          (Math.random() - 0.5) * 0.2,
          (Math.random() - 0.5) * 0.2,
          (Math.random() - 0.5) * 0.2
        );
        scene.add(mesh);
        spitParticles.push(mesh);
      }
    }

    // Trigger spit randomly on scroll
    window.addEventListener('scroll', function() {
      var delta = Math.abs(window.scrollY - lastScrollY);
      lastScrollY = window.scrollY;
      if (delta > 5 && spitCooldown <= 0 && Math.random() < 0.4) {
        spawnBurst();
        spitCooldown = 12 + Math.floor(Math.random() * 20); // frames cooldown
      }
    });

    function update() {
      if (spitCooldown > 0) spitCooldown--;
      for (var i = spitParticles.length - 1; i >= 0; i--) {
        var p = spitParticles[i];
        // Move
        p.position.add(p.userData.vel);
        // Gravity
        p.userData.vel.y -= 0.001;
        // Spin
        p.rotation.x += p.userData.spin.x;
        p.rotation.y += p.userData.spin.y;
        p.rotation.z += p.userData.spin.z;
        // Fade
        p.userData.life -= p.userData.decay;
        p.material.opacity = Math.max(0, p.userData.life);
        // Scale down as they fade
        var s = Math.max(0.1, p.userData.life);
        p.scale.set(s, s, s);
        // Remove dead particles
        if (p.userData.life <= 0) {
          scene.remove(p);
          p.geometry.dispose();
          p.material.dispose();
          spitParticles.splice(i, 1);
        }
      }
    }

    return {
      spawnBurst: spawnBurst,
      update: update
    };
  };

})();
