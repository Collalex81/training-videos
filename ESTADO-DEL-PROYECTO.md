# Estado del Proyecto / Project State

> **Para el asistente (Claude): lee este archivo Y `REGLAS-DE-TRABAJO.md` al inicio de cada sesión de este proyecto.**
> **For the assistant: read this file AND `REGLAS-DE-TRABAJO.md` at the start of every session in this project.**

Última actualización / Last updated: 2026-07-13

---

## ES — Qué es el proyecto

Portal de capacitación bilingüe (ES/EN) publicado (o a publicar) en GitHub Pages. Galería (`index.html`) organizada por **áreas de trabajo**. Cada video/animación se define en `videos.json`. Los módulos interactivos son archivos HTML autónomos en `animations/`.

### Estructura
```
Project/
├── index.html                → Galería corporativa por áreas (idioma por defecto: INGLÉS)
├── videos.json               → Lista de módulos (bilingüe ES/EN)
├── animations/               → Módulos interactivos (HTML self-contained)
│   ├── pim-kaelus.html            (Telecom — prueba de PIM)
│   ├── coax-sweep-anritsu.html    (Telecom — VSWR/RL/DTF/cable loss, Anritsu)
│   ├── tower-safety.html          (Seguridad — trabajo en torres OSHA/Crown Castle)
│   ├── tool-tethering-aerial-lifts.html (Seguridad — amarre de herramientas en plataformas)
│   ├── loto-lockout-tagout.html   (Seguridad — bloqueo/etiquetado LOTO)
│   ├── grounding-bonding-cell-sites.html (Telecom — puesta a tierra y bonding)
│   ├── mewp-aerial-lift-operation.html (Construcción — operación de plataforma MEWP)
│   ├── multimeter-electrical.html (Electricidad — multímetro / -48V)
│   ├── fieldclix-instalacion.html (Inducción — instalar y configurar la app Fieldclix)
│   └── ejemplo-intro.html         (ejemplo)
├── assets/                   → Portadas SVG (poster-*.svg) y fotos reales (JPG)
├── telecom/
│   └── fiber-optic-training/  → PLATAFORMA de fibra óptica (5 módulos, progresiva)
│       ├── index.html             (dashboard: registro, tarjetas, desbloqueo, progreso)
│       ├── scripts/progress.js    (motor de progreso compartido, localStorage)
│       ├── module-01-layer-1/     (Módulo 1 COMPLETO — Layer 1 y componentes)
│       ├── module-02-optical-physics/ … module-05-safety/  (placeholders "en desarrollo")
│       ├── assessments/final-exam.html   (examen final — se desbloquea tras los 5 módulos)
│       └── certificates/certificate.html (certificado imprimible, editable)
├── tools/
│   └── generador-portadas.html    → Generador de portadas (enlazado en el footer)
├── videos/                   → Videos .mp4
├── Versiones/                → Respaldos versionados (ver REGLAS)
├── REGLAS-DE-TRABAJO.md      → Reglas de trabajo
└── ESTADO-DEL-PROYECTO.md    → Este archivo
```

### Convenciones (IMPORTANTE — mantenerlas)
1. **Bilingüe, inglés por defecto.** `index.html` y los módulos arrancan en EN, con botón ES/EN que recuerda la elección. En el código de módulos: `X(en, es)` (inglés primero).
2. **Áreas** (con color de acento): `seguridad` (verde), `telecom` (azul), `electricidad` (ámbar), `construccion` (naranja), `induccion` (morado).
3. **Motor de los módulos** (mismo patrón en todos): encabezado **fijo (sticky)**, navegación con `prev/next` + puntos, botón de tema **claro/oscuro**, y **animaciones en canvas tipo pantalla de analizador** (funciones `fitCanvas`, `screen`, `stopAnim`, `initCanvases`, y `draw*/anim*`). No usar animaciones SVG básicas.
4. **Rutas de fotos:** dentro de `animations/` las imágenes se referencian como `../assets/archivo.jpg` (con `../`).
5. **Fotos reales:** van en `assets/`, formato **JPG**, nombres en **inglés** sin doble extensión. Cada módulo lista sus nombres en su objeto `IMG` (arriba del `<script>`). Si el archivo no existe, se muestra una ilustración.
6. **Portadas:** SVG en `assets/` (`poster-*.svg`) hechas con `tools/generador-portadas.html`, **o** exportadas desde **Canva** (JPG/PNG). Se enlazan en `videos.json` con `"poster": "assets/xxx.svg|jpg"`. También se puede usar **Figma** para pasar maquetas a código (ver REGLA 8).
7. **`videos.json`:** cada entrada tiene `area`, `titulo` {es,en}, `descripcion` {es,en}, `categoria` {es,en}, `duracion`, `video`, `poster`, `tipo` (`video` | `animacion`).
8. **Responsivo obligatorio** (PC y móvil) y **versionado** antes de editar (ver `REGLAS-DE-TRABAJO.md`).

