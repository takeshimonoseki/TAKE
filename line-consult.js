// FILE: line-consult.js（全文）
// 車両ページ：選択内容 + 備考 を集めて、LINE（公式アカウント）に「下書き入り」で開く

(function () {
  "use strict";

  var C = window.CONFIG || {};

  function $all(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function normalizeOaId(raw) {
    var s = String(raw || "").trim();
    if (!s) return "";
    if (s[0] !== "@") s = "@" + s;
    return s;
  }

  function getLabelText(el, scope) {
    if (!el) return "";

    // label[for=id]
    if (el.id) {
      var lb = (scope || document).querySelector('label[for="' + el.id + '"]');
      if (lb && (lb.textContent || "").trim()) return (lb.textContent || "").trim();
    }

    // .field-label（近い行）
    var row = el.closest(".form-row") || el.closest(".form-row-full");
    if (row) {
      var fl = row.querySelector(".field-label");
      if (fl && (fl.textContent || "").trim()) return (fl.textContent || "").trim();
    }

    // fieldset legend
    var fs = el.closest("fieldset");
    if (fs) {
      var lg = fs.querySelector("legend");
      if (lg && (lg.textContent || "").trim()) return (lg.textContent || "").trim();
    }

    return "";
  }

  function buildMessage(sectionEl, title) {
    var t = String(title || "").trim();
    if (!t) {
      var h = sectionEl ? sectionEl.querySelector("h2,h3,.vehicle-card-title") : null;
      t = h ? String(h.textContent || "").trim() : "相談";
    }

    var lines = [];
    lines.push("【相談カテゴリ】");
    lines.push(t);
    lines.push("");
    lines.push("【選択内容】");

    var any = false;

    // select
    $all("select", sectionEl).forEach(function (sel) {
      var v = "";
      if (sel.options && sel.selectedIndex >= 0) {
        v = String(sel.options[sel.selectedIndex].text || "").trim();
      } else {
        v = String(sel.value || "").trim();
      }
      if (!v) return;

      any = true;
      var label = (getLabelText(sel, sectionEl) || sel.name || sel.id || "項目").replace(/：\s*$/, "");
      lines.push("・" + label + "： " + v);
    });

    // text/number/email/tel
    $all('input[type="text"],input[type="number"],input[type="email"],input[type="tel"]', sectionEl).forEach(function (inp) {
      var v = String(inp.value || "").trim();
      if (!v) return;

      any = true;
      var label = (getLabelText(inp, sectionEl) || inp.name || inp.id || "入力").replace(/：\s*$/, "");
      lines.push("・" + label + "： " + v);
    });

    // checkbox/radio（checkedだけ）
    var checked = $all('input[type="checkbox"]:checked, input[type="radio"]:checked', sectionEl);
    var groups = {};
    checked.forEach(function (inp) {
      var name = (inp.name || inp.id || "選択");
      if (!groups[name]) groups[name] = [];
      var lb = getLabelText(inp, sectionEl);
      groups[name].push(lb || String(inp.value || "選択"));
    });

    Object.keys(groups).forEach(function (k) {
      any = true;
      var anyEl = sectionEl.querySelector('[name="' + k + '"]');
      var label = anyEl ? getLabelText(anyEl, sectionEl) : k;
      label = (label || k).replace(/：\s*$/, "");
      lines.push("・" + label + "： " + groups[k].join(" / "));
    });

    if (!any) lines.push("（未選択）");

    // note
    var noteEl = sectionEl ? sectionEl.querySelector("textarea.js-line-note, textarea[data-line-note]") : null;
    var note = noteEl ? String(noteEl.value || "").trim() : "";
    if (!note) note = "未入力";

    lines.push("");
    lines.push("【備考】");
    lines.push(note);

    return lines.join("\n").slice(0, 5000);
  }

  function openLineWithText(text) {
    var msg = encodeURIComponent(String(text || "").slice(0, 5000));
    var oaId = normalizeOaId(C.LINE_OA_ID || C.LINE_OA || "");
    if (oaId) {
      var url = "https://line.me/R/oaMessage/" + encodeURIComponent(oaId) + "/?" + msg;
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }
    // fallback（宛先選択になる可能性あり）
    window.open("https://line.me/R/msg/text/?" + msg, "_blank", "noopener,noreferrer");
  }

  function onClick(e) {
    var btn = e.currentTarget;
    var title = (btn.getAttribute("data-line-title") || btn.textContent || "").trim();

    // ボタンがあるセクション単位で集計
    var section = btn.closest("section") || btn.closest(".card") || document.body;

    var text = buildMessage(section, title);
    openLineWithText(text);
  }

  // bind
  $all(".js-line-send").forEach(function (btn) {
    btn.addEventListener("click", onClick);
  });
})();
