/* ============================================================================
   Buzón de Sugerencias del Portal — Backend Google Apps Script
   Training Portal Suggestions — Google Apps Script backend
   ----------------------------------------------------------------------------
   Recibe sugerencias (y un archivo opcional) enviadas por el sitio estático
   (GitHub Pages), guarda el archivo en una carpeta de tu Drive y agrega una
   fila a una Hoja de Google. Opcionalmente te avisa por correo.

   Receives suggestions (and an optional file) POSTed by the static site,
   saves the file to a Drive folder, appends a row to a Google Sheet, and can
   email you a notification.

   El front-end envía un POST con:
     - Content-Type: "text/plain;charset=utf-8"
     - mode: "no-cors"  (no lee la respuesta)
   El cuerpo es un JSON con estas claves:
     { ts, name, area, suggestion, link, lang, page,
       fileName, fileType, fileB64 }
   ==========================================================================*/

/* ------------------------------ CONFIG ---------------------------------- */

// (Opcional) ID de la Hoja de Google donde se agregan las filas. Si lo dejas
// vacío y este script está ligado a una Hoja (Extensiones > Apps Script desde
// la Hoja), usa la Hoja activa.
// (Optional) Google Sheet ID. If empty and the script is bound to a Sheet,
// it uses the active spreadsheet.
const SHEET_ID = "";

// Nombre de la pestaña donde se guardan las sugerencias (se crea sola).
const SHEET_NAME = "Sugerencias";

// (Opcional) ID de la carpeta de Drive donde guardar los archivos. Si lo dejas
// vacío, el script crea/usa una carpeta llamada FOLDER_NAME en "Mi unidad".
// (Optional) Drive folder ID for uploaded files. If empty, a folder named
// FOLDER_NAME is created/used in My Drive.
const FOLDER_ID = "";
const FOLDER_NAME = "Sugerencias del Portal";

// (Opcional) Tu correo para recibir un aviso por cada sugerencia. Vacío = sin
// aviso. (Optional) Your email to get notified on each suggestion. Empty = off.
const NOTIFY_EMAIL = "";

// Límite de tamaño del archivo (MB) que el backend aceptará.
const MAX_MB = 12;

const HEADERS = [
  "Fecha/Timestamp", "Nombre/Name", "Área/Area", "Sugerencia/Suggestion",
  "Link", "Archivo/File", "URL del archivo/File URL", "Idioma/Lang", "Página/Page"
];

/* ------------------------------ HELPERS --------------------------------- */

function getSheet_() {
  var ss = (SHEET_ID && String(SHEET_ID).trim() !== "")
    ? SpreadsheetApp.openById(SHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error("No spreadsheet: set SHEET_ID or bind this script to a Sheet.");
  var sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sh.setFrozenRows(1);
    sh.setColumnWidths(1, HEADERS.length, 160);
  }
  return sh;
}

function getFolder_() {
  if (FOLDER_ID && String(FOLDER_ID).trim() !== "") return DriveApp.getFolderById(FOLDER_ID);
  var it = DriveApp.getFoldersByName(FOLDER_NAME);
  return it.hasNext() ? it.next() : DriveApp.createFolder(FOLDER_NAME);
}

function s_(v){ return (v === null || v === undefined) ? "" : String(v); }

/* ------------------------------ ROUTES ---------------------------------- */

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);

    var p = {};
    if (e && e.postData && e.postData.contents) {
      try { p = JSON.parse(e.postData.contents) || {}; }
      catch (err) { return jsonOut_({ ok:false, error:"Invalid JSON" }); }
    } else {
      return jsonOut_({ ok:false, error:"Empty body" });
    }

    // Guardar el archivo (si viene) en Drive.
    var fileUrl = "";
    if (p.fileB64 && p.fileName) {
      try {
        var bytes = Utilities.base64Decode(p.fileB64);
        if (bytes.length <= MAX_MB * 1024 * 1024) {
          var blob = Utilities.newBlob(bytes, p.fileType || "application/octet-stream", cleanName_(p.fileName));
          var file = getFolder_().createFile(blob);
          fileUrl = file.getUrl();
        } else {
          fileUrl = "(archivo omitido: excede " + MAX_MB + " MB)";
        }
      } catch (fe) {
        fileUrl = "(error al guardar archivo: " + String(fe) + ")";
      }
    }

    var sh = getSheet_();
    sh.appendRow([
      s_(p.ts) || new Date().toISOString(),
      s_(p.name), s_(p.area), s_(p.suggestion), s_(p.link),
      s_(p.fileName), fileUrl, s_(p.lang), s_(p.page)
    ]);

    if (NOTIFY_EMAIL && String(NOTIFY_EMAIL).trim() !== "") {
      try {
        var body = "Nueva sugerencia / New suggestion\n\n" +
          "Nombre/Name: " + (s_(p.name) || "(anónimo/anonymous)") + "\n" +
          "Área/Area: " + s_(p.area) + "\n" +
          "Sugerencia/Suggestion:\n" + s_(p.suggestion) + "\n\n" +
          (s_(p.link) ? ("Link: " + s_(p.link) + "\n") : "") +
          (fileUrl ? ("Archivo/File: " + fileUrl + "\n") : "") +
          "\nIdioma/Lang: " + s_(p.lang);
        MailApp.sendEmail(NOTIFY_EMAIL, "Nueva sugerencia del portal de entrenamiento", body);
      } catch (me) { /* no romper si falla el correo */ }
    }

    return jsonOut_({ ok:true });
  } catch (err) {
    return jsonOut_({ ok:false, error:String(err) });
  } finally {
    try { lock.releaseLock(); } catch (ignore) {}
  }
}

function doGet(e) {
  return jsonOut_({ ok:true, service:"Portal suggestions", time:new Date().toISOString() });
}

function cleanName_(name) {
  var n = String(name || "archivo").replace(/[\\/:*?"<>|]/g, "_").slice(0, 120);
  var stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || "America/New_York", "yyyyMMdd-HHmmss");
  return stamp + "__" + n;
}

function jsonOut_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