### Probar localmente
`videos.json` no carga con doble clic; usar servidor: `python -m http.server 8000` dentro de `Project/` y abrir `http://localhost:8000`.

### Módulos actuales
- **Telecom:** PIM (Kaelus), Coax Sweep (Anritsu), Puesta a tierra y bonding (R56/NEC 250).
- **Seguridad:** Trabajo en torres (OSHA / Crown Castle); Amarre de herramientas en plataformas (toolbox talk); Bloqueo/etiquetado LOTO (OSHA 1910.147 / NFPA 70E).
- **Electricidad:** Multímetro y electricidad (DC/AC, ohms, watts, breakers, planta -48V).
- **Construcción:** Operación de plataforma elevadora MEWP (ANSI A92 / OSHA 1926.453).
- **Inducción:** 2 ejemplos + **Fieldclix (instalación y configuración de la app)**.

> Nota: el "Starter-Kit" (andamiaje genérico para otros proyectos) se movió fuera de esta carpeta. / Note: the generic "Starter-Kit" was moved outside this folder.

### Fotos reales (assets/)
- Electricidad: `multimeter.jpg`, `clamp-meter.jpg`, `breaker-panel.jpg`, `rectifier-48v.jpg` (generadas con ChatGPT, integradas y verificadas). / Electrical photos generated and integrated.
- Telecom PIM: `kaelus-ipa.jpg`, `kaelus-iqa.jpg`.
- EPP (Seguridad): `hardhat.jpg`, `safety-glasses.jpg`, `hivis-vest.jpg`, `safety-harness.jpg`, `work-gloves.jpg`, `safety-boots.jpg`, `rf-monitor.jpg`, `lanyard-srl.jpg` (generadas con ChatGPT, integradas en la galería de EPP). / Full PPE photo set generated and integrated.
- Inducción Fieldclix: `fieldclix-01-search.jpg` … `fieldclix-09-ready.jpg` (9 capturas reales del video de instalación) + `poster-fieldclix.svg`. / Real screenshots extracted from the install screen recording.

> Método fiable para descargar imágenes de ChatGPT: hacer clic en la imagen para abrir el visor a pantalla completa y usar el botón de descarga arriba a la derecha (evita el modal de compartir + resize, que congela la pestaña). / Reliable ChatGPT image download: click image → fullscreen viewer → top-right download button.

### Pendientes / To do
- (Opcional) Fotos reales para los otros módulos (Coax/Anritsu, Torres). / Real photos for the other modules.
- (Opcional) Publicar en GitHub Pages; actualizar README al esquema nuevo de videos.json. / Publish to GitHub Pages; update README.

