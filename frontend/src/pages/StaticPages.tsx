import { Link } from 'react-router-dom';
import { Compass, FileQuestion, ScrollText, ShieldCheck } from 'lucide-react';
import { LinkButton } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageContainer } from '@/layouts/AppLayout';
import { useDocumentTitle } from '@/hooks/useAsync';

function Prose({ children }: { children: React.ReactNode }) {
  return <div className="card space-y-6 p-6 text-sm leading-relaxed text-ink sm:p-8 [&_h2]:text-lg [&_h2]:font-bold [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-1">{children}</div>;
}

export function PrivacyPage() {
  useDocumentTitle('Kebijakan Privasi');
  return (
    <PageContainer narrow>
      <PageHeader icon={<ShieldCheck className="h-6 w-6" />} title="Kebijakan Privasi" description="Versi 2026-10 · Berlaku untuk layanan Psikologia Career di psikologia.id" />
      <Prose>
        <section>
          <h2>Data yang kami kumpulkan</h2>
          <ul>
            <li>Data akun: nama, email, dan password (disimpan dalam bentuk hash, tidak pernah dalam teks asli).</li>
            <li>Data profil opsional: pendidikan, posisi saat ini, dan tujuan karier.</li>
            <li>Jawaban dan hasil Refleksi Karier.</li>
            <li>Isi percakapan dengan AI Career Assistant.</li>
            <li>CV (file PDF atau teks yang kamu tempel), target posisi, deskripsi pekerjaan, dan hasil analisisnya.</li>
            <li>Pertanyaan, jawaban, dan feedback latihan interview.</li>
            <li>Catatan persetujuan (jenis, versi, waktu) dan data teknis minimal untuk keamanan (misalnya pembatasan jumlah permintaan).</li>
          </ul>
        </section>
        <section>
          <h2>Tujuan pemrosesan</h2>
          <p>Data digunakan hanya untuk menyediakan fitur yang kamu minta: menyusun laporan refleksi, memberikan saran karier, menganalisis CV, dan memberikan feedback interview — serta menjaga keamanan akun. Kami tidak menjual datamu dan tidak menggunakan CV-mu untuk tujuan lain tanpa persetujuan.</p>
        </section>
        <section>
          <h2>Penggunaan penyedia layanan AI</h2>
          <p>Fitur AI Career Assistant, CV Reviewer, dan Persiapan Interview mengirim teks yang relevan ke penyedia model AI pihak ketiga melalui server kami. Kami selalu meminta persetujuan eksplisit sebelum data dikirim, dan persetujuan CV diminta setiap kali analisis. Laporan Refleksi Karier disusun dengan aturan di server kami sendiri dan <strong>tidak</strong> dikirim ke AI. Jika layanan AI belum dikonfigurasi, respons ditandai “Simulasi” dan tidak ada data yang dikirim ke pihak ketiga.</p>
          <p className="mt-2">Saat ini layanan dapat memakai <strong>paket gratis</strong> penyedia AI (mis. Google Gemini atau Groq). Pada paket gratis, penyedia tersebut dapat menyimpan dan menggunakan data yang dikirim untuk meningkatkan layanannya sesuai kebijakan mereka. Karena itu, hindari mencantumkan data sensitif seperti NIK, nomor rekening, atau alamat lengkap di CV dan percakapan.</p>
        </section>
        <section>
          <h2>Penyimpanan & retensi</h2>
          <ul>
            <li>Data disimpan selama akunmu aktif, sampai kamu menghapusnya.</li>
            <li>File CV disimpan secara privat di luar direktori publik dan hanya dapat diakses oleh akunmu.</li>
            <li>Jika mencoba refleksi tanpa akun, jawaban disimpan sementara di browser perangkatmu (localStorage) hingga kamu menyimpannya ke akun atau memulai ulang.</li>
            <li>Sesi login berakhir otomatis setelah 7 hari tidak aktif.</li>
          </ul>
        </section>
        <section>
          <h2>Hak dan cara menghapus data</h2>
          <p>Di halaman <Link to="/profile" className="font-semibold text-primary">Profil & Privasi</Link> kamu dapat memperbarui profil, mencabut persetujuan AI, menghapus seluruh data pribadi, atau menghapus akun secara permanen. Setiap item (refleksi, percakapan, review CV, sesi interview) juga dapat dihapus satu per satu.</p>
        </section>
        <section>
          <h2>Batasan layanan</h2>
          <p>Psikologia Career bukan layanan psikologi klinis. Refleksi karier bukan tes psikologi tervalidasi, dan saran AI dapat keliru. Jika kamu mengalami masalah kesehatan mental, hubungi psikolog atau tenaga profesional.</p>
        </section>
      </Prose>
    </PageContainer>
  );
}

export function TermsPage() {
  useDocumentTitle('Syarat Penggunaan');
  return (
    <PageContainer narrow>
      <PageHeader icon={<ScrollText className="h-6 w-6" />} title="Syarat Penggunaan" description="Versi 2026-10" />
      <Prose>
        <section>
          <h2>Sifat layanan</h2>
          <p>Seluruh hasil refleksi, rekomendasi, skor CV, dan feedback interview adalah panduan eksplorasi — bukan diagnosis, penilaian ilmiah, jaminan diterima kerja, atau keputusan mutlak tentang masa depanmu.</p>
        </section>
        <section>
          <h2>Tanggung jawab pengguna</h2>
          <ul>
            <li>Berikan informasi yang jujur dan jangan mengunggah data milik orang lain tanpa izin.</li>
            <li>Jangan menambahkan pengalaman atau pencapaian yang tidak benar ke CV berdasarkan saran apa pun.</li>
            <li>Jaga kerahasiaan password akunmu.</li>
            <li>Jangan menyalahgunakan layanan (misalnya mengirim permintaan otomatis berlebihan).</li>
          </ul>
        </section>
        <section>
          <h2>Perubahan</h2>
          <p>Syarat dan kebijakan dapat diperbarui. Perubahan penting akan diberitahukan melalui aplikasi, dan persetujuan ulang akan diminta bila diperlukan.</p>
        </section>
      </Prose>
    </PageContainer>
  );
}

export function NotFoundPage() {
  useDocumentTitle('Halaman tidak ditemukan');
  return (
    <PageContainer narrow>
      <div className="flex flex-col items-center py-16 text-center">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary-50 text-primary"><FileQuestion className="h-8 w-8" /></div>
        <h1 className="mt-5 text-3xl font-extrabold">Halaman tidak ditemukan</h1>
        <p className="mt-2 text-muted">Tautan yang kamu buka mungkin salah atau sudah dipindahkan.</p>
        <div className="mt-6 flex gap-3">
          <LinkButton to="/">Ke Beranda</LinkButton>
          <LinkButton to="/career-reflection" variant="secondary" icon={<Compass className="h-4 w-4" />}>Mulai Refleksi</LinkButton>
        </div>
      </div>
    </PageContainer>
  );
}
