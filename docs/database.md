# Database

Migrasi: `backend/database/migrations/001_create_core_tables.sql` (dijalankan oleh `php bin/migrate.php`, tercatat di `schema_migrations`).
Semua tabel memakai InnoDB + `utf8mb4_unicode_ci`. Waktu disimpan dalam **UTC**.

| Tabel | Kolom utama | Catatan |
|---|---|---|
| `users` | id, name, email (unique), password_hash, created_at, updated_at | Password di-hash dengan Argon2id/bcrypt |
| `user_profiles` | id, user_id (unique, FK), education, current_position, career_goal, profile_data JSON | 1:1 dengan users |
| `reflections` | id, user_id (FK), answers_json, result_json, created_at | Index (user_id, created_at) |
| `conversations` | id, user_id (FK), title, created_at, updated_at | Index (user_id, updated_at) |
| `conversation_messages` | id, conversation_id (FK), role ENUM(user, assistant), content, meta_json, created_at | meta_json: provider, model, simulated |
| `cv_reviews` | id, user_id (FK), file_path (privat, nullable), original_filename, source ENUM(upload, paste), target_job, job_description, result_json, consent_given, created_at | Teks CV **tidak** disimpan, hanya file (opsional) dan hasil analisis |
| `interview_sessions` | id, user_id (FK), job_position, interview_type, questions_json, answers_json, feedback_json, meta_json, created_at, updated_at | Jawaban/feedback per indeks pertanyaan |
| `consent_logs` | id, user_id (FK), consent_type, consent_version, accepted_at | privacy_policy, ai_processing, cv_processing |
| `password_resets` | id, user_id (FK), token_hash (unique, SHA-256), expires_at, used_at, created_at | Token sekali pakai, berlaku 60 menit |
| `sessions` | id (SHA-256 dari session ID), user_id, payload, last_activity | Driver sesi database |
| `rate_limits` | rl_key (PK), hits, reset_at | Identitas di-hash |

Semua FK ke `users` memakai `ON DELETE CASCADE`, sehingga menghapus akun ikut menghapus seluruh data terkait
(file CV dihapus oleh `AccountService`).

## Perintah

```bash
php bin/migrate.php          # terapkan migrasi yang tertunda
php bin/migrate.php --fresh  # hapus semua tabel lalu migrasi ulang (ditolak di production)
php bin/seed.php             # akun demo demo@psikologia.id / Demo12345 (ditolak di production)
```

Seeder hanya membuat akun demo, profil, dan satu laporan refleksi berbasis aturan. **Tidak ada hasil AI palsu** yang di-seed.

Menambah migrasi: buat file `002_nama_perubahan.sql` (nomor urut berikutnya). Jangan mengubah migrasi yang sudah dijalankan di production.