### Hecho recientemente / Recently done (2026-07-13)
- **NUEVA PLATAFORMA — Entrenamiento de Fibra Óptica (Telecom, `telecom/fiber-optic-training/`).** Fundación + los CINCO módulos completos. Es una plataforma tipo LMS (no un módulo suelto): **dashboard** (`index.html`) con registro de empleado, tarjetas de los 5 módulos, **desbloqueo progresivo** (M2 se abre al aprobar M1, etc.), barra de progreso, examen final y certificado; **motor de progreso compartido** `scripts/progress.js` (localStorage: nombre, fechas, última lección, %, intentos, notas, tiempos, estado del certificado); **certificado imprimible** (`certificates/certificate.html`, con placeholders editables `[Company Name]` / `[Trainer / Approver]`); placeholder para el examen final acumulativo (pendiente de construir). **Módulo 1 completo** (`module-01-layer-1/`, 18 lecciones): OSI/Layer 1, E→O→E, fuentes (LED/VCSEL/láser), estructura de la fibra (SVG de corte), construcciones de cable, SMF vs MMF (canvas), tipos de fibra OS/OM y G.65x (tabla), código de colores TIA-598-C, conectores (LC/SC/FC/ST/MPO/MTP/E2000/MU), pulidos PC/UPC/APC (canvas de reflexión), organización/patch panels, **fusión** (canvas del proceso), fusión vs mecánico, **Inspeccionar–Limpiar–Inspeccionar** (zonas IEC 61300-3-35), práctica interactiva, quiz (8 preguntas, ≥80% para desbloquear M2) y **referencias con fuentes primarias** (ITU-T G.65x, IEC 61753-1 / 61755 / 61300-3-35, TIA-598-C, IEEE 802.3, FOA). Integrado en la galería vía `videos.json` (tarjeta "Programa" en Telecom, `poster-fiber-training.svg`). Datos verificados con fuentes fiables (sin inventar). **Módulos 2–5 completos (mismo motor):** **M2 Física óptica** (16 lecciones — c=λf, índice, Snell y RIT interactivos, apertura numérica, modos, atenuación, dB/dBm con calculadora, dispersión, return loss, bandas O/E/S/C/L/U, presupuesto óptico con calculadora; fuentes ITU-T G.652/G.694, IEC 60793). **M3 Transporte/SFP/WDM/protocolos** (18 lecciones — transceptor y DOM/DDM, familias SFP/QSFP, lector de etiqueta SFP interactivo, duplex/BiDi animados, MUX/DEMUX animado, SFP sintonizable, Ethernet PHYs, CPRI, eCPRI/O-RAN, PON, validador de compatibilidad interactivo; fuentes SFF-8472, ITU-T G.694.1/.2/G.984, IEEE 802.3, CPRI Cooperation, O-RAN). **M4 Pruebas/troubleshooting** (15 lecciones — flujo de inspección, VFL animado, power meter, fuente+referencia, OLTS, OTDR con traza interactiva por eventos, configuración, 1310/1550/1625, árboles de troubleshooting interactivos, reportes; fuentes TIA-526-7/14, IEC 61280-4-x, IEC 61746/Telcordia GR-196). **M5 Seguridad** (12 lecciones — peligros, seguridad láser animada IEC 60825, manejo de residuos, EPP, químicos, herramientas, seguridad de campo/espacios confinados, respuesta a incidentes SIN procedimientos médicos improvisados, checklist; fuentes IEC 60825-1, ANSI Z136, OSHA 1910.146/.147, MUTCD). Cada módulo con quiz de 8 preguntas (≥80%) que desbloquea el siguiente. Respaldos: `Versiones/videos-v10-2026-07-13.json`, `Versiones/estado-del-proyecto-v4-2026-07-13.md`. Pendiente: examen final acumulativo (banco de preguntas), laboratorios/simuladores y glosario general. / **NEW fiber-optic training PLATFORM** — all FIVE modules fully built (interactive canvas animations, calculators, per-module quizzes with progressive unlock, sourced references) plus dashboard, progress engine, printable certificate, linked from the gallery. Multi-session build; final exam + labs + glossary still pending.
- Tres módulos nuevos **basados en documentación** (con slide de Referencias en cada uno): **LOTO** (`loto-lockout-tagout.html`, Seguridad/verde, 24 slides — OSHA 1910.147 y Apéndice A, NFPA 70E 120.5, con demo vivo-muerto-vivo, checklist, quiz); **Puesta a tierra y bonding** (`grounding-bonding-cell-sites.html`, Telecom/azul, 18 slides — Motorola R56, NEC 250, TIA-222, con diagrama SVG del sitio y calculadora de resistencia ≤ 5 Ω); **Operación de plataforma MEWP** (`mewp-aerial-lift-operation.html`, Construcción/naranja, 21 slides — ANSI A92.20/22/24, OSHA 1926.453, con calculadora de capacidad). Pósters SVG: `poster-loto.svg`, `poster-grounding.svg`, `poster-mewp.svg`. Entradas añadidas a `videos.json` (primer módulo del área **construcción**). Respaldos: `Versiones/videos-v9-2026-07-13.json`, `Versiones/estado-del-proyecto-v3-2026-07-13.md`. / Three new documentation-based modules (LOTO, Grounding & Bonding, MEWP operation) with references, SVG visuals and interactives.
- Seguridad: nuevo módulo **Amarre de herramientas en plataformas elevadoras** (`animations/tool-tethering-aerial-lifts.html`, área verde, 22 slides). Toolbox talk con animaciones canvas (herramienta cayendo/energía de impacto, cordón que sostiene, zona de exclusión), calculadora de energía de impacto y de carga vs capacidad, checklist previo y quiz. Portada hecha en **Canva** (`assets/poster-tool-tethering.jpg`) — se corrigió una versión previa donde el trabajador no llevaba arnés. Entrada añadida a `videos.json`. Respaldos: `Versiones/videos-v8-2026-07-13.json`, `Versiones/estado-del-proyecto-v2-2026-07-13.md`. / New green Safety toolbox-talk module on tool tethering in aerial lifts (22 slides, canvas animations, calculators, checklist, quiz); Canva-made poster (harness corrected).
- Flujo: se habilitaron y documentaron **Canva** (portadas/gráficos exportables) y **Figma** (maquetas → código) como parte del flujo (REGLA 8 en `REGLAS-DE-TRABAJO.md`). / Enabled Canva & Figma in the workflow (working-rule 8).
- Inducción: nuevo módulo **Fieldclix — instalación y configuración** (`animations/fieldclix-instalacion.html`, área morada). Guía paso a paso (Play Store → instalar → permisos → datos en segundo plano → login → menú → Time Keeping → órdenes/Time Off) con **9 capturas reales** extraídas del video, más el **video completo incrustado** (`videos/fieldclix-instalacion.mp4`, sin audio, comprimido a ~16 MB para GitHub). Portada `poster-fieldclix.svg`. Entrada añadida a `videos.json`. Respaldos: `Versiones/videos-v7-2026-07-13.json`, `Versiones/estado-del-proyecto-v1-2026-07-13.md`. Publicado y verificado en GitHub Pages. / New Fieldclix install & setup onboarding module with 9 real screenshots + embedded full video; published and verified on GitHub Pages.

