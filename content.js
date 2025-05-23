/*
Scripts that run within the extension's isolated world.
*/

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', afterDOMLoaded);
} else {
    afterDOMLoaded();
}

// Global variables
let lastURL = location.href;
let originalInput = null;
let overlayID = null;
let clientX = 0;
let clientY = 0;
let isCreatingOverlay = false;

// Capture cursor coords
if (!document.cnpCoordListener) {
    document.addEventListener('mousemove', event => {
        document.cnpCoordListener = true;
        clientX = event.clientX;
        clientY = event.clientY;
    });
}

// Inject init.js to the DOM
function injectInitJs() {
    return new Promise((resolve) => {
        if (document.head.querySelector('CnP-init')) {
            console.log('%c📋 Cover Letter Input: init.js already injected', 'font-weight: bold; font-size: 1.3em;');
            resolve();
            return;
        }
        const initJS = document.createElement('script');
        initJS.id = `CnP-init`;
        try {
            initJS.src = chrome.runtime.getURL('init.js');
            initJS.onload = () => {
                console.log('%c📋 Cover Letter Input: init.js injected and loaded', 'font-weight: bold; font-size: 1.3em;');
                resolve();
            };
            initJS.onerror = (error) => {
                console.log('%c📋 Cover Letter Input: Error injecting init.js\n', 'font-weight: bold; font-size: 1.3em;', error);
                resolve();
            };
            document.head.appendChild(initJS);
        } catch (error) {
            console.log('%c📋 Cover Letter Input: Error setting init.js src\n', 'font-weight: bold; font-size: 1.3em;', error);
            resolve();
        }
    });
}

// Inject overlay.js script (fallback)
function injectOverlayScript(shadow) {
    return new Promise((resolve, reject) => {
        const script = shadow.ownerDocument.createElement('script');
        script.src = chrome.runtime.getURL('overlay.js');
        console.log('%c📋 Cover Letter Input: overlay.js URL: %s', 'font-weight: bold; font-size: 1.3em;', script.src);
        script.onload = () => {
            console.log('%c📋 Cover Letter Input: overlay.js script injected', 'font-weight: bold; font-size: 1.3em;');
            resolve(true);
        };
        script.onerror = (event) => {
            console.log('%c📋 Cover Letter Input: Error loading overlay.js script', 'font-weight: bold; font-size: 1.3em;');
            console.error('overlay.js script error:', event);
            resolve(false);
        };
        shadow.appendChild(script);
    });
}

// Fallback setupCreateOverlay
function setupCreateOverlay(node) {
    if (node.id !== "cnp-overlay-file-input" && !node.dataset.cnpCreateOverlayListener) {
        node.addEventListener("click", createOverlay, { capture: true });
        node.dataset.cnpCreateOverlayListener = "true";
        console.log('%c📋 Cover Letter Input: Fallback setupCreateOverlay for input', 'font-weight: bold; font-size: 1.3em;');
    }
}

