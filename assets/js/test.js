// Engine tes generik: mendukung banyak tes lewat registry window.TESTS.
// Tes aktif ditentukan dari ?test=<id> (default "bigfive").
(function () {
  const params = new URLSearchParams(window.location.search);
  const testId = params.get("test") && window.TESTS[params.get("test")] ? params.get("test") : "bigfive";
  const TEST = window.TESTS[testId];
  const QS = TEST.questions;
  const OPTS = TEST.likert;

  const ANS_KEY = "psikologia_answers_" + testId;
  let answers = [];
  try { answers = JSON.parse(localStorage.getItem(ANS_KEY)) || []; } catch (e) {}
  let current = 0;

  const elTitle = document.getElementById("test-title");
  const elGreeting = document.getElementById("test-greeting");
  const elQuestion = document.getElementById("question-text");
  const elOptions = document.getElementById("likert-options");
  const elFill = document.getElementById("progress-fill");
  const elLabel = document.getElementById("progress-label");
  const btnPrev = document.getElementById("btn-prev");
  const btnNext = document.getElementById("btn-next");

  if (elTitle) elTitle.textContent = TEST.title;
  if (elGreeting) elGreeting.textContent = TEST.greeting;
  document.title = TEST.title + " — Psikologia.id";

  function render() {
    const q = QS[current];
    elQuestion.textContent = q.text;
    elLabel.textContent = "Pertanyaan " + (current + 1) + " dari " + QS.length;
    elFill.style.width = (current / QS.length) * 100 + "%";

    elOptions.innerHTML = "";
    OPTS.forEach(function (opt) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = opt.label;
      btn.dataset.value = opt.value;
      if (answers[current] === opt.value) btn.classList.add("selected");
      btn.addEventListener("click", function () { select(opt.value); });
      elOptions.appendChild(btn);
    });

    btnPrev.style.visibility = current === 0 ? "hidden" : "visible";
    btnNext.disabled = answers[current] == null;
    btnNext.textContent = current === QS.length - 1 ? "Lihat Hasil →" : "Selanjutnya →";
  }

  function select(value) {
    answers[current] = value;
    localStorage.setItem(ANS_KEY, JSON.stringify(answers));
    render();
    setTimeout(next, 250);
  }

  function next() {
    if (answers[current] == null) return;
    if (current < QS.length - 1) {
      current++;
      render();
    } else {
      finish();
    }
  }

  function finish() {
    const scores = TEST.computeScores(answers);
    localStorage.setItem("psikologia_scores_" + testId, JSON.stringify(scores));
    localStorage.setItem("psikologia_completed_" + testId, "1");
    localStorage.setItem("psikologia_active_test", testId);
    window.location.href = "hasil.html?test=" + testId;
  }

  btnPrev.addEventListener("click", function () { if (current > 0) { current--; render(); } });
  btnNext.addEventListener("click", next);

  render();
})();