### Hecho recientemente / Recently done (2026-07-12)
- Electricidad: animaciones canvas rehechas tipo analizador — LCD de 7 segmentos, osciloscopio con brillo (AC/DC), multímetro en vivo (DC/AC con puntas y fuente), Ley de Ohm con flujo de electrones + barra de potencia, y Watts con barra de amperaje vs límite de breaker (15/20 A). Respaldo: `Versiones/multimeter-electrical-v2-2026-07-12.html`. / Electrical canvas animations rebuilt analyzer-style.
- Seguridad: nuevos slides de **alta visibilidad (tráfico)** con animación de faros iluminando el chaleco retro-reflectivo (día/noche) y de **zona de trabajo (MUTCD Parte 6)** con conos/taper/buffer/flagger; galería de EPP con 8 fotos reales y descripciones; fondos de animación mejorados (rejilla + degradado). Estándares: ANSI/ISEA 107-2020 (Clase 2/3, Type R), MUTCD 11.ª ed. Respaldo: `Versiones/tower-safety-v1-2026-07-12.html`. / Safety module: hi-vis + work-zone slides, PPE photo gallery, upgraded animations.

---

## EN — What this project is

A bilingual (ES/EN) training portal published (or to publish) on GitHub Pages. The gallery (`index.html`) is organized by **work areas**. Each video/animation is defined in `videos.json`. Interactive modules are self-contained HTML files in `animations/`.

### Key conventions (keep these)
1. **Bilingual, English default.** Gallery and modules start in EN with an ES/EN toggle that remembers the choice. In module code use `X(en, es)`.
2. **Areas** with accent colors: `seguridad` (green), `telecom` (blue), `electricidad` (amber), `construccion` (orange), `induccion` (purple).
3. **Module engine** (same in all): sticky header, prev/next + dots nav, light/dark theme, and **canvas analyzer-style animations** (`fitCanvas`, `screen`, `stopAnim`, `initCanvases`, `draw*/anim*`). Avoid basic SVG animations.
4. **Photo paths:** inside `animations/` reference images as `../assets/file.jpg`.
5. **Real photos:** in `assets/`, **JPG**, English names, no double extension. Each module lists its names in its `IMG` object; missing files fall back to an illustration.
6. **Posters:** SVG in `assets/` (`poster-*.svg`), can be made with `tools/generador-portadas.html`, linked in `videos.json`.
7. **`videos.json`:** each entry has `area`, bilingual `titulo`/`descripcion`/`categoria`, `duracion`, `video`, `poster`, `tipo`.
8. **Responsive is mandatory**; **version before editing** (see `REGLAS-DE-TRABAJO.md`).

### Preview locally
Use a local server: `python -m http.server 8000` inside `Project/`, open `http://localhost:8000` (double-click won't load `videos.json`).
