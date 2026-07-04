// Checkout generik: mengunci laporan premium per-tes (mode simulasi).
// Untuk produksi, ganti blok "SIMULASI" dengan Midtrans Snap / Xendit Invoice:
//   1. Panggil backend untuk membuat transaksi & dapatkan token/URL pembayaran.
//   2. Tampilkan popup Snap / redirect ke invoice.
//   3. Set psikologia_paid_<id> lewat callback/webhook yang terverifikasi.
(function () {
  const params = new URLSearchParams(window.location.search);
  const testId = params.get("test") && window.TESTS[params.get("test")]
    ? params.get("test")
    : (localStorage.getItem("psikologia_active_test") || "bigfive");
  const TEST = window.TESTS[testId];

  // Wajib menyelesaikan tes terkait dulu.
  if (localStorage.getItem("psikologia_completed_" + testId) !== "1") {
    window.location.href = "test.html?test=" + testId;
    return;
  }

  const priceStr = "Rp " + TEST.price.toLocaleString("id-ID");
  const strikeStr = "Rp " + TEST.priceStrike.toLocaleString("id-ID");
  const discount = TEST.priceStrike - TEST.price;

  // Isi ringkasan & label dinamis.
  const setText = function (id, txt) { const el = document.getElementById(id); if (el) el.textContent = txt; };
  setText("product-name", TEST.productName);
  setText("product-strike", strikeStr);
  setText("discount-amount", "−Rp " + discount.toLocaleString("id-ID"));
  setText("total-amount", priceStr);
  const payBtn = document.getElementById("btn-pay");
  if (payBtn) payBtn.textContent = "Bayar " + priceStr;
  document.title = "Checkout — " + TEST.productName;
  const resultLink = document.getElementById("btn-view-result");
  if (resultLink) resultLink.href = "hasil.html?test=" + testId;

  const form = document.getElementById("pay-form");
  const formBox = document.getElementById("checkout-form-box");
  const processingBox = document.getElementById("processing-box");
  const successBox = document.getElementById("success-box");
  const receiptLine = document.getElementById("receipt-line");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const method = form.querySelector('input[name="method"]:checked').value;

    formBox.classList.add("hidden");
    processingBox.classList.remove("hidden");

    // === SIMULASI: payment gateway asli dipasang di sini ===
    setTimeout(function () {
      const orderId = "PSI-" + Date.now().toString(36).toUpperCase();
      localStorage.setItem("psikologia_paid_" + testId, "1");
      localStorage.setItem("psikologia_order_" + testId, JSON.stringify({
        orderId: orderId, test: testId, email: email, method: method,
        amount: TEST.price, paidAt: new Date().toISOString(),
      }));

      const methodLabels = { qris: "QRIS", va: "Virtual Account", card: "Kartu Kredit/Debit" };
      receiptLine.textContent = "Order " + orderId + " · " + methodLabels[method] + " · Tanda terima dikirim ke " + email;

      processingBox.classList.add("hidden");
      successBox.classList.remove("hidden");
    }, 1500);
  });
})();
