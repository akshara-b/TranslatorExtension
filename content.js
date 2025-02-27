console.log("Content script is alive!");
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Message received:", message.action);
  if (message.action === "getURL") {
    console.log("Sending URL:", window.location.href);
    sendResponse({ url: window.location.href });
    return true;
  }
});