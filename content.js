chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Received in content script:", message);
});
