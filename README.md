# Psikologia Career

**Kenali Potensimu. Bangun Kariermu.** — platform pengembangan karier untuk mahasiswa, fresh graduate, dan
profesional di awal karier, yang memadukan pendekatan psikologi, teknologi, dan AI. Domain: **psikologia.id**.

> Hasil refleksi dan saran AI adalah **panduan eksplorasi**, bukan tes psikologi tervalidasi, diagnosis, atau keputusan
> mutlak tentang masa depan pengguna.

<!-- legacy-start -->
> **Catatan repositori:** file statis di root (`index.html`, `test.html`, `hasil.html`, `checkout.html`, `assets/`) adalah
> situs tes kepribadian psikologia.id versi sebelumnya dan tidak diubah. Dokumentasinya dipindah ke
> [docs/legacy-tes-kepribadian.md](docs/legacy-tes-kepribadian.md). Psikologia Career berada di `frontend/`, `backend/`, `docs/`, `deploy/`.
<!-- legacy-end -->

## 1. Ringkasan arsitektur

```
React SPA (Vite build, file statis)  ─┐
                                      ├─ satu domain: psikologia.id   (/ → SPA, /api → PHP)
PHP 8.2+ REST API (tanpa framework)  ─┘
   ├─ MySQL/MariaDB via PDO (prepared statements)
   ├─ Sesi di database + cookie HttpOnly/SameSite=Lax + token CSRF
   ├─ Penyimpanan CV privat di luar public_html
   └─ Lapisan AI: AiProvider → OpenAI | Anthropic | Mock (berlabel “Simulasi”)
```

Tidak membutuhkan Node.js di production, sehingga kompatibel dengan Hostinger Web Hosting. Detail lengkap dan keputusan teknis ada di
[docs/architecture.md](docs/architecture.md).

**Asumsi utama:** laporan Refleksi Karier dihitung dengan aturan (tanpa AI) agar tetap berfungsi tanpa API key dan tidak mengirim data
refleksi ke pihak ketiga. Bila `AI_API_KEY` kosong, fitur AI berjalan dalam mode simulasi yang selalu diberi label.

## 2. Struktur folder

```
frontend/   React + TypeScript + Vite + Tailwind + Lucide (src/components, pages, layouts, hooks, services, types, utils; e2e/)
backend/    PHP API (public/, src/{Core,Middleware,Controllers,Services,Services/AI,Repositories,Domain}, database/, bin/, storage/, tests/)
deploy/     hostinger/ (.htaccess public_html), vercel/ (vercel.json, composer.json, api/index.php)
scripts/    build-hostinger.sh, export-career-repo.sh
docs/       architecture.md, database.md, api.md, deployment.md, user-guide.md
```

## 3. Fitur yang sudah berfungsi (teruji)

| Fitur | Status |
|---|---|
| Landing page (hero, fitur, cara kerja, manfaat, testimoni **berlabel contoh**, CTA, footer) | ✅ |
| Register, login, logout, lupa & reset password, protected routes, sesi aman | ✅ |
| Refleksi Karier: 5 kategori, 37 pertanyaan, progres, validasi, autosave + resume, bisa dicoba tanpa akun | ✅ |
| Laporan Karier: ringkasan, kekuatan, minat, preferensi, nilai, 3 area karier, pertanyaan lanjutan, rekomendasi, langkah berikutnya, riwayat, hapus, ekspor PDF (cetak) | ✅ |
| Hasil tamu otomatis tersimpan setelah daftar/masuk | ✅ |
| AI Career Assistant: chat, riwayat percakapan, konteks refleksi, loading, error, hapus percakapan, persetujuan | ✅ (mode simulasi sampai API key diisi) |
| CV Reviewer: upload PDF / tempel teks, deskripsi lowongan, persetujuan, ringkasan, kekuatan, saran, relevansi skill, perbaikan bullet, skor estimasi, riwayat, hapus | ✅ (mode simulasi sampai API key diisi) |
| Persiapan Interview: pilih posisi & jenis, buat pertanyaan, jawab, feedback STAR, saran, progres, riwayat | ✅ (mode simulasi sampai API key diisi) |
| Dashboard: ringkasan aktivitas, refleksi terakhir, progres 5 milestone, CV & interview terbaru, langkah berikutnya | ✅ |
| Profil: ubah profil, ubah password, lihat/cabut persetujuan, hapus data pribadi, hapus akun | ✅ |
| Kebijakan Privasi & Syarat Penggunaan, halaman 404 | ✅ |
| Rate limiting, CSRF, validasi, logging, upload aman, JSON error konsisten | ✅ |

