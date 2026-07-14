/* ============================================================================
   Fiber Optic Telecommunications Training — Shared Progress Engine
   Motor de progreso compartido (dashboard + módulos)
   ----------------------------------------------------------------------------
   Almacena todo en localStorage (sin backend; funciona en GitHub Pages).
   Stores everything in localStorage (no backend; works on GitHub Pages).

   Opcional: sincroniza eventos de progreso a un Google Sheet mediante un
   Apps Script Web App (ver bloque SYNC más abajo). Optional: syncs progress
   events to a Google Sheet through an Apps Script Web App (see SYNC block).

   Expone un objeto global: FOT
   - FOT.MODULES, FOT.PASS
   - FOT.get() / FOT.save(state)
   - FOT.setEmployee(name, email) / FOT.hasEmployee() / FOT.isValidEmail(e)
   - FOT.setLang(l) / FOT.getLang() / FOT.setTheme(t) / FOT.getTheme()
   - FOT.statusOf(id)  -> 'locked'|'available'|'in_progress'|'completed'
   - FOT.recordProgress(id, lessonIndex, total)
   - FOT.recordTime(id, ms)
   - FOT.recordQuiz(id, scorePct) -> registra intento; completa si best>=PASS
   - FOT.moduleRecord(id)
   - FOT.overallPercent()
   - FOT.finalExamUnlocked() / FOT.recordFinalExam(scorePct)
   - FOT.certificateReady() / FOT.issueCertificate() / FOT.certRecord()
   - FOT.reset()
   ==========================================================================*/
