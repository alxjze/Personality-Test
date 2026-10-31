/**
 * End-to-end smoke test (real browser, real PHP API, real MySQL, mock AI).
 *
 *   BASE_URL=http://127.0.0.1:8080 node e2e/run.mjs
 *
 * Requires the backend serving the built SPA (FRONTEND_DIST) — see README "Pengujian".
 * Uses the globally installed Playwright (or a local one).
 */
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';

const require = createRequire(import.meta.url);
let playwright;
try { playwright = require('playwright'); } catch { playwright = require(require('node:child_process').execSync('npm root -g').toString().trim() + '/playwright'); }
const { chromium } = playwright;

const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:8080';
const SHOTS = process.env.SHOTS_DIR ?? 'e2e/screenshots';
mkdirSync(SHOTS, { recursive: true });

const results = [];
const consoleErrors = [];
async function step(name, fn) {
  try {
    await fn();
    results.push(['PASS', name]);
    console.log('✓', name);
  } catch (e) {
    results.push(['FAIL', name, e.message]);
    console.log('✗', name, '\n   ', e.message.split('\n')[0]);
  }
}
const expect = (cond, msg) => { if (!cond) throw new Error(msg); };

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 860 } });
const page = await context.newPage();
page.on('console', (m) => {
  // 401 from /auth/me-style probes and intentional 4xx validation responses are expected network logs.
  if (m.type() === 'error' && !/status of (401|404|409|422|428)/.test(m.text())) consoleErrors.push(`${page.url()} :: ${m.text()}`);
});
page.on('pageerror', (e) => consoleErrors.push(`${page.url()} :: pageerror ${e.message}`));

const email = `e2e_${Date.now()}@example.com`;
const password = 'Rahasia123';

async function answerReflection() {
  for (let s = 0; s < 5; s++) {
    const groups = await page.locator('[role="radiogroup"]').count();
    for (let i = 0; i < groups; i++) {
      const v = ((i + s) % 5) + 1;
      await page.locator('[role="radiogroup"]').nth(i).locator('label').nth(v - 1).click();
    }
    const choice = page.locator('input[name="goal_focus"]');
    if (await choice.count()) {
      await page.locator('label', { has: page.locator('input[name="goal_focus"]') }).first().click();
      await page.locator('#goal_text').fill('Ingin mencoba karier di bidang data dan HR.');
    }
    if (s < 4) await page.getByRole('button', { name: 'Selanjutnya' }).click();
  }
}

await step('Landing page renders hero, CTA and labelled sample testimonials', async () => {
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.getByRole('heading', { name: /Kenali Potensimu/ }).waitFor();
  expect(await page.getByText('Contoh testimoni').count() > 0, 'testimonial label missing');
  await page.getByRole('link', { name: /Mulai Eksplorasi Karier/ }).first().click();
  await page.waitForURL('**/career-reflection');
});

await step('Reflection validation blocks Next when unanswered', async () => {
  await page.getByRole('button', { name: 'Selanjutnya' }).click();
  await page.getByText(/belum dijawab/).first().waitFor();
});

await step('Reflection autosave resumes after reload', async () => {
  await page.locator('[role="radiogroup"]').first().locator('label').nth(3).click();
  await page.reload({ waitUntil: 'networkidle' });
  await page.getByText('Melanjutkan refleksi sebelumnya').waitFor();
  expect(await page.locator('[role="radiogroup"]').first().locator('input[value="4"]').isChecked(), 'answer not restored');
});

await step('Guest completes reflection and sees report (unsaved)', async () => {
  await answerReflection();
  await page.getByRole('button', { name: 'Lihat Laporan' }).click();
  await page.waitForURL('**/career-report');
  await page.getByText('Area karier yang dapat dieksplorasi').waitFor();
  await page.getByText('Hasil ini belum tersimpan').waitFor();
  await page.screenshot({ path: `${SHOTS}/report-guest.png`, fullPage: true });
});

await step('Protected route redirects guests to login', async () => {
  await page.goto(BASE + '/dashboard', { waitUntil: 'networkidle' });
  await page.waitForURL('**/login?next=%2Fdashboard');
});

