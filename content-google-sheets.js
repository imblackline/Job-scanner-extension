chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "addToSheet") {
      // Find first empty row in column A
      let row = 1;
      while (document.querySelector(`[aria-label="A${row}"]`)) {
        row++;
      }
  
      // Set values in Google Sheets
      const colA = document.querySelector(`[aria-label="A${row}"]`);
      const colB = document.querySelector(`[aria-label="B${row}"]`);
      
      colA.textContent = request.data.jobTitle;
      colB.textContent = request.data.companyName;
      
      // Trigger input events to ensure changes are saved
      colA.dispatchEvent(new Event('input', { bubbles: true }));
      colB.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });