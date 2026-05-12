const express = require('express');
const { spawn, execFile } = require('child_process');
const path = require('path');
const os = require('os');

const app = express();
const PORT = 3000;

const VIDEO_DIR = path.join(os.homedir(), 'Movies');
const AUDIO_DIR = path.join(os.homedir(), 'Music');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Get video info
app.post('/api/info', (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL requerida' });

  const args = ['--dump-json', '--no-playlist', url];

  execFile('yt-dlp', args, { timeout: 30000 }, (err, stdout) => {
    if (err) {
      return res.status(400).json({ error: 'No se pudo obtener información del video. Verifica la URL.' });
    }

    try {
      const info = JSON.parse(stdout);

      // Build video format list from all video streams (DASH + progressive)
      // For each unique resolution, we'll use yt-dlp to merge best video + best audio
      const seenHeights = new Set();
      const videoFormats = [];
      (info.formats || [])
        .filter(f => f.vcodec && f.vcodec !== 'none' && f.height)
        .sort((a, b) => (b.height || 0) - (a.height || 0))
        .forEach(f => {
          if (!seenHeights.has(f.height)) {
            seenHeights.add(f.height);
            videoFormats.push({
              format_id: `bestvideo[height=${f.height}]+bestaudio/bestvideo[height<=${f.height}]+bestaudio/best`,
              height: f.height,
              type: 'video',
              label: `${f.height}p`
            });
          }
        });

      if (videoFormats.length === 0) {
        videoFormats.push({
          format_id: 'bestvideo+bestaudio/best',
          height: null,
          type: 'video',
          label: 'Mejor calidad disponible'
        });
      }

      // Audio-only option
      const formats = [
        ...videoFormats,
        { format_id: 'audio_only', type: 'audio', label: 'Solo audio (MP3)' }
      ];

      res.json({
        title: info.title,
        thumbnail: info.thumbnail,
        duration: info.duration,
        duration_string: info.duration_string,
        uploader: info.uploader,
        view_count: info.view_count,
        formats
      });
    } catch (e) {
      res.status(500).json({ error: 'Error procesando información del video' });
    }
  });
});

// Get playlist info
app.post('/api/playlist', (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL requerida' });

  const args = ['-J', '--flat-playlist', '--no-warnings', url];

  execFile('yt-dlp', args, { timeout: 60000 }, (err, stdout) => {
    if (err) {
      return res.status(400).json({ error: 'No se pudo cargar la playlist. Verifica la URL.' });
    }
    try {
      const info = JSON.parse(stdout);
      if (!info.entries) return res.status(400).json({ error: 'No es una playlist válida.' });

      const entries = info.entries
        .filter(e => e && e.id)
        .map(e => ({
          id: e.id,
          title: e.title || 'Sin título',
          url: `https://www.youtube.com/watch?v=${e.id}`,
          duration_string: e.duration_string || fmtDuration(e.duration),
          thumbnail: `https://i.ytimg.com/vi/${e.id}/mqdefault.jpg`
        }));

      res.json({ title: info.title || 'Playlist', count: entries.length, entries });
    } catch {
      res.status(500).json({ error: 'Error procesando la playlist' });
    }
  });
});

function fmtDuration(s) {
  if (!s) return '';
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = Math.floor(s % 60);
  return h > 0
    ? `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
    : `${m}:${String(sec).padStart(2,'0')}`;
}

// Download with SSE progress
app.get('/api/download', (req, res) => {
  const { url, format_id, title } = req.query;
  if (!url) return res.status(400).json({ error: 'URL requerida' });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const isAudio = format_id === 'audio_only';
  const safeTitle = (title || 'archivo').replace(/[/\\?%*:|"<>]/g, '_');
  const outputDir = isAudio ? AUDIO_DIR : VIDEO_DIR;
  const outputTemplate = path.join(outputDir, `${safeTitle}.%(ext)s`);

  let args;
  if (isAudio) {
    args = [
      '--no-playlist',
      '--extract-audio',
      '--audio-format', 'mp3',
      '--audio-quality', '0',
      '--output', outputTemplate,
      '--newline',
      '--progress',
      url
    ];
  } else {
    const fmtArg = (format_id && format_id !== 'best')
      ? format_id
      : 'bestvideo+bestaudio/best';
    args = [
      '--no-playlist',
      '--format', fmtArg,
      '--merge-output-format', 'mp4',
      '--ffmpeg-location', '/opt/homebrew/bin/ffmpeg',
      '--output', outputTemplate,
      '--newline',
      '--progress',
      url
    ];
  }

  const proc = spawn('yt-dlp', args);

  const send = (data) => {
    if (!res.writableEnded) {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    }
  };

  proc.stdout.on('data', (chunk) => {
    const lines = chunk.toString().split('\n');
    for (const line of lines) {
      // Parse progress lines like: [download]  42.3% of  123.45MiB at  1.23MiB/s ETA 00:12
      const match = line.match(/\[download\]\s+([\d.]+)%\s+of\s+([\d.]+\S+)\s+at\s+([\d.]+\S+)\s+ETA\s+(\S+)/);
      if (match) {
        send({
          type: 'progress',
          percent: parseFloat(match[1]),
          size: match[2],
          speed: match[3],
          eta: match[4]
        });
      } else if (line.includes('[download] 100%')) {
        send({ type: 'progress', percent: 100 });
      } else if (line.includes('[Merger]') || line.includes('Merging')) {
        send({ type: 'status', message: 'Combinando audio y video...' });
      } else if (line.includes('[download] Destination')) {
        send({ type: 'status', message: 'Descargando...' });
      }
    }
  });

  proc.stderr.on('data', (chunk) => {
    const line = chunk.toString();
    if (!line.includes('WARNING')) {
      send({ type: 'status', message: 'Procesando...' });
    }
  });

  proc.on('close', (code) => {
    if (code === 0) {
      const msg = isAudio
        ? `Audio guardado en: ${AUDIO_DIR}`
        : `Video guardado en: ${VIDEO_DIR}`;
      send({ type: 'done', message: msg, isAudio });
    } else {
      send({ type: 'error', message: 'Error durante la descarga. Intenta de nuevo.' });
    }
    res.end();
  });

  req.on('close', () => {
    proc.kill();
  });
});

app.listen(PORT, () => {
  console.log(`\n✅ YouTube Downloader corriendo en: http://localhost:${PORT}\n`);
  console.log(`📁 Videos → ${VIDEO_DIR}`);
  console.log(`🎵 Audio  → ${AUDIO_DIR}\n`);
});