## 4. Fitur yang masih membutuhkan konfigurasi

* **AI sungguhan** — isi `AI_PROVIDER` (`anthropic`/`openai`), `AI_API_KEY`, dan opsional `AI_MODEL`. Tanpa itu, respons berlabel **Simulasi**.
* **Email reset password** — `MAIL_DRIVER=mail` dan akun email `no-reply@psikologia.id` di Hostinger. Di dev, tautan ditulis ke `backend/storage/logs/`.
* **Database & domain production** — lihat [docs/deployment.md](docs/deployment.md).

## 5. Source code

Seluruh kode ada di repositori ini (`frontend/`, `backend/`). Prompt AI per fitur ada di `backend/src/Services/AI/Prompts.php`,
bank pertanyaan refleksi di `backend/src/Domain/ReflectionQuestions.php`, dan katalog area karier di `backend/src/Domain/CareerCatalog.php`.

## 6. Database schema & migrations

`backend/database/migrations/001_create_core_tables.sql` — tabel `users`, `user_profiles`, `reflections`, `conversations`,
`conversation_messages`, `cv_reviews`, `interview_sessions`, `consent_logs`, `password_resets`, `sessions`, `rate_limits`.
Lihat [docs/database.md](docs/database.md).

## 7. API documentation

[docs/api.md](docs/api.md) — konvensi respons, kode error, dan seluruh endpoint (`/api/auth/*`, `/api/reflections*`, `/api/assistant/*`,
`/api/cv-reviews*`, `/api/interviews*`, `/api/profile*`, `/api/dashboard`, `/api/health`).

## 8. Environment variable template

[backend/.env.example](backend/.env.example) (berisi komentar untuk setiap variabel). Rahasia hanya disimpan di `.env` server — tidak pernah di frontend atau repositori.

## 9. Menjalankan secara lokal

Prasyarat: PHP 8.2+ (ekstensi pdo_mysql, mbstring, curl, fileinfo), Composer 2, Node 18+, MySQL/MariaDB.

```bash
# 1) Database lokal
mysql -uroot -e "CREATE DATABASE psikologia_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  CREATE USER 'psikologia'@'localhost' IDENTIFIED BY 'devpass';
  GRANT ALL ON psikologia_dev.* TO 'psikologia'@'localhost';"
```

```bash
# 2) Backend
cd backend
composer install
cp .env.example .env     # set APP_ENV=development, APP_DEBUG=true, APP_URL=http://localhost:5173,
                         # DB_* sesuai di atas, SESSION_SECURE_COOKIE=false, AI_PROVIDER=mock
php bin/migrate.php
php bin/seed.php         # opsional: demo@psikologia.id / Demo12345
php -S 127.0.0.1:8080 -t public public/router.php
```

```bash
# 3) Frontend (terminal lain) — Vite mem-proxy /api ke 127.0.0.1:8080
cd frontend
npm install
npm run dev              # buka http://localhost:5173
```

## 10. Deployment ke Hostinger

Ringkas: `scripts/build-hostinger.sh` → unggah `build/hostinger/public_html/*` ke `public_html/` dan `build/hostinger/psikologia-app/`
ke **luar** `public_html` → buat `.env` → buat database → `php bin/migrate.php` → aktifkan SSL.
Panduan lengkap (termasuk daftar yang perlu dicek di hPanel dan deployment Vercel untuk staging): [docs/deployment.md](docs/deployment.md).

## 11. Checklist pengujian

Otomatis:

```bash
# Backend: 39 tes PHPUnit (unit + API level HTTP, memakai database psikologia_test dan AI mock)
mysql -uroot -e "CREATE DATABASE psikologia_test CHARACTER SET utf8mb4; GRANT ALL ON psikologia_test.* TO 'psikologia'@'localhost';"
cd backend && vendor/bin/phpunit
```

