# Reglas de Trabajo / Working Rules

> **Para el asistente (Claude):** lee este archivo al inicio de cada sesión de este proyecto y sigue estas reglas.
> **For the assistant (Claude):** read this file at the start of every session in this project and follow these rules.

---

## ES — Reglas

1. **Todo el contenido es bilingüe** (español e inglés). Cada texto debe tener versión `es` y `en`.
2. **Mantener el estilo visual y la estructura de carpetas** del proyecto: `index.html`, `videos.json`, `videos/`, `animations/`, `assets/`. El sitio se publica en GitHub Pages.
3. **Preguntar siempre antes de editar un archivo existente.** No modificar nada sin confirmación.
4. **Versionado obligatorio.** Antes de reemplazar un archivo por una versión nueva:
   - Copiar el archivo actual a la carpeta `Versiones/`.
   - Renombrarlo con la convención: `nombre-vN-AAAA-MM-DD.ext`
     - Ejemplo: `index-v1-2026-07-11.html`
   - Recién entonces aplicar los cambios en el archivo original.
5. Se pueden usar y editar las subcarpetas del proyecto según se necesite (respetando las reglas anteriores).
6. **Diseño responsivo obligatorio.** Todo debe verse y funcionar bien tanto en computadora (PC) como en teléfono (móvil): layouts que se adaptan, textos legibles, botones tocables y sin scroll horizontal.
7. **Mantener actualizado `ESTADO-DEL-PROYECTO.md`.** Cada vez que hagamos una mejora o cambio relevante (nuevo módulo, nueva convención, portada, ajuste importante), actualiza ese archivo y su fecha de "última actualización".
8. **Herramientas de diseño — Canva y Figma (parte del flujo).** Ambas están conectadas a la cuenta del proyecto.
   - **Canva:** para crear y **exportar** portadas y gráficos. Respetar el estilo por área (colores de acento) y, si existe un **Brand Kit**, usarlo. Las imágenes exportadas se guardan en `assets/` (JPG para fotos, SVG para portadas) siguiendo la convención de nombres en inglés.
   - **Figma:** para **leer** maquetas/diagramas del usuario y convertirlos al HTML/CSS del **motor de módulos** del proyecto (no crear desde cero). Sirve también para screenshots y diagramas.
   - Estas herramientas **complementan**, no reemplazan, el flujo actual: código a mano (HTML/CSS/JS/SVG) + **ffmpeg** para capturas y compresión de video.
   - Sigue aplicando la regla 3 (preguntar antes de editar archivos existentes) y la regla 4 (versionado).
9. **Uso de agentes (subagentes) — preferirlos siempre que aporten.** Para cualquier tarea que no sea trivial, usa agentes de forma proactiva y en paralelo:
   - **Construcciones grandes o de varios archivos** y **trabajo independiente/paralelizable:** lanza varios agentes a la vez, cada uno con el **mismo contrato de diseño** (tokens de color por área, motor de módulos, bilingüe ES/EN, responsivo) y su especificación clara. Ejemplo: los 4 laboratorios de fibra se construyeron en paralelo, un agente por lab.
   - **Búsqueda amplia y exploración** del proyecto: delega a un agente en vez de leer todo en el chat principal (mantiene el contexto limpio).
   - **Verificación final:** cierra cada trabajo relevante con un agente que valide (sintaxis con `node --check`, revisión de lógica, pruebas). No marcar algo como terminado sin esta pasada.
   - Reserva el trabajo directo (sin agente) solo para ediciones pequeñas, preguntas rápidas o cambios de un archivo corto donde coordinar un agente costaría más de lo que ahorra.
   - Los agentes **deben respetar las reglas 1–8** (bilingüe, estructura, preguntar antes de editar, versionado antes de reemplazar, responsivo, y actualizar `ESTADO-DEL-PROYECTO.md`).

## EN — Rules

1. **All content is bilingual** (Spanish and English). Every text must have an `es` and `en` version.
2. **Keep the visual style and folder structure** of the project: `index.html`, `videos.json`, `videos/`, `animations/`, `assets/`. The site is published on GitHub Pages.
3. **Always ask before editing an existing file.** Do not modify anything without confirmation.
4. **Mandatory versioning.** Before replacing a file with a new version:
   - Copy the current file into the `Versiones/` folder.
   - Rename it using the convention: `name-vN-YYYY-MM-DD.ext`
     - Example: `index-v1-2026-07-11.html`
   - Only then apply the changes to the original file.
5. Project subfolders may be used and edited as needed (respecting the rules above).
6. **Responsive design is mandatory.** Everything must look and work well on both desktop (PC) and phone (mobile): adaptive layouts, readable text, tappable buttons, and no horizontal scrolling.
7. **Keep `ESTADO-DEL-PROYECTO.md` up to date.** Every time we make a meaningful improvement or change (new module, new convention, poster, important adjustment), update that file and its "last updated" date.
8. **Design tools — Canva and Figma (part of the flow).** Both are connected to the project account.
   - **Canva:** to create and **export** posters and graphics. Respect the per-area style (accent colors) and, if a **Brand Kit** exists, use it. Exported images go to `assets/` (JPG for photos, SVG for posters) following the English-name convention.
   - **Figma:** to **read** the user's mockups/diagrams and convert them into the project's **module-engine** HTML/CSS (not create from scratch). Also useful for screenshots and diagrams.
   - These tools **complement**, not replace, the current flow: hand-written code (HTML/CSS/JS/SVG) + **ffmpeg** for video screenshots and compression.
   - Rules 3 (ask before editing existing files) and 4 (versioning) still apply.
9. **Use of agents (subagents) — prefer them whenever they help.** For any non-trivial task, use agents proactively and in parallel:
   - **Large or multi-file builds** and **independent/parallelizable work:** launch several agents at once, each with the **same design contract** (per-area color tokens, module engine, bilingual ES/EN, responsive) and a clear spec. Example: the 4 fiber labs were built in parallel, one agent per lab.
   - **Broad search and exploration** of the project: delegate to an agent instead of reading everything in the main chat (keeps context clean).
   - **Final verification:** close every meaningful piece of work with an agent that validates it (syntax via `node --check`, logic review, tests). Do not mark something done without this pass.
   - Reserve direct work (no agent) for small edits, quick questions, or short single-file changes where coordinating an agent would cost more than it saves.
   - Agents **must follow rules 1–8** (bilingual, structure, ask before editing, version before replacing, responsive, and keep `ESTADO-DEL-PROYECTO.md` updated).
