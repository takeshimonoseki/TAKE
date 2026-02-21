/* assets/effects.js — UX enhancement layer (Vanilla JS, no deps) */
(function () {
  "use strict";

  /* ============================
     Kill Switch
     ============================ */
  function isKilled() {
    try {
      if (/[?&]effects=off/i.test(location.search)) return true;
      if (localStorage.getItem("effects_off") === "1") return true;
      var html = document.documentElement;
      var body = document.body;
      if (html && html.dataset && html.dataset.effects === "off") return true;
      if (body && body.dataset && body.dataset.effects === "off") return true;
    } catch (e) {}
    return false;
  }

  if (isKilled()) return;

  /* ============================
     Helpers
     ============================ */
  var reducedMotion = false;
  try {
    reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch (e) {}

  function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
  function qsa(sel, ctx) { return [].slice.call((ctx || document).querySelectorAll(sel)); }

  function createEl(tag, attrs, textContent) {
    var el = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === "className") el.className = attrs[k];
        else if (k === "style" && typeof attrs[k] === "object") {
          Object.keys(attrs[k]).forEach(function (s) { el.style[s] = attrs[k][s]; });
        } else el.setAttribute(k, attrs[k]);
      });
    }
    if (textContent) el.textContent = textContent;
    return el;
  }

  function onReady(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  }

  /* ============================
     Init
     ============================ */
  onReady(function () {
    if (isKilled()) return;

    document.body.classList.add("fx-active");

    initReveal();
    initScrollHint();
    initHeaderShrink();
    initSubmitEnhance();
    initProgressBar();
    initInlineValidation();
    initSkeletons();
    initFixedCTA();
    initParallax();
    initCountUp();
  });

  /* ============================
     (7) ふわっと入場
     ============================ */
  function initReveal() {
    var els = qsa("[data-reveal]");
    if (!els.length) return;

    if (reducedMotion) {
      els.forEach(function (el) { el.classList.add("is-revealed"); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -30px 0px" });

    els.forEach(function (el) { observer.observe(el); });
  }

  /* ============================
     (8) スクロール誘導
     ============================ */
  function initScrollHint() {
    var page = (document.body.dataset && document.body.dataset.page) || "";
    if (page !== "top") return;

    var hint = createEl("div", { className: "fx-scroll-hint", "aria-hidden": "true" });

    var arrow = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    arrow.setAttribute("viewBox", "0 0 24 24");
    arrow.setAttribute("fill", "none");
    arrow.setAttribute("stroke", "currentColor");
    arrow.setAttribute("stroke-width", "2");
    arrow.setAttribute("class", "fx-scroll-hint-arrow");
    var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M12 5v14M5 12l7 7 7-7");
    arrow.appendChild(path);

    var label = createEl("span", {}, "\u30B9\u30AF\u30ED\u30FC\u30EB");
    hint.appendChild(arrow);
    hint.appendChild(label);
    document.body.appendChild(hint);

    var hidden = false;
    function onScroll() {
      if (hidden) return;
      if (window.scrollY > 100) {
        hint.classList.add("is-hidden");
        hidden = true;
        window.removeEventListener("scroll", onScroll);
        setTimeout(function () {
          if (hint.parentNode) hint.parentNode.removeChild(hint);
        }, 500);
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ============================
     (10) ヘッダー縮小と影
     ============================ */
  function initHeaderShrink() {
    var header = qs(".site-header") || qs("body > header");
    if (!header) return;

    var scrolled = false;
    function onScroll() {
      var y = window.scrollY;
      if (y > 10 && !scrolled) {
        header.classList.add("is-scrolled");
        scrolled = true;
      } else if (y <= 10 && scrolled) {
        header.classList.remove("is-scrolled");
        scrolled = false;
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ============================
     (2) 送信中UI
     transition.js が #take-submit-overlay を担当するため、
     effects.js はフォーム内の薄いオーバーレイのみ追加。
     ボタン内容・disabled・beforeunload には触れない。
     ============================ */
  function initSubmitEnhance() {
    var forms = qsa("form[id]");
    forms.forEach(function (form) {
      var btn = form.querySelector("[type=submit]") || form.querySelector("#submitBtn");
      if (!btn) return;

      var overlay = null;
      var sending = false;
      var timeoutId = 0;

      function showOverlay() {
        if (sending) return;
        sending = true;
        if (!overlay) {
          overlay = createEl("div", { className: "fx-submit-overlay" });
          if (!form.style.position || form.style.position === "static") {
            form.style.position = "relative";
          }
          form.appendChild(overlay);
        }
        requestAnimationFrame(function () {
          if (overlay) overlay.classList.add("is-visible");
        });
        timeoutId = setTimeout(hideOverlay, 20000);
      }

      function hideOverlay() {
        if (!sending) return;
        sending = false;
        clearTimeout(timeoutId);
        timeoutId = 0;
        if (overlay) overlay.classList.remove("is-visible");
      }

      var mo = new MutationObserver(function () {
        if (btn.disabled && !sending) showOverlay();
        else if (!btn.disabled && sending) hideOverlay();
      });
      mo.observe(btn, { attributes: true, attributeFilter: ["disabled"] });
    });
  }

  /* ============================
     (4) 成功トースト
     ============================ */
  var toastShown = false;
  function showSuccessToast() {
    if (toastShown) return;

    var successBox = qs("#successBox");
    if (!successBox) return;
    if (successBox.style.display === "none") return;
    if (!successBox.offsetParent) return;

    toastShown = true;

    var toast = createEl("div", { className: "fx-toast", role: "status", "aria-live": "polite" });

    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2.5");
    svg.setAttribute("class", "fx-toast-check");
    var circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", "12");
    circle.setAttribute("cy", "12");
    circle.setAttribute("r", "10");
    var polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    polyline.setAttribute("points", "9 12 11.5 14.5 16 10");
    svg.appendChild(circle);
    svg.appendChild(polyline);

    var msg = createEl("span", {}, "\u9001\u4FE1\u5B8C\u4E86\u3057\u307E\u3057\u305F");
    toast.appendChild(svg);
    toast.appendChild(msg);
    document.body.appendChild(toast);

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        toast.classList.add("is-visible");
      });
    });

    setTimeout(function () {
      toast.classList.remove("is-visible");
      setTimeout(function () {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 400);
    }, 3500);
  }

  onReady(function () {
    var successBox = qs("#successBox");
    if (!successBox) return;
    var smo = new MutationObserver(function () {
      if (successBox.style.display !== "none" && successBox.offsetParent !== null) {
        showSuccessToast();
      }
    });
    smo.observe(successBox, { attributes: true, attributeFilter: ["style"] });
  });

  /* ============================
     (3) 進捗バー（full-register.html のみ）
     ============================ */
  function initProgressBar() {
    var path = location.pathname || "";
    if (path.indexOf("full-register") < 0) return;

    var form = qs("#fullRegisterForm");
    if (!form) return;

    var bar = createEl("div", { className: "fx-progress-bar", "aria-hidden": "true" });
    var fill = createEl("div", { className: "fx-progress-fill" });
    bar.appendChild(fill);
    document.body.appendChild(bar);

    function calcProgress() {
      var inputs = qsa("input, select, textarea", form);
      var total = 0;
      var filled = 0;

      inputs.forEach(function (el) {
        if (el.type === "hidden" || el.type === "submit" || el.type === "button") return;
        if (el.offsetParent === null && el.type !== "checkbox" && el.type !== "radio") return;

        if (el.type === "checkbox" || el.type === "radio") {
          var name = el.name;
          if (!name) return;
          var group = form.querySelectorAll("[name=\"" + name + "\"]");
          if (group[0] !== el) return;
          total++;
          for (var i = 0; i < group.length; i++) {
            if (group[i].checked) { filled++; break; }
          }
          return;
        }

        if (el.type === "file") {
          total++;
          if (el.files && el.files.length > 0) filled++;
          return;
        }

        total++;
        if ((el.value || "").trim()) filled++;
      });

      return total > 0 ? Math.round((filled / total) * 100) : 0;
    }

    function update() {
      fill.style.width = calcProgress() + "%";
    }

    form.addEventListener("input", update);
    form.addEventListener("change", update);
    update();
  }

  /* ============================
     (5) エラー即時表示（HTML5 invalid）
     ============================ */
  function initInlineValidation() {
    var forms = qsa("form[id]");
    forms.forEach(function (form) {
      qsa("input, select, textarea", form).forEach(function (el) {
        el.addEventListener("invalid", function () {
          el.classList.add("fx-invalid");

          if (el.id) {
            var existing = el.parentNode.querySelector(".fx-field-error[data-for=\"" + el.id + "\"]");
            if (existing) existing.parentNode.removeChild(existing);
          }

          if (el.validationMessage && el.id) {
            var errEl = createEl("div", {
              className: "fx-field-error",
              "data-for": el.id,
              id: "fx-err-" + el.id,
              "aria-live": "polite"
            }, el.validationMessage);
            el.insertAdjacentElement("afterend", errEl);
            el.setAttribute("aria-describedby", "fx-err-" + el.id);
          }
        });

        el.addEventListener("input", function () {
          el.classList.remove("fx-invalid");
          if (el.id) {
            var errEl = el.parentNode.querySelector(".fx-field-error[data-for=\"" + el.id + "\"]");
            if (errEl) errEl.parentNode.removeChild(errEl);
          }
          el.removeAttribute("aria-describedby");
        });
      });
    });
  }

  /* ============================
     (6) スケルトン（読み込み中表示がある場合のみ）
     ============================ */
  function initSkeletons() {
    qsa("#cityLoading, #publicCityLoading").forEach(function (loadEl) {
      var select = loadEl.previousElementSibling;
      if (!select || select.tagName !== "SELECT") return;

      var skeleton = null;

      new MutationObserver(function () {
        var isLoading = loadEl.style.display !== "none";
        if (isLoading && !skeleton) {
          skeleton = createEl("div", { className: "fx-skeleton", style: { width: "100%", height: "42px" } });
          select.style.display = "none";
          select.insertAdjacentElement("afterend", skeleton);
          setTimeout(function () {
            if (skeleton && skeleton.parentNode) {
              skeleton.parentNode.removeChild(skeleton);
              skeleton = null;
              select.style.display = "";
            }
          }, 1500);
        } else if (!isLoading && skeleton) {
          if (skeleton.parentNode) skeleton.parentNode.removeChild(skeleton);
          skeleton = null;
          select.style.display = "";
        }
      }).observe(loadEl, { attributes: true, attributeFilter: ["style"] });
    });
  }

  /* ============================
     (9) 固定CTA
     ============================ */
  function initFixedCTA() {
    var path = location.pathname || "";

    if (qs("form[id]")) return;

    if (path.indexOf("thankyou") >= 0) return;

    var todayKey = "fx_cta_closed_" + new Date().toISOString().slice(0, 10);
    try {
      if (localStorage.getItem(todayKey) === "1") return;
    } catch (e) {}

    var registerUrl = "./register.html";

    var cta = createEl("a", { className: "fx-fixed-cta", href: registerUrl });
    cta.appendChild(createEl("span", {}, "\u4EEE\u767B\u9332\u306F\u3053\u3061\u3089"));
    var closeBtn = createEl("button", {
      className: "fx-fixed-cta-close",
      "aria-label": "\u9589\u3058\u308B",
      type: "button"
    }, "\u00D7");
    cta.appendChild(closeBtn);
    document.body.appendChild(cta);

    closeBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      cta.classList.add("is-hidden");
      try { localStorage.setItem(todayKey, "1"); } catch (ex) {}
    });

    var focused = false;
    document.addEventListener("focusin", function (e) {
      var tag = e.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") {
        if (!focused) { cta.classList.add("is-dimmed"); focused = true; }
      }
    });
    document.addEventListener("focusout", function () {
      if (focused) {
        setTimeout(function () {
          var act = document.activeElement;
          var tag = act ? act.tagName : "";
          if (tag !== "INPUT" && tag !== "TEXTAREA" && tag !== "SELECT") {
            cta.classList.remove("is-dimmed");
            focused = false;
          }
        }, 100);
      }
    });
  }

  /* ============================
     (11) 控えめパララックス
     ============================ */
  function initParallax() {
    if (reducedMotion) return;
    var els = qsa("[data-parallax]");
    if (!els.length) return;

    var ticking = false;
    var frameCount = 0;
    var startTime = performance.now();

    function tick() {
      frameCount++;
      var elapsed = performance.now() - startTime;
      if (elapsed > 2000 && frameCount < 90) return;

      var scrollY = window.scrollY;
      els.forEach(function (el) {
        var speed = parseFloat(el.dataset.parallax) || 0.1;
        el.style.transform = "translateY(" + (scrollY * speed * -1) + "px)";
      });
    }

    window.addEventListener("scroll", function () {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(function () { tick(); ticking = false; });
      }
    }, { passive: true });
  }

  /* ============================
     (12) 数字カウントアップ
     ============================ */
  function initCountUp() {
    var els = qsa("[data-countup]");
    if (!els.length) return;

    if (reducedMotion) {
      els.forEach(function (el) { el.textContent = el.dataset.countup; });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        observer.unobserve(el);
        var target = parseInt(el.dataset.countup, 10);
        if (isNaN(target)) { el.textContent = el.dataset.countup; return; }
        var duration = 550;
        var start = performance.now();
        function step(now) {
          var progress = Math.min((now - start) / duration, 1);
          el.textContent = Math.round(target * (1 - Math.pow(1 - progress, 3)));
          if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.3 });

    els.forEach(function (el) { observer.observe(el); });
  }

})();
