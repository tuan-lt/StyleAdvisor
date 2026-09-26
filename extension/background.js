/**
 * Style Advisor - Background Service Worker
 * Handles toolbar action click to toggle the Draggable In-Page Widget.
 */

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab || !tab.id || !tab.url) return;

  // Cannot inject into chrome:// or edge:// internal pages
  if (tab.url.startsWith("chrome://") || tab.url.startsWith("edge://") || tab.url.startsWith("about:") || tab.url.startsWith("chrome-extension://")) {
    return;
  }

  try {
    // Send message to active tab to toggle the widget
    chrome.tabs.sendMessage(tab.id, { action: "TOGGLE_WIDGET" }, (response) => {
      // If content script was not ready, inject it and try again
      if (chrome.runtime.lastError || !response) {
        chrome.scripting.executeScript(
          {
            target: { tabId: tab.id },
            files: ["content.js"],
          },
          () => {
            setTimeout(() => {
              chrome.tabs.sendMessage(tab.id, { action: "TOGGLE_WIDGET" });
            }, 100);
          }
        );
      }
    });
  } catch (err) {
    console.error("[Style Advisor Background Error]:", err);
  }
});
