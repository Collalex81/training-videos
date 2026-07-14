# Sincronizacion con Google Sheets / Google Sheets Sync

Este backend opcional permite que el sitio **estatico** de capacitacion (alojado en
GitHub Pages) registre los eventos de progreso de cada empleado en una **Google
Sheet privada**. Sin configurarlo, el sitio sigue funcionando: el progreso se
guarda solo localmente en el navegador (`localStorage`).

This optional backend lets the **static** training site (hosted on GitHub Pages)
record each employee's progress events into a **private Google Sheet**. Without
it, the site still works: progress is stored locally in the browser only
(`localStorage`).

Archivos / Files:
- `backend/apps-script.gs` — codigo del Web App (Google Apps Script).
- `backend/README-sync.md` — esta guia / this guide.

---

## ESPANOL

### Como funciona (resumen)
La pagina estatica envia un POST HTTP por cada evento
(`register`, `module_pass`, `final_exam`, `certificate`). El cuerpo es un JSON.
El Web App de Apps Script recibe ese JSON y **agrega una fila** a la pestana
`Progress`. **Un POST = un evento = una fila.**

### 1. Crear (o reutilizar) una Google Sheet
1. Ve a https://sheets.google.com y crea una hoja nueva (o abre una existente).
2. Ponle un nombre, por ejemplo *Registro de Capacitacion Fibra Optica*.
3. Copia su **ID** desde la URL. El ID es la parte larga entre `/d/` y `/edit`:
   ```
   https://docs.google.com/spreadsheets/d/ESTE_ES_EL_ID/edit
   ```

### 2. Abrir Apps Script y pegar el codigo
Tienes dos opciones:

**Opcion A — Script ligado a la hoja (recomendado, mas simple):**
1. Dentro de la hoja: menu **Extensiones -> Apps Script**.
2. Borra el codigo de ejemplo y pega **todo** el contenido de `apps-script.gs`.
3. Deja `const SHEET_ID = "";` vacio. Al estar ligado a la hoja, usa
   automaticamente la hoja activa.
4. Guarda (icono de disquete).

**Opcion B — Script independiente (standalone):**
1. Ve a https://script.google.com y crea un proyecto nuevo.
2. Pega el contenido de `apps-script.gs`.
3. Rellena el ID: `const SHEET_ID = "TU_ID_AQUI";`
4. Guarda.

### 3. Desplegar como aplicacion web (Web App)
1. Boton **Implementar (Deploy) -> Nueva implementacion**.
2. En "Tipo", elige **Aplicacion web (Web app)**.
3. Configura:
   - **Ejecutar como (Execute as):** *Yo / Me* (tu cuenta).
   - **Quien tiene acceso (Who has access):** *Cualquier persona / Anyone*.
4. Haz clic en **Implementar** y **autoriza** los permisos que pida Google.
5. Copia la **URL del Web app** que termina en **`/exec`**.

> La primera vez Google mostrara una advertencia ("no verificada"): entra a
> *Configuracion avanzada -> Ir al proyecto (no seguro)* para autorizar tu
> propio script.

### 4. Conectar el sitio (pegar la URL)
1. Abre `telecom/fiber-optic-training/scripts/progress.js`.
2. Cerca del inicio del archivo, busca la constante `SYNC_URL` y pega ahi la
   URL `/exec`:
   ```js
   var SYNC_URL = "https://script.google.com/macros/s/AKf.../exec";
   ```
3. Si dejas `SYNC_URL` **vacio** (`""`), el progreso queda **solo local** en el
   navegador y no se envia nada a la hoja. Rellenarlo activa la sincronizacion.
4. Sube el cambio a GitHub Pages.

### 5. Como probar
1. Abre la URL `/exec` en el navegador. Deberias ver el JSON de `doGet`:
   ```json
   { "ok": true, "service": "FOT training sync", "time": "2026-..." }
   ```
2. En el dashboard del sitio, **registrate** con tu nombre y completa un quiz.
3. Vuelve a la Google Sheet, pestana **`Progress`**: deberian aparecer filas
   nuevas (una por evento).

### 6. Las columnas y una vista por empleado
Cada fila es **un evento**. Columnas:

| Columna | Contenido |
|---|---|
| Timestamp | Fecha/hora del evento (`ts`) |
| Event | `register`, `module_pass`, `final_exam` o `certificate` |
| Name | Nombre del empleado |
| Email | Correo del empleado |
| Module | Modulo relacionado (etiqueta legible) |
| Score (%) | Puntaje en porcentaje, o vacio |
| Passed | `TRUE` / `FALSE`, o vacio |
| Attempts | Numero de intentos, o vacio |
| Certificate # | Numero de certificado (ej. `FOT-2026-01234`), o vacio |
| Client ID | Identificador anonimo del navegador/dispositivo |
| Language | Idioma de la interfaz (`es` / `en`) |
| Started At | Cuando el empleado inicio la capacitacion |

**Vista por empleado (Tabla dinamica / Pivot Table):**
1. Selecciona los datos -> menu **Insertar -> Tabla dinamica**.
2. En **Filas** pon `Email` (o `Name`).
3. En **Valores** pon `Event` (COUNTA) o `Score (%)` (MAX/AVG).
4. Opcional: filtra por `Event = final_exam` para ver quien aprobo el examen
   final, o por `certificate` para ver certificados emitidos.

