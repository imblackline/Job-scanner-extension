chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // const linkedinTabInfo = document.getElementById('updated');
  // linkedinTabInfo.textContent = `Job: action`;

  // chrome.runtime.sendMessage({ action: "updated", jobTitle: message.jobTitle, companyName: message.companyName });

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
  let sheetCells = document.querySelectorAll('div[role="gridcell"]'); // Get all Google Sheets cells
  console.log(sheetCells);
  let newCell = null;
  for (let cell of sheetCells) {
      if (cell.innerText.trim() === "NEW") {
          newCell = cell;
          break;
      }
  }

  if (!newCell) {
      alert("No 'NEW' cell found. Please add 'NEW' where you want the job to be inserted.");
      return;
  }

  // Insert job title in the "NEW" cell
  newCell.innerText = jobTitle;

  // Find the next cell in the same row (company name)
  let companyCell = newCell.nextElementSibling;
  if (companyCell) {
      companyCell.innerText = companyName;
  }

  // Move "NEW" to the next row
  let rowCells = [...newCell.parentElement.children];
  let newIndex = rowCells.indexOf(newCell);
  
  let nextRow = newCell.parentElement.nextElementSibling;
  if (nextRow) {
      let nextRowCells = [...nextRow.children];
      let targetCell = nextRowCells[newIndex];
      if (targetCell) {
          targetCell.innerText = "NEW";
      }
  }
}
// function pasteIntoGoogleSheet(jobTitle, companyName) {
//   console.log("start");
//   let activeCell = document.activeElement;
//   console.log("Received message in background.js:", activeCell);
//   if (activeCell && activeCell.tagName === "INPUT") {
//     activeCell.value = `${jobTitle} - ${companyName}`;
//     let event = new Event("input", {
//       bubbles: true
//     });
//     activeCell.dispatchEvent(event);
//   } else {
//     alert("Click on a cell in Google Sheets before scanning.");
//   }
// }