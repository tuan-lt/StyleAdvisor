/**
 * Style Advisor - Background Service Worker
 * Robust toolbar click handler to toggle Draggable In-Page Ingestor Widget on any webpage.
 */

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab || !tab.id || !tab.url) return;

  // Cannot inject into browser internal URLs
  if (
    tab.url.startsWith("chrome://") ||
    tab.url.startsWith("edge://") ||
    tab.url.startsWith("about:") ||
    tab.url.startsWith("chrome-extension://") ||
    tab.url.startsWith("view-source:")
  ) {
    return;
  }

  const sendToggleMessage = () => {
    chrome.tabs.sendMessage(tab.id, { action: "TOGGLE_WIDGET" }, (res) => {
      if (chrome.runtime.lastError || !res || !res.success) {
        // If content script was missing or not responding, inject and call directly
        chrome.scripting.executeScript(
          {
            target: { tabId: tab.id },
            files: ["content.js"],
          },
          () => {
            // Small delay to ensure initialization
            setTimeout(() => {
              chrome.tabs.sendMessage(tab.id, { action: "TOGGLE_WIDGET" }, () => {
                if (chrome.runtime.lastError) {
                  // Direct function execution fallback
                  chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    func: () => {
                      if (typeof window.__STYLE_ADVISOR_TOGGLE__ === "function") {
                        window.__STYLE_ADVISOR_TOGGLE__();
                      }
                    },
                  });
                }
              });
            }, 60);
          }
        );
      }
    });
  };

  sendToggleMessage();
});
