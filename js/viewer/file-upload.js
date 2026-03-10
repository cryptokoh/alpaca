/**
 * file-upload.js
 * Drag-and-drop file upload zone for STL/OBJ files.
 * Exposes window.Alpaca3D.initFileUpload(dropZoneId, onFileLoaded)
 */
(function() {
  'use strict';

  window.Alpaca3D = window.Alpaca3D || {};

  var MAX_SIZE = 50 * 1024 * 1024; // 50 MB

  /**
   * Initialize a file upload drop zone.
   * @param {string} dropZoneId - ID of the drop zone element
   * @param {Function} onFileLoaded - Callback(file, extension) when a valid file is selected
   */
  window.Alpaca3D.initFileUpload = function(dropZoneId, onFileLoaded) {
    var zone = document.getElementById(dropZoneId);
    if (!zone) return;

    // Create hidden file input
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = '.stl,.obj';
    input.style.display = 'none';
    zone.appendChild(input);

    // Click to browse
    zone.addEventListener('click', function(e) {
      // Avoid triggering if clicking the filename or filesize text
      if (e.target === input) return;
      input.click();
    });

    // Drag events
    zone.addEventListener('dragover', function(e) {
      e.preventDefault();
      e.stopPropagation();
      zone.classList.add('drag-over');
    });

    zone.addEventListener('dragenter', function(e) {
      e.preventDefault();
      e.stopPropagation();
      zone.classList.add('drag-over');
    });

    zone.addEventListener('dragleave', function(e) {
      e.preventDefault();
      e.stopPropagation();
      zone.classList.remove('drag-over');
    });

    zone.addEventListener('drop', function(e) {
      e.preventDefault();
      e.stopPropagation();
      zone.classList.remove('drag-over');
      var files = e.dataTransfer.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
    });

    // File input change
    input.addEventListener('change', function() {
      if (input.files && input.files[0]) {
        handleFile(input.files[0]);
        // Reset input so the same file can be re-selected
        input.value = '';
      }
    });

    /**
     * Validate and process a selected file.
     * @param {File} file
     */
    function handleFile(file) {
      // Size check
      if (file.size > MAX_SIZE) {
        showError(zone, 'File too large. Maximum size is 50MB.');
        return;
      }

      // Extension check
      var name = file.name || '';
      var ext = name.split('.').pop().toLowerCase();
      if (ext !== 'stl' && ext !== 'obj') {
        showError(zone, 'Unsupported format. Use .stl or .obj files.');
        return;
      }

      // Update UI
      var filenameEl = zone.querySelector('.upload-filename');
      var filesizeEl = zone.querySelector('.upload-filesize');

      if (filenameEl) filenameEl.textContent = file.name;
      if (filesizeEl) filesizeEl.textContent = (file.size / 1024 / 1024).toFixed(2) + ' MB';

      zone.classList.add('has-file');
      zone.classList.remove('has-error');

      if (onFileLoaded) onFileLoaded(file, ext);
    }

    /**
     * Show a temporary error message in the drop zone.
     * @param {HTMLElement} zoneEl
     * @param {string} message
     */
    function showError(zoneEl, message) {
      var filenameEl = zoneEl.querySelector('.upload-filename');
      if (filenameEl) {
        filenameEl.textContent = message;
        filenameEl.style.color = '#f87171';
        zoneEl.classList.add('has-error');
        setTimeout(function() {
          filenameEl.textContent = '';
          filenameEl.style.color = '';
          zoneEl.classList.remove('has-error');
        }, 3000);
      }
    }
  };

})();
