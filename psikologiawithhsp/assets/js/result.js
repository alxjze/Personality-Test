// Halaman hasil generik: menampilkan hasil dari test.getResult(scores) + paywall per-tes.
(function () {
  const params = new URLSearchParams(window.location.search);
  const testId = params.get("test") && window.TESTS[params.get("test")]
    ? params.get("test")
    : (localStorage.getItem("psikologia_active_test") || "bigfive");
  const TEST = window.TESTS[testId];

  if (localStorage.getItem("psikologia_completed_" + testId) !== "1") {
    window.location.href = "test.html?test=" + testId;
    return;
  }

  let scores;
  try { scores = JSON.parse(localStorage.getItem("psikologia_scores_" + testId)); } catch (e) {}
  if (!scores) { window.location.href = "test.html?test=" + testId; return; }

  const result = TEST.getResult(scores);
  document.title = "Hasil " + TEST.short + " — Psikologia.id";

  // Header hasil (gratis)
  document.getElementById("arch-monogram").textContent = result.monogram;
  document.getElementById("arch-name").textContent = result.name;
  document.getElementById("arch-tagline").textContent = result.tagline;
  document.getElementById("arch-desc").textContent = result.desc;

  // Bar skor (gratis)
  const barsTitleEl = document.getElementById("bars-title");
  if (barsTitleEl) barsTitleEl.textContent = result.barsTitle;
  const barsEl = document.getElementById("score-bars");
  result.bars.forEach(function (b) {
    const wrap = document.createElement("div");
    wrap.className = "trait-bar";
    wrap.innerHTML =
      '<div class="label"><span>' + b.name + " (" + b.en + ')</span><span>' + b.pct + '%</span></div>' +
      '<div class="track"><div class="fill" style="width:' + b.pct + '%"></div></div>';
    barsEl.appendChild(wrap);
  });

  // Konten premium
  const premium = result.premium;
  const fillList = function (id, items) {
    const el = document.getElementById(id);
    items.forEach(function (t) {
      const li = document.createElement("li");
      li.textContent = t;
      el.appendChild(li);
    });
  };
  fillList("strengths-list", premium.strengths);
  fillList("weaknesses-list", premium.weaknesses);
  fillList("careers-list", premium.careers);
  document.getElementById("relationship-text").textContent = premium.relationship;
  fillList("tips-list", premium.tips);

  // Tautan checkout membawa id tes.
  const unlockBtn = document.getElementById("btn-unlock");
  if (unlockBtn) {
    unlockBtn.href = "checkout.html?test=" + testId;
    unlockBtn.textContent = "Buka Hasil Lengkap — Rp " + TEST.price.toLocaleString("id-ID");
  }

  // Paywall per-tes.
  const paid = localStorage.getItem("psikologia_paid_" + testId) === "1";
  const content = document.getElementById("premium-content");
  const overlay = document.getElementById("paywall-overlay");
  const badge = document.getElementById("unlocked-badge");
  if (paid) {
    overlay.classList.add("hidden");
    badge.classList.remove("hidden");
  } else {
    content.classList.add("locked");
  }
})();
