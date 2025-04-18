function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet1');
    var data = JSON.parse(e.postData.contents);

    var jobTitle = data.jobTitle || '';
    var companyName = data.companyName || '';
    var date = data.date || '';
    var link = data.link || '';
    var easyApply = data.easyApply ? 'Easy Apply' : 'Applied';
    var status1 = data.status1 || 'Not Respond';
    var status2 = data.lastStatus || 'Not Respond';
    var note1 = data.interviewDates || '-';
    var note2 = data.followUpDate || '-';
    var note3 = data.salaryOffered || '-';
    var country = data.country || '';
    var city = data.city || '';
    var workplaceType = data.workplaceType || '';
    var coverLetter = data.coverLetter || '';
    var publishDate = data.publishDate || '';
    var details = data.details || '';

    // Find the first row with an empty column A
    var values = sheet.getRange("A:A").getValues();
    var insertRow = -1;
    
    for (var i = 0; i < values.length; i++) {
      if (!values[i][0] || values[i][0] === "") {
        insertRow = i + 1; // +1 because array is 0-indexed but sheet rows are 1-indexed
        break;
      }
    }
    
    if (insertRow === -1) {
      insertRow = sheet.getLastRow() + 1;
    }
    
    var templateRow = insertRow > 1 ? insertRow - 1 : 1;
    
    var needToInsert = insertRow <= sheet.getLastRow();
    
    if (needToInsert) {
      sheet.insertRowBefore(insertRow);
    }
    
    var rowValues = [
      jobTitle,
      companyName,
      date,
      `=HYPERLINK("${link}", "Link")`,
      easyApply,
      status1,
      status2,
      note1,
      note2,
      note3,
      country,
      city,
      workplaceType,
      publishDate,
      coverLetter,
      details
    ];
    
    sheet.getRange(insertRow, 1, 1, rowValues.length).setValues([rowValues]);
    
    var numCols = sheet.getMaxColumns();
    var sourceRange = sheet.getRange(templateRow, 1, 1, numCols);
    sourceRange.copyFormatToRange(sheet, 1, numCols, insertRow, insertRow);
    
    sheet.getRange(insertRow, 4).setValue(`=HYPERLINK("${link}", "Link")`);

    var checkboxCol = 15; // Adjust if your checkbox is in a different column
    if (numCols >= checkboxCol) {
      var checkboxCell = sheet.getRange(insertRow, checkboxCol);
      if (checkboxCell.getDataValidation() === null) {
        checkboxCell.insertCheckboxes();
      }
    }

    return jsonResponse_({ result: 'Success' });
  } catch (error) {
    return jsonResponse_({ result: 'Error', message: error.message });
  }
}

function doOptions(e) {
  return jsonResponse_({});
}

function jsonResponse_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader("Access-Control-Allow-Origin", "*")
    .setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    .setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}
