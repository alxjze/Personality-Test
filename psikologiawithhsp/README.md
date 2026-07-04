# Psikologia.id — Landing Page Tes Kepribadian

Landing page + tes kepribadian interaktif berbahasa Indonesia dengan model freemium
(hasil ringkas gratis, laporan lengkap berbayar), terinspirasi konsep
[personality.co](https://personality.co/) dan testlibrary.com.

## Fitur

- **Landing page** (`index.html`) — hero, pilihan tes, social proof, cara kerja, 5 dimensi OCEAN, testimoni, pricing, FAQ, CTA.
- **Platform multi-tes** — dua tes psikologi berbagi satu engine:
  - **Big Five (OCEAN)** — 20 pertanyaan, memetakan 5 dimensi kepribadian → arketipe.
  - **HSP (Highly Sensitive Person)** — 21 pertanyaan, mengukur kepekaan dari 3 aspek (EOE, LST, AES) → level sensitivitas.
- **Tes** (`test.html?test=<id>`) — Likert 1–5, progress bar, auto-lanjut, jawaban tersimpan di `localStorage`.
- **Halaman hasil** (`hasil.html?test=<id>`) — label/arketipe + skor dimensi **gratis**; analisis kekuatan/kelemahan, karier, hubungan, dan tips di balik **paywall** (blur sampai bayar).
- **Checkout** (`checkout.html?test=<id>`) — ringkasan pesanan dinamis per tes, metode (QRIS / VA / kartu), simulasi pembayaran → laporan premium terbuka.

## Arsitektur multi-tes

Setiap tes adalah entri di registry `window.TESTS[<id>]` (lihat `assets/js/questions.js` untuk `bigfive`, `assets/js/hsp.js` untuk `hsp`), dengan antarmuka seragam:

```js
window.TESTS["<id>"] = {
  id, title, short, productName, price, priceStrike, greeting,
  questions,            // [{ dim, reverse, text }]
  likert,               // [{ value, label }]
  computeScores(answers) -> { <dim>: pct, ... },
  getResult(scores) -> { monogram, name, tagline, desc, barsTitle, bars:[{name,en,pct}], premium },
};
```

Engine generik (`test.js`, `result.js`, `checkout.js`) memilih tes aktif dari `?test=<id>` (default `bigfive`) dan menyimpan state dengan namespace: `psikologia_answers_<id>`, `psikologia_scores_<id>`, `psikologia_completed_<id>`, `psikologia_paid_<id>`. Paywall berlaku **per tes** (tiap laporan pembelian terpisah).

Menambah tes baru: buat satu file `assets/js/<id>.js` yang mendaftarkan `window.TESTS["<id>"]`, muat di `test.html`/`hasil.html`/`checkout.html`, dan tambahkan kartunya di `index.html`.

## Menjalankan

Situs statis murni — tidak perlu build step.

```bash
python3 -m http.server 8000
# buka http://localhost:8000
```

## Skoring

- Setiap dimensi O/C/E/A/N punya 4 item (beberapa reverse-scored).
- Skor = rata-rata jawaban 1–5 → dinormalisasi 0–100.
- Neuroticism ditampilkan terbalik sebagai "Stabilitas Emosi".
- Arketipe (Sang Visioner, Sang Arsitek, Sang Penggerak, Sang Penjaga, Sang Penyeimbang) ditentukan dari dimensi skor tertinggi.

## Integrasi pembayaran sungguhan

Pembayaran saat ini **mode demo** (flag `psikologia_paid` di `localStorage`). Titik
integrasinya ada di `assets/js/checkout.js` (blok "SIMULASI"). Untuk produksi:

1. Buat backend/serverless endpoint yang membuat transaksi (Midtrans Snap token / Xendit Invoice).
2. Ganti `setTimeout` simulasi dengan popup Snap (`snap.pay(token)`) atau redirect ke invoice URL.
3. Verifikasi status pembayaran lewat webhook di server, lalu buka akses laporan
   (idealnya lewat token/URL hasil yang diterbitkan server, bukan flag localStorage).

## Disclaimer

Hasil tes bersifat edukatif dan bukan diagnosis klinis atau alat psikometri tersertifikasi.
