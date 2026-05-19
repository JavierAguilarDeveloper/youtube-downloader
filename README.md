# 📥 YouTube Downloader

> App web local para descargar videos y audio de YouTube directamente a tu computadora o teléfono.  
> Sin límites, sin marcas de agua, sin cuentas. Solo pega el link y listo.

Compatible con **macOS**, **Windows** y **Android** (vía Termux).

---

## ✨ ¿Qué hace?

- **Videos individuales** — pega cualquier URL de YouTube y descarga en la calidad que elijas (hasta 1080p o la máxima disponible)
- **Solo audio (MP3)** — extrae el audio en máxima calidad directamente a tu carpeta de Música
- **Playlists completas** — detecta automáticamente si es una playlist, muestra todos los videos con checkboxes para que elijas cuáles bajar
- **Progreso en tiempo real** — barra de progreso con velocidad, ETA y tamaño mientras descarga
- **Sin instalación complicada** — es tu propia app local, corre en `localhost:3000` con un doble click

---

## 🖥️ Cómo se ve

```
┌─────────────────────────────────────────────┐
│  ● ● ●   localhost:3000                     │
├─────────────────────────────────────────────┤
│                                             │
│   ▶  YouTube Downloader                     │
│   Pega el enlace y descárgalo en tu compu   │
│                                             │
│   [ https://youtube.com/watch?v=... ]  📋   │
│   [        Obtener video         ]          │
│                                             │
│   🖼  Rick Astley — Never Gonna Give...     │
│      ⏱ 3:33  👤 Rick Astley  👁 1.4B       │
│                                             │
│   Calidad: [1080p ▾]                        │
│   [  ⬇  Descargar video  ]                 │
│                                             │
│   Descargando... ███████████░░░░ 68%        │
│   Velocidad: 4.2 MB/s  ETA: 00:12           │
└─────────────────────────────────────────────┘
```

---

## 🛠️ Instalación por sistema

### 🍎 macOS

**Requisitos:**

