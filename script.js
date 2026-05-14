// ====== CONFIG ======
const CONFIG = {
  weddingDate: '2026-08-15T08:00:00+07:00',
  // Ganti dengan URL Web App Google Apps Script kamu
  rsvpEndpoint: 'https://script.google.com/macros/s/AKfycbznDy9Q6EJB7pF3PlLngwTZzk_weTA-19XjWvxHkffbGDplTDLoc9Hcm7stZ26IT66C8Q/exec',
};

// ====== SPLASH -> COVER ======
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('splash').style.display = 'none';
    document.getElementById('cover').classList.remove('hidden');
  }, 4000);
});

// ====== GUEST NAME ?to= ======
(function setGuestName() {
  const params = new URLSearchParams(window.location.search);
  const to = params.get('to');
  if (to) {
    const decoded = decodeURIComponent(to).replace(/\+/g, ' ');
    document.getElementById('guestName').textContent = decoded;
    const nameInput = document.getElementById('rsvpNama');
    if (nameInput) nameInput.value = decoded;
  }
})();

// ====== OPEN INVITATION ======
document.getElementById('openBtn').addEventListener('click', () => {
  document.getElementById('cover').classList.add('hidden');
  document.getElementById('main').classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'instant' });
  playMusic();
});

// ====== MUSIC ======
const bgm = document.getElementById('bgm');
const musicBtn = document.getElementById('musicToggle');

function playMusic() {
  bgm.volume = 0.4;
  bgm.play().then(() => musicBtn.classList.add('playing')).catch(() => {});
}
musicBtn.addEventListener('click', () => {
  if (bgm.paused) {
    bgm.play().then(() => musicBtn.classList.add('playing')).catch(() => {});
  } else {
    bgm.pause();
    musicBtn.classList.remove('playing');
  }
});

// ====== COUNTDOWN ======
const target = new Date(CONFIG.weddingDate).getTime();
function tick() {
  const now = Date.now();
  let diff = Math.max(0, target - now);
  const d = Math.floor(diff / 86400000); diff %= 86400000;
  const h = Math.floor(diff / 3600000);  diff %= 3600000;
  const m = Math.floor(diff / 60000);    diff %= 60000;
  const s = Math.floor(diff / 1000);
  const pad = (n) => String(n).padStart(2, '0');
  document.getElementById('cd-d').textContent = pad(d);
  document.getElementById('cd-h').textContent = pad(h);
  document.getElementById('cd-m').textContent = pad(m);
  document.getElementById('cd-s').textContent = pad(s);
}
tick();
setInterval(tick, 1000);

// ====== COPY REKENING ======
document.querySelectorAll('.gift-copy').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const target = document.getElementById(btn.dataset.target);
    if (!target) return;
    const text = target.textContent.trim();
    try {
      await navigator.clipboard.writeText(text);
      const orig = btn.textContent;
      btn.textContent = 'Tersalin ✓';
      setTimeout(() => (btn.textContent = orig), 1500);
    } catch {
      btn.textContent = 'Gagal salin';
    }
  });
});

// ====== RSVP SUBMIT ======
const form = document.getElementById('rsvpForm');
const statusEl = document.getElementById('rsvpStatus');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  statusEl.className = 'rsvp-status';
  statusEl.textContent = 'Mengirim...';

  const data = new FormData(form);
  const payload = {
    nama: data.get('nama'),
    kehadiran: data.get('kehadiran'),
    jumlah: data.get('jumlah'),
    ucapan: data.get('ucapan'),
    waktu: new Date().toISOString(),
  };

  try {
    await fetch(CONFIG.rsvpEndpoint, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
    });
    statusEl.className = 'rsvp-status ok';
    statusEl.textContent = 'Terima kasih! Konfirmasi terkirim.';
    form.reset();
    setTimeout(loadWishes, 1500);
  } catch (err) {
    statusEl.className = 'rsvp-status err';
    statusEl.textContent = 'Gagal mengirim. Coba lagi nanti.';
  }
});

// ====== LOAD WISHES ======
const wishesList = document.getElementById('wishesList');
const wishesCount = document.getElementById('wishesCount');

function formatWishTime(t) {
  if (!t) return '';
  const d = new Date(t);
  if (isNaN(d)) return '';
  return d.toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function statusClass(k) {
  const v = (k || '').toLowerCase();
  if (v.includes('tidak')) return 'tidak';
  if (v.includes('ragu')) return 'ragu';
  return 'hadir';
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[c]);
}

async function loadWishes() {
  try {
    const res = await fetch(CONFIG.rsvpEndpoint, { method: 'GET' });
    const json = await res.json();
    if (!json.ok || !Array.isArray(json.data)) throw new Error('bad response');

    const items = json.data.slice().reverse();
    wishesCount.textContent = items.length;

    if (!items.length) {
      wishesList.innerHTML = '<p class="wishes-empty">Belum ada ucapan. Jadilah yang pertama!</p>';
      return;
    }

    wishesList.innerHTML = items.map((r) => `
      <article class="wish-card" data-row="${r.row}">
        <div class="wish-head">
          <span class="wish-name">${escapeHtml(r.nama)}</span>
          <span class="wish-status ${statusClass(r.kehadiran)}">${escapeHtml(r.kehadiran || '-')}</span>
        </div>
        ${r.ucapan ? `<p class="wish-msg">${escapeHtml(r.ucapan)}</p>` : ''}
        <div class="wish-foot">
          <span class="wish-time">${escapeHtml(formatWishTime(r.waktu))}</span>
          <button class="wish-del" data-row="${r.row}" title="Hapus ucapan">&times;</button>
        </div>
      </article>
    `).join('');
  } catch (err) {
    wishesList.innerHTML = '<p class="wishes-empty">Gagal memuat ucapan.</p>';
  }
}

// ====== DELETE WISH (admin) ======
let adminPassword = sessionStorage.getItem('adminPwd') || '';

wishesList.addEventListener('click', async (e) => {
  const btn = e.target.closest('.wish-del');
  if (!btn) return;

  const row = btn.dataset.row;
  if (!adminPassword) {
    const input = prompt('Masukkan kata sandi pemilik undangan:');
    if (!input) return;
    adminPassword = input;
  }

  if (!confirm('Hapus ucapan ini?')) return;

  btn.disabled = true;
  btn.textContent = '...';

  try {
    const res = await fetch(CONFIG.rsvpEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'delete', row, password: adminPassword }),
    });
    const json = await res.json();
    if (!json.ok) {
      if (String(json.error || '').toLowerCase().includes('password')) {
        adminPassword = '';
        sessionStorage.removeItem('adminPwd');
        alert('Kata sandi salah.');
      } else {
        alert('Gagal menghapus: ' + (json.error || 'unknown'));
      }
      btn.disabled = false;
      btn.textContent = '×';
      return;
    }
    sessionStorage.setItem('adminPwd', adminPassword);
    loadWishes();
  } catch (err) {
    alert('Gagal menghubungi server.');
    btn.disabled = false;
    btn.textContent = '×';
  }
});

loadWishes();
