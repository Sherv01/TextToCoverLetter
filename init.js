/*
Initializes global variables and functions for the Cover Letter Input extension.
*/

console.log('%c📋 Cover Letter Input: init.js executing', 'font-weight: bold; font-size: 1.3em;');

// Detect and override input elements that use .click()
var oriClick = HTMLElement.prototype.click;
HTMLElement.prototype.click = function(...args) {
  if (this.matches("input[type='file']") && !this.id.startsWith('cnp')) {
    window.setupCreateOverlay(this);
    oriClick.call(this, ...args);
  } else {
    return oriClick.apply(this, arguments);
  }
};

// Detect and override input elements that use .showPicker()
var oriShowPicker = HTMLInputElement.prototype.showPicker;
HTMLInputElement.prototype.showPicker = function() {
  if (this.matches("input[type='file']")) {
    this.click();
  } else {
    return oriShowPicker.apply(this, arguments);
  }
};

// Global variables
var overlayID = null;
var originalInput = null;

// Sets a node up for Cover Letter Overlay
window.setupCreateOverlay = function(node) {
  if (node.id !== "cnp-overlay-file-input" && !node.dataset.cnpCreateOverlayListener) {
    node.addEventListener("click", (event) => {
      // Dispatch to content.js via postMessage
      window.postMessage({ type: 'cnp-create-overlay', targetId: node.id || 'file-input-' + Date.now() }, '*');
    }, { capture: true });
    node.dataset.cnpCreateOverlayListener = "true";
    console.log('%c📋 Cover Letter Input: Setup createOverlay for input', 'font-weight: bold; font-size: 1.3em;');
  }
};

// Console logging for errors and messages
function logging(message) {
  console.log('%c📋 Cover Letter Input:\n', 'font-weight: bold; font-size: 1.3em;', message);
}

console.log('%c📋 Cover Letter Input: init.js loaded', 'font-weight: bold; font-size: 1.3em;');