await step('Register validation errors are shown', async () => {
  await page.goto(BASE + '/register', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Daftar', exact: true }).click();
  await page.getByText('Nama wajib diisi.').waitFor();
  await page.getByText('Kamu perlu menyetujui Kebijakan Privasi untuk membuat akun.').waitFor();
});

await step('Register auto-saves the guest reflection', async () => {
  await page.getByLabel('Nama').fill('Pengguna E2E');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.locator('input[type="checkbox"]').check();
  await page.getByRole('button', { name: 'Daftar', exact: true }).click();
  await page.waitForURL(/\/career-report\/\d+\?saved=1/);
  await page.getByText('berhasil disimpan').waitFor();
});

await step('Dashboard shows the latest reflection and progress', async () => {
  await page.goto(BASE + '/dashboard', { waitUntil: 'networkidle' });
  await page.getByText('Hasil refleksi terakhir').waitFor();
  await page.getByText('Progres pengembangan karier').waitFor();
  await page.screenshot({ path: `${SHOTS}/dashboard.png`, fullPage: true });
});

await step('AI assistant asks consent, then replies with Simulasi label', async () => {
  await page.goto(BASE + '/career-assistant', { waitUntil: 'networkidle' });
  await page.locator('#chat-input').fill('Peran apa yang cocok untuk saya?');
  await page.getByRole('button', { name: 'Kirim' }).click();
  await page.getByRole('dialog').getByText('Persetujuan pemrosesan oleh AI').waitFor();
  await page.getByRole('dialog').locator('input[type="checkbox"]').check();
  await page.getByRole('button', { name: 'Setuju & lanjutkan' }).click();
  await page.getByText('Menggunakan konteks refleksimu').waitFor({ timeout: 15000 });
  expect(await page.getByText('Simulasi', { exact: true }).count() > 0, 'simulation badge missing');
  // Follow-up in same conversation, then it appears in history
  await page.locator('#chat-input').fill('Bagaimana dengan CV saya?');
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => document.querySelectorAll('[aria-live="polite"] .bg-primary.text-white').length >= 2);
  await page.screenshot({ path: `${SHOTS}/assistant.png`, fullPage: true });
});

await step('AI assistant conversation can be deleted', async () => {
  await page.getByRole('button', { name: 'Hapus' }).first().click();
  await page.getByRole('dialog').getByRole('button', { name: 'Hapus' }).click();
  await page.getByText('Belum ada percakapan.').waitFor();
});

await step('CV reviewer requires consent and rejects a non-PDF', async () => {
  await page.goto(BASE + '/cv-reviewer', { waitUntil: 'networkidle' });
  await page.locator('input[type="file"]').setInputFiles({ name: 'cv.txt', mimeType: 'text/plain', buffer: Buffer.from('hello') });
  await page.getByText('Format file harus PDF.').waitFor();
  await page.getByRole('tab', { name: /Tempel teks/ }).click();
  await page.getByRole('button', { name: /Analisis CV Saya/ }).click();
  await page.getByText('Persetujuan diperlukan sebelum CV dikirim').waitFor();
});

await step('CV reviewer analyses pasted CV and shows labelled estimate', async () => {
  const cv = [
    'Budi Santoso — budi@example.com — linkedin.com/in/budi',
    'PENDIDIKAN: S1 Psikologi, Universitas Contoh (2021–2025)',
    'PENGALAMAN',
    '- Magang HR di PT Contoh: membantu proses rekrutmen 40 kandidat',
    '- Ketua divisi acara himpunan mahasiswa, mengoordinasikan 15 orang',
    'KETERAMPILAN: Microsoft Excel, wawancara, komunikasi, analisis data dasar',
  ].join('\n');
  await page.getByLabel('Teks CV').fill(cv);
  await page.getByLabel('Target posisi').fill('HR Generalist');
  await page.getByLabel(/Deskripsi pekerjaan/).fill('Mencari HR Generalist dengan kemampuan rekrutmen, komunikasi, Excel, dan administrasi karyawan.');
  await page.locator('form input[type="checkbox"]').check();
  await page.getByRole('button', { name: /Analisis CV Saya/ }).click();
  await page.waitForURL(/\/cv-reviewer\/\d+/, { timeout: 20000 });
  await page.getByText('Skor estimasi').waitFor();
  await page.getByText(/bukan ukuran ilmiah/).first().waitFor();
  await page.getByRole('tab', { name: 'Perbaikan Bullet' }).click();
  await page.screenshot({ path: `${SHOTS}/cv-result.png`, fullPage: true });
});