| Herramienta | Para qué sirve | Cómo instalar |
|-------------|----------------|---------------|
| **Node.js** | Correr el servidor local | [nodejs.org](https://nodejs.org) o `brew install node` |
| **yt-dlp** | Descargar de YouTube | `brew install yt-dlp` |
| **ffmpeg** | Combinar video + audio | `brew install ffmpeg` |

> Si no tienes Homebrew: `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`

**Ejecutar:**

Doble click en **`iniciar.command`** — se abre el navegador automáticamente en `http://localhost:3000`.

O desde terminal:
```bash
cd ~/Desktop/youtube\ download
npm install   # solo la primera vez
npm start
```

**¿Dónde se guardan los archivos?**

| Tipo | Carpeta |
|------|---------|
| 🎬 Videos (MP4) | `~/Movies/` |
| 🎵 Audio (MP3) | `~/Music/` |

---

### 🪟 Windows

**Requisitos:**

**1. Node.js**
Descárgalo desde [nodejs.org](https://nodejs.org) e instálalo normalmente.

**2. yt-dlp**
Abre PowerShell o CMD y ejecuta:
```powershell
winget install yt-dlp
```
O descarga el `.exe` directamente desde [github.com/yt-dlp/yt-dlp/releases](https://github.com/yt-dlp/yt-dlp/releases) y colócalo en una carpeta que esté en el PATH (por ejemplo `C:\Windows\System32`).

**3. ffmpeg**
```powershell
winget install ffmpeg
```
O descárgalo desde [ffmpeg.org/download.html](https://ffmpeg.org/download.html), extrae el zip y agrega la carpeta `bin\` al PATH del sistema.

> Para agregar al PATH en Windows: Inicio → "Variables de entorno" → `Path` → Nuevo → pega la ruta de la carpeta `bin`.

**Ejecutar:**

Doble click en **`iniciar.bat`** — se abre el navegador automáticamente en `http://localhost:3000`.

O desde CMD/PowerShell:
```cmd
cd "%USERPROFILE%\Desktop\youtube download"
npm install
npm start
```

**¿Dónde se guardan los archivos?**

| Tipo | Carpeta |
|------|---------|
| 🎬 Videos (MP4) | `C:\Users\TuUsuario\Videos\` |
| 🎵 Audio (MP3) | `C:\Users\TuUsuario\Music\` |

---

### 🤖 Android (vía Termux)

Termux es una terminal para Android que permite correr Node.js, yt-dlp y ffmpeg sin rootear el teléfono. La app corre como servidor local y se usa desde el navegador del teléfono.

**Paso 1 — Instalar Termux**

Descarga Termux desde [F-Droid](https://f-droid.org/packages/com.termux/) (recomendado) o desde la Play Store.

> La versión de F-Droid es más reciente y tiene soporte completo de paquetes.

**Paso 2 — Instalar dependencias**

Abre Termux y ejecuta estos comandos uno por uno:

```bash
# Actualizar paquetes
pkg update && pkg upgrade

# Instalar Node.js, yt-dlp y ffmpeg
pkg install nodejs python ffmpeg

# Instalar yt-dlp vía pip
pip install yt-dlp
```

**Paso 3 — Dar acceso al almacenamiento**

```bash
termux-setup-storage
```

Acepta el permiso cuando Android lo solicite. Esto crea la carpeta `~/storage/` con acceso a los archivos del teléfono.

**Paso 4 — Clonar o copiar el proyecto**

```bash
# Opción A: clonar desde GitHub
git clone https://github.com/JavierAguilarDeveloper/youtube-download.git
cd youtube-download

# Opción B: copiar la carpeta manualmente al almacenamiento del teléfono
# y luego acceder desde Termux:
cd ~/storage/shared/youtube\ download
```

**Paso 5 — Instalar dependencias y arrancar**

```bash
npm install
npm start
# o: bash iniciar.sh
```

Abre tu navegador (Chrome, Firefox, etc.) en **`http://localhost:3000`**.

**¿Dónde se guardan los archivos?**

| Tipo | Carpeta |
|------|---------|
| 🎬 Videos (MP4) | `~/Videos/` (dentro del home de Termux) |
| 🎵 Audio (MP3) | `~/Music/` (dentro del home de Termux) |

> Para que los archivos queden accesibles desde la galería o el explorador de archivos de Android, muévelos a `~/storage/movies/` o `~/storage/music/` después de descargar, o cambia las rutas en `server.js` a esas carpetas.

---

## ⚙️ Stack técnico

```
Frontend          →  HTML + CSS + Vanilla JS (sin frameworks)
Backend           →  Node.js + Express
Descarga          →  yt-dlp (CLI)
Merge audio/video →  ffmpeg (detectado automáticamente según el sistema)
Progreso en vivo  →  Server-Sent Events (SSE)
Compatibilidad    →  macOS / Windows / Linux / Android (Termux)
```

La app detecta automáticamente el sistema operativo para ajustar rutas, carpetas de destino y ubicación de ffmpeg.

---

## 🎯 Funcionalidades detalladas

### Videos individuales
1. Pega la URL en el input
2. Click en **Obtener video** → se carga miniatura, título, canal y vistas
3. Selecciona la calidad en el dropdown (todas las resoluciones disponibles, hasta 4K si existe)
4. Click en **Descargar** → barra de progreso en tiempo real

### Solo audio (MP3)
Selecciona **"Solo audio (MP3)"** en el dropdown de calidad.  
El audio se extrae en la máxima calidad disponible y se guarda en la carpeta de Música.

### Playlists
Pega el link de cualquier playlist de YouTube.  
- Se muestran todos los videos con checkbox, miniatura y duración
- Puedes seleccionar/deseleccionar individualmente o con "Seleccionar todo"
- Elige el formato (MP3 o cualquier resolución de video) para toda la selección
- Los videos se descargan uno a uno con estado por video (✓ listo, ✗ error, ⟳ descargando)

---

## 🔧 Solución de problemas

**El video se descarga sin audio**  
→ Asegúrate de tener `ffmpeg` instalado y accesible desde la terminal

**"yt-dlp: command not found"**  
→ Verifica que yt-dlp esté instalado y en el PATH del sistema

**Puerto 3000 ocupado**
- macOS/Linux: `kill $(lsof -ti:3000)`
- Windows: `netstat -ano | findstr :3000` → anota el PID → `taskkill /PID <número> /F`

**Error en video de playlist**  
→ Algunos videos pueden estar privados o geo-restringidos. El resto continúa descargándose.

**En Windows: "yt-dlp no se reconoce como comando"**  
→ Asegúrate de que la carpeta donde está `yt-dlp.exe` esté en el PATH del sistema y reinicia la terminal.

**En Android: los archivos no aparecen en la galería**  
→ Los archivos se guardan en el home de Termux. Para que sean visibles desde Android, copia los archivos a `~/storage/movies/` o `~/storage/music/` con `mv archivo.mp4 ~/storage/movies/`.

---

## 🤝 Cómo fue construido

Este proyecto nació de una conversación real entre **Javier Aguilar** y **Claude** (Anthropic).

Lo construimos juntos de forma iterativa:

1. **La idea base** — interfaz para pegar URLs de YouTube y descargar con barra de progreso
2. **El fix de audio** — descubrimos que YouTube sirve video y audio como streams separados (DASH); necesitabas `ffmpeg` para combinarlos. Lo resolvimos usando format strings `bestvideo+bestaudio` en lugar de format IDs directos
3. **MP3 only** — opción de extraer solo el audio con `--extract-audio --audio-format mp3`
4. **Soporte de playlists** — detección automática por URL, descarga secuencial con estado por video via Server-Sent Events
5. **El diseño** — UI oscura con glassmorphism, orbs animados, barra de progreso en vivo
6. **Cross-platform** — detección automática de OS para ajustar rutas, carpetas y binarios (macOS, Windows, Android/Linux)

Todo el código es open source. Úsalo, modifícalo, compártelo.

---

## ☕ ¿Te fue útil?

Si este proyecto te ahorró tiempo o aprendiste algo nuevo con él, puedes invitarme un café.  
No es obligatorio, pero se agradece mucho y me ayuda a seguir creando cosas para la comunidad. 🙏

**[☕ buymeacoffee.com/javieraguilar](https://buymeacoffee.com/javieraguilar)**

---

## 👤 Autor

**Javier Aguilar** — Full Stack Developer  
🌐 [javieraguilar.dev](https://javieraguilar.dev)  
☕ [buymeacoffee.com/javieraguilar](https://buymeacoffee.com/javieraguilar)

---

> ⚠️ **Nota legal** — Esta herramienta es para uso personal. Respeta los términos de servicio de YouTube y los derechos de autor del contenido que descargues.
