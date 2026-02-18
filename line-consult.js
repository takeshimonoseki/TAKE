// 各相談セクション内の選択項目 + 備考を集めて、スマホはLINE / PCはメールで開く（PCはLINE用QRも表示）

(function () {
  "use strict";

  function isMobileDevice() {
    try {
      var ua = String(navigator.userAgent || "");
      if (/iphone|ipad|ipod|android|mobile/i.test(ua)) return true;
      if (window.matchMedia && window.matchMedia("(pointer:coarse)").matches) return true;
      if (window.innerWidth && window.innerWidth < 768) return true;
    } catch (e) {}
    return false;
  }

  function getLineUrl() {
    return (window.CONFIG && window.CONFIG.LINE_URL) ? String(window.CONFIG.LINE_URL) : "https://line.me/R/ti/p/%40277rcesk";
  }

  function getEmailTo() {
    return (window.CONFIG && window.CONFIG.EMAIL_TO) ? String(window.CONFIG.EMAIL_TO) : "";
  }

  function $all(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function cssEscapeSafe(s) {
    s = String(s || "");
    if (window.CSS && typeof window.CSS.escape === "function") return window.CSS.escape(s);
    return s.replace(/[^a-zA-Z0-9_\-]/g, "\\$&");
  }

  function getLabelText(el, scope) {
    if (!el) return "";
    var id = el.id ? String(el.id) : "";
    if (id) {
      var lb = (scope || document).querySelector('label[for="' + cssEscapeSafe(id) + '"]');
      if (lb && (lb.textContent || "").trim()) return (lb.textContent || "").trim();
    }
    var aria = el.getAttribute && el.getAttribute("aria-label");
    if (aria && String(aria).trim()) return String(aria).trim();
    var prev = el.previousElementSibling;
    if (prev && prev.tagName && prev.tagName.toLowerCase() === "label" && (prev.textContent || "").trim()) {
      return (prev.textContent || "").trim();
    }
    return "";
  }

  function normalizeOaId(raw) {
    var s = String(raw || "").trim();
    if (!s) return "";
    if (s[0] !== "@") s = "@" + s;
    return s; // oaMessageは@付きのままが安定
  }

  function buildMessage(sectionEl, title) {
    var lines = [];
    var t = String(title || "").trim();
    if (!t) {
      var h = sectionEl ? sectionEl.querySelector("h2,h3,.vehicle-card-title,.consult-title") : null;
      t = h ? (h.textContent || "").trim() : "相談";
    }

    lines.push("【" + t + "】");
    lines.push("ページ: " + (location.pathname || "/"));

    // select
    $all("select", sectionEl).forEach(function (sel) {
      var v = (sel.value == null ? "" : String(sel.value)).trim();
      if (!v) return;
      var label = getLabelText(sel, sectionEl) || sel.name || sel.id || "項目";
      lines.push(label + ": " + v);
    });

    // text/number/email/tel
    $all('input[type="text"],input[type="number"],input[type="email"],input[type="tel"]', sectionEl).forEach(function (inp) {
      var v = (inp.value == null ? "" : String(inp.value)).trim();
      if (!v) return;
      var label = getLabelText(inp, sectionEl) || inp.name || inp.id || "入力";
      lines.push(label + ": " + v);
    });

    // checkbox/radio
    var checked = $all('input[type="checkbox"]:checked, input[type="radio"]:checked', sectionEl);
    var groups = {};
    checked.forEach(function (inp) {
      var name = (inp.name || inp.id || "選択");
      if (!groups[name]) groups[name] = [];
      var lb = "";
      if (inp.id) {
        var l = sectionEl.querySelector('label[for="' + cssEscapeSafe(inp.id) + '"]');
        lb = l ? (l.textContent || "").trim() : "";
      }
      groups[name].push(lb || (inp.value || "選択"));
    });
    Object.keys(groups).forEach(function (k) {
      var label = k;
      var any = sectionEl.querySelector('[name="' + cssEscapeSafe(k) + '"]');
      if (any) {
        var fs = any.closest("fieldset");
        var lg = fs ? fs.querySelector("legend") : null;
        if (lg && (lg.textContent || "").trim()) label = (lg.textContent || "").trim();
      }
      lines.push(label + ": " + groups[k].join("・"));
    });

    // note textarea
    var noteEl = sectionEl ? sectionEl.querySelector("textarea.js-line-note, textarea[data-line-note]") : null;
    var note = noteEl ? String(noteEl.value || "").trim() : "";
    if (note) {
      lines.push("備考:");
      lines.push(note);
    }

    if (lines.length <= 2) {
      lines.push("（未選択）");
      lines.push("備考に状況を書いて送ってください。");
    }

    return lines.join("\n").slice(0, 5000);
  }

  function openLineWithText(text) {
    var msg = encodeURIComponent(String(text || "").slice(0, 5000));

    var oa = (window.CONFIG && (window.CONFIG.LINE_OA_ID || window.CONFIG.LINE_OA)) ? (window.CONFIG.LINE_OA_ID || window.CONFIG.LINE_OA) : "";
    var oaEnc = normalizeOaId(oa);

    // 公式アカウント宛て（最優先）
    if (oaEnc) {
      var mobile = isMobileDevice();
      var base = mobile ? "line://oaMessage/" : "https://line.me/R/oaMessage/";
      location.href = base + oaEnc + "/?" + msg;
      return;
    }

    location.href = "https://line.me/R/msg/text/?" + msg;
  }

  function openMailWithText(text, title) {
    var to = getEmailTo();
    if (!to) return false;

    var t = String(title || "").trim() || "相談";
    var subject = encodeURIComponent("【" + t + "】相談（PCから送信）");
    var body = encodeURIComponent(String(text || "").slice(0, 5000));
    location.href = "mailto:" + encodeURIComponent(to) + "?subject=" + subject + "&body=" + body;
    return true;
  }

  function injectQrStyleOnce() {
    if (document.getElementById("lineQrStyle")) return;
    var style = document.createElement("style");
    style.id = "lineQrStyle";
    style.textContent = [
      ".line-qr-box{margin-top:12px;padding:12px;border:1px solid rgba(255,255,255,.12);border-radius:16px;background:rgba(255,255,255,.03);}",
      ".line-qr-hint{font-size:12px;color:rgba(255,255,255,.55);line-height:1.4;}",
      ".line-qr-row{display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-top:10px;}",
      ".line-qr-img{width:160px;height:160px;border-radius:12px;background:#fff;padding:8px;box-sizing:border-box;}",
      ".line-qr-link{font-size:12px;color:rgba(255,255,255,.75);text-decoration:underline;}",
      "@media (max-width: 767px){.line-qr-box{display:none;}}"
    ].join("\n");
    document.head.appendChild(style);
  }

  function ensurePcQrBox(btn) {
    if (!btn || isMobileDevice()) return;

    injectQrStyleOnce();

    var next = btn.nextElementSibling;
    if (next && next.classList && next.classList.contains("line-qr-box")) return;

    var lineUrl = getLineUrl();
    if (!lineUrl) return;

    var qrImg = "https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=" + encodeURIComponent(lineUrl);

    var box = document.createElement("div");
    box.className = "line-qr-box";
    box.innerHTML =
      '<div class="line-qr-hint">スマホでLINE相談したい場合：QRを読み取り → LINEで送信</div>' +
      '<div class="line-qr-row">' +
        '<img class="line-qr-img" src="' + qrImg + '" alt="LINE QRコード">' +
        '<a class="line-qr-link" href="' + lineUrl + '" target="_blank" rel="noopener noreferrer">LINEをブラウザで開く</a>' +
      "</div>";

    btn.insertAdjacentElement("afterend", box);
  }

  function setBtnLabel(btn, mode) {
    if (!btn) return;
    try {
      if (mode === "mail") {
        btn.innerHTML = '<i data-lucide="mail" class="w-4 h-4 mr-2"></i> メールで相談する';
      } else {
        btn.innerHTML = '<i data-lucide="message-circle" class="w-4 h-4 mr-2"></i> LINEで相談する';
      }
      if (window.lucide && typeof window.lucide.createIcons === "function") {
        window.lucide.createIcons();
      }
    } catch (e) {}
  }

  function decideMode(btn) {
    var force = (btn && btn.getAttribute) ? String(btn.getAttribute("data-force") || "").toLowerCase() : "";
    var mobile = isMobileDevice();
    var hasMail = !!getEmailTo();

    if (force === "line") return "line";
    if (force === "mail") return hasMail ? "mail" : "line";

    // auto
    if (mobile) return "line";
    return hasMail ? "mail" : "line";
  }

  function onClick(e) {
    var btn = e.currentTarget;
    if (!btn) return;
    e.preventDefault();

    var section =
      btn.closest("section") ||
      btn.closest(".card") ||
      btn.closest(".vehicle-card") ||
      btn.closest(".consult-card") ||
      document;

    var title = btn.getAttribute("data-line-title") || "";
    var text = buildMessage(section, title);

    var mode = decideMode(btn);
    if (mode === "mail") {
      var ok = openMailWithText(text, title);
      if (!ok) openLineWithText(text);
    } else {
      openLineWithText(text);
    }
  }

  function boot() {
    $all(".js-line-send").forEach(function (el) {
      var mode = decideMode(el);
      setBtnLabel(el, mode);
      if (mode === "mail") ensurePcQrBox(el);
      el.addEventListener("click", onClick);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
