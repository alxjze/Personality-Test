# Deployment

Target utama: **Hostinger Web Hosting** dengan domain `psikologia.id`.
Target pratinjau/staging: **Vercel** (PHP via runtime komunitas `vercel-php`, database MySQL di Hostinger).

---

## A. Hal yang perlu dicek di hPanel Hostinger

Akun Hostinger yang terhubung sudah memiliki situs `psikologia.id` (username hosting `u728262898`,
document root `/home/u728262898/domains/psikologia.id/public_html`). Sebelum deploy, pastikan:

| Cek | Di mana | Kebutuhan |
|---|---|---|
| Versi PHP | Websites → psikologia.id → Advanced → PHP Configuration | **8.2 atau 8.3** |
| Ekstensi PHP | PHP Configuration → PHP extensions | `pdo_mysql`, `mbstring`, `curl`, `fileinfo`, `json`, `openssl` (biasanya aktif) |
| Batas PHP | PHP Configuration → PHP options | `upload_max_filesize` ≥ 4M, `post_max_size` ≥ 8M, `max_execution_time` ≥ 120 (untuk panggilan AI) |
| MySQL/MariaDB | Databases → Management | Tersedia di semua paket Web Hosting |
| SSH | Advanced → SSH Access | Paket Premium/Business biasanya tersedia — memudahkan `composer` dan `migrate` |
| SSL | Security → SSL | Aktifkan SSL gratis untuk psikologia.id |
| Konten lama | File Manager → public_html | **Cadangkan dulu.** Situs tes kepribadian yang lama akan tergantikan |
| Node.js | Websites → Node.js (paket Business/Cloud) | **Tidak diperlukan.** Aplikasi ini tidak membutuhkan Node di production |
| Email | Emails | Buat `no-reply@psikologia.id` jika ingin reset password terkirim (`MAIL_DRIVER=mail`) |

> Bila paketmu mendukung Node.js application hosting, alternatifnya backend ditulis ulang dengan Node (mis. Express/NestJS)
> dan dideploy lewat Git. Namun backend PHP ini lebih sederhana untuk shared hosting dan sudah teruji, jadi itu yang direkomendasikan.

## B. Build

Di komputer lokal (butuh Node 18+, PHP 8.2+, Composer 2):

```bash
scripts/build-hostinger.sh
```

Hasil:

```
build/hostinger/public_html/        → isi untuk domains/psikologia.id/public_html/
    index.html, assets/, favicon.svg, robots.txt
    .htaccess                       (HTTPS redirect, SPA fallback, header keamanan)
    api/index.php, api/.htaccess    (front controller API)
build/hostinger/psikologia-app/     → domains/psikologia.id/psikologia-app/  (DI LUAR public_html)
    src/, vendor/, database/, bin/, storage/, composer.json, .env.example
```

API base URL tidak perlu dikonfigurasi: frontend memanggil `/api` pada domain yang sama.
(Opsional: `VITE_API_BASE_URL` saat build bila API berada di path lain.)

## C. Deploy backend

1. File Manager / SFTP: unggah `psikologia-app/` ke `/home/u728262898/domains/psikologia.id/psikologia-app/`.
   `api/index.php` otomatis menemukan folder ini (`dirname(__DIR__, 2) . '/psikologia-app'`). Jika lokasinya berbeda, set env `APP_ROOT`.
2. Salin `.env.example` menjadi `.env` di `psikologia-app/` lalu isi (lihat bagian D untuk DB):
   ```
   APP_ENV=production
   APP_URL=https://psikologia.id
   DB_HOST=127.0.0.1
   DB_DATABASE=u728262898_xxxxx
   DB_USERNAME=u728262898_xxxxx
   DB_PASSWORD=********
   SESSION_SECURE_COOKIE=true
   AI_PROVIDER=gemini           # gratis (Google AI Studio); atau groq, anthropic, openai, mock
   AI_API_KEY=********
   AI_MODEL=                    # kosong = default penyedia (gemini: gemini-2.5-flash)
   MAIL_DRIVER=mail
   ```
3. Permission: folder `psikologia-app/storage` dan subfoldernya `755` (bisa ditulis oleh user PHP), file `.env` `600`.
4. Jika mengunggah tanpa `vendor/`, jalankan via SSH: `cd ~/domains/psikologia.id/psikologia-app && composer install --no-dev -o`.

## D. Database

1. hPanel → Databases → Management → buat database + user (nama otomatis diawali `u728262898_`). Gunakan password kuat.
2. Isi kredensial di `.env` (host **127.0.0.1** atau `localhost` — bukan host `srvNNNN.hstgr.io`, yang hanya untuk akses dari luar).
3. Jalankan migrasi:
   * Dengan SSH: `php ~/domains/psikologia.id/psikologia-app/bin/migrate.php`
   * Tanpa SSH: phpMyAdmin → Import → `database/migrations/001_create_core_tables.sql`, **atau** set `OPS_TOKEN`
     sementara lalu `curl -X POST https://psikologia.id/api/ops/migrate -H "X-Ops-Token: <token>"`, kemudian kosongkan lagi `OPS_TOKEN`.