(function (global) {
  "use strict";

  var KEY  = "fot_progress_v1";
  var PASS = 80; // % mínimo para aprobar / minimum passing score

  // ==========================================================================
  // SYNC — Guardado opcional a Google Sheets vía Apps Script Web App.
  // SYNC — Optional save to Google Sheets through an Apps Script Web App.
  // --------------------------------------------------------------------------
  // EN: Paste your Apps Script Web App "/exec" URL between the quotes below to
  //     enable saving progress to your Google Sheet. Leave it empty ("") to
  //     keep all progress only in this browser (localStorage). You can also
  //     define window.FOT_SYNC_URL before this script loads to override it.
  // ES: Pega la URL "/exec" de tu Web App de Apps Script entre las comillas de
  //     abajo para guardar el progreso en tu Google Sheet. Déjala vacía ("")
  //     para mantener el progreso solo en este navegador (localStorage).
  //     También puedes definir window.FOT_SYNC_URL antes de cargar este script.
  var SYNC_URL = ""; // <-- OWNER: paste your /exec URL here / pega aquí tu URL /exec
  var SYNC_QUEUE_KEY = "fot_sync_queue_v1";

  // URL efectiva: prioriza el override global window.FOT_SYNC_URL.
  // Effective URL: honors the window.FOT_SYNC_URL override first.
  function effectiveSyncUrl() {
    try {
      if (typeof global.FOT_SYNC_URL === "string" && global.FOT_SYNC_URL) {
        return global.FOT_SYNC_URL;
      }
    } catch (e) {}
    return SYNC_URL || "";
  }

  // Orden de módulos y metadatos. Las rutas son relativas al dashboard
  // (telecom/fiber-optic-training/index.html).
  var MODULES = [
    { id: "m1", order: 1, file: "module-01-layer-1/index.html",
      code: "01",
      title: { en: "Layer 1 & Fiber Components",      es: "Layer 1 y componentes de fibra" },
      desc:  { en: "The physical layer: what fiber is, how it is built, fiber & connector types, splicing, cleaning and inspection.",
               es: "La capa física: qué es la fibra, cómo se construye, tipos de fibra y conectores, empalmes, limpieza e inspección." },
      accent: "#2563EB", ready: true },
    { id: "m2", order: 2, file: "module-02-optical-physics/index.html",
      code: "02",
      title: { en: "Optical Transmission Physics",     es: "Física de la transmisión óptica" },
      desc:  { en: "Light as a wave, refraction & Snell's law, total internal reflection, attenuation, dispersion, dB/dBm and optical budget.",
               es: "La luz como onda, refracción y ley de Snell, reflexión interna total, atenuación, dispersión, dB/dBm y presupuesto óptico." },
      accent: "#2563EB", ready: true },
    { id: "m3", order: 3, file: "module-03-optical-transmission/index.html",
      code: "03",
      title: { en: "Transport, SFP, WDM & Protocols",  es: "Transporte, SFP, WDM y protocolos" },
      desc:  { en: "Transceivers, SFP families, simplex/duplex/BiDi, WDM/CWDM/DWDM, tunable SFP, Ethernet, CPRI and eCPRI.",
               es: "Transceptores, familias SFP, simplex/duplex/BiDi, WDM/CWDM/DWDM, SFP sintonizable, Ethernet, CPRI y eCPRI." },
      accent: "#2563EB", ready: true },
    { id: "m4", order: 4, file: "module-04-testing-troubleshooting/index.html",
      code: "04",
      title: { en: "Testing, Certification & Troubleshooting", es: "Pruebas, certificación y troubleshooting" },
      desc:  { en: "VFL, power meter, light source, OLTS and OTDR; reading a trace, structured troubleshooting and test reports.",
               es: "VFL, power meter, fuente de luz, OLTS y OTDR; interpretar una traza, troubleshooting estructurado y reportes." },
      accent: "#2563EB", ready: true },
    { id: "m5", order: 5, file: "module-05-safety/index.html",
      code: "05",
      title: { en: "Fiber Safety",                     es: "Seguridad con fibra óptica" },
      desc:  { en: "Glass shards, laser safety, waste handling, PPE, tool safety, field safety and incident response.",
               es: "Fragmentos de vidrio, seguridad láser, manejo de residuos, EPP, herramientas, seguridad de campo y respuesta a incidentes." },
      accent: "#2563EB", ready: false }
  ];

  function nowISO() { return new Date().toISOString(); }

  function isValidEmail(e) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((e || "").trim());
  }

  function genClientId() {
    return "c-" + Date.now() + "-" + Math.random().toString(36).slice(2, 10);
  }

  function blank() {
    return {
      version: 1,
      employee: { name: "", email: "", startedAt: "" },
      lang: "en",
      theme: "light",
      clientId: "",
      modules: {},   // id -> record
      finalExam: { attempts: [], best: 0, passed: false, completedAt: "" },
      certificate: { issued: false, number: "", date: "", name: "", email: "", score: 0 }
    };
  }

  function blankModule() {
    return { status: "locked", lastLesson: 0, total: 0, lessonsDone: [],
             percent: 0, timeMs: 0, best: 0, attempts: [], completedAt: "" };
  }

  function load() {
    var s;
    try { s = JSON.parse(localStorage.getItem(KEY)); } catch (e) { s = null; }
    if (!s || typeof s !== "object") s = blank();
    if (!s.employee) s.employee = { name: "", email: "", startedAt: "" };
    // normaliza registros antiguos sin email / normalize older records missing email
    if (typeof s.employee.email !== "string") s.employee.email = "";
    if (!s.modules)  s.modules = {};
    if (!s.finalExam) s.finalExam = { attempts: [], best: 0, passed: false, completedAt: "" };
    if (!s.certificate) s.certificate = { issued: false, number: "", date: "", name: "", email: "", score: 0 };
    if (typeof s.certificate.email !== "string") s.certificate.email = "";
    if (!s.lang)  s.lang = "en";
    if (!s.theme) s.theme = "light";
    // clientId persistente para identificar el navegador / persistent per-browser id
    if (!s.clientId) { s.clientId = genClientId(); save(s); }
    // normaliza registros de módulos
    for (var i = 0; i < MODULES.length; i++) {
      var id = MODULES[i].id;
      if (!s.modules[id]) s.modules[id] = blankModule();
    }
    return s;
  }

  function save(s) {
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {}
    return s;
  }

  // ==========================================================================
  // SYNC — cola en localStorage + envío por HTTP POST (no-cors, opaco).
  // SYNC — localStorage queue + HTTP POST delivery (no-cors, opaque).
  // --------------------------------------------------------------------------
  function loadQueue() {
    var q;
    try { q = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY)); } catch (e) { q = null; }
    return (Object.prototype.toString.call(q) === "[object Array]") ? q : [];
  }

  function saveQueue(q) {
    try { localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(q)); } catch (e) {}
  }

  function pushEvent(obj) {
    try {
      var q = loadQueue();
      q.push(obj);
      saveQueue(q);
    } catch (e) {}
  }

  // Intenta enviar cada elemento; lo elimina si el fetch se resuelve
  // (respuesta opaca == éxito) y lo conserva si la red falla.
  // Tries each queued item; removes it if the fetch resolves (opaque response
  // == success) and keeps it if the network fails.
  function flushQueue() {
    try {
      var url = effectiveSyncUrl();
      if (!url) return;               // sin URL: conserva la cola / no URL: keep queue
      var q = loadQueue();
      if (!q.length) return;
      var remaining = q.slice();

      function persist() { saveQueue(remaining); }

      function step(i) {
        if (i >= q.length) { persist(); return; }
        var item = q[i];
        try {
          fetch(url, {
            method: "POST",
            mode: "no-cors",
            keepalive: true,
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify(item)
          }).then(function () {
            // resuelto (opaco) => éxito: quita el elemento / resolved => success
            var idx = remaining.indexOf(item);
            if (idx >= 0) remaining.splice(idx, 1);
            persist();
            step(i + 1);
          }).catch(function () {
            // fallo de red => conserva y detiene por ahora / keep & stop for now
            persist();
          });
        } catch (e) {
          persist();
        }
      }

      step(0);
    } catch (e) {}
  }

  // Construye el payload desde el estado actual + extra, encola y vacía.
  // Builds the payload from current state + extra, enqueues and flushes.
  function sendEvent(event, extra) {
    try {
      var s = load();
      extra = extra || {};
      var payload = {
        ts: nowISO(),
        event: event,
        name: s.employee.name || "",
        email: s.employee.email || "",
        moduleId: ("moduleId" in extra) ? extra.moduleId : "",
        module: ("module" in extra) ? extra.module : "",
        score: ("score" in extra) ? extra.score : "",
        passed: ("passed" in extra) ? extra.passed : "",
        attempts: ("attempts" in extra) ? extra.attempts : "",
        certificate: ("certificate" in extra) ? extra.certificate : "",
        clientId: s.clientId || "",
        lang: s.lang || "en",
        startedAt: s.employee.startedAt || ""
      };
      pushEvent(payload);
      flushQueue();
    } catch (e) {}
  }

  function idxOf(id) {
    for (var i = 0; i < MODULES.length; i++) if (MODULES[i].id === id) return i;
    return -1;
  }

  // Estado calculado de un módulo (respeta el desbloqueo progresivo).
  function statusOf(id) {
    var s = load();
    var i = idxOf(id);
    if (i < 0) return "locked";
    var rec = s.modules[id];
    if (rec.completedAt) return "completed";
    if (i === 0) return rec.percent > 0 ? "in_progress" : "available";
    var prev = s.modules[MODULES[i - 1].id];
    if (prev && prev.completedAt) return rec.percent > 0 ? "in_progress" : "available";
    return "locked";
  }

  function recordProgress(id, lessonIndex, total) {
    var s = load();
    var rec = s.modules[id]; if (!rec) return;
    if (total) rec.total = total;
    if (lessonIndex > rec.lastLesson) rec.lastLesson = lessonIndex;
    if (rec.lessonsDone.indexOf(lessonIndex) < 0) rec.lessonsDone.push(lessonIndex);
    if (rec.total) rec.percent = Math.min(100, Math.round((rec.lessonsDone.length / rec.total) * 100));
    if (!rec.completedAt && rec.status === "locked") rec.status = "in_progress";
    if (!rec.completedAt) rec.status = rec.percent >= 100 ? "in_progress" : "in_progress";
    save(s);
  }

  function recordTime(id, ms) {
    if (!ms || ms < 0) return;
    var s = load();
    var rec = s.modules[id]; if (!rec) return;
    rec.timeMs = (rec.timeMs || 0) + ms;
    save(s);
  }

  function recordQuiz(id, scorePct) {
    var s = load();
    var rec = s.modules[id]; if (!rec) return null;
    scorePct = Math.round(scorePct);
    rec.attempts.push({ score: scorePct, date: nowISO(), pass: scorePct >= PASS });
    if (scorePct > rec.best) rec.best = scorePct;
    var justPassed = false;
    if (rec.best >= PASS && !rec.completedAt) {
      rec.completedAt = nowISO();
      rec.status = "completed";
      rec.percent = 100;
      justPassed = true;
    }
    save(s);
    // Sólo dispara en la transición de aprobado (no en cada intento).
    // Fire only on the passing transition (not on every attempt).
    if (justPassed) {
      var mi = idxOf(id);
      var title = (mi >= 0 ? MODULES[mi].title.en : "");
      sendEvent("module_pass", { moduleId: id, module: title, score: rec.best, passed: true, attempts: rec.attempts.length });
    }
    return { best: rec.best, passed: rec.best >= PASS, attempts: rec.attempts.length };
  }

  function moduleRecord(id) { return load().modules[id] || blankModule(); }

  function overallPercent() {
    var s = load(), sum = 0;
    for (var i = 0; i < MODULES.length; i++) sum += (s.modules[MODULES[i].id].percent || 0);
    return Math.round(sum / MODULES.length);
  }

  function allModulesCompleted() {
    var s = load();
    for (var i = 0; i < MODULES.length; i++) if (!s.modules[MODULES[i].id].completedAt) return false;
    return true;
  }

  function finalExamUnlocked() { return allModulesCompleted(); }

  function recordFinalExam(scorePct) {
    var s = load();
    scorePct = Math.round(scorePct);
    s.finalExam.attempts.push({ score: scorePct, date: nowISO(), pass: scorePct >= PASS });
    if (scorePct > s.finalExam.best) s.finalExam.best = scorePct;
    if (s.finalExam.best >= PASS && !s.finalExam.passed) {
      s.finalExam.passed = true;
      s.finalExam.completedAt = nowISO();
    }
    save(s);
    sendEvent("final_exam", { score: scorePct, passed: (scorePct >= PASS), attempts: s.finalExam.attempts.length });
    return { best: s.finalExam.best, passed: s.finalExam.passed, attempts: s.finalExam.attempts.length };
  }

  function certificateReady() { return load().finalExam.passed === true; }

  function issueCertificate() {
    var s = load();
    if (!s.finalExam.passed) return null;
    if (!s.certificate.issued) {
      var d = new Date();
      var yr = d.getFullYear();
      // número único determinista a partir de nombre + fecha de inicio
      var seed = (s.employee.name || "TRAINEE") + "|" + (s.employee.startedAt || nowISO());
      var h = 0;
      for (var i = 0; i < seed.length; i++) { h = (h * 31 + seed.charCodeAt(i)) >>> 0; }
      var serial = ("00000" + (h % 100000)).slice(-5);
      s.certificate.issued = true;
      s.certificate.number = "FOT-" + yr + "-" + serial;
      s.certificate.date   = d.toISOString().slice(0, 10);
      s.certificate.name   = s.employee.name || "";
      s.certificate.email  = s.employee.email || "";
      s.certificate.score  = s.finalExam.best;
      save(s);
      sendEvent("certificate", { certificate: s.certificate.number, score: s.certificate.score });
    }
    return s.certificate;
  }

  function certRecord() { return load().certificate; }

  function setEmployee(name, email) {
    var s = load();
    s.employee.name = (name || "").trim();
    // Backward tolerant: si email es undefined, se trata como "".
    // Backward tolerant: if email is undefined, treat it as "".
    s.employee.email = (email === undefined || email === null) ? "" : (email + "").trim();
    if (!s.employee.startedAt) s.employee.startedAt = nowISO();
    save(s);
    sendEvent("register", {});
    return s.employee;
  }
  function hasEmployee() {
    var e = load().employee;
    return !!(e && (e.name || "").trim().length >= 2 && isValidEmail(e.email));
  }
  function employee() { return load().employee; }

  function setLang(l)  { var s = load(); s.lang  = (l === "es" ? "es" : "en"); save(s); return s.lang; }
  function getLang()   { return load().lang; }
  function setTheme(t) { var s = load(); s.theme = (t === "dark" ? "dark" : "light"); save(s); return s.theme; }
  function getTheme()  { return load().theme; }

  function reset() { try { localStorage.removeItem(KEY); } catch (e) {} }

  global.FOT = {
    KEY: KEY, PASS: PASS, MODULES: MODULES,
    get: load, save: save,
    setEmployee: setEmployee, hasEmployee: hasEmployee, employee: employee,
    isValidEmail: isValidEmail,
    setLang: setLang, getLang: getLang, setTheme: setTheme, getTheme: getTheme,
    statusOf: statusOf, moduleRecord: moduleRecord,
    recordProgress: recordProgress, recordTime: recordTime, recordQuiz: recordQuiz,
    overallPercent: overallPercent, allModulesCompleted: allModulesCompleted,
    finalExamUnlocked: finalExamUnlocked, recordFinalExam: recordFinalExam,
    certificateReady: certificateReady, issueCertificate: issueCertificate, certRecord: certRecord,
    sendEvent: sendEvent, flushQueue: flushQueue,
    reset: reset
  };

  // Reintenta cualquier evento pendiente al cargar / retry pending events on load.
  try { flushQueue(); } catch (e) {}
})(window);
