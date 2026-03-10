/**
 * sound.js
 * Web Audio API ambient sound toggle. Muted by default.
 * State persisted in localStorage.
 */
(function() {
  'use strict';

  var audioCtx = null;
  var isPlaying = false;
  var nodes = [];
  var STORAGE_KEY = 'alpaca3d-sound';

  function createAmbient() {
    if (audioCtx) return nodes[nodes.length - 1].masterGain;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    // Create a gentle ambient drone
    var frequencies = [65.41, 98.0, 130.81, 196.0]; // C2, G2, C3, G3
    var masterGain = audioCtx.createGain();
    masterGain.gain.value = 0;
    masterGain.connect(audioCtx.destination);

    frequencies.forEach(function(freq, i) {
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.value = 0.03 - i * 0.005;
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start();
      nodes.push({ osc: osc, gain: gain });
    });

    // Add subtle LFO for movement
    var lfo = audioCtx.createOscillator();
    var lfoGain = audioCtx.createGain();
    lfo.type = 'sine';
    lfo.frequency.value = 0.1;
    lfoGain.gain.value = 3;
    lfo.connect(lfoGain);
    lfoGain.connect(nodes[0].osc.frequency);
    lfo.start();

    nodes.push({ masterGain: masterGain });

    return masterGain;
  }

  function startSound() {
    var master = createAmbient();
    master.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 2);
    isPlaying = true;
    localStorage.setItem(STORAGE_KEY, 'on');
    updateButton();
  }

  function stopSound() {
    if (audioCtx && nodes.length > 0) {
      var master = nodes[nodes.length - 1].masterGain;
      master.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.5);
    }
    isPlaying = false;
    localStorage.setItem(STORAGE_KEY, 'off');
    updateButton();
  }

  function updateButton() {
    var btn = document.getElementById('sound-toggle');
    if (!btn) return;
    var icon = btn.querySelector('.sound-icon');
    if (icon) {
      icon.innerHTML = isPlaying ? '&#128266;' : '&#128264;';
    }
    if (isPlaying) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  }

  // Wait for nav.js to inject the button
  var checkBtn = setInterval(function() {
    var btn = document.getElementById('sound-toggle');
    if (btn) {
      clearInterval(checkBtn);
      btn.addEventListener('click', function() {
        if (isPlaying) {
          stopSound();
        } else {
          startSound();
        }
      });

      // Check localStorage - default to off
      // Don't auto-play (browser policy), but update visual state
      updateButton();
    }
  }, 100);
})();