```bash
# Frontend: typecheck + build, lalu E2E Playwright (20 skenario) terhadap API + SPA hasil build
cd frontend && npm run build
cd ../backend && FRONTEND_DIST=$PWD/../frontend/dist RL_REGISTER_MAX=1000 RL_LOGIN_MAX=1000 RL_ASSISTANT_MAX=1000 \
  RL_CV_MAX=1000 RL_INTERVIEW_MAX=1000 php -S 127.0.0.1:8080 -t public public/router.php &
cd ../frontend && BASE_URL=http://127.0.0.1:8080 node e2e/run.mjs
```

Cakupan otomatis:
* **Auth**: register, email duplikat, validasi, login, password salah, email tak dikenal (pesan sama), logout, protected routes (401), CSRF (419), cookie HttpOnly/SameSite, reset password sekali pakai + invalidasi sesi.
* **Refleksi**: kuesioner publik, preview tamu, jawaban tidak lengkap/tidak valid ditolak, simpan/list/detail/hapus, isolasi antar-pengguna, determinisme scoring.
* **AI Assistant**: persetujuan wajib (428), chat + label simulasi + konteks refleksi, lanjut percakapan, isolasi, rate limit (429 + Retry-After), validasi panjang pesan, error penyedia → pesan aman, API key tidak ada di build frontend.
* **CV**: persetujuan wajib, analisis teks, upload PDF valid tersimpan privat (0600) dan terhapus, file palsu/terlalu besar ditolak, isolasi, skor = jumlah kriteria.
* **Interview**: buat, jawab, feedback STAR, progres, validasi, isolasi.
* **Profil**: update, ganti password, cabut persetujuan, hapus data, hapus akun (+ file).
* **UI (E2E)**: alur lengkap tamu→daftar→semua fitur→hapus akun, tanpa horizontal overflow di 375px pada 9 halaman, crawl tautan internal tanpa 404, tanpa console error.

Manual sebelum rilis: lihat “Verifikasi production” di [docs/deployment.md](docs/deployment.md#f-verifikasi-production).

**Belum diuji otomatis:** panggilan ke API OpenAI/Anthropic sungguhan (butuh key; hanya penanganan error koneksi yang diuji),
pengiriman email via `mail()` Hostinger, dan deploy fisik ke Hostinger.

## 12. Checklist keamanan sebelum production

Lihat [docs/deployment.md → Checklist keamanan](docs/deployment.md#checklist-keamanan-sebelum-production).

## 13. Keterbatasan MVP

* Kuesioner refleksi dan pemetaan area karier bersifat editorial (aturan sederhana), **belum divalidasi secara psikometrik**.
* Skor CV adalah estimasi dari 5 kriteria; kualitasnya bergantung pada model AI yang dipakai.
* PDF hasil scan (gambar) tidak bisa dibaca — pengguna perlu menempel teks.
* Ekspor PDF memakai dialog cetak browser.
* Email hanya lewat PHP `mail()` (belum SMTP/antrean); belum ada verifikasi email.
* Chat belum streaming (jawaban muncul sekaligus setelah selesai).
* Rate limit berbasis IP/user di MySQL (cukup untuk MVP, belum terdistribusi).
* Belum ada panel admin, analitik, atau ekspor data pengguna (hapus data sudah ada).

## 14. Rekomendasi tahap berikutnya

1. Validasi kuesioner bersama psikolog (uji reliabilitas, norma lokal) sebelum klaim apa pun yang lebih kuat.
2. Streaming respons AI dan riwayat konteks yang diringkas untuk percakapan panjang.
3. SMTP (PHPMailer) + verifikasi email + notifikasi.
4. Ekspor data pribadi (JSON/PDF) untuk memenuhi hak akses UU PDP.
5. Panel admin: moderasi, metrik penggunaan, biaya AI.
6. Rencana pengembangan 30/60/90 hari yang bisa dicentang, terhubung ke dashboard.
7. Integrasi lowongan (job board) dan pencocokan dengan hasil refleksi.
8. CI (GitHub Actions) yang menjalankan PHPUnit + build + E2E di setiap PR.
