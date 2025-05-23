console.log('%c📋 Cover Letter Input: background.js loaded', 'font-weight: bold; font-size: 1.3em;');

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('%c📋 Cover Letter Input: Received message in background.js: %o', 'font-weight: bold; font-size: 1.3em;', message);
  if (message.type === 'runOverlayScript') {
    console.log('%c📋 Cover Letter Input: Attempting to inject overlay.js for shadowHostId: %s', 'font-weight: bold; font-size: 1.3em;', message.shadowHostId);
    chrome.scripting.executeScript({
      target: { tabId: sender.tab.id, frameIds: [sender.frameId] },
      files: ['overlay.js'],
      world: 'ISOLATED'
    }, () => {
      if (chrome.runtime.lastError) {
        console.error('%c📋 Cover Letter Input: Error injecting overlay.js in isolated world', 'font-weight: bold; font-size: 1.3em;', chrome.runtime.lastError);
      } else {
        console.log('%c📋 Cover Letter Input: overlay.js injected in isolated world', 'font-weight: bold; font-size: 1.3em;');
      }
    });
  }
});