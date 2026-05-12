// ─── DOM refs ────────────────────────────────────────────
const urlInput          = document.getElementById('urlInput');
const fetchBtn          = document.getElementById('fetchBtn');
const pasteBtn          = document.getElementById('pasteBtn');
// Single video
const videoCard         = document.getElementById('videoCard');
const thumbnail         = document.getElementById('thumbnail');
const playOverlay       = document.getElementById('playOverlay');
const videoTitle        = document.getElementById('videoTitle');
const videoDuration     = document.getElementById('videoDuration');
const videoUploader     = document.getElementById('videoUploader');
const videoViews        = document.getElementById('videoViews');
const formatSelect      = document.getElementById('formatSelect');
const downloadBtn       = document.getElementById('downloadBtn');
const progressSection   = document.getElementById('progressSection');
const progressStatus    = document.getElementById('progressStatus');
const progressPercent   = document.getElementById('progressPercent');
const progressBar       = document.getElementById('progressBar');
const progressSpeed     = document.getElementById('progressSpeed');
const progressEta       = document.getElementById('progressEta');
const progressSize      = document.getElementById('progressSize');
const doneMessage       = document.getElementById('doneMessage');
const doneText          = document.getElementById('doneText');
// Playlist
const playlistCard      = document.getElementById('playlistCard');
const playlistTitle     = document.getElementById('playlistTitle');
const playlistCount     = document.getElementById('playlistCount');
const checkAll          = document.getElementById('checkAll');
const playlistFormat    = document.getElementById('playlistFormat');
const downloadPlaylistBtn = document.getElementById('downloadPlaylistBtn');
const playlistItems     = document.getElementById('playlistItems');
const queueProgress     = document.getElementById('queueProgress');
const queueStatus       = document.getElementById('queueStatus');
const queueCounter      = document.getElementById('queueCounter');
const queueBar          = document.getElementById('queueBar');
const currentItemStatus = document.getElementById('currentItemStatus');
const currentItemPercent= document.getElementById('currentItemPercent');
const currentItemBar    = document.getElementById('currentItemBar');
const queueDone         = document.getElementById('queueDone');
const queueDoneText     = document.getElementById('queueDoneText');

// ─── State ───────────────────────────────────────────────
let currentVideoTitle = '';
let currentVideoUrl   = '';
let eventSource       = null;
let playlistEntries   = [];
let isDownloadingQueue = false;

// ─── URL detection ───────────────────────────────────────
const isPlaylistUrl = url => /[?&]list=/.test(url);
const isYouTubeUrl  = url => /youtu(be\.com|\.be)/.test(url);

// ─── Input handlers ──────────────────────────────────────
pasteBtn.addEventListener('click', async () => {
  try {
    const text = await navigator.clipboard.readText();
    urlInput.value = text;
    urlInput.focus();
    if (isYouTubeUrl(text)) route(text);
  } catch { urlInput.focus(); }
});

urlInput.addEventListener('keydown', e => { if (e.key === 'Enter') fetchBtn.click(); });

urlInput.addEventListener('paste', () => {
  setTimeout(() => {
    const val = urlInput.value.trim();
    if (isYouTubeUrl(val)) route(val);
  }, 50);
});

fetchBtn.addEventListener('click', () => {
  const url = urlInput.value.trim();
  if (!url) { shake(urlInput); return; }
  route(url);
});

function route(url) {
  if (isPlaylistUrl(url)) fetchPlaylistInfo(url);
  else fetchVideoInfo(url);
}

// ─── Single video ────────────────────────────────────────
playOverlay.addEventListener('click', () => {
  if (currentVideoUrl) window.open(currentVideoUrl, '_blank');
});

formatSelect.addEventListener('change', updateDownloadBtn);

function updateDownloadBtn() {
  const isAudio = formatSelect.value === 'audio_only';
  downloadBtn.innerHTML = isAudio
    ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg> Descargar audio`
    : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Descargar video`;
}

