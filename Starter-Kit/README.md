# Starter Kit — Bilingual Training Portal

A clean, reusable scaffold for a bilingual (EN/ES) training portal with interactive
HTML modules, published on GitHub Pages. Built from lessons learned on a real project.

*Andamiaje limpio y reutilizable para un portal de capacitación bilingüe con módulos
interactivos en HTML, publicable en GitHub Pages.*

---

## What's inside / Contenido

```
Starter-Kit/
├── index.html                     → Gallery (bilingual, EN default, by AREAS)
├── videos.json                    → List of modules (edit to add modules)
├── animations/
│   └── module-template.html       → COPY THIS for each new module
├── tools/
│   └── poster-generator.html      → Make SVG cover posters (no design tools)
├── assets/                        → Posters (poster-*.svg) + real photos (JPG)
├── videos/                        → .mp4 files (optional)
├── Versiones/                     → Versioned backups (see WORKING-RULES.md)
├── WORKING-RULES.md               → Working rules (versioning, ask before edit…)
├── PROJECT-STATE.md               → Living state doc — keep it updated
├── .nojekyll  .gitignore
```

---

## Quick start / Inicio rápido

1. **Rename the areas.** Edit `AREAS` and `BRAND` in `index.html` (keys must match
   the `"area"` field in `videos.json`). *Edita `AREAS` y `BRAND` en `index.html`.*
2. **Create a module.** Copy `animations/module-template.html` to a new file and edit
   the three marked blocks: `CONFIG`, `IMG`, `STEPS`. *Copia la plantilla y edita esos 3 bloques.*
3. **Make a cover.** Open `tools/poster-generator.html`, download the SVG into `assets/`.
   *Abre el generador de portadas y descarga el SVG a `assets/`.*
4. **List it.** Add an entry in `videos.json` (bilingual, with `area`, `poster`, `video`).
5. **Preview.** Run a local server (double-click won't load `videos.json`):

   ```bash
   python -m http.server 8000
   # open http://localhost:8000
   ```

6. **Publish.** Push to GitHub and enable Pages (Settings → Pages → main → /root).
   `.nojekyll` is already included.

---

## Conventions / Convenciones

- **Bilingual, English default.** Toggle EN/ES; the choice is remembered. In modules use `X(en, es)`.
- **Module engine:** sticky header, prev/next + dots, light/dark theme, and **canvas
  analyzer-style animations** (`fitCanvas`, `screen`, `stopAnim`, `initCanvases`, `draw*/anim*`).
- **Photos:** JPG in `assets/`, referenced from modules as `../assets/name.jpg`. Missing → illustration.
- **Posters:** SVG in `assets/`, linked in `videos.json`.
- **videos.json entry:** `area`, `titulo` {en,es}, `descripcion` {en,es}, `categoria` {en,es},
  `duracion`, `video`, `poster`, `tipo` (`video` | `animacion`).

See `WORKING-RULES.md` and `PROJECT-STATE.md`.