async function afterDOMLoaded() {
    console.log('%c📋 Cover Letter Input: Initializing extension', 'font-weight: bold; font-size: 1.3em;');

    // Inject init.js and wait
    await injectInitJs();

    // Use window.setupCreateOverlay if available, else fallback
    const setupFunc = window.setupCreateOverlay || setupCreateOverlay;

    // Prep all input file elements
    if (!document.cnpClickListener) {
        document.addEventListener("click", event => {
            document.cnpClickListener = true;
            if (event.target.matches("input[type='file']")) {
                setupFunc(event.target);
            }
        }, true);
    }

    // Run through DOM to detect file inputs, shadow DOMs, and iframes
    document.querySelectorAll('*').forEach((element, index) => {
        if (element.matches("input[type='file']")) {
            setupFunc(element);
            console.log('%c📋 Cover Letter Input: Found file input', 'font-weight: bold; font-size: 1.3em;');
        } else if (element.shadowRoot) {
            element.shadowRoot.querySelectorAll("input[type='file']").forEach(fileInput => {
                setupFunc(fileInput);
                console.log('%c📋 Cover Letter Input: Found file input in shadow DOM', 'font-weight: bold; font-size: 1.3em;');
            });
        } else if (element.matches('iframe') && element.contentDocument) {
            try {
                const initJS = element.contentDocument.createElement('script');
                initJS.id = `CnP-init-iframe-${index}`;
                initJS.src = chrome.runtime.getURL('init.js');
                element.contentDocument.head.appendChild(initJS);
                console.log('%c📋 Cover Letter Input: Injected init.js into iframe', 'font-weight: bold; font-size: 1.3em;');
            } catch (error) {
                console.log('%c📋 Cover Letter Input: Error injecting into iframe\n', 'font-weight: bold; font-size: 1.3em;', error);
            }
        }
    });

    // Monitor for new file inputs, shadow DOMs, and iframes
    if (!document.body.cnpMutationObserver) {
        const observer = new MutationObserver(mutations => {
            if (lastURL !== location.href) {
                lastURL = location.href;
                afterDOMLoaded();
            }
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach((node, index) => {
                    if (node.nodeType === Node.ELEMENT_NODE && node.matches("input[type='file']")) {
                        setupFunc(node);
                        console.log('%c📋 Cover Letter Input: New file input detected', 'font-weight: bold; font-size: 1.3em;');
                    } else if (node.nodeType === Node.ELEMENT_NODE && node.shadowRoot) {
                        node.shadowRoot.querySelectorAll("input[type='file']").forEach(fileInput => {
                            setupFunc(fileInput);
                            console.log('%c📋 Cover Letter Input: New file input in shadow DOM', 'font-weight: bold; font-size: 1.3em;');
                        });
                    } else if (node.nodeType === Node.ELEMENT_NODE && node.matches("iframe") && node.contentDocument) {
                        try {
                            const initJS = node.contentDocument.createElement('script');
                            initJS.id = `CnP-mutatedIframe-${index}`;
                            initJS.src = chrome.runtime.getURL('init.js');
                            node.contentDocument.head.appendChild(initJS);
                            console.log('%c📋 Cover Letter Input: Injected init.js into new iframe', 'font-weight: bold; font-size: 1.3em;');
                        } catch (error) {
                            console.log('%c📋 Cover Letter Input: Error injecting into new iframe\n', 'font-weight: bold; font-size: 1.3em;', error);
                        }
                    } else if (node.nodeType === Node.ELEMENT_NODE && node.hasChildNodes()) {
                        node.querySelectorAll("input[type='file']").forEach(fileInput => {
                            setupFunc(fileInput);
                            console.log('%c📋 Cover Letter Input: Found file input in child node', 'font-weight: bold; font-size: 1.3em;');
                        });
                    } else if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
                        node.childNodes.forEach(childNode => {
                            if (childNode.nodeType === Node.ELEMENT_NODE && childNode.shadowRoot) {
                                childNode.shadowRoot.querySelectorAll("input[type='file']").forEach(fileInput => {
                                    setupFunc(fileInput);
                                    console.log('%c📋 Cover Letter Input: Found file input in document fragment shadow DOM', 'font-weight: bold; font-size: 1.3em;');
                                });
                            }
                        });
                    }
                });
            });
        });
        try {
            observer.observe(document.body, { childList: true, subtree: true });
            document.body.cnpMutationObserver = true;
            console.log('%c📋 Cover Letter Input: MutationObserver started', 'font-weight: bold; font-size: 1.3em;');
        } catch (error) {
            console.log('%c📋 Cover Letter Input: MutationObserver error\n', 'font-weight: bold; font-size: 1.3em;', error);
        }
    }
}

// Inject jsPDF script
function injectJsPDF(shadow) {
    return new Promise((resolve, reject) => {
        const script = shadow.ownerDocument.createElement('script');
        script.src = chrome.runtime.getURL('jspdf.umd.min.js');
        console.log('%c📋 Cover Letter Input: jsPDF URL: %s', 'font-weight: bold; font-size: 1.3em;', script.src);
        script.onload = () => {
            console.log('%c📋 Cover Letter Input: jsPDF script loaded', 'font-weight: bold; font-size: 1.3em;');
            resolve(true);
        };
        script.onerror = (event) => {
            console.log('%c📋 Cover Letter Input: Error loading jsPDF script', 'font-weight: bold; font-size: 1.3em;');
            console.error('jsPDF script error:', event);
            resolve(false);
        };
        shadow.appendChild(script);
    });
}

