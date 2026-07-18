# Buzón de Sugerencias — Guía / Suggestions Inbox — Guide

Este buzón deja que cualquiera que entre al portal envíe una **sugerencia**, un **link** y
un **archivo** (opcional). Todo llega a **una Hoja de Google** (las sugerencias) y a **una
carpeta de tu Drive** (los archivos), donde solo tú los ves. No requiere que los
trabajadores inicien sesión.

This inbox lets anyone in the portal send a **suggestion**, a **link** and an optional
**file**. Everything lands in **a Google Sheet** (the text) and **a Drive folder** (the
files), private to you. Workers don't need to sign in.

**Archivos / Files**
- `index.html` — el formulario del portal (ya publicado en `/suggestions/`).
- `apps-script.gs` — el backend que tú despliegas en Google (una sola vez).
- `README.md` — esta guía.

---

## Configuración — una sola vez (~5 min) / One-time setup

### 1. Crea la Hoja de Google / Create the Google Sheet
- Ve a https://sheets.google.com y crea una hoja nueva (ej. **"Sugerencias del Portal"**).
- Go to https://sheets.google.com and create a new spreadsheet (e.g. "Portal Suggestions").

### 2. Abre el editor de Apps Script / Open the Apps Script editor
- En la hoja: menú **Extensiones → Apps Script**.
- In the sheet: **Extensions → Apps Script**.

### 3. Pega el código / Paste the code
- Borra lo que haya y pega **todo** el contenido de `apps-script.gs`.
- Delete anything there and paste the **entire** contents of `apps-script.gs`.
- (Opcional) En `NOTIFY_EMAIL = ""` pon tu correo entre comillas para recibir un aviso por
  cada sugerencia. Ej.: `const NOTIFY_EMAIL = "tucorreo@gmail.com";`
- (Optional) Set `NOTIFY_EMAIL` to your email to get notified on each suggestion.
- Guarda (💾) / Save.

### 4. Despliega como aplicación web / Deploy as a Web App
- Botón azul **Implementar → Nueva implementación** (Deploy → New deployment).
- Tipo/Type: **Aplicación web / Web app**.
- **Ejecutar como / Execute as:** *Yo / Me* (tu cuenta).
- **Quién tiene acceso / Who has access:** **Cualquier usuario / Anyone**.
  > Importante: elige "Cualquier usuario" (no "Cualquier usuario con cuenta de Google"),
  > así los trabajadores no necesitan iniciar sesión.
- **Implementar / Deploy**. La primera vez te pedirá **autorizar permisos** (aceptar): son
  para escribir en tu Hoja y guardar archivos en tu Drive. Es normal.

### 5. Copia la URL / Copy the URL
- Copia la **URL de la aplicación web** que termina en **`/exec`**.
- Copy the **Web app URL** that ends in **`/exec`**.

### 6. Pega la URL en el formulario / Paste the URL into the form
- Abre `suggestions/index.html` y busca cerca del inicio del `<script>`:
  ```js
  var SUGGEST_URL = "";
  ```
- Pon tu URL entre las comillas:
  ```js
  var SUGGEST_URL = "https://script.google.com/macros/s/AKfy.../exec";
  ```
- Guarda y súbelo (Luis: dile a Claude "ya tengo la URL: …" y él lo pega y publica).
- Save and publish (Luis: tell Claude "here's the URL: …" and he'll paste it and push).

---

## Cómo ver las sugerencias / How to view suggestions
- **Texto, links y quién:** abre tu **Hoja de Google** (pestaña *Sugerencias*). Cada fila
  es un envío, con fecha, nombre (si lo dejaron), área, la sugerencia, el link y la URL del
  archivo.
- **Archivos:** en la columna *URL del archivo* haz clic para abrirlo, o entra a la carpeta
  **"Sugerencias del Portal"** en tu Drive.
- **Aviso por correo (si lo activaste):** recibes un email por cada sugerencia.

---

## Notas / Notes
- **Sin login:** con "Cualquier usuario", nadie necesita cuenta Google para enviar.
- **Tamaño de archivo:** el formulario limita a ~10 MB y el backend a 12 MB. Para archivos
  grandes o varios a la vez, que peguen un **link de Drive/Dropbox** en el campo *Link*.
- **Privacidad:** la carpeta y la hoja son **tuyas y privadas**; los archivos no se hacen
  públicos. El nombre es opcional para el trabajador.
- **Cambiar algo del backend:** edita el código en Apps Script y usa **Implementar →
  Gestionar implementaciones → editar (lápiz) → Nueva versión** para que tome los cambios.
  Si creas una implementación nueva, la URL `/exec` cambia y hay que volver a pegarla.
- **Probar rápido:** abre la URL `/exec` en el navegador; debe responder
  `{"ok":true,"service":"Portal suggestions",...}`.
