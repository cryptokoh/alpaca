/**
 * model-viewer.js
 * STL/OBJ file viewer with OrbitControls, grid floor, and stats overlay.
 * Exposes window.Alpaca3D.initModelViewer(canvasId, options)
 */
(function() {
  'use strict';

  window.Alpaca3D = window.Alpaca3D || {};

  /**
   * Initialize a model viewer on the given canvas.
   * @param {string} canvasId - Canvas element ID
   * @param {Object} [options] - Configuration
   * @param {string} [options.overlayId] - ID of stats overlay element
   * @returns {{ loadModel: Function, scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer, controls: THREE.OrbitControls, cleanup: Function }}
   */
  window.Alpaca3D.initModelViewer = function(canvasId, options) {
    options = options || {};
    var canvas = document.getElementById(canvasId);
    if (!canvas || typeof THREE === 'undefined') return null;

    var renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(
      45,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 2, 5);

    // OrbitControls (requires the CDN addon to be loaded)
    var controls = null;
    if (THREE.OrbitControls) {
      controls = new THREE.OrbitControls(camera, canvas);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.enablePan = true;
      controls.minDistance = 1;
      controls.maxDistance = 50;
    }

    // Grid floor
    var grid = new THREE.GridHelper(10, 20, 0x6c2bd9, 0x2a2a3a);
    scene.add(grid);

    // Lighting
    var ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);
    var dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);
    var backLight = new THREE.DirectionalLight(0x8b5cf6, 0.3);
    backLight.position.set(-5, 5, -5);
    scene.add(backLight);

    var overlay = document.getElementById(options.overlayId || 'model-stats');
    var currentModel = null;
    var animationId = null;

    /**
     * Load a 3D model file into the viewer.
     * @param {File} file - The file to load
     * @param {string} type - File type ('stl' or 'obj')
     */
    function loadModel(file, type) {
      // Remove previous model
      if (currentModel) {
        scene.remove(currentModel);
        currentModel.traverse(function(child) {
          if (child.isMesh) {
            child.geometry.dispose();
            child.material.dispose();
          }
        });
        currentModel = null;
      }

      var reader = new FileReader();
      reader.onload = function(e) {
        var mesh = null;

        try {
          if (type === 'stl' && THREE.STLLoader) {
            var stlLoader = new THREE.STLLoader();
            var geometry = stlLoader.parse(e.target.result);
            var material = new THREE.MeshPhongMaterial({
              color: 0x8b5cf6,
              wireframe: false,
              transparent: true,
              opacity: 0.9,
              flatShading: true
            });
            mesh = new THREE.Mesh(geometry, material);

            // Add wireframe overlay
            var wireGeo = geometry.clone();
            var wireMat = new THREE.MeshBasicMaterial({
              color: 0xe040fb,
              wireframe: true,
              transparent: true,
              opacity: 0.15
            });
            var wireMesh = new THREE.Mesh(wireGeo, wireMat);
            mesh.add(wireMesh);

          } else if (type === 'obj' && THREE.OBJLoader) {
            var objLoader = new THREE.OBJLoader();
            var text = new TextDecoder().decode(e.target.result);
            mesh = objLoader.parse(text);
            mesh.traverse(function(child) {
              if (child.isMesh) {
                child.material = new THREE.MeshPhongMaterial({
                  color: 0x8b5cf6,
                  wireframe: false,
                  transparent: true,
                  opacity: 0.9,
                  flatShading: true
                });
                // Wireframe overlay
                var wGeo = child.geometry.clone();
                var wMat = new THREE.MeshBasicMaterial({
                  color: 0xe040fb,
                  wireframe: true,
                  transparent: true,
                  opacity: 0.15
                });
                child.add(new THREE.Mesh(wGeo, wMat));
              }
            });
          }
        } catch (err) {
          if (overlay) {
            overlay.textContent = 'Error loading model: ' + err.message;
          }
          return;
        }

        if (mesh) {
          // Auto-center and scale to fit viewport
          var box = new THREE.Box3().setFromObject(mesh);
          var center = box.getCenter(new THREE.Vector3());
          var size = box.getSize(new THREE.Vector3());
          var maxDim = Math.max(size.x, size.y, size.z);
          var scale = 3 / maxDim;

          mesh.scale.set(scale, scale, scale);
          // Center horizontally and on the grid
          mesh.position.set(
            -center.x * scale,
            -box.min.y * scale,
            -center.z * scale
          );

          scene.add(mesh);
          currentModel = mesh;

          // Reset camera to look at model
          camera.position.set(0, size.y * scale * 0.8, maxDim * scale * 2.5);
          if (controls) {
            controls.target.set(0, size.y * scale * 0.4, 0);
            controls.update();
          }

          // Update stats overlay
          if (overlay) {
            var verts = 0;
            var faces = 0;
            mesh.traverse(function(child) {
              if (child.isMesh && child.geometry) {
                var geo = child.geometry;
                if (geo.attributes && geo.attributes.position) {
                  verts += geo.attributes.position.count;
                }
                if (geo.index) {
                  faces += geo.index.count / 3;
                } else if (geo.attributes && geo.attributes.position) {
                  faces += geo.attributes.position.count / 3;
                }
              }
            });
            overlay.textContent = 'Vertices: ' + verts.toLocaleString() +
              ' | Faces: ' + Math.floor(faces).toLocaleString();
          }
        }
      };

      reader.readAsArrayBuffer(file);
    }

    // Animation loop
    function animate() {
      animationId = requestAnimationFrame(animate);
      if (controls) controls.update();
      renderer.render(scene, camera);
    }
    animate();

    // Resize handling
    var resizeObserver = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(function() {
        var w = canvas.clientWidth;
        var h = canvas.clientHeight;
        if (w > 0 && h > 0) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
      });
      resizeObserver.observe(canvas);
    }

    /**
     * Clean up the model viewer (stop animation, dispose resources).
     */
    function cleanup() {
      if (animationId) cancelAnimationFrame(animationId);
      if (resizeObserver) resizeObserver.disconnect();
      if (currentModel) {
        scene.remove(currentModel);
        currentModel.traverse(function(child) {
          if (child.isMesh) {
            child.geometry.dispose();
            child.material.dispose();
          }
        });
      }
      grid.geometry.dispose();
      grid.material.dispose();
      renderer.dispose();
    }

    return {
      loadModel: loadModel,
      scene: scene,
      camera: camera,
      renderer: renderer,
      controls: controls,
      cleanup: cleanup
    };
  };

})();
