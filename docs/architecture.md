# Arsitektur — Psikologia Career

## Ringkasan

```
Browser (React SPA)  ──HTTPS──▶  psikologia.id/            file statis hasil build Vite
                     ──HTTPS──▶  psikologia.id/api/*       PHP 8.2+ REST API (front controller)
                                        │
                                        ├── MySQL / MariaDB (PDO, prepared statements)
                                        ├── Penyimpanan privat CV (di luar public_html)
                                        └── Penyedia AI (OpenAI / Anthropic) — hanya dari server
```

* **Satu domain, satu origin.** Frontend dan API berada di domain yang sama, sehingga autentikasi memakai
  cookie sesi `HttpOnly` + `SameSite=Lax` tanpa CORS. Permintaan yang mengubah data wajib membawa header
  `X-CSRF-Token`.
* **Tidak ada Node.js di production.** Node hanya dipakai saat build frontend. Cocok untuk Hostinger Web Hosting (shared).
* **AI hanya di backend.** Kunci API dibaca dari environment server; frontend tidak pernah melihatnya.

## Keputusan teknis & asumsi

| Topik | Keputusan | Alasan |
|---|---|---|
| Frontend | React 18 + TypeScript + Vite 5 + Tailwind 3 + Lucide + React Router 6 | Sesuai brief, stabil, build statis |
| Backend | PHP 8.2+ tanpa framework, struktur controller → service → repository, middleware | Ringan dan kompatibel dengan shared hosting |
| Database | MySQL 5.7+/8 atau MariaDB 10.4+ (diuji dengan MariaDB 10.11) | Tersedia di Hostinger |
| Sesi | Disimpan di tabel `sessions` (ID di-hash SHA-256) | Berfungsi di shared hosting dan platform serverless (Vercel) |
| Password | `password_hash` Argon2id (fallback bcrypt) | Standar PHP |
| Laporan refleksi | Berbasis aturan (deterministik), **tanpa AI** | Tetap berfungsi tanpa API key, hasil bisa direproduksi, dan tidak ada data refleksi yang dikirim ke pihak ketiga |
| AI | Interface `AiProvider` → `OpenAiProvider` (cURL; juga melayani Gemini & Groq gratis via endpoint kompatibel OpenAI), `AnthropicProvider` (SDK resmi), `MockProvider` | Penyedia bisa diganti lewat `AI_PROVIDER`; default gratis yang disarankan: `gemini` |
| Mock AI | Selalu diberi tanda `simulated: true` + label “Simulasi” di UI | Tidak pernah tampil seolah-olah hasil AI |
| PDF | `smalot/pdfparser` (PHP murni) | Tanpa ekstensi atau binary tambahan |
| Rate limit | Fixed window di tabel `rate_limits` | Tanpa Redis |
| Ekspor PDF laporan | `window.print()` + stylesheet cetak | Andal, tanpa library berat |
| Email reset | Driver `log` (dev) / `mail` (PHP `mail()` Hostinger) | Sederhana; SMTP bisa ditambahkan nanti |

## Struktur folder

```
frontend/                 React SPA
  src/components/         UI reusable (Button, Form, Feedback, Modal, RichText, guard rute, modal persetujuan)
  src/pages/              Halaman per rute
  src/layouts/            Navbar, Footer, AppLayout
  src/hooks/              useAuth (konteks auth), useAsync
  src/services/api.ts     API client (cookie + CSRF, retry 419)
  src/types/              Tipe data bersama
  src/utils/              Format, localStorage aman
  e2e/run.mjs             Tes end-to-end Playwright
backend/
  public/                 index.php (front controller), .htaccess, router.php (server dev)
  src/App.php             Kernel + container sederhana + penanganan error
  src/routes.php          Seluruh endpoint
  src/Core/               Env, Config, Request, Response, Router, Database, Session, DbSessionHandler, Validator, Logger, Migrator
  src/Middleware/         CsrfMiddleware, AuthMiddleware, RateLimiter
  src/Controllers/        Auth, Reflection, Assistant, CvReview, Interview, Profile, Dashboard, Health, Ops
  src/Services/           CareerReflectionService, CareerAssistantService, CVReviewService, InterviewPreparationService,
                          AuthService, ConsentService, AccountService, CvFileStorage, PdfTextExtractor, Mailer
  src/Services/AI/        AiProvider, AiProviderFactory, OpenAiProvider, AnthropicProvider, MockProvider, Prompts, JsonOutput
  src/Repositories/       Akses data per tabel (selalu dibatasi user_id)
  src/Domain/             ReflectionQuestions (bank pertanyaan), CareerCatalog (area karier & label)
  database/migrations/    Migrasi SQL bernomor
  database/seeds/         Seeder untuk development
  bin/                    migrate.php, seed.php
  storage/                logs/, sessions/, cv/ (privat, tidak di-commit)
  tests/                  PHPUnit: Unit + Api (HTTP-level)
deploy/hostinger/         .htaccess untuk public_html
deploy/vercel/            vercel.json, composer.json root, api/index.php
scripts/                  build-hostinger.sh, export-career-repo.sh
docs/                     Dokumentasi ini
```

## Alur permintaan API

1. `public/index.php` mencari app root (dev: `backend/`, Hostinger: `../../psikologia-app`, atau `APP_ROOT`).
2. `App::handle()` mencocokkan rute → `CsrfMiddleware` (POST/PUT/PATCH/DELETE) → `AuthMiddleware` (rute `auth`).
3. Controller memvalidasi input (`Validator`), memanggil rate limiter dan service, lalu mengembalikan `Response`.
4. Semua error dipetakan ke format JSON yang konsisten; exception tak terduga dicatat di log dan pengguna hanya melihat pesan generik.

## Strategi keamanan (ringkas)

Lihat checklist lengkap di [deployment.md](deployment.md#checklist-keamanan-sebelum-production).

* Prepared statements (emulasi dimatikan), output JSON (React melakukan escaping; `RichText` tidak memakai `innerHTML`).
* Otorisasi: setiap query data pribadi difilter `user_id`; akses ke data milik orang lain → 404.
* Sesi: regenerasi saat login, timeout idle 7 hari, sesi lain dihapus saat reset atau ganti password.
* Upload: hanya PDF (ekstensi + MIME `finfo` + magic bytes `%PDF-`), maksimal 2 MB, nama acak, `chmod 0600`, di luar web root.
* Persetujuan berversi (`consent_logs`) sebelum data dikirim ke AI; persetujuan CV dicatat setiap kali analisis.
* Header keamanan (HSTS, CSP, nosniff, frame-deny) melalui `.htaccess` / `vercel.json`.
