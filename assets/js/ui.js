/* ===== Psikologia.id — enhancement UI landing page =====
   Progressive enhancement: tanpa JS, carousel tetap bisa digeser manual
   (scroll horizontal) dan semua konten tetap terbaca. */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Carousel ---------- */
  function initCarousel(root) {
    var viewport = root.querySelector("[data-carousel-viewport]");
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-carousel-slide]"));
    var prev = root.querySelector("[data-carousel-prev]");
    var next = root.querySelector("[data-carousel-next]");
    var dotsWrap = root.querySelector("[data-carousel-dots]");
    var status = root.querySelector("[data-carousel-status]");
    if (!viewport || slides.length === 0) return;

    root.classList.add("is-enhanced");

    var pages = [];   // posisi scrollLeft tiap halaman
    var index = 0;

    function measure() {
      pages = [];
      var max = viewport.scrollWidth - viewport.clientWidth;
      if (max <= 1) {                       // semua slide muat — sembunyikan kontrol
        root.classList.add("is-static");
        pages = [0];
      } else {
        root.classList.remove("is-static");
        var step = viewport.clientWidth;
        for (var x = 0; x < max - 1; x += step) pages.push(x);
        pages.push(max);
      }
      buildDots();
      sync();
    }

    function buildDots() {
      if (!dotsWrap) return;
      if (dotsWrap.childElementCount === pages.length) return;
      dotsWrap.innerHTML = "";
      pages.forEach(function (pos, i) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "carousel-dot";
        b.setAttribute("aria-label", "Ke halaman " + (i + 1) + " dari " + pages.length);
        b.addEventListener("click", function () { goTo(i); });
        dotsWrap.appendChild(b);
      });
    }

    function nearestPage() {
      var x = viewport.scrollLeft, best = 0, dist = Infinity;
      pages.forEach(function (pos, i) {
        var d = Math.abs(pos - x);
        if (d < dist) { dist = d; best = i; }
      });
      return best;
    }

    function sync() {
      index = nearestPage();
      if (prev) prev.disabled = index === 0;
      if (next) next.disabled = index >= pages.length - 1;
      if (dotsWrap) {
        Array.prototype.forEach.call(dotsWrap.children, function (dot, i) {
          var on = i === index;
          dot.classList.toggle("is-active", on);
          dot.setAttribute("aria-current", on ? "true" : "false");
        });
      }
      if (status) status.textContent = "Halaman " + (index + 1) + " dari " + pages.length;
    }

    // Animasi manual: scrollTo({behavior:"smooth"}) tidak jalan pada container
    // ber-scroll-snap mandatory, dan tiap penulisan scrollLeft langsung
    // di-snap — jadi snapping dimatikan sementara selama animasi berjalan.
    var anim = 0;
    function goTo(i) {
      i = Math.max(0, Math.min(pages.length - 1, i));
      var start = viewport.scrollLeft;
      var delta = pages[i] - start;
      anim++;
      // Tab tersembunyi menghentikan requestAnimationFrame — lompat langsung
      // supaya posisi tetap benar saat tab kembali dibuka.
      if (reduceMotion || document.hidden || Math.abs(delta) < 2) {
        viewport.scrollLeft = pages[i];
        sync();
        return;
      }

      var token = anim;
      var t0 = null;
      var duration = 380;
      viewport.style.scrollSnapType = "none";
      requestAnimationFrame(function step(now) {
        if (token !== anim) return;                       // klik baru menimpa animasi ini
        if (t0 === null) t0 = now;
        var p = Math.min(1, (now - t0) / duration);
        var eased = 1 - Math.pow(1 - p, 3);
        viewport.scrollLeft = start + delta * eased;
        if (p < 1) {
          requestAnimationFrame(step);
        } else {
          viewport.style.scrollSnapType = "";
          sync();
        }
      });
    }

    if (prev) prev.addEventListener("click", function () { goTo(nearestPage() - 1); });
    if (next) next.addEventListener("click", function () { goTo(nearestPage() + 1); });

    viewport.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); goTo(nearestPage() + 1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); goTo(nearestPage() - 1); }
    });

    var ticking = false;
    viewport.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { sync(); ticking = false; });
    }, { passive: true });

    // Ukur ulang setiap kali layout bisa berubah: resize, stylesheet/font selesai
    // dimuat, atau perubahan ukuran elemen. Pengukuran awal sering terjadi
    // sebelum CSS/font final diterapkan, jadi jangan andalkan satu sumber saja.
    var measureTimer;
    function remeasure() {
      clearTimeout(measureTimer);
      measureTimer = setTimeout(measure, 120);
    }
    window.addEventListener("resize", remeasure);
    window.addEventListener("load", measure);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    if ("ResizeObserver" in window) new ResizeObserver(remeasure).observe(viewport);
    measure();
  }

  /* ---------- Scroll reveal ---------- */
  function initReveal() {
    var items = document.querySelectorAll("[data-reveal]");
    if (!items.length) return;

    function revealAll() {
      Array.prototype.forEach.call(items, function (el) { el.classList.add("is-visible"); });
    }

    if (reduceMotion || document.hidden || !("IntersectionObserver" in window)) {
      revealAll();
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.05 });
    Array.prototype.forEach.call(items, function (el) { io.observe(el); });

    // Jaring pengaman: konten tidak boleh tetap tak terlihat kalau observer
    // gagal terpicu (mis. tab tidak aktif saat dimuat).
    setTimeout(revealAll, 2500);
  }

  /* ---------- Header state saat scroll ---------- */
  function initHeader() {
    var header = document.querySelector(".site-header");
    if (!header) return;
    var ticking = false;
    function update() {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }, { passive: true });
    update();
  }

  function boot() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-carousel]"), initCarousel);
    initReveal();
    initHeader();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