async function fetchVideoInfo(url) {
  setFetchLoading(true);
  hideAllCards();

  try {
    const res  = await fetch('/api/info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    const data = await res.json();
    if (!res.ok) { alert(data.error || 'Error al obtener el video'); return; }

    currentVideoTitle = data.title;
    currentVideoUrl   = url;

    thumbnail.src       = data.thumbnail;
    videoTitle.textContent = data.title;

    const dur = data.duration_string || formatSeconds(data.duration);
    videoDuration.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> ${dur}`;
    videoUploader.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> ${data.uploader || ''}`;

    const views = formatNumber(data.view_count);
    if (views) {
      videoViews.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> ${views}`;
      videoViews.classList.remove('hidden');
    } else { videoViews.classList.add('hidden'); }

    formatSelect.innerHTML = '';
    const vFmts = (data.formats || []).filter(f => f.type === 'video');
    const aFmts = (data.formats || []).filter(f => f.type === 'audio');

    if (!vFmts.length && !aFmts.length) {
      formatSelect.appendChild(makeOpt('best', 'Mejor calidad disponible'));
    } else {
      if (vFmts.length) {
        const g = document.createElement('optgroup');
        g.label = 'Video con audio';
        vFmts.forEach(f => g.appendChild(makeOpt(f.format_id, f.label)));
        formatSelect.appendChild(g);
      }
      if (aFmts.length) {
        const g = document.createElement('optgroup');
        g.label = 'Solo audio';
        aFmts.forEach(f => g.appendChild(makeOpt(f.format_id, f.label)));
        formatSelect.appendChild(g);
      }
    }

    videoCard.classList.remove('hidden');
    videoCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } catch { alert('Error de conexión. ¿Está corriendo el servidor?'); }
  finally  { setFetchLoading(false); }
}

downloadBtn.addEventListener('click', () => {
  if (!currentVideoUrl) return;
  if (eventSource) { eventSource.close(); eventSource = null; }

  const params = new URLSearchParams({
    url: currentVideoUrl,
    format_id: formatSelect.value,
    title: currentVideoTitle
  });

  downloadBtn.disabled = true;
  progressSection.classList.remove('hidden');
  doneMessage.classList.add('hidden');
  setProgress(0, 'Iniciando descarga...');

  eventSource = new EventSource(`/api/download?${params}`);
  eventSource.onmessage = e => {
    const msg = JSON.parse(e.data);
    if (msg.type === 'progress') {
      setProgress(msg.percent, msg.percent === 100 ? 'Finalizando...' : 'Descargando...');
      if (msg.speed) progressSpeed.textContent = `Velocidad: ${msg.speed}`;
      if (msg.eta)   progressEta.textContent   = `ETA: ${msg.eta}`;
      if (msg.size)  progressSize.textContent  = `Tamaño: ${msg.size}`;
    } else if (msg.type === 'status') {
      progressStatus.textContent = msg.message;
    } else if (msg.type === 'done') {
      setProgress(100, '¡Completado!');
      eventSource.close(); eventSource = null;
      downloadBtn.disabled = false;
      updateDownloadBtn();
      setTimeout(() => {
        progressSection.classList.add('hidden');
        doneText.textContent = msg.message;
        doneMessage.classList.remove('hidden');
      }, 600);
    } else if (msg.type === 'error') {
      progressStatus.textContent = msg.message;
      progressStatus.style.color = '#ff4444';
      eventSource.close(); eventSource = null;
      downloadBtn.disabled = false;
    }
  };
  eventSource.onerror = () => {
    progressStatus.textContent = 'Error de conexión';
    progressStatus.style.color = '#ff4444';
    downloadBtn.disabled = false;
    if (eventSource) { eventSource.close(); eventSource = null; }
  };
});

// ─── Playlist ────────────────────────────────────────────
async function fetchPlaylistInfo(url) {
  setFetchLoading(true);
  hideAllCards();

  try {
    const res  = await fetch('/api/playlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    const data = await res.json();
    if (!res.ok) { alert(data.error || 'Error al cargar la playlist'); return; }

    playlistEntries = data.entries;
    renderPlaylist(data);
    playlistCard.classList.remove('hidden');
    playlistCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } catch { alert('Error de conexión. ¿Está corriendo el servidor?'); }
  finally  { setFetchLoading(false); }
}

function renderPlaylist(data) {
  playlistTitle.textContent = data.title;
  playlistCount.textContent = `${data.count} videos`;
  checkAll.checked = true;
  checkAll.indeterminate = false;
  queueProgress.classList.add('hidden');
  queueDone.classList.add('hidden');

  playlistItems.innerHTML = '';
  data.entries.forEach((entry, i) => {
    const el = document.createElement('div');
    el.className = 'playlist-item';
    el.dataset.index = i;
    el.innerHTML = `
      <label class="pl-check">
        <input type="checkbox" class="pl-checkbox" data-index="${i}" checked />
        <span class="pl-checkmark"></span>
      </label>
      <img class="pl-thumb" src="${entry.thumbnail}" alt="" loading="lazy" />
      <div class="pl-meta">
        <span class="pl-title">${escHtml(entry.title)}</span>
        ${entry.duration_string ? `<span class="pl-duration">${entry.duration_string}</span>` : ''}
      </div>
      <span class="pl-status" id="pl-status-${i}"></span>
    `;
    playlistItems.appendChild(el);
  });

  updateSelectedCount();
}

// Select-all toggle
checkAll.addEventListener('change', () => {
  document.querySelectorAll('.pl-checkbox').forEach(cb => cb.checked = checkAll.checked);
  updateSelectedCount();
});

// Per-item checkbox
playlistItems.addEventListener('change', e => {
  if (!e.target.classList.contains('pl-checkbox')) return;
  const boxes      = [...document.querySelectorAll('.pl-checkbox')];
  const checked    = boxes.filter(b => b.checked).length;
  checkAll.checked      = checked === boxes.length;
  checkAll.indeterminate = checked > 0 && checked < boxes.length;
  updateSelectedCount();
});

function updateSelectedCount() {
  const n = document.querySelectorAll('.pl-checkbox:checked').length;
  downloadPlaylistBtn.textContent = n > 0
    ? `Descargar ${n} de ${playlistEntries.length}`
    : 'Ninguno seleccionado';
  downloadPlaylistBtn.disabled = n === 0 || isDownloadingQueue;
}

downloadPlaylistBtn.addEventListener('click', () => {
  if (isDownloadingQueue) return;
  const queue = [...document.querySelectorAll('.pl-checkbox:checked')]
    .map(cb => playlistEntries[parseInt(cb.dataset.index)])
    .filter(Boolean);
  if (queue.length === 0) return;
  startQueueDownload(queue, playlistFormat.value);
});

async function startQueueDownload(queue, format_id) {
  isDownloadingQueue = true;
  downloadPlaylistBtn.disabled = true;
  queueDone.classList.add('hidden');
  queueProgress.classList.remove('hidden');

  let done = 0, errors = 0;

  for (let i = 0; i < queue.length; i++) {
    const entry  = queue[i];
    const gIndex = playlistEntries.indexOf(entry);

    queueStatus.textContent = truncate(entry.title, 45);
    queueCounter.textContent = `${i + 1} / ${queue.length}`;
    setQueueBar((i / queue.length) * 100);
    setItemStatus(gIndex, 'downloading');
    currentItemStatus.textContent  = '';
    currentItemPercent.textContent = '';
    currentItemBar.style.width     = '0%';

    const ok = await downloadQueueItem(entry, format_id, gIndex);
    if (ok) { done++;   setItemStatus(gIndex, 'done'); }
    else    { errors++; setItemStatus(gIndex, 'error'); }
  }

  setQueueBar(100);
  queueCounter.textContent = `${queue.length} / ${queue.length}`;
  queueStatus.textContent  = '¡Listo!';
  isDownloadingQueue = false;

  setTimeout(() => {
    queueProgress.classList.add('hidden');
    queueDoneText.textContent = errors === 0
      ? `${done} archivos descargados correctamente`
      : `${done} descargados · ${errors} con error`;
    queueDone.classList.remove('hidden');
    downloadPlaylistBtn.disabled = false;
    updateSelectedCount();
  }, 600);
}

function downloadQueueItem(entry, format_id, gIndex) {
  return new Promise(resolve => {
    const params = new URLSearchParams({ url: entry.url, format_id, title: entry.title });
    const es = new EventSource(`/api/download?${params}`);

    es.onmessage = e => {
      const msg = JSON.parse(e.data);
      if (msg.type === 'progress') {
        const pct = msg.percent || 0;
        currentItemStatus.textContent  = truncate(entry.title, 38);
        currentItemPercent.textContent = `${pct.toFixed(0)}%`;
        currentItemBar.style.width     = `${pct}%`;
      } else if (msg.type === 'done') {
        currentItemBar.style.width = '100%';
        es.close(); resolve(true);
      } else if (msg.type === 'error') {
        es.close(); resolve(false);
      }
    };
    es.onerror = () => { es.close(); resolve(false); };
  });
}

function setItemStatus(index, status) {
  const el   = document.getElementById(`pl-status-${index}`);
  const item = document.querySelector(`.playlist-item[data-index="${index}"]`);
  if (!el) return;
  if (item) item.dataset.status = status;
  const icons = {
    downloading: `<svg class="spin-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>`,
    done:  `<svg viewBox="0 0 24 24" fill="none" stroke="#00c864" stroke-width="2.5" width="16" height="16"><polyline points="20 6 9 17 4 12"/></svg>`,
    error: `<svg viewBox="0 0 24 24" fill="none" stroke="#ff4444" stroke-width="2.5" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
    pending: ''
  };
  el.innerHTML = icons[status] || '';
}

function setQueueBar(pct) {
  queueBar.style.width = `${Math.min(100, Math.max(0, pct))}%`;
}

// ─── Helpers ─────────────────────────────────────────────
function hideAllCards() {
  videoCard.classList.add('hidden');
  playlistCard.classList.add('hidden');
  progressSection.classList.add('hidden');
  doneMessage.classList.add('hidden');
  progressStatus.style.color = '';
  progressSpeed.textContent  = '';
  progressEta.textContent    = '';
  progressSize.textContent   = '';
  setProgress(0, 'Preparando...');
  downloadBtn.disabled = false;
}

function setFetchLoading(on) {
  if (on) {
    fetchBtn.classList.add('loading');
    fetchBtn.textContent = '';
  } else {
    fetchBtn.classList.remove('loading');
    fetchBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg> Obtener video`;
  }
}

function setProgress(pct, status) {
  const c = Math.min(100, Math.max(0, pct || 0));
  progressBar.style.width      = `${c}%`;
  progressPercent.textContent  = `${c.toFixed(0)}%`;
  if (status) progressStatus.textContent = status;
}

function makeOpt(value, text) {
  const o = document.createElement('option');
  o.value = value; o.textContent = text;
  return o;
}

function formatNumber(n) {
  if (!n) return '';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M vistas`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K vistas`;
  return `${n} vistas`;
}

function formatSeconds(s) {
  if (!s) return '--:--';
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function truncate(str, len) {
  return str.length > len ? str.substring(0, len) + '…' : str;
}

function escHtml(str) {
  const d = document.createElement('div');
  d.appendChild(document.createTextNode(str));
  return d.innerHTML;
}

function shake(el) {
  el.style.animation = 'none';
  el.offsetHeight;
  el.style.animation = 'shake 0.3s ease';
  setTimeout(() => el.style.animation = '', 300);
}
