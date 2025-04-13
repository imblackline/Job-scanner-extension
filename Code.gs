function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet1');
    var data = JSON.parse(e.postData.contents);

    var jobTitle = data.jobTitle || '';
    var companyName = data.companyName || '';
    var date = data.date || '';
    var link = data.link || '';
    var easyApply = data.easyApply ? 'Easy Apply' : 'Applied';
    var status1 = data.status1 || '';
    var status2 = data.status2 || '';
    var note1 = data.note1 || '';
    var note2 = data.note2 || '';
    var note3 = data.note3 || '';
    var country = data.country || '';
    var city = data.city || '';
    var workplaceType = data.workplaceType || '';
    var coverLetter = data.coverLetter || '';
    var detail = data.detail || '';

    sheet.appendRow([
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
      coverLetter,
      detail
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'Success' }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader("Access-Control-Allow-Origin", "*")
      .setHeader("Access-Control-Allow-Methods", "POST")
      .setHeader("Access-Control-Allow-Headers", "Content-Type");

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'Error', message: error.message }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader("Access-Control-Allow-Origin", "*")
      .setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
      .setHeader("Access-Control-Allow-Headers", "Content-Type");
  }
}


function doGet(e) {
  return ContentService
    .createTextOutput("Hello! This endpoint is working.")
    .setMimeType(ContentService.MimeType.TEXT);
}
