# Desain Sistem — Psikologia Career

Sumber utama: berkas brand **`psikologia-career-landing.html`** dari pemilik produk. Halaman depan (`/`) adalah port
langsung berkas itu ke React; halaman fungsional lain memakai token dan komponen yang sama.

## Implementasi
- **Landing**: `frontend/src/pages/LandingPage.tsx` + `frontend/src/styles/landing.css` (CSS berkas brand, semua selector
  di-scope ke `.lp` agar tidak bocor ke halaman lain; `.container` diganti `.lp-container` karena bentrok dengan Tailwind).
- **Global**: `tailwind.config.js`, `styles/index.css`, `components/ui/*`, `layouts/Navbar.tsx`, `layouts/Footer.tsx`.

## Token
| Peran | Nilai |
|---|---|
| Ink (teks & judul) | `#101d42` |
| Muted | `#53627f` |
| Blue (aksi) | `#1467ed` · gelap `#084cbf` · lembut `#eaf3ff` |
| Garis kartu | `#dce8fb` |
| Background | `#f9fbff` · surface `#fff` |
| Font | Inter 400–900; judul tracking −0.04 s.d. −0.065em |
| Radius | kartu 18–24px, tombol 13px, chip penuh |
| Bayangan | kartu `0 9px 24px rgba(27,71,133,.045)`, hover `0 16px 28px rgba(27,71,133,.09)` |
| Tombol utama | gradien `#1686ff → #0757d9`, bayangan biru, naik 2px saat hover |

## Penyesuaian dari berkas brand (dan alasannya)
- Semua tautan diarahkan ke rute yang ada (Blog, Tentang Kami, FAQ, Hubungi Kami, ikon media sosial dihapus/diganti karena belum ada halamannya).
- Bukti yang dikarang dihapus: "10.000+ pengguna" → "Gratis untuk dicoba"; rating bintang dihapus; testimoni diberi label
  "Contoh testimoni"; panel dashboard di hero diberi label "Contoh tampilan".
- Foto hero `psikologia-career-hero.png` tidak tersedia; ditampilkan ilustrasi SVG sampai file itu ditaruh di
  `frontend/public/psikologia-career-hero.png` (komponen otomatis memakai foto bila ada).
- Lapisan gerakan: panel dashboard & catatan melayang pelan, reveal bertahap saat scroll, hover pada kartu;
  semua dimatikan untuk `prefers-reduced-motion`, dan selalu tampil saat dicetak.

## Catatan taste-skill
Berkas brand memakai gradien, bayangan, chip label di atas judul, dan kartu berikon — perangkat yang dilarang aturan
umum taste-skill. Sesuai bagian "existing brand", aset brand dipertahankan dan aturan itu dikecualikan untuk merek ini.