4. Verifikasi: `https://psikologia.id/api/health` → `"database": true`.

## E. Domain & SSL

1. Pastikan domain `psikologia.id` mengarah ke Hostinger (sudah terpasang sebagai website di akun).
2. Security → SSL → Install/aktifkan SSL untuk `psikologia.id` dan `www`.
3. Redirect HTTP→HTTPS sudah diatur di `public_html/.htaccess` (bisa juga diaktifkan dengan opsi *Force HTTPS* di hPanel).
4. Cek `https://psikologia.id/` (SPA) dan `https://psikologia.id/api/health` (API).

## F. Verifikasi production

- [ ] Register akun baru (centang Kebijakan Privasi)
- [ ] Logout lalu login kembali; password salah ditolak
- [ ] Isi refleksi sebagai tamu → laporan tampil → daftar → hasil otomatis tersimpan
- [ ] Unduh PDF laporan (dialog cetak)
- [ ] AI Career Assistant: modal persetujuan muncul, jawaban tanpa label “Simulasi” (jika AI dikonfigurasi)
- [ ] CV Reviewer: upload PDF teks ≤2 MB dan tempel teks; file non-PDF ditolak; hapus review
- [ ] Persiapan Interview: buat pertanyaan, jawab, feedback STAR, progres bertambah
- [ ] Lupa password: email diterima, tautan berfungsi sekali
- [ ] Profil: hapus data pribadi, lalu hapus akun
- [ ] `https://psikologia.id/api/ops/migrate` → 404 (OPS_TOKEN kosong)
- [ ] `https://psikologia.id/.env` dan `https://psikologia.id/api/../psikologia-app` tidak dapat diakses

---

## Vercel (staging/pratinjau)

Repositori standalone untuk Vercel dibuat dengan `scripts/export-career-repo.sh <dir>`. Skrip ini menaruh
`vercel.json`, `composer.json` (root, khusus runtime PHP Vercel), dan `api/index.php` di root repositori.

* **Frontend**: `npm run build` di `frontend/` → `frontend/dist` (output Vercel).
* **API**: `api/index.php` dijalankan oleh runtime `vercel-php@0.7.4` (PHP 8.3). Dependensi Composer diinstal oleh runtime dari `composer.json` root.
* **Database**: Vercel tidak menyediakan MySQL. Gunakan database Hostinger dengan *Remote MySQL* (host `srvNNNN.hstgr.io`).
  Karena IP Vercel dinamis, remote access perlu `%` — pakai user/database terpisah khusus staging dan password panjang.
* **Mode stateless**: `SESSION_DRIVER=database`, `CV_STORE_FILES=false` (PDF tidak disimpan, hanya hasil analisis), `LOG_CHANNEL=stderr`.

Environment variables di Vercel: `APP_ENV=production`, `APP_URL`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`,
`SESSION_SECURE_COOKIE=true`, `CV_STORE_FILES=false`, `LOG_CHANNEL=stderr`, `AI_PROVIDER`, `AI_API_KEY`, `AI_MODEL`,
`OPS_TOKEN` (sementara, untuk migrasi).

Migrasi pertama: set `AUTO_MIGRATE=true` (migrasi tertunda dijalankan sekali per cold start, aman diulang), **atau** `curl -X POST https://<project>.vercel.app/api/ops/migrate -H "X-Ops-Token: $OPS_TOKEN"` lalu hapus `OPS_TOKEN`.

---

## Checklist keamanan sebelum production

- [ ] `APP_ENV=production` dan `APP_DEBUG=false`
- [ ] `.env` berada di luar `public_html`, permission `600`, tidak di-commit
- [ ] `SESSION_SECURE_COOKIE=true` dan HTTPS aktif (HSTS terkirim)
- [ ] Password database kuat dan unik; remote MySQL `%` **tidak** dibuka untuk database production
- [ ] `AI_API_KEY` hanya di `.env` server (tes `testApiKeyNeverAppearsInFrontendBuild` memastikan tidak ada di build frontend)
- [ ] `OPS_TOKEN` kosong setelah migrasi
- [ ] `storage/` tidak dapat diakses publik (berada di luar web root)
- [ ] `display_errors` off (diatur oleh `public/index.php`); log di `storage/logs` tidak berisi password, token, atau isi CV
- [ ] Batas rate limit sesuai trafik (`RL_*`)
- [ ] Backup database terjadwal aktif di hPanel
- [ ] Kebijakan Privasi ditinjau pihak legal (UU PDP No. 27/2022) sebelum peluncuran publik
- [ ] Batas pengeluaran (spend limit) di dasbor penyedia AI
