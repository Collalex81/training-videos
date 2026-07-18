/* ============================================================================
   Buzón de Sugerencias del Portal — Backend Google Apps Script
   Training Portal Suggestions — Google Apps Script backend
   ----------------------------------------------------------------------------
   Recibe sugerencias (y hasta 3 archivos opcionales) del sitio estático
   (GitHub Pages), guarda los archivos en tu Drive y agrega una fila a una
   Hoja de Google con un enlace clicable "Abrir" al archivo o a la carpeta.

   Receives suggestions (and up to 3 optional files), saves them to Drive, and
   appends a row to a Google Sheet with a clickable "Open" link to the file or
   folder. Optional email notification.

   El front-end envía POST con Content-Type "text/plain;charset=utf-8",
   mode "no-cors", cuerpo JSON:
     { ts, name, area, suggestion, link, lang, page,
       files: [ { name, type, b64 }, ... ] }        // 0..3 archivos
   (También acepta el formato antiguo de 1 archivo: fileName/fileType/fileB64.)
   ==========================================================================*/

/* ------------------------------ CONFIG ---------------------------------- */

// (Opcional) ID de la Hoja de Google. Vacío + script ligado a una Hoja = Hoja activa.
const SHEET_ID = "";
const SHEET_NAME = "Sugerencias";

// (Opcional) ID de la carpeta raíz en Drive. Vacío = se crea/usa FOLDER_NAME.
const FOLDER_ID = "";
const FOLDER_NAME = "Sugerencias del Portal";

// (Opcional) tu correo para recibir aviso por cada sugerencia. Vacío = sin aviso.
const NOTIFY_EMAIL = "";

// Límites (deben coincidir con el formulario): hasta MAX_FILES archivos y
// MAX_TOTAL_MB combinados.
const MAX_FILES = 3;
const MAX_TOTAL_MB = 12;

const HEADERS = [
  "Fecha/Timestamp", "Nombre/Name", "Área/Area", "Sugerencia/Suggestion",
  "Link", "Archivos/Files", "Abrir/Open", "Idioma/Lang", "Página/Page"
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
function safe_(v){ return s_(v).replace(/[\\/:*?"<>|]/g, "_").slice(0, 60).trim(); }
function stamp_(){ return Utilities.formatDate(new Date(), Session.getScriptTimeZone() || "America/New_York", "yyyyMMdd-HHmmss"); }

/* Normaliza el/los archivo(s) a un arreglo [{name,type,b64}]. */
function readFiles_(p) {
  var out = [];
  if (p && Array.isArray(p.files)) {
    p.files.forEach(function(f){ if (f && f.b64 && f.name) out.push({ name:s_(f.name), type:s_(f.type)||"application/octet-stream", b64:f.b64 }); });
  } else if (p && p.fileB64 && p.fileName) { // compatibilidad con formato antiguo
    out.push({ name:s_(p.fileName), type:s_(p.fileType)||"application/octet-stream", b64:p.fileB64 });
  }
  return out.slice(0, MAX_FILES);
}

/* ------------------------------ ROUTES ---------------------------------- */

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);

    var p = {};
    if (e && e.postData && e.postData.contents) {
      try { p = JSON.parse(e.postData.contents) || {}; }
      catch (err) { return jsonOut_({ ok:false, error:"Invalid JSON" }); }
    } else {
      return jsonOut_({ ok:false, error:"Empty body" });
    }

    var files = readFiles_(p);
    var savedNames = [];   // nombres originales guardados
    var openUrl = "";      // URL cruda (archivo o carpeta) para email
    var openCell = "";     // lo que va en la columna "Abrir" (fórmula HYPERLINK o nota)

    if (files.length) {
      // Decodificar y medir tamaño combinado.
      var blobs = [], total = 0, ok = true;
      for (var i = 0; i < files.length; i++) {
        try {
          var bytes = Utilities.base64Decode(files[i].b64);
          total += bytes.length;
          blobs.push(Utilities.newBlob(bytes, files[i].type, files[i].name));
        } catch (de) { ok = false; }
      }
      if (!ok) {
        openCell = "(error al decodificar un archivo)";
      } else if (total > MAX_TOTAL_MB * 1024 * 1024) {
        openCell = "(archivos omitidos: exceden " + MAX_TOTAL_MB + " MB combinados)";
      } else {
        var parent = getFolder_();
        if (files.length === 1) {
          // Un solo archivo: va directo a la carpeta raíz.
          var one = parent.createFile(blobs[0].setName(stamp_() + "__" + safe_(files[0].name)));
          savedNames.push(files[0].name);
          openUrl = one.getUrl();
          openCell = '=HYPERLINK("' + openUrl + '","Abrir archivo")';
        } else {
          // Varios archivos: subcarpeta propia por envío.
          var who = safe_(p.name); var sub = parent.createFolder(stamp_() + (who ? ("__" + who) : "__sugerencia"));
          for (var j = 0; j < blobs.length; j++) {
            sub.createFile(blobs[j].setName(safe_(files[j].name)));
            savedNames.push(files[j].name);
          }
          openUrl = sub.getUrl();
          openCell = '=HYPERLINK("' + openUrl + '","Abrir carpeta (' + files.length + ')")';
        }
      }
    }

    var sh = getSheet_();
    sh.appendRow([
      s_(p.ts) || new Date().toISOString(),
      s_(p.name), s_(p.area), s_(p.suggestion), s_(p.link),
      savedNames.join(", "), openCell, s_(p.lang), s_(p.page)
    ]);

    if (NOTIFY_EMAIL && String(NOTIFY_EMAIL).trim() !== "") {
      try {
        var body = "Nueva sugerencia / New suggestion\n\n" +
          "Nombre/Name: " + (s_(p.name) || "(anónimo/anonymous)") + "\n" +
          "Área/Area: " + s_(p.area) + "\n" +
          "Sugerencia/Suggestion:\n" + s_(p.suggestion) + "\n\n" +
          (s_(p.link) ? ("Link: " + s_(p.link) + "\n") : "") +
          (savedNames.length ? ("Archivos/Files: " + savedNames.join(", ") + "\n") : "") +
          (openUrl ? ("Abrir/Open: " + openUrl + "\n") : "") +
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

function jsonOut_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
