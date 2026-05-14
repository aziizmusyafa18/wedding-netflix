# Undangan Pernikahan Digital — Tema Netflix

Undangan pernikahan digital dengan tampilan ala dashboard Netflix. HTML/CSS/JS murni, tanpa framework.

## Struktur

```
wedding-netflix/
├── index.html              # Markup undangan (splash, cover, hero, acara, RSVP)
├── style.css               # Tema gelap Netflix (#E50914 + hitam)
├── script.js               # Splash timer, ?to=, musik, countdown, RSVP fetch
├── google-apps-script.gs   # Backend RSVP (Google Sheets Web App)
└── assets/
    ├── hero.jpg            # Foto hero (pasang sendiri, 1600x900 disarankan)
    └── music.mp3           # Musik latar (opsional)
```

## Cara Pakai Lokal

Buka `index.html` langsung di browser. Untuk testing personalisasi tamu:

```
file:///.../index.html?to=Budi+Santoso
```

## Setup Google Sheets RSVP

1. Buat Google Sheet baru, beri nama `Wedding RSVP`.
2. Buat 2 tab:
   - **RSVP** — header baris 1: `Waktu | Nama | Kehadiran | Jumlah | Ucapan | Raw`
   - **Tamu** — header baris 1: `Nama | Link Undangan | Status Kirim`
3. Menu `Extensions` → `Apps Script`. Paste isi `google-apps-script.gs`.
4. Ganti `BASE_URL` dengan URL hosting kamu (mis. `https://username.github.io/wedding-netflix/`).
5. `Deploy` → `New deployment` → `Web app`:
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Salin URL deploy, paste ke `CONFIG.rsvpEndpoint` di `script.js`.

## Formula Generate Link Tamu (di tab "Tamu")

Di kolom B2 (Link Undangan), masukkan formula berikut:

```
=IF(A2="","",CONCATENATE("https://username.github.io/wedding-netflix/?to=",ENCODEURL(A2)))
```

Lalu drag ke bawah. Setiap kali kamu mengisi nama di kolom A, link akan otomatis ter-generate dengan parameter `?to=Nama+Tamu`.

### Versi dengan tombol salin (HYPERLINK)

```
=IF(A2="","",HYPERLINK(CONCATENATE("https://username.github.io/wedding-netflix/?to=",ENCODEURL(A2)),"Buka Undangan "&A2))
```

### Versi pesan WhatsApp siap kirim

Tambah kolom D untuk pesan WhatsApp:

```
=IF(A2="","",CONCATENATE("https://wa.me/?text=",ENCODEURL("Halo "&A2&", kami mengundang Anda di pernikahan kami. Silakan buka undangan: https://username.github.io/wedding-netflix/?to="&ENCODEURL(A2))))
```

Klik link di kolom D → langsung buka WhatsApp dengan pesan siap kirim.

## Kustomisasi Cepat

| Apa | Di mana |
|---|---|
| Nama mempelai | `index.html` — cari "Rio & Sari" |
| Tanggal & jam akad/resepsi | `index.html` bagian `.episode` + `script.js` (`weddingDate`) |
| Lokasi & Maps | `index.html` href tombol "Buka Maps" |
| Warna utama | `style.css` variabel `--netflix-red` |
| Foto hero | Letakkan di `assets/hero.jpg` |
| Musik latar | Letakkan di `assets/music.mp3` |

## Hosting Gratis

- **GitHub Pages**: push folder ini ke repo, aktifkan Pages di Settings.
- **Netlify Drop**: drag-and-drop folder ke <https://app.netlify.com/drop>.
- **Vercel**: import repo, deploy. Tanpa konfigurasi.
