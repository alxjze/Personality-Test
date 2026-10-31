# Desain Sistem — Psikologia Career

Acuan: mockup Psikologia Career (biru, kartu lembut, chip melayang), pola UX halaman *website design* Squarespace
(tipografi besar, copy ringkas, showcase produk bertab yang berganti otomatis, FAQ akordeon, CTA penutup gelap),
dan prinsip `design-taste-frontend` (taste-skill): skala tipe yang berani, komposisi yang tidak seragam,
gambar dari produk sendiri, dan gerakan yang bermakna.

> Halaman Squarespace tidak dapat direkam langsung dari lingkungan build (jaringan dibatasi), jadi polanya
> diterapkan dari pengetahuan umum tentang desainnya, bukan dari tangkapan halaman.

## Token (Tailwind `tailwind.config.js`)
| Peran | Nilai |
|---|---|
| Primary | `#155EEF` (hover `#0F4BC4`), tint `primary-50 #EAF2FF`, `primary-100 #D6E6FF` |
| Navy (judul, band gelap) | `#102A56` |
| Sky (aksen ilustrasi) | `#67B7FF` |
| Background | `#F7FAFF` · Surface `#FFFFFF` |
| Teks / teks sekunder | `#172B4D` / `#64748B` |
| Tag kecenderungan | violet `#5B4BDB/#EEEBFF`, biru `#155EEF/#EAF2FF`, oranye `#C2570C/#FFF1E6` (+ teal, rose, green) |
| Radius | kartu `rounded-3xl`, band `rounded-4xl` (2rem), tombol `rounded-xl`, chip `rounded-full` |
| Bayangan | `shadow-card` (diam, lembut), `shadow-lift` (hover/melayang), `shadow-chip`, `shadow-glow` (tombol utama) |
| Font | Plus Jakarta Sans 400–800; judul tracking −0.02 s.d. −0.035em |

## Komponen & pola
- `.card`, `.card-soft`, `.card-hover` (naik 4px + bayangan biru saat hover), `.icon-tile`, `.chip`, `.hero-wash`, `.band-blue`.
- Tombol: `primary` (glow + naik saat hover), `secondary`, `soft`, `ghost`, `danger`, `white`, `outlineLight`; semua punya efek tekan `active:scale-.97`.
- `ToolShowcase`: tab vertikal yang berganti otomatis tiap 6,5 dtk dengan bilah progres; berhenti saat hover/fokus; navigasi panah keyboard; panel berisi cuplikan UI aplikasi (diberi label "Contoh tampilan").
- `FaqAccordion`: `<details>` native (aksesibel tanpa JS).
- Ilustrasi SVG (`Illustrations.tsx`): `HeroPerson`, `SummitIllustration`, `DeskIllustration` — dapat diganti foto asli dengan rasio sama.
- Likert refleksi: satu baris per pernyataan, angka 1–5 di kanan (desktop) / di bawah (mobile), legenda skala di atas.

## Gerakan
- `useReveal` + atribut `data-reveal` / `data-reveal-delay`: elemen naik 20px + fade saat masuk viewport, bertahap 80–120ms.
- Chip hero melayang (`animate-float`), panel showcase `animate-scale-in`, testimoni berganti otomatis (bisa dipilih).
- `prefers-reduced-motion`: semua animasi dimatikan, konten tetap tampil. Mode cetak memaksa semua konten terlihat.

## Aturan
- Tidak ada horizontal overflow di 375–390px (diuji E2E).
- Konten contoh selalu diberi label (testimoni, "Contoh tampilan").
- Kontras teks utama memakai ink penuh; abu-abu hanya untuk teks sekunder.
