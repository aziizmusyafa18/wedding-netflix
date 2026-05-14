/**
 * Google Apps Script — RSVP Endpoint untuk Undangan Netflix Wedding
 *
 * CARA PAKAI:
 * 1. Buka Google Sheets baru, beri nama "Wedding RSVP".
 * 2. Buat 2 sheet (tab) di dalamnya:
 *    - Tab "RSVP"     : kolom A..F => Waktu | Nama | Kehadiran | Jumlah | Ucapan | Raw
 *    - Tab "Tamu"     : kolom A..C => Nama | Link Undangan | Status Kirim
 * 3. Menu Extensions > Apps Script, hapus isi default, paste seluruh kode ini.
 * 4. Ganti BASE_URL di bawah dengan URL hosting undangan kamu (mis. GitHub Pages).
 * 5. Klik Deploy > New deployment > pilih "Web app".
 *    - Execute as: Me
 *    - Who has access: Anyone
 *    Salin URL yang muncul, paste ke CONFIG.rsvpEndpoint di script.js
 * 6. Untuk generate link tamu otomatis di sheet "Tamu", lihat formula di bawah.
 */

const BASE_URL = 'https://USERNAME.github.io/wedding-netflix/';
const SHEET_NAME = 'RSVP';
// GANTI password ini dengan password rahasia kamu (hanya pemilik undangan yang tahu)
const ADMIN_PASSWORD = 'rio-sari-2026';

function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);
    const data = JSON.parse(e.postData.contents);

    // ===== ACTION: DELETE =====
    if (data.action === 'delete') {
      if (data.password !== ADMIN_PASSWORD) {
        return ContentService
          .createTextOutput(JSON.stringify({ ok: false, error: 'Password salah' }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      const rowIndex = Number(data.row);
      if (!rowIndex || rowIndex < 2) {
        return ContentService
          .createTextOutput(JSON.stringify({ ok: false, error: 'Baris tidak valid' }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      sheet.deleteRow(rowIndex);
      return ContentService
        .createTextOutput(JSON.stringify({ ok: true, deleted: rowIndex }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // ===== DEFAULT: APPEND RSVP =====
    sheet.appendRow([
      new Date(),
      data.nama || '',
      data.kehadiran || '',
      data.jumlah || '',
      data.ucapan || '',
      JSON.stringify(data),
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);
    const values = sheet.getDataRange().getValues();
    const rows = values.slice(1).map((r, i) => ({
      row: i + 2,
      waktu: r[0],
      nama: r[1],
      kehadiran: r[2],
      jumlah: r[3],
      ucapan: r[4],
    })).filter(r => r.nama);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, data: rows }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
