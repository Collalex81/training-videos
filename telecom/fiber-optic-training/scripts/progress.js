/* ============================================================================
   Fiber Optic Telecommunications Training — Shared Progress Engine
   Motor de progreso compartido (dashboard + módulos)
   ----------------------------------------------------------------------------
   Almacena todo en localStorage (sin backend; funciona en GitHub Pages).
   Stores everything in localStorage (no backend; works on GitHub Pages).

   Expone un objeto global: FOT
   - FOT.MODULES, FOT.PASS
   - FOT.get() / FOT.save(state)
   - FOT.setEmployee(name) / FOT.hasEmployee()
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

  function blank() {
    return {
      version: 1,
      employee: { name: "", startedAt: "" },
      lang: "en",
      theme: "light",
      modules: {},   // id -> record
      finalExam: { attempts: [], best: 0, passed: false, completedAt: "" },
      certificate: { issued: false, number: "", date: "", name: "", score: 0 }
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
    if (!s.employee) s.employee = { name: "", startedAt: "" };
    if (!s.modules)  s.modules = {};
    if (!s.finalExam) s.finalExam = { attempts: [], best: 0, passed: false, completedAt: "" };
    if (!s.certificate) s.certificate = { issued: false, number: "", date: "", name: "", score: 0 };
    if (!s.lang)  s.lang = "en";
    if (!s.theme) s.theme = "light";
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
    if (rec.best >= PASS && !rec.completedAt) {
      rec.completedAt = nowISO();
      rec.status = "completed";
      rec.percent = 100;
    }
    save(s);
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
      s.certificate.score  = s.finalExam.best;
      save(s);
    }
    return s.certificate;
  }

  function certRecord() { return load().certificate; }

  function setEmployee(name) {
    var s = load();
    s.employee.name = (name || "").trim();
    if (!s.employee.startedAt) s.employee.startedAt = nowISO();
    save(s);
    return s.employee;
  }
  function hasEmployee() { return !!(load().employee.name); }
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
    setLang: setLang, getLang: getLang, setTheme: setTheme, getTheme: getTheme,
    statusOf: statusOf, moduleRecord: moduleRecord,
    recordProgress: recordProgress, recordTime: recordTime, recordQuiz: recordQuiz,
    overallPercent: overallPercent, allModulesCompleted: allModulesCompleted,
    finalExamUnlocked: finalExamUnlocked, recordFinalExam: recordFinalExam,
    certificateReady: certificateReady, issueCertificate: issueCertificate, certRecord: certRecord,
    reset: reset
  };
})(window);
