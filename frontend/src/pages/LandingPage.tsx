import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Compass, FileText, MessageSquareText } from 'lucide-react';
import { HeroPerson } from '@/components/Illustrations';
import { useDocumentTitle } from '@/hooks/useAsync';
import '@/styles/landing.css';

/**
 * Front page, ported from the brand file `psikologia-career-landing.html` (styles in styles/landing.css, scoped to .lp).
 * Changes from the file: links point at real routes; invented proof (user count, star ratings) was replaced or labelled.
 */

const HERO_PHOTO = '/psikologia-career-hero.png';

/** Shows the brand photo when it exists in /public, otherwise the drawn illustration. */
function HeroPicture() {
  const [failed, setFailed] = useState(false);
  if (failed) return <HeroPerson className="hero-person" />;
  return <img className="hero-person" src={HERO_PHOTO} alt="Profesional muda sedang memikirkan arah kariernya" onError={() => setFailed(true)} />;
}

const Sw = { strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

export default function LandingPage() {
  useDocumentTitle('');

  return (
    <div className="lp">
      <section className="hero" id="beranda">
        <div className="lp-container hero-inner">
          <div className="hero-copy">
            <div className="eyebrow"><span className="dot" /> Psikologi <span>×</span> Karier <span>×</span> Teknologi</div>
            <h1>Kenali Potensimu.<br /><span>Bangun Kariermu.</span></h1>
            <p className="hero-description">Temukan arah karier, tingkatkan kualitas CV, dan persiapkan dirimu menghadapi dunia kerja dengan pendekatan psikologi dan AI.</p>
            <div className="hero-actions">
              <Link className="button button-primary" to="/career-reflection">Mulai Eksplorasi Karier <span aria-hidden="true">→</span></Link>
              <a className="button button-ghost" href="#cara-kerja"><span aria-hidden="true">▶</span> Pelajari Fitur</a>
            </div>
            <div className="trust-row">
              <div className="trust-icons" aria-hidden="true">
                <span><Compass size={15} /></span><span><FileText size={15} /></span><span><MessageSquareText size={15} /></span>
              </div>
              <div><strong>Gratis untuk dicoba</strong>Refleksi tanpa membuat akun, sekitar 8 menit</div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-blob" /><div className="hero-orbit" />
            <svg className="spark spark-one" viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M23 3c-1 13-7 19-19 20 12 1 18 7 19 20 1-13 7-19 20-20C30 22 24 16 23 3Z" fill="currentColor" /><path d="M41 3v8M45 7h-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg>
            <svg className="spark spark-two" viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M15 2c-1 9-4 12-13 13 9 1 12 4 13 13 1-9 4-12 13-13C19 14 16 11 15 2Z" fill="currentColor" /></svg>
            <HeroPicture />
            <div className="dashboard" role="img" aria-label="Contoh tampilan dashboard Psikologia Career">
              <span className="dash-sample">Contoh tampilan</span>
              <div className="dash-head"><div className="dash-brand"><span className="dash-logo">P</span> Psikologia <span style={{ color: '#1467ed' }}>Career</span></div><div className="dash-user">Notifikasi <i>✦</i></div></div>
              <p className="dash-greeting">Halo, Alexander!</p><div className="dash-sub">Lanjutkan perjalanan kariermu hari ini.</div>
              <div className="dash-progress"><div className="dash-progress-top"><strong>Progress Pengembangan</strong><span>64%</span></div><div className="progress-track"><span /></div></div>
              <div className="dash-items">
                <div className="dash-item"><span className="mini-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8m0-12.8L5.6 18.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg></span><strong>Refleksi Karier</strong><small>Kenali minat dan potensimu</small></div>
                <div className="dash-item"><span className="mini-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 19V9m8 10V5m8 14v-7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /></svg></span><strong>Review CV</strong><small>Siap tampil lebih percaya diri</small></div>
              </div>
            </div>
            <div className="float-note"><span>✓</span> Langkah kecil, progres nyata</div>
          </div>
        </div>
      </section>

      <section className="feature-strip" id="fitur" aria-labelledby="fitur-title">
        <h2 id="fitur-title" className="sr-only">Keunggulan Psikologia Career</h2>
        <div className="lp-container feature-panel">
          <article className="feature" data-reveal><span className="feature-icon"><svg width="25" height="25" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9.5 4.5c-2.8-.8-5 1.4-5 4.1-2.1 1.9-1.4 5.3.8 6.4-.1 2.6 2.7 4.3 5 3.2.7 1.4 2.8 1.5 3.5 0 2.3 1.1 5.1-.6 5-3.2 2.2-1.1 2.9-4.5.8-6.4 0-2.7-2.2-4.9-5-4.1-1.2-1.7-3.9-1.7-5.1 0Z" stroke="currentColor" strokeWidth="1.8" /><path d="M9 9.5c.2-1.1 1.3-1.6 2.3-1M15 9.5c-.2-1.1-1.3-1.6-2.3-1M8.5 13c.8-.7 1.6-.7 2.4 0m4.6 0c-.8-.7-1.6-.7-2.4 0M12 9v7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg></span><div><h3>Berbasis Psikologi</h3><p>Pahami potensi, minat, dan preferensi dirimu.</p></div></article>
          <article className="feature" data-reveal data-reveal-delay="70"><span className="feature-icon"><svg width="25" height="25" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m12 2 1.7 6.3L20 10l-6.3 1.7L12 18l-1.7-6.3L4 10l6.3-1.7L12 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><path d="m19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z" fill="currentColor" /></svg></span><div><h3>Dibantu oleh AI</h3><p>Dapatkan analisis dan umpan balik personal.</p></div></article>
          <article className="feature" data-reveal data-reveal-delay="140"><span className="feature-icon"><svg width="25" height="25" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 20h4V11H4v9Zm6 0h4V5h-4v15Zm6 0h4V2h-4v18Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg></span><div><h3>Praktis &amp; Terarah</h3><p>Dari eksplorasi hingga persiapan melamar kerja.</p></div></article>
          <article className="feature" data-reveal data-reveal-delay="210"><span className="feature-icon"><svg width="25" height="25" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3 20 6v5.2c0 4.6-3.2 7.9-8 9.8-4.8-1.9-8-5.2-8-9.8V6l8-3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><path d="m8.5 12 2.3 2.3 4.8-5" {...Sw} stroke="currentColor" /></svg></span><div><h3>Aman &amp; Privat</h3><p>Data pribadimu dikelola dengan aman dan bertanggung jawab.</p></div></article>
        </div>
      </section>

      <section className="section" id="cara-kerja" aria-labelledby="cara-kerja-title">
        <div className="lp-container">
          <div className="section-heading" data-reveal><div><h2 id="cara-kerja-title">Bagaimana Cara Kerjanya?</h2><p>Mulai dari memahami diri sendiri, lalu bergerak menuju karier yang kamu inginkan.</p></div></div>
          <ol className="workflow-grid" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            <li className="step-card" data-reveal><div className="step-top"><span className="step-number" aria-hidden="true">1</span><span className="step-icon"><svg width="23" height="23" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 3h8l4 4v14H5V3h2Z" {...Sw} stroke="currentColor" /><path d="M14 3v5h5M8 13l2.2 2.2L16 10" {...Sw} stroke="currentColor" /></svg></span></div><h3>Isi Refleksi</h3><p>Jawab beberapa pertanyaan tentang minat dan hal yang penting bagimu.</p><span className="step-link" aria-hidden="true">→</span></li>
            <li className="step-card" data-reveal data-reveal-delay="80"><div className="step-top"><span className="step-number" aria-hidden="true">2</span><span className="step-icon"><svg width="23" height="23" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 20h4V11H4v9Zm6 0h4V5h-4v15Zm6 0h4V2h-4v18Z" {...Sw} stroke="currentColor" /></svg></span></div><h3>Dapatkan Laporan</h3><p>Lihat rangkuman potensi dan rekomendasi arah karier yang sesuai.</p><span className="step-link" aria-hidden="true">→</span></li>
            <li className="step-card" data-reveal data-reveal-delay="160"><div className="step-top"><span className="step-number" aria-hidden="true">3</span><span className="step-icon"><svg width="23" height="23" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m14 5 5 5-9.8 9.8L4 20l.2-5.2L14 5Z" {...Sw} stroke="currentColor" /><path d="m12 7 5 5M14 4l2-2 6 6-2 2" {...Sw} stroke="currentColor" /></svg></span></div><h3>Kembangkan Diri</h3><p>Gunakan AI, review CV, dan latihan interview untuk semakin siap.</p><span className="step-link" aria-hidden="true">→</span></li>
            <li className="step-card" data-reveal data-reveal-delay="240"><div className="step-top"><span className="step-number" aria-hidden="true">4</span><span className="step-icon"><svg width="23" height="23" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 21V4m0 1h15l-3.2 4L19 13H4" {...Sw} stroke="currentColor" /></svg></span></div><h3>Capai Tujuan</h3><p>Susun rencana karier dan ambil langkah nyata dengan percaya diri.</p></li>
          </ol>

          <div className="why-panel" data-reveal>
            <div className="why-copy">
              <h2>Mengapa Psikologia Career?</h2>
              <ul className="check-list">
                <li><span className="check" aria-hidden="true">✓</span>Membantu mengenali potensi dan minat karier</li>
                <li><span className="check" aria-hidden="true">✓</span>Memberikan feedback CV yang relevan</li>
                <li><span className="check" aria-hidden="true">✓</span>Melatih kemampuan interview dengan simulasi</li>
                <li><span className="check" aria-hidden="true">✓</span>Bisa diakses kapan saja, di mana saja</li>
              </ul>
            </div>
            <div className="mountain-art" aria-hidden="true">
              <svg viewBox="0 0 560 270" preserveAspectRatio="xMidYMid meet" fill="none">
                <circle cx="463" cy="57" r="26" fill="#FFE38A" />
                <path d="M0 218c53-23 68-57 125-45 43 9 46 37 93 37 55 0 73-49 131-48 57 1 73 38 129 35 28-2 50-17 82-31v104H0v-52Z" fill="#C4E4FF" />
                <path d="m86 238 152-143 89 82 69-66 164 127H86Z" fill="#77B9F7" />
                <path d="m238 95 35 44-35-8-34 28 34-64Z" fill="#F8FCFF" />
                <path d="m327 177 69-66 164 127H293l34-61Z" fill="#2986E9" />
                <path d="m396 111 31 34-31-6-31 24 31-52Z" fill="#EAF6FF" />
                <path d="M395 113V61" stroke="#1259B5" strokeWidth="4" strokeLinecap="round" />
                <path d="M397 63h54l-14 15 14 15h-54V63Z" fill="#FFBE45" />
                <path d="M28 117c0-14 11-25 25-25 5-14 25-18 36-6 5-1 10 0 14 3 8 6 10 17 5 25H28Z" fill="#F4FAFF" opacity=".9" />
                <path d="M446 153c0-12 9-20 20-20 4-11 20-15 29-5 4-1 8 0 11 2 7 5 8 14 4 23h-64Z" fill="#EFF8FF" opacity=".9" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      <section className="section social-proof" id="cerita" aria-labelledby="cerita-title">
        <div className="lp-container">
          <div className="section-heading" data-reveal>
            <div><h2 id="cerita-title">Apa Kata Mereka?</h2><p>Perjalanan setiap orang berbeda. Mulai perjalananmu dengan lebih percaya diri.</p></div>
            <span className="sample-label">Contoh testimoni — ilustrasi, bukan ulasan pengguna nyata</span>
          </div>
          <div className="testimonial-grid">
            <article className="quote-card" data-reveal><div className="quote-avatar" aria-hidden="true">NR</div><div><blockquote>“Hasil refleksinya membantu aku lebih paham minat dan arah karier. Fitur CV Reviewer-nya juga sangat membantu!”</blockquote><div className="quote-bottom"><div className="quote-name">Nadia R.<small>Mahasiswa Psikologi</small></div></div></div></article>
            <article className="quote-card" data-reveal data-reveal-delay="90"><div className="quote-avatar" aria-hidden="true">RZ</div><div><blockquote>“Latihan interview-nya realistis dan feedback-nya detail. Sekarang aku lebih percaya diri saat menghadapi interview kerja.”</blockquote><div className="quote-bottom"><div className="quote-name">Reza K.<small>Fresh Graduate</small></div></div></div></article>
          </div>
        </div>
      </section>

      <section className="cta-section" id="mulai" aria-labelledby="cta-title">
        <div className="lp-container">
          <div className="cta-banner" data-reveal>
            <div className="cta-copy">
              <h2 id="cta-title">Siap Mulai Perjalanan Kariermu?</h2>
              <p>Kenali dirimu lebih dalam, kembangkan kompetensimu, dan raih karier yang kamu inginkan.</p>
              <Link className="button" to="/career-reflection">Mulai Sekarang Gratis <span aria-hidden="true">→</span></Link>
            </div>
            <div className="cta-illustration" aria-hidden="true">
              <div className="desk" /><div className="book-stack"><span /><span /><span /></div>
              <div className="laptop"><div className="laptop-screen" /><div className="laptop-base" /></div>
              <div className="plant"><i className="stem" /><i className="leaf l1" /><i className="leaf l2" /><i className="leaf l3" /><i className="leaf l4" /><i className="pot" /></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
