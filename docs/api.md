# API

Base URL: `https://psikologia.id/api` (dev: `http://localhost:5173/api` via proxy Vite → `127.0.0.1:8080`).

## Konvensi

* JSON in/out (`Content-Type: application/json`), kecuali upload CV (`multipart/form-data`).
* Autentikasi: cookie sesi `psk_session` (HttpOnly). Kirim `credentials: 'same-origin'`.
* **CSRF**: setiap `POST/PUT/PATCH/DELETE` wajib membawa header `X-CSRF-Token`. Token didapat dari `GET /auth/csrf`
  atau `GET /auth/me`, dan diperbarui setelah login, registrasi, atau ganti password.
* Respons sukses: `{ "success": true, "data": … }`
* Respons error: `{ "success": false, "error": { "code": "…", "message": "…", "fields": { "field": "pesan" } } }`

| Status | code | Arti |
|---|---|---|
| 401 | `unauthenticated` | Belum login |
| 401 | `invalid_credentials` | Email atau password salah |
| 404 | `not_found` | Tidak ada, **atau milik pengguna lain** |
| 419 | `csrf_mismatch` | Token CSRF salah atau kedaluwarsa (client otomatis mengambil token baru dan mencoba ulang sekali) |
| 422 | `validation_error` | Lihat `error.fields` |
| 428 | `consent_required` | Persetujuan pemrosesan AI belum diberikan |
| 429 | `rate_limited` | Terlalu banyak permintaan (header `Retry-After`) |
| 502/503 | `ai_unavailable`, `ai_busy`, `ai_misconfigured`, `ai_bad_output` | Masalah penyedia AI (pesan selalu generik) |
| 422 | `ai_declined` | AI menolak memproses permintaan |
| 500 | `server_error` | Error tak terduga (detail hanya di log) |

## Endpoint

### Sistem
| Method | Path | Auth | Keterangan |
|---|---|---|---|
| GET | `/health` | – | Status DB dan mode AI (`live`/`simulated`) |
| POST | `/ops/migrate` | header `X-Ops-Token` | Jalankan migrasi. **Nonaktif (404)** jika `OPS_TOKEN` kosong |

### Autentikasi
| Method | Path | Body | Keterangan |
|---|---|---|---|
| GET | `/auth/csrf` | – | `{ csrf_token }` |
| GET | `/auth/me` | – | `{ user \| null, csrf_token }` |
| POST | `/auth/register` | `name, email, password, accept_privacy` | 201 + login otomatis. Rate limit per IP |
| POST | `/auth/login` | `email, password` | Rate limit per IP + email |
| POST | `/auth/logout` | – | Menghancurkan sesi |
| POST | `/auth/forgot-password` | `email` | Selalu 200 (tidak membocorkan akun terdaftar). Rate limit |
| POST | `/auth/reset-password` | `token, password` | Token 64 hex, sekali pakai, 60 menit |

### Refleksi Karier
| Method | Path | Auth | Keterangan |
|---|---|---|---|
| GET | `/reflections/questions` | – | Kuesioner (kategori, skala Likert, disclaimer) |
| POST | `/reflections/preview` | – | `{ answers }` → `{ result, saved: false }`. Untuk tamu, tidak disimpan |
| POST | `/reflections` | ✓ | `{ answers }` → 201 tersimpan |
| GET | `/reflections` | ✓ | Daftar ringkas |
| GET | `/reflections/latest` | ✓ | Laporan terbaru atau `null` |
| GET | `/reflections/{id}` | ✓ | Detail (jawaban + hasil) |
| DELETE | `/reflections/{id}` | ✓ | Hapus |

`answers` = objek `{ question_id: 1..5 | "pilihan" | "teks" }`. Seluruh pertanyaan Likert dan `goal_focus` wajib; `goal_text` opsional (≤300 karakter).

### AI Career Assistant
| Method | Path | Body | Keterangan |
|---|---|---|---|
| POST | `/assistant/chat` | `message (1–2000), conversation_id?, consent?` | 428 bila belum ada persetujuan AI; `consent: true` mencatatnya. Rate limit 20/10 menit/pengguna |
| GET | `/assistant/conversations` | – | Riwayat |
| GET | `/assistant/conversations/{id}` | – | Detail + pesan |
| DELETE | `/assistant/conversations/{id}` | – | Hapus percakapan |

### CV Reviewer
| Method | Path | Body | Keterangan |
|---|---|---|---|
| POST | `/cv-reviews` | JSON `{ cv_text (150–20000), target_job, job_description?, consent: true }` **atau** multipart `file (PDF ≤2MB), target_job, job_description?, consent=1` | 201. Persetujuan wajib setiap kali. Rate limit 6/jam |
| GET | `/cv-reviews` | – | Riwayat (skor, label simulasi) |
| GET | `/cv-reviews/{id}` | – | Detail hasil |
| DELETE | `/cv-reviews/{id}` | – | Hapus hasil + file privat |

Hasil: `summary`, `score { overall, max, criteria[5], note }` (overall = jumlah 5 kriteria × 20), `strengths`, `improvements[]`,
`skill_relevance { matched, missing, note }`, `bullet_rewrites[]`, `questions_for_user[]`, `meta { provider, model, simulated }`.

### Persiapan Interview
| Method | Path | Body | Keterangan |
|---|---|---|---|
| GET | `/interviews/types` | – | behavioral, hr, technical |
| POST | `/interviews` | `job_position, interview_type, question_count (3–6), consent?` | 201 sesi + pertanyaan |
| POST | `/interviews/{id}/answer` | `question_index, answer (20–3000), consent?` | Feedback STAR untuk pertanyaan tersebut |
| GET | `/interviews` | – | Riwayat + progres |
| GET | `/interviews/{id}` | – | Detail |
| DELETE | `/interviews/{id}` | – | Hapus |

### Profil, privasi, dashboard
| Method | Path | Body | Keterangan |
|---|---|---|---|
| GET | `/profile` | – | `{ user, profile }` |
| PUT | `/profile` | `name, education?, current_position?, career_goal?` | |
| PUT | `/profile/password` | `current_password, new_password` | Mengeluarkan sesi lain, sesi saat ini tetap aktif |
| GET | `/profile/consents` | – | Status dan riwayat persetujuan |
| PUT | `/profile/consents` | `type: "ai_processing", granted` | Berikan atau cabut |
| DELETE | `/profile/data` | – | Hapus semua data pribadi, akun tetap ada |
| DELETE | `/profile` | `password` | Hapus akun permanen |
| GET | `/dashboard` | – | Ringkasan aktivitas, progres 5 milestone, item terbaru, langkah berikutnya |
