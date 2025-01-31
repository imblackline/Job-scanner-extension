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
chrome.storage.local.get("accessToken", function (data) {
  if (data.accessToken) {
    fetch("https://sheets.googleapis.com/v4/spreadsheets/YOUR_SHEET_ID/values/Sheet1!A:B:append?valueInputOption=RAW", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${data.accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          values: [
            ["Job Title", "Company Name"]
          ]
        })
      })
      .then(response => response.json())
      .then(data => console.log("✅ Data added:", data))
      .catch(error => console.error("❌ Error:", error));
  }
});