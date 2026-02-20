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

  function forceDarkBackground() {
    try {
      if (root) root.style.backgroundColor = "#0f1915";
      if (document.body) document.body.style.backgroundColor = "#0f1915";
    } catch (e) {}
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
    } catch (e) {}
  }

  function ensureLineQrBoxClass() {
    try {
      var img = document.querySelector("img[data-qr=\"line\"]");
      if (!img) return;
      var p = img.parentElement;
      if (!p) return;
      if (!p.classList.contains("line-qr-box")) p.classList.add("line-qr-box");
    } catch (e) {}
  }

  function markEnter() {
    try {
      root.classList.add("is-enter");
      root.classList.remove("is-leave");
    } catch (e) {}
  }

  function handleReady() {
    forceDarkBackground();
    injectLineBadgeFixCssOnce();
    ensureLineQrBoxClass();

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
    forceDarkBackground();
    try { if (root) root.classList.remove("is-leave"); } catch (e) {}
    handleReady();
  });
})();