### 7. Privacidad
El nombre, correo y progreso de los empleados se guardan en la **Google Sheet
privada del propietario** con fines de **registro de capacitacion**. Buenas
practicas:
- **Informa** al personal que su avance queda registrado.
- **No compartas** la hoja publicamente; mantenla restringida a quien deba verla.
- El acceso "Cualquier persona" del Web App **solo permite agregar eventos**
  (append); **no** da acceso de lectura a la hoja.

### 8. Solucion de problemas
Si **no aparecen filas**:
- Verifica que la implementacion tenga acceso **"Cualquier persona / Anyone"**.
- Verifica que la URL termine en **`/exec`** (no en `/dev`).
- Verifica que `SYNC_URL` este correctamente pegada en `progress.js`.
- Si cambiaste el codigo, crea una **Nueva implementacion** (o "Administrar
  implementaciones" y edita la version) para publicar los cambios.
- **CORS no es problema:** el cliente usa `no-cors`, por lo que los errores de
  CORS en la consola son esperados y no impiden que la fila se guarde.

---

## ENGLISH

### How it works (summary)
The static page sends one HTTP POST per event
(`register`, `module_pass`, `final_exam`, `certificate`). The body is JSON. The
Apps Script Web App receives that JSON and **appends one row** to the `Progress`
tab. **One POST = one event = one row.**

### 1. Create (or reuse) a Google Sheet
1. Go to https://sheets.google.com and create a new sheet (or open an existing one).
2. Give it a name, e.g. *Fiber Optic Training Log*.
3. Copy its **ID** from the URL. The ID is the long part between `/d/` and `/edit`:
   ```
   https://docs.google.com/spreadsheets/d/THIS_IS_THE_ID/edit
   ```

### 2. Open Apps Script and paste the code
You have two options:

**Option A — Container-bound script (recommended, simplest):**
1. Inside the sheet: menu **Extensions -> Apps Script**.
2. Delete the sample code and paste the **entire** contents of `apps-script.gs`.
3. Leave `const SHEET_ID = "";` empty. Because it is bound to the sheet, it uses
   the active spreadsheet automatically.
4. Save (disk icon).

**Option B — Standalone script:**
1. Go to https://script.google.com and create a new project.
2. Paste the contents of `apps-script.gs`.
3. Fill in the ID: `const SHEET_ID = "YOUR_ID_HERE";`
4. Save.

### 3. Deploy as a Web app
1. Click **Deploy -> New deployment**.
2. Under "Type", choose **Web app**.
3. Configure:
   - **Execute as:** *Me* (your account).
   - **Who has access:** *Anyone*.
4. Click **Deploy** and **authorize** the permissions Google requests.
5. Copy the **Web app URL** ending in **`/exec`**.

> The first time, Google shows an "unverified app" warning: use
> *Advanced -> Go to project (unsafe)* to authorize your own script.

### 4. Connect the site (paste the URL)
1. Open `telecom/fiber-optic-training/scripts/progress.js`.
2. Near the top of the file, find the `SYNC_URL` constant and paste the `/exec`
   URL there:
   ```js
   var SYNC_URL = "https://script.google.com/macros/s/AKf.../exec";
   ```
3. If you leave `SYNC_URL` **empty** (`""`), progress stays **local-only** in the
   browser and nothing is sent to the sheet. Filling it in enables syncing.
4. Push the change to GitHub Pages.

### 5. How to test
1. Open the `/exec` URL in a browser. You should see the `doGet` JSON:
   ```json
   { "ok": true, "service": "FOT training sync", "time": "2026-..." }
   ```
2. On the site dashboard, **register** with your name and complete a quiz.
3. Go back to the Google Sheet, **`Progress`** tab: new rows should appear (one
   per event).

### 6. The columns and a per-employee view
Each row is **one event**. Columns:

| Column | Content |
|---|---|
| Timestamp | Event date/time (`ts`) |
| Event | `register`, `module_pass`, `final_exam`, or `certificate` |
| Name | Employee name |
| Email | Employee email |
| Module | Related module (human-readable label) |
| Score (%) | Score as a percent, or empty |
| Passed | `TRUE` / `FALSE`, or empty |
| Attempts | Number of attempts, or empty |
| Certificate # | Certificate number (e.g. `FOT-2026-01234`), or empty |
| Client ID | Anonymous browser/device identifier |
| Language | UI language (`es` / `en`) |
| Started At | When the employee started training |

**Per-employee view (Pivot Table):**
1. Select the data -> menu **Insert -> Pivot table**.
2. Under **Rows** add `Email` (or `Name`).
3. Under **Values** add `Event` (COUNTA) or `Score (%)` (MAX/AVG).
4. Optional: filter by `Event = final_exam` to see who passed the final exam, or
   by `certificate` to see issued certificates.

### 7. Privacy
Employees' name, email, and progress are stored in the **owner's private Google
Sheet** for **training records**. Good practice:
- **Inform** staff that their progress is being recorded.
- **Do not share** the sheet publicly; keep it restricted to those who need it.
- The Web App "Anyone" access **only allows appending events** (append); it does
  **not** grant read access to the sheet.

### 8. Troubleshooting
If **no rows appear**:
- Re-check the deployment access is **"Anyone"**.
- Re-check the URL ends in **`/exec`** (not `/dev`).
- Re-check that `SYNC_URL` is set correctly in `progress.js`.
- If you changed the code, create a **New deployment** (or "Manage deployments"
  and edit the version) to publish the changes.
- **CORS is not an issue:** the client uses `no-cors`, so CORS errors in the
  console are expected and do not prevent the row from being saved.
