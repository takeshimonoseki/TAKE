// ① path: assets/transition.js
(function () {
  "use strict";

  var root = document.documentElement;
  var body = document.body;

  if (root && root.dataset && root.dataset.takeTransitionInited === "1") return;
  if (root && root.dataset) root.dataset.takeTransitionInited = "1";

  function prefersReducedMotion() {
    try {
      return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch (e) {
      return false;
    }
  }

<<<<<<< Updated upstream
<<<<<<< Updated upstream
  function getCssVar(name, fallback) {
    try {
      if (!root) return fallback;
      var v = window.getComputedStyle(root).getPropertyValue(name);
      v = (v || "").toString().trim();
      return v || fallback;
    } catch (e) {
      return fallback;
    }
  }

  function forceDarkBackground() {
    try {
      // CSS変数(--bg)があるならそれを優先（色替えに追従）
      var bg = getCssVar("--bg", "#0B1220");
      if (root) root.style.backgroundColor = bg;
      if (document.body) document.body.style.backgroundColor = bg;
    } catch (e) {}
=======
  function forceCreamBackground() {
    try {
      if (root) root.style.backgroundColor = "#F2F8F5";
      if (document.body) document.body.style.backgroundColor = "#F2F8F5";
    } catch (e) { }
>>>>>>> Stashed changes
=======
  function forceCreamBackground() {
    try {
      if (root) root.style.backgroundColor = "#F2F8F5";
      if (document.body) document.body.style.backgroundColor = "#F2F8F5";
    } catch (e) { }
>>>>>>> Stashed changes
  }

  function injectLineBadgeFixCssOnce() {
    try {
      if (document.getElementById("take-linebadge-fix")) return;
      var style = document.createElement("style");
      style.id = "take-linebadge-fix";
      style.textContent =
        "div:has(img[data-qr=\"line\"])::after{content:none !important;display:none !important;}" +
        ".line-qr-box{position:relative;}" +
        ".line-qr-box::after{content:\"LINE\";position:absolute;top:-10px;right:-10px;padding:2px 8px;border-radius:9999px;background:#06C755;color:#fff;font-size:10px;font-weight:800;letter-spacing:0.08em;box-shadow:0 10px 24px rgba(0,0,0,0.25);}";
      document.head.appendChild(style);
    } catch (e) { }
  }

  function ensureLineQrBoxClass() {
    try {
      var img = document.querySelector("img[data-qr=\"line\"]");
      if (!img) return;
      var p = img.parentElement;
      if (!p) return;
      if (!p.classList.contains("line-qr-box")) p.classList.add("line-qr-box");
    } catch (e) { }
<<<<<<< Updated upstream
  }

  function injectSubmitGuardCssOnce() {
    try {
      if (document.getElementById("take-submit-guard-style")) return;
      var style = document.createElement("style");
      style.id = "take-submit-guard-style";
      style.textContent =
        "#take-submit-overlay{position:fixed;inset:0;z-index:2147483646;display:none;align-items:center;justify-content:center;padding:24px;background:rgba(0,0,0,0.58);backdrop-filter:blur(8px);}" +
        "#take-submit-overlay[aria-hidden=\"false\"]{display:flex;}" +
        "#take-submit-overlay .box{width:min(560px,100%);border-radius:20px;border:1px solid rgba(255,255,255,0.12);background:rgba(11,31,59,0.92);box-shadow:0 18px 40px rgba(0,0,0,0.45);padding:18px 18px 16px;}" +
        "#take-submit-overlay .row{display:flex;gap:12px;align-items:center;}" +
        "#take-submit-overlay .spin{width:18px;height:18px;border-radius:9999px;border:2px solid rgba(255,255,255,0.25);border-top-color:#2DD4BF;animation:takeSpin .8s linear infinite;flex:0 0 auto;}" +
        "#take-submit-overlay .title{font-weight:900;color:rgba(255,255,255,0.94);font-size:14px;}" +
        "#take-submit-overlay .desc{margin-top:8px;color:rgba(255,255,255,0.78);font-size:12px;line-height:1.5;}" +
        "#take-submit-overlay .timer{margin-top:10px;color:rgba(255,255,255,0.70);font-size:12px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,\"Liberation Mono\",\"Courier New\",monospace;}" +
        "@keyframes takeSpin{to{transform:rotate(360deg);}}";
      document.head.appendChild(style);
    } catch (e) {}
  }

  function ensureSubmitOverlay() {
    if (document.getElementById("take-submit-overlay")) return document.getElementById("take-submit-overlay");

    injectSubmitGuardCssOnce();

    var overlay = document.createElement("div");
    overlay.id = "take-submit-overlay";
    overlay.setAttribute("aria-hidden", "true");

    var box = document.createElement("div");
    box.className = "box";

    var row = document.createElement("div");
    row.className = "row";

    var spin = document.createElement("div");
    spin.className = "spin";

    var title = document.createElement("div");
    title.className = "title";
    title.textContent = "送信中です…（15〜20秒かかることがあります）";

    row.appendChild(spin);
    row.appendChild(title);

    var desc = document.createElement("div");
    desc.className = "desc";
    desc.textContent = "写真の変換 → 保存 → 通知の順で処理します。完了までこの画面を閉じずにお待ちください。";

    var timer = document.createElement("div");
    timer.className = "timer";
    timer.textContent = "経過: 0秒";

    box.appendChild(row);
    box.appendChild(desc);
    box.appendChild(timer);

    overlay.appendChild(box);

    try {
      document.body.appendChild(overlay);
    } catch (e) {
      document.documentElement.appendChild(overlay);
    }

    // クリックで閉じない（誤操作防止）
    overlay.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
    });

    return overlay;
  }

  function initSubmitGuard() {
    try {
      var form = document.getElementById("registerForm") || document.getElementById("fullRegisterForm");
      var btn = document.getElementById("submitBtn");
      if (!form || !btn) return;

      var overlay = ensureSubmitOverlay();
      var timerEl = overlay.querySelector(".timer");
      var startedAt = 0;
      var tickId = 0;

      function setBeforeUnload(on) {
        try {
          if (!on) {
            window.onbeforeunload = null;
            return;
          }
          window.onbeforeunload = function () {
            return "送信中です。完了までこのままお待ちください。";
          };
        } catch (e) {}
      }

      function startTimer() {
        if (tickId) return;
        startedAt = Date.now();
        tickId = window.setInterval(function () {
          if (!timerEl) return;
          var sec = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
          timerEl.textContent = "経過: " + sec + "秒";
        }, 500);
      }

      function stopTimer() {
        if (!tickId) return;
        window.clearInterval(tickId);
        tickId = 0;
        if (timerEl) timerEl.textContent = "経過: 0秒";
      }

      function showOverlay() {
        overlay.setAttribute("aria-hidden", "false");
        setBeforeUnload(true);
        startTimer();
      }

      function hideOverlay() {
        overlay.setAttribute("aria-hidden", "true");
        setBeforeUnload(false);
        stopTimer();
      }

      // submit直後（disabledになる前）でも出す
      form.addEventListener("submit", function () {
        showOverlay();
      }, true);

      // ボタン disabled の状態で確実に追従（既存コードに依存しない）
      var mo = new MutationObserver(function () {
        try {
          if (btn.disabled) showOverlay();
          else hideOverlay();
        } catch (e) {}
      });
      mo.observe(btn, { attributes: true, attributeFilter: ["disabled"] });

      // 初期状態
      if (btn.disabled) showOverlay();
      else hideOverlay();
    } catch (e) {}
=======
>>>>>>> Stashed changes
  }

  function markEnter() {
    try {
      root.classList.add("is-enter");
      root.classList.remove("is-leave");
    } catch (e) { }
  }

  function handleReady() {
    forceCreamBackground();
    injectLineBadgeFixCssOnce();
    ensureLineQrBoxClass();
    initSubmitGuard();

    if (!root) return;
    if (prefersReducedMotion()) {
      root.classList.remove("is-leave");
      root.classList.add("is-enter");
      return;
    }
    requestAnimationFrame(function () {
      requestAnimationFrame(markEnter);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", handleReady, { once: true });
  } else {
    handleReady();
  }

  window.addEventListener("pageshow", function () {
    forceCreamBackground();
    try { if (root) root.classList.remove("is-leave"); } catch (e) { }
    handleReady();
  });
})();