await step('CV review can be deleted', async () => {
  await page.getByRole('button', { name: 'Hapus' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Hapus permanen' }).click();
  await page.waitForURL('**/cv-reviewer');
  await page.getByText('Belum ada review CV').waitFor();
});

await step('Interview: generate questions, answer, see STAR feedback and progress', async () => {
  await page.goto(BASE + '/interview-preparation', { waitUntil: 'networkidle' });
  await page.getByLabel('Posisi yang dilamar').fill('Business Analyst');
  await page.getByRole('button', { name: 'Buat pertanyaan' }).click();
  await page.waitForURL(/\/interview-preparation\/\d+/, { timeout: 20000 });
  await page.locator('#answer').fill('Saat semester lima, saya bertugas memimpin proyek analisis data kepuasan mahasiswa. Saya menyusun kuesioner, menganalisis hasil dengan Excel, lalu mempresentasikan temuan sehingga fakultas meningkatkan layanan konseling.');
  await page.getByRole('button', { name: 'Dapatkan feedback' }).click();
  await page.getByRole('heading', { name: 'Feedback' }).waitFor({ timeout: 20000 });
  await page.getByText('Situation', { exact: true }).waitFor();
  await page.getByText(/1\/5 pertanyaan terjawab/).waitFor();
  await page.screenshot({ path: `${SHOTS}/interview.png`, fullPage: true });
});

await step('Profile update works', async () => {
  await page.goto(BASE + '/profile', { waitUntil: 'networkidle' });
  await page.getByLabel(/Pendidikan/).fill('S1 Psikologi');
  await page.getByRole('button', { name: 'Simpan profil' }).click();
  await page.getByText('Profil berhasil diperbarui.').waitFor();
});

await step('Logout then login again', async () => {
  await page.getByRole('button', { name: /Pengguna E2E/ }).click();
  await page.getByRole('menuitem', { name: 'Keluar' }).click();
  await page.waitForURL(BASE + '/');
  await page.goto(BASE + '/login', { waitUntil: 'networkidle' });
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill('salah-password1');
  await page.getByRole('button', { name: 'Masuk', exact: true }).click();
  await page.getByText('Email atau password salah.').waitFor();
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Masuk', exact: true }).click();
  await page.waitForURL('**/dashboard');
});

await step('Mobile layout has no horizontal overflow on key pages', async () => {
  const m = await browser.newContext({ viewport: { width: 375, height: 812 }, storageState: await context.storageState() });
  const mp = await m.newPage();
  for (const path of ['/', '/career-reflection', '/dashboard', '/career-assistant', '/cv-reviewer', '/interview-preparation', '/profile', '/privasi', '/login']) {
    await mp.goto(BASE + path, { waitUntil: 'networkidle' });
    const overflow = await mp.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow <= 0, `${path} overflows by ${overflow}px`);
  }
  await mp.goto(BASE + '/dashboard', { waitUntil: 'networkidle' });
  await mp.screenshot({ path: `${SHOTS}/dashboard-mobile.png`, fullPage: true });
  await m.close();
});

await step('No broken internal links', async () => {
  const seen = new Set();
  const queue = ['/', '/dashboard', '/privasi', '/syarat'];
  const broken = [];
  while (queue.length) {
    const path = queue.shift();
    if (seen.has(path)) continue;
    seen.add(path);
    await page.goto(BASE + path, { waitUntil: 'networkidle' });
    if (await page.getByText('Halaman tidak ditemukan').count()) broken.push(path);
    const hrefs = await page.$$eval('a[href^="/"]', (as) => as.map((a) => a.getAttribute('href')));
    for (const h of hrefs) {
      const clean = h.split('#')[0].split('?')[0];
      if (clean && !seen.has(clean) && !/\/\d+$/.test(clean)) queue.push(clean);
    }
  }
  expect(broken.length === 0, `broken: ${broken.join(', ')}`);
  console.log('    crawled', seen.size, 'routes');
});

await step('Delete account', async () => {
  await page.goto(BASE + '/profile', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Hapus akun' }).click();
  await page.getByRole('dialog').getByLabel('Password').fill(password);
  await page.getByRole('dialog').getByRole('button', { name: 'Hapus akun' }).click();
  await page.waitForURL(BASE + '/');
  await page.goto(BASE + '/login', { waitUntil: 'networkidle' });
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Masuk', exact: true }).click();
  await page.getByText('Email atau password salah.').waitFor();
});

await step('No unhandled console errors', async () => {
  expect(consoleErrors.length === 0, consoleErrors.join('\n'));
});

await browser.close();
const failed = results.filter((r) => r[0] === 'FAIL');
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