// Creates the overlay
async function createOverlay(event) {
    if (isCreatingOverlay) {
        console.log('%c📋 Cover Letter Input: Overlay creation debounced', 'font-weight: bold; font-size: 1.3em;');
        return;
    }
    isCreatingOverlay = true;
    setTimeout(() => { isCreatingOverlay = false; }, 500);

    console.log('%c📋 Cover Letter Input: Creating overlay', 'font-weight: bold; font-size: 1.3em;');
    try {
        event.preventDefault();
        event.stopPropagation();
        originalInput = event.target;

        // Remove existing overlays
        document.querySelectorAll('.cnp-overlay').forEach(overlay => overlay.remove());
        document.querySelectorAll('div.cnp-shadow-host').forEach(host => host.remove());

        const overlay = document.createElement('div');
        overlay.classList.add('cnp-overlay');
        overlay.style.position = 'fixed';
        overlay.style.zIndex = '2147483647';
        const uuid = crypto.randomUUID ? crypto.randomUUID() : 'overlay-' + Date.now();
        overlay.id = overlayID = uuid;

        // Create shadow DOM
        const shadowHost = document.createElement('div');
        shadowHost.classList.add('cnp-shadow-host');
        shadowHost.id = 'cnp-shadow-host-' + uuid;
        const shadow = shadowHost.attachShadow({ mode: 'open' });
        document.body.appendChild(shadowHost);
        console.log('%c📋 Cover Letter Input: Shadow host created with id: %s', 'font-weight: bold; font-size: 1.3em;', shadowHost.id);

        const urlToFetch = chrome.runtime.getURL('overlay.html');
        console.log('%c📋 Cover Letter Input: Fetching overlay.html from %s', 'font-weight: bold; font-size: 1.3em;', urlToFetch);

        fetch(urlToFetch)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(html => {
                console.log('%c📋 Cover Letter Input: overlay.html fetched successfully', 'font-weight: bold; font-size: 1.3em;');
                shadow.innerHTML = html;
                console.log('%c📋 Cover Letter Input: Overlay appended to shadow DOM', 'font-weight: bold; font-size: 1.3em;');

                const overlayContent = shadow.querySelector('.cnp-overlay-content');
                if (!overlayContent) {
                    throw new Error('Overlay content not found in HTML');
                }

                // Position overlay
                let overlayLeftPos = clientX + window.scrollX;
                let overlayTopPos = clientY + window.scrollY + 20;
                if (isNaN(overlayLeftPos) || isNaN(overlayTopPos)) {
                    overlayLeftPos = (window.innerWidth - 320) / 2;
                    overlayTopPos = (window.innerHeight - 300) / 2;
                }

                const maxLeft = window.innerWidth - overlayContent.offsetWidth - 10;
                const maxTop = window.innerHeight - overlayContent.offsetHeight - 10;
                overlayLeftPos = Math.max(10, Math.min(overlayLeftPos, maxLeft));
                overlayTopPos = Math.max(10, Math.min(overlayTopPos, maxTop));

                overlayContent.style.left = overlayLeftPos + 'px';
                overlayContent.style.top = overlayTopPos + 'px';
                console.log('%c📋 Cover Letter Input: Overlay positioned at (%d, %d)', 'font-weight: bold; font-size: 1.3em;', overlayLeftPos, overlayTopPos);

                const overlayFileInput = shadow.querySelector('#cnp-overlay-file-input');
                overlayFileInput.multiple = originalInput.multiple;
                overlayFileInput.webkitdirectory = originalInput.webkitdirectory;
                overlayFileInput.setAttribute('accept', originalInput.getAttribute('accept') || 'application/pdf');

                // Inject jsPDF
                injectJsPDF(shadow);

                // Inject overlay.js
                try {
                    chrome.runtime.sendMessage({
                        type: 'runOverlayScript',
                        shadowHostId: shadowHost.id
                    }, response => {
                        if (chrome.runtime.lastError) {
                            console.log('%c📋 Cover Letter Input: Failed to send message to background, falling back to direct injection', 'font-weight: bold; font-size: 1.3em;');
                            console.error('Message error:', chrome.runtime.lastError);
                            injectOverlayScript(shadow);
                        }
                    });
                } catch (error) {
                    console.log('%c📋 Cover Letter Input: Error sending message to background, falling back to direct injection', 'font-weight: bold; font-size: 1.3em;');
                    console.error('Send message error:', error);
                    injectOverlayScript(shadow);
                }

                // Close overlay when clicking outside
                if (!document.cnpRemoveListener) {
                    document.addEventListener('click', event => {
                        document.cnpRemoveListener = true;
                        const overlayContent = shadow.querySelector('.cnp-overlay-content');
                        const shadowHost = document.querySelector('div.cnp-shadow-host');
                        if (!overlayContent || !shadowHost) return;
                        if (!isClickOutsideClick(event, overlayContent, shadowHost)) {
                            console.log('%c📋 Cover Letter Input: Closing overlay, target: %s', 'font-weight: bold; font-size: 1.3em;', event.target.tagName);
                            closeOverlay();
                        }
                    }, { capture: true });
                }
            })
            .catch(error => {
                console.log('%c📋 Cover Letter Input: Error fetching overlay.html\n', 'font-weight: bold; font-size: 1.3em;', error);
            });
    } catch (error) {
        console.log('%c📋 Cover Letter Input: Error in createOverlay\n', 'font-weight: bold; font-size: 1.3em;', error);
    }
}

