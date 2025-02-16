// Message handling
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Received in content script:", message);
    
    switch(message.type) {
        case 'SCAN_JOB':
            // Handle job scanning
            break;
        case 'UPDATE_UI':
            // Handle UI updates
            break;
        default:
            console.log('Unknown message type:', message.type);
    }
});

// Error handling
window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error('Content script error: ', {
        message: msg,
        url: url,
        lineNo: lineNo,
        columnNo: columnNo,
        error: error
    });
    return false;
};