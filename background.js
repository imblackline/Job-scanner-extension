chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.jobTitle && message.companyName) {
    chrome.tabs.query({}, (tabs) => {
      let sheetsTab = tabs.find(tab => tab.url.includes("docs.google.com/spreadsheets"));

      if (sheetsTab) {
        chrome.scripting.executeScript({
          target: {
            tabId: sheetsTab.id
          },
          function: pasteIntoGoogleSheet,
          args: [message.jobTitle, message.companyName]
        });
      } else {
        console.log("Google Sheets tab not found. Please open a Google Sheet.");
      }
    });
  }
});


function pasteIntoGoogleSheet(jobTitle, companyName) {
  console.log("object", jobTitle);
 

}