function isClickOutsideClick(event, overlayContent, shadowHost) {
    const isClickInside = overlayContent.contains(event.target) || shadowHost.contains(event.target);
    const isInteractive = event.target.closest('input, button, select, textarea, a, [role="button"], #submit-btn, #download-btn, #upload-btn, #close-btn');
    return isClickInside || isInteractive;
}

function triggerChangeEvent(input) {
    input.dispatchEvent(new Event('change', { bubbles: true }));
    input.dispatchEvent(new Event('input', { bubbles: true }));
    console.log('%c📋 Cover Letter Input: Change event triggered', 'font-weight: bold; font-size: 1.3em;');
}

function closeOverlay() {
    document.querySelectorAll('.cnp-overlay').forEach(overlay => overlay.remove());
    document.querySelectorAll('div.cnp-shadow-host').forEach(host => host.remove());
    originalInput = null;
    console.log('%c📋 Cover Letter Input: Overlay closed', 'font-weight: bold; font-size: 1.3em;');
}

// Single message listener
if (window.cnpMessageListener) {
    window.removeEventListener('message', window.cnpMessageListener);
}
window.cnpMessageListener = function(event) {
    console.log('%c📋 Cover Letter Input: Received message: %o', 'font-weight: bold; font-size: 1.3em;', event.data);
    if (event.data.type === 'cnp-create-overlay') {
        const input = document.getElementById(event.data.targetId) || document.querySelector('input[type="file"]');
        if (input) {
            createOverlay({ target: input, preventDefault: () => {}, stopPropagation: () => {} });
        }
    } else if (event.data.type === 'cnp-pdf-generated') {
        console.log('%c📋 Cover Letter Input: PDF generated message received via postMessage', 'font-weight: bold; font-size: 1.3em;');
        try {
            const { file, fileName } = event.data;
            if (!originalInput) throw new Error('Original input not found');
            originalInput.setAttribute('accept', 'application/pdf');
            const fileList = new DataTransfer();
            fileList.items.add(file);
            originalInput.files = fileList.files;
            triggerChangeEvent(originalInput);
            closeOverlay();
            console.log('%c📋 Cover Letter Input: PDF submitted via postMessage', 'font-weight: bold; font-size: 1.3em;');
        } catch (error) {
            console.error('%c📋 Cover Letter Input: Error processing PDF via postMessage', 'font-weight: bold; font-size: 1.3em;', error);
            // Suppress alert to avoid popup
        }
    } else if (event.data.type === 'cnp-file-uploaded') {
        console.log('%c📋 Cover Letter Input: File uploaded message received via postMessage', 'font-weight: bold; font-size: 1.3em;');
        try {
            const { file, fileName } = event.data;
            if (!originalInput) throw new Error('Original input not found');
            originalInput.setAttribute('accept', 'application/pdf');
            const fileList = new DataTransfer();
            fileList.items.add(file);
            originalInput.files = fileList.files;
            triggerChangeEvent(originalInput);
            closeOverlay();
            console.log('%c📋 Cover Letter Input: Uploaded file submitted via postMessage', 'font-weight: bold; font-size: 1.3em;');
        } catch (error) {
            console.error('%c📋 Cover Letter Input: Error processing uploaded file via postMessage', 'font-weight: bold; font-size: 1.3em;', error);
            // Suppress alert to avoid popup
        }
    } else if (event.data.type === 'cnp-close-overlay') {
        console.log('%c📋 Cover Letter Input: Close overlay message received via postMessage', 'font-weight: bold; font-size: 1.3em;');
        closeOverlay();
    }
};
window.addEventListener('message', window.cnpMessageListener);