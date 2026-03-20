// ============================================================
// KATIE & RILEY WEDDING PHOTO UPLOAD — Google Apps Script
// ============================================================
// SETUP INSTRUCTIONS:
// 1. Go to https://script.google.com and create a New Project
// 2. Paste ALL of this code into the editor (replace any existing code)
// 3. Click "Deploy" → "New deployment"
// 4. Type: Web app
// 5. Execute as: Me
// 6. Who has access: Anyone
// 7. Click Deploy → copy the Web App URL
// 8. Paste that URL into index.html where it says APPS_SCRIPT_URL
// ============================================================

var FOLDER_NAME = 'Katie & Riley Wedding Photos';

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var imageData = data.image;       // base64 data URL
    var caption   = data.caption || '';
    var guest     = data.guest || 'Guest';
    var timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    var fileName  = 'WeddingPhoto_' + timestamp + '.jpg';

    // Find or create the wedding photos folder in Drive
    var folders = DriveApp.getFoldersByName(FOLDER_NAME);
    var folder  = folders.hasNext() ? folders.next() : DriveApp.createFolder(FOLDER_NAME);

    // Strip the data URL prefix and decode base64
    var base64 = imageData.replace(/^data:image\/\w+;base64,/, '');
    var blob   = Utilities.newBlob(Utilities.base64Decode(base64), 'image/jpeg', fileName);

    // Save to Drive
    var file = folder.createFile(blob);

    // Store caption and guest name as file description
    var description = '';
    if (guest)   description += 'From: ' + guest + '\n';
    if (caption) description += 'Caption: ' + caption;
    if (description) file.setDescription(description);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, fileId: file.getId() }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput('Katie & Riley Wedding Photo API is running!')
    .setMimeType(ContentService.MimeType.TEXT);
}
