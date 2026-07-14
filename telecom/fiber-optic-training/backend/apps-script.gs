/* ============================================================================
   Fiber Optic Telecommunications Training — Google Apps Script sync backend
   Backend de sincronizacion (Google Apps Script)
   ----------------------------------------------------------------------------
   Receives training events POSTed by the STATIC site (GitHub Pages) and
   appends one row per event to a Google Sheet.

   The front-end sends an HTTP POST with:
     - Content-Type: "text/plain;charset=utf-8"
     - mode: "no-cors"   (it does NOT read the response)
   The body is a JSON string with these exact keys:
     { ts, event, name, email, moduleId, module, score, passed,
       attempts, certificate, clientId, lang, startedAt }

   event is one of: "register" | "module_pass" | "final_exam" | "certificate"
   One POST = one event = one appended row.

   Because the client uses no-cors, it never reads what we return, so we always
   respond HTTP 200 with JSON and never throw out of doPost/doGet.
   ==========================================================================*/

/* ------------------------------ CONFIG ---------------------------------- */

// Paste the target Google Sheet ID here (the long string in the Sheet URL:
//   https://docs.google.com/spreadsheets/d/<THIS_IS_THE_ID>/edit ).
// If left empty AND this script is container-bound (created via a Sheet's
// Extensions > Apps Script), it falls back to the active spreadsheet.
const SHEET_ID = "";

// Tab (sheet) name where rows are appended. Created automatically if missing.
const SHEET_NAME = "Progress";

// Header row written once when the tab is empty. Column order is the contract
// used by doPost() when appending rows — do not reorder without updating it.
const HEADERS = [
  "Timestamp",
  "Event",
  "Name",
  "Email",
  "Module",
  "Score (%)",
  "Passed",
  "Attempts",
  "Certificate #",
  "Client ID",
  "Language",
  "Started At"
];

/* ------------------------------ HELPERS --------------------------------- */

/**
 * Open the spreadsheet, get (or create) the target tab, ensure the header row,
 * and return the Sheet object.
 */
function getSheet_() {
  // Prefer an explicit SHEET_ID; otherwise use the container-bound spreadsheet.
  var ss;
  if (SHEET_ID && String(SHEET_ID).trim() !== "") {
    ss = SpreadsheetApp.openById(SHEET_ID);
  } else {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  }
  if (!ss) {
    throw new Error(
      "No spreadsheet available: set SHEET_ID or bind this script to a Sheet."
    );
  }

  // Get or create the tab.
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  // Write the header row only when the sheet is completely empty.
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1); // keep the header visible when scrolling
  }

  return sheet;
}

/**
 * Coerce a boolean-ish value.
 * Accepts real booleans, "true"/"false" strings, 1/0, or "" (empty pass-through).
 * Returns true, false, or "" so the sheet mirrors the front-end contract.
 */
function coerceBool_(v) {
  if (v === true || v === false) return v;
  if (v === "" || v === null || v === undefined) return "";
  var s = String(v).trim().toLowerCase();
  if (s === "true" || s === "1" || s === "yes") return true;
  if (s === "false" || s === "0" || s === "no") return false;
  return ""; // unknown -> empty, never throw
}

/**
 * Coerce a numeric value.
 * Returns a number, or "" for empty/invalid input (never NaN, never throws).
 */
function coerceNum_(v) {
  if (v === "" || v === null || v === undefined) return "";
  var n = Number(v);
  return isNaN(n) ? "" : n;
}

/**
 * Coerce any value to a plain string; "" for null/undefined.
 */
function coerceStr_(v) {
  if (v === null || v === undefined) return "";
  return String(v);
}

/* ------------------------------ ROUTES ---------------------------------- */

/**
 * POST endpoint: append one training event as a row.
 * Uses a script lock so concurrent requests do not clobber each other.
 * Always returns JSON with HTTP 200 (the no-cors client never reads it, but
 * this keeps browser and owner testing sane).
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    // Serialize appends to avoid race conditions on getLastRow()/appendRow().
    lock.waitLock(10000); // wait up to ~10 seconds

    // Safely parse the JSON body. Guard against missing/invalid payloads.
    var payload = {};
    if (e && e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents) || {};
      } catch (parseErr) {
        // Malformed JSON: return a clean error instead of throwing.
        return jsonOut_({ ok: false, error: "Invalid JSON: " + String(parseErr) });
      }
    } else {
      return jsonOut_({ ok: false, error: "Empty request body" });
    }

    var sheet = getSheet_();

    // Map payload fields to header columns, in order. Note: "moduleId" is part
    // of the contract but the visible "Module" column stores the human label.
    var row = [
      coerceStr_(payload.ts),          // Timestamp
      coerceStr_(payload.event),       // Event
      coerceStr_(payload.name),        // Name
      coerceStr_(payload.email),       // Email
      coerceStr_(payload.module),      // Module
      coerceNum_(payload.score),       // Score (%)
      coerceBool_(payload.passed),     // Passed
      coerceNum_(payload.attempts),    // Attempts
      coerceStr_(payload.certificate), // Certificate #
      coerceStr_(payload.clientId),    // Client ID
      coerceStr_(payload.lang),        // Language
      coerceStr_(payload.startedAt)    // Started At
    ];

    sheet.appendRow(row);

    return jsonOut_({ ok: true });
  } catch (err) {
    // Any unexpected failure still returns HTTP 200 + JSON.
    return jsonOut_({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (ignore) {}
  }
}

/**
 * GET endpoint: a simple health check so the owner can open the /exec URL in a
 * browser and confirm the deployment is live.
 */
function doGet(e) {
  return jsonOut_({
    ok: true,
    service: "FOT training sync",
    time: new Date().toISOString()
  });
}

/**
 * Build a JSON ContentService response.
 */
function jsonOut_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
