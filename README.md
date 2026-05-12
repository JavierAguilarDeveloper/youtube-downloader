# 📥 YouTube Downloader

> App web local para descargar videos y audio de YouTube directamente a tu computadora.  
> Sin límites, sin marcas de agua, sin cuentas. Solo pega el link y listo.

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

## 🛠️ Requisitos

Necesitas tener instalado en tu Mac:

| Herramienta | Para qué sirve | Cómo instalar |
|-------------|----------------|---------------|
| **Node.js** | Correr el servidor local | [nodejs.org](https://nodejs.org) o `brew install node` |
| **yt-dlp** | Descargar de YouTube | `brew install yt-dlp` |
| **ffmpeg** | Combinar video + audio (necesario para 720p+) | `brew install ffmpeg` |

> ⚠️ Si no tienes Homebrew: `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`

---

## 🚀 Cómo ejecutarlo

### Opción 1 — Doble click (la fácil) ⭐

Haz doble click en el archivo **`iniciar.command`** que está en la carpeta del proyecto.

Eso es todo. Se abre el navegador solo en `http://localhost:3000`.

---

### Opción 2 — Terminal

```bash
# 1. Entra a la carpeta del proyecto
cd ~/Desktop/youtube\ download

# 2. Instala dependencias (solo la primera vez)
npm install

# 3. Arranca el servidor
npm start
```

Luego abre tu navegador en **http://localhost:3000**

---

## 📁 ¿Dónde se guardan los archivos?

| Tipo | Carpeta |
|------|---------|
| 🎬 Videos (MP4) | `~/Movies/` |
| 🎵 Audio (MP3) | `~/Music/` |

---

## ⚙️ Stack técnico

```
Frontend          →  HTML + CSS + Vanilla JS (sin frameworks)
Backend           →  Node.js + Express
Descarga          →  yt-dlp (CLI)
Merge audio/video →  ffmpeg
Progreso en vivo  →  Server-Sent Events (SSE)
```

La app detecta automáticamente si el link es un video individual o una playlist y adapta la UI al instante.

---

## 🎯 Funcionalidades detalladas

### Videos individuales
1. Pega la URL en el input
2. Click en **Obtener video** → se carga miniatura, título, canal y vistas
3. Selecciona la calidad en el dropdown (todas las resoluciones disponibles, hasta 4K si existe)
4. Click en **Descargar** → barra de progreso en tiempo real

### Solo audio (MP3)
Selecciona **"Solo audio (MP3)"** en el dropdown de calidad.  
El audio se extrae en la máxima calidad disponible y se guarda en `~/Music/`.

### Playlists
Pega el link de cualquier playlist de YouTube.  
- Se muestran todos los videos con checkbox, miniatura y duración
- Puedes seleccionar/deseleccionar individualmente o con "Seleccionar todo"
- Elige el formato (MP3 o cualquier resolución de video) para toda la selección
- Los videos se descargan uno a uno con estado por video (✓ listo, ✗ error, ⟳ descargando)

---

## 🔧 Solución de problemas

**El video se descarga sin audio**  
→ Asegúrate de tener `ffmpeg` instalado: `brew install ffmpeg`

**"yt-dlp: command not found"**  
→ Instala yt-dlp: `brew install yt-dlp`

**Puerto 3000 ocupado**  
→ Cierra otras instancias: `kill $(lsof -ti:3000)` y vuelve a correr `npm start`

**Error en video de playlist**  
→ Algunos videos pueden estar privados o geo-restringidos. El resto continúa descargándose.

---

## 🤝 Cómo fue construido

Este proyecto nació de una conversación real entre **Javier Aguilar** y **Claude** (Anthropic).

Lo construimos juntos de forma iterativa:

1. **La idea base** — interfaz para pegar URLs de YouTube y descargar con barra de progreso
2. **El fix de audio** — descubrimos que YouTube sirve video y audio como streams separados (DASH); necesitabas `ffmpeg` para combinarlos. Lo resolvimos usando format strings `bestvideo+bestaudio` en lugar de format IDs directos
3. **MP3 only** — opción de extraer solo el audio con `--extract-audio --audio-format mp3`
4. **Soporte de playlists** — detección automática por URL, descarga secuencial con estado por video via Server-Sent Events
5. **El diseño** — UI oscura con glassmorphism, orbs animados, barra de progreso en vivo

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
