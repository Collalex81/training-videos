# Centro de Entrenamiento / Training Center

Proyecto bilingüe (español · inglés) para crear videos y animaciones cortas de entrenamiento **combinando código y diseño**, y publicarlos con **GitHub Pages**.

*Bilingual project (Spanish · English) to create short training videos and animations **combining code and design**, and publish them with **GitHub Pages**.*

La galería (`index.html`) tiene un botón **ES / EN** arriba a la derecha que cambia todos los textos al instante.
*The gallery (`index.html`) has an **ES / EN** button at the top right that switches all text instantly.*

---

## Estructura / Structure

```
Project/
├── index.html          → Galería / índice bilingüe (se publica en GitHub Pages)
├── videos.json         → Lista de videos (títulos y descripciones en ES y EN)
├── videos/             → Archivos de video .mp4
├── animations/         → Animaciones hechas con código (HTML/CSS/JS)
│   └── ejemplo-intro.html
├── assets/             → Portadas (posters), logos, etc.
└── .nojekyll           → Necesario para GitHub Pages
```

---

## Agregar un video o animación / Add a video or animation

Edita **`videos.json`** y añade un bloque. Cada texto tiene versión `es` y `en`:
*Edit **`videos.json`** and add a block. Each text has an `es` and `en` version:*

```json
{
  "titulo": { "es": "Módulo 2: Nombre del tema", "en": "Module 2: Topic name" },
  "descripcion": {
    "es": "Una frase corta de qué se aprende aquí.",
    "en": "A short sentence about what is learned here."
  },
  "categoria": { "es": "Introducción", "en": "Introduction" },
  "duracion": "2:30",
  "video": "videos/mi-video.mp4",
  "poster": "assets/mi-portada.jpg",
  "tipo": "video"
}
```

- `tipo: "video"` → reproduce un `.mp4` de `videos/`. *plays an `.mp4` from `videos/`.*
- `tipo: "animacion"` → abre una animación `.html` de `animations/`. *opens an `.html` animation from `animations/`.*
- `categoria` → crea un filtro automático en la galería. *creates an automatic filter in the gallery.*
- La galería pasa el idioma activo a las animaciones (`?lang=es` / `?lang=en`).
  *The gallery passes the active language to animations (`?lang=es` / `?lang=en`).*

---

## Dos formas de crear un clip / Two ways to create a clip

**1. Con código / With code.** Duplica `animations/ejemplo-intro.html`, cambia los textos (bloque `TEXTOS` con `es` y `en`) y los colores de marca (al inicio del archivo). Enlázalo como `tipo: "animacion"` o grábalo como video.
*Duplicate `animations/ejemplo-intro.html`, change the texts (`TEXTOS` block with `es` and `en`) and the brand colors (top of the file). Link it as `tipo: "animacion"` or record it as a video.*

Grabar pantalla / Screen record: **Windows** `Win + G` · **Mac** `Cmd + Shift + 5`.

**2. Con diseño / With design.** Genera gráficos, portadas o guiones visuales, expórtalos y colócalos en `assets/` o `videos/`, luego enlázalos en `videos.json`.
*Generate graphics, posters or visual scripts, export them into `assets/` or `videos/`, then link them in `videos.json`.*

---

## Ver el sitio localmente / Preview locally

Abrir `index.html` con doble clic **no** carga `videos.json`. Usa un servidor local:
*Double-clicking `index.html` will **not** load `videos.json`. Use a local server:*

```bash
cd Project
python -m http.server 8000
# abre / open http://localhost:8000
```

---

## Publicar en GitHub Pages / Publish to GitHub Pages

1. Crea un repositorio en GitHub. *Create a repository on GitHub.*
2. Sube esta carpeta / Upload this folder:

   ```bash
   cd Project
   git init
   git add .
   git commit -m "Primer módulo / First module"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/entrenamiento.git
   git push -u origin main
   ```

3. En GitHub: **Settings → Pages → Deploy from a branch**, rama `main`, carpeta `/ (root)`, guarda.
   *On GitHub: **Settings → Pages → Deploy from a branch**, branch `main`, folder `/ (root)`, save.*
4. Tu sitio estará en / Your site will be at:
   `https://TU_USUARIO.github.io/entrenamiento/`

Para actualizar / To update: `git add . && git commit -m "nuevo video" && git push`.

---

## Nota sobre videos pesados / Note on large videos

Límite recomendado de GitHub: **100 MB por archivo**. Para videos grandes, súbelos a YouTube/Vimeo (no listado) y pídeme adaptar la galería para enlaces incrustados.
*GitHub recommended limit: **100 MB per file**. For large videos, upload them to YouTube/Vimeo (unlisted) and ask me to adapt the gallery for embedded links.*
