// ② path: assets/full-register-enhance.js
/**
 * full-register 拡張: 市区町村(HeartRails)・銀行支店(teraren) API / キャッシュ / サジェスト
 * initOnce ガード済み。TTL 7日、タイムアウト8秒。
 * データソース固定: banks.json?page=1&per=500 / banks/{bankCode}/branches.json?page=1&per=500
 */
(function() {
  "use strict";
  var CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
  var FETCH_TIMEOUT_MS = 8000;
  var BANKS_CACHE_KEY = "take_banks_v1";
  var BRANCHES_CACHE_PREFIX = "take_branches_";
  var BRANCHES_CACHE_SUFFIX = "_v1";
  var CITIES_CACHE_PREFIX = "take_cities_";

  var cityCache = Object.create(null);
  var banksCache = null;
  var branchesCache = Object.create(null);

  function getCache(key) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return null;
      var obj = JSON.parse(raw);
      if (!obj || typeof obj.ts !== "number" || !obj.data) return null;
      if (Date.now() - obj.ts > CACHE_TTL_MS) return null;
      return obj.data;
    } catch (e) { return null; }
  }
  function setCache(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data: data }));
    } catch (e) {}
  }

  function fetchWithTimeout(url) {
    var ctrl = new AbortController();
    var t = setTimeout(function() { ctrl.abort(); }, FETCH_TIMEOUT_MS);
    return fetch(url, { signal: ctrl.signal })
      .then(function(r) { clearTimeout(t); return r.ok ? r.json() : Promise.reject(new Error("HTTP " + r.status)); })
      .catch(function(err) { clearTimeout(t); throw err; });
  }

  function getCitiesForPrefecture(pref, callback) {
    if (!pref || !pref.trim()) { callback(null, []); return; }
    var key = CITIES_CACHE_PREFIX + pref;
    if (cityCache[key]) { callback(null, cityCache[key]); return; }
    var cached = getCache(key);
    if (cached && Array.isArray(cached)) { cityCache[key] = cached; callback(null, cached); return; }
    var url = "https://geoapi.heartrails.com/api/json?method=getCities&prefecture=" + encodeURIComponent(pref);
    fetchWithTimeout(url)
      .then(function(json) {
        var arr = (json && json.response && json.response.location) ? json.response.location : [];
        var names = arr.map(function(x) { return x.city; }).filter(Boolean);
        cityCache[key] = names;
        setCache(key, names);
        callback(null, names);
      })
      .catch(function(err) { callback(err, []); });
  }

  function loadBanksAll(callback) {
    if (banksCache) { callback(null, banksCache); return; }
    var cached = getCache(BANKS_CACHE_KEY);
    if (cached && Array.isArray(cached)) { banksCache = cached; callback(null, cached); return; }

    var url = "https://bank.teraren.com/banks.json?page=1&per=500";
    fetchWithTimeout(url)
      .then(function(json) {
        var banks = (json && json.data) ? json.data : [];
        banksCache = banks;
        setCache(BANKS_CACHE_KEY, banks);
        callback(null, banks);
      })
      .catch(function(err) { callback(err, []); });
  }

  function loadBranchesForBank(bankCode, callback) {
    if (!bankCode) { callback(null, []); return; }
    var key = BRANCHES_CACHE_PREFIX + bankCode + BRANCHES_CACHE_SUFFIX;
    if (branchesCache[key]) { callback(null, branchesCache[key]); return; }
    var cached = getCache(key);
    if (cached && Array.isArray(cached)) { branchesCache[key] = cached; callback(null, cached); return; }

    var url = "https://bank.teraren.com/banks/" + encodeURIComponent(bankCode) + "/branches.json?page=1&per=500";
    fetchWithTimeout(url)
      .then(function(json) {
        var branches = (json && json.data) ? json.data : [];
        branchesCache[key] = branches;
        setCache(key, branches);
        callback(null, branches);
      })
      .catch(function(err) { callback(err, []); });
  }

  function filterSuggest(arr, query, limit) {
    limit = limit || 12;
    var q = (query || "").trim();
    if (!q) return arr.slice(0, limit);

    q = q.toLowerCase();
    var out = [];
    for (var i = 0; i < arr.length; i++) {
      var name = (arr[i] && arr[i].name) ? String(arr[i].name) : "";
      var code = (arr[i] && arr[i].code) ? String(arr[i].code) : "";
      var key = (code + " " + name).toLowerCase();
      if (key.indexOf(q) !== -1) out.push(arr[i]);
      if (out.length >= limit) break;
    }
    return out;
  }

  function getBankLabel(bank) {
    var code = bank && bank.code ? String(bank.code) : "";
    var name = bank && bank.name ? String(bank.name) : "";
    return code ? (code + " " + name) : name;
  }

  function getBranchDisplayLabel(branch) {
    var code = branch && branch.code ? String(branch.code).padStart(3, "0") : "";
    var name = branch && branch.name ? String(branch.name) : "";
    return code ? (code + " " + name) : name;
  }

  function createSuggestDropdown(inputEl, onSelect) {
    var ul = document.createElement("ul");
    ul.style.position = "absolute";
    ul.style.zIndex = "1000";
    ul.style.left = "0";
    ul.style.right = "0";
    ul.style.top = "calc(100% + 6px)";
    ul.style.maxHeight = "240px";
    ul.style.overflow = "auto";
    ul.style.borderRadius = "12px";
    ul.style.border = "1px solid rgba(255,255,255,0.12)";
    ul.style.background = "#0b1220";
    ul.style.padding = "6px";
    ul.style.boxShadow = "0 10px 30px rgba(0,0,0,0.35)";
    ul.style.display = "none";

    var wrap = inputEl.parentNode;
    if (wrap) {
      wrap.style.position = "relative";
      wrap.appendChild(ul);
    }

    function show(items) {
      ul.innerHTML = "";
      if (!items || !items.length) { hide(); return; }
      ul.style.display = "block";
      items.forEach(function(item, idx) {
        var li = document.createElement("li");
        li.style.padding = "10px 10px";
        li.style.borderRadius = "10px";
        li.style.cursor = "pointer";
        li.style.color = "rgba(255,255,255,0.92)";
        li.textContent = item.label || "";
        li.setAttribute("data-index", idx);
        li.addEventListener("mousedown", function(e) {
          e.preventDefault();
          onSelect(item);
          hide();
        });
        ul.appendChild(li);
      });
    }
    function hide() { ul.style.display = "none"; }
    return { show: show, hide: hide, ul: ul };
  }

  // ============================================================
  // 追加UI: 公開プロフィールの固定項目ロック / アピール例文 / 送信待機メッセージ
  // ============================================================

  function lockElForViewOnly(el) {
    if (!el) return;
    if (el.getAttribute("data-view-only") === "1") return;
    el.setAttribute("data-view-only", "1");
    el.setAttribute("aria-disabled", "true");
    el.style.pointerEvents = "none";
    el.tabIndex = -1;
  }

  function lockPublicFixedFields() {
    // 公開プロフィールの「確定項目」は編集不可（ただし disabled にしない＝送信に含めるため）
    var publicPrefecture = document.getElementById("publicPrefecture");
    var publicCity = document.getElementById("publicCity");
    var publicCityManual = document.getElementById("publicCityManual");

    lockElForViewOnly(publicPrefecture);
    lockElForViewOnly(publicCity);

    if (publicCityManual) {
      if (publicCityManual.getAttribute("data-view-only") !== "1") {
        publicCityManual.setAttribute("data-view-only", "1");
        publicCityManual.readOnly = true;
        publicCityManual.setAttribute("aria-disabled", "true");
        publicCityManual.style.pointerEvents = "none";
        publicCityManual.tabIndex = -1;
      }
    }
  }

  function insertAfter(el, node) {
    if (!el || !el.parentNode) return;
    if (el.nextSibling) el.parentNode.insertBefore(node, el.nextSibling);
    else el.parentNode.appendChild(node);
  }

  function ensurePublicAppealExamples() {
    var ta = document.getElementById("publicAppeal");
    if (!ta) return;
    if (document.getElementById("publicAppealExamples")) return;

    var wrap = document.createElement("div");
    wrap.id = "publicAppealExamples";
    wrap.style.marginTop = "10px";

    var title = document.createElement("div");
    title.style.fontSize = "12px";
    title.style.opacity = "0.75";
    title.style.marginBottom = "8px";
    title.textContent = "例文（クリックで入力／追加できます）";
    wrap.appendChild(title);

    var btnRow = document.createElement("div");
    btnRow.style.display = "flex";
    btnRow.style.flexWrap = "wrap";
    btnRow.style.gap = "8px";

    function makeChip(label, value, mode) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = label;
      b.style.padding = "8px 10px";
      b.style.borderRadius = "999px";
      b.style.border = "1px solid rgba(255,255,255,0.14)";
      b.style.background = "rgba(255,255,255,0.06)";
      b.style.color = "rgba(255,255,255,0.92)";
      b.style.fontSize = "12px";
      b.style.fontWeight = "700";
      b.style.cursor = "pointer";

      b.addEventListener("click", function () {
        var cur = (ta.value || "").trim();
        var v = String(value || "").trim();
        if (!v) return;

        if (mode === "set") {
          ta.value = v;
          ta.focus();
          return;
        }

        if (!cur) {
          ta.value = v;
        } else {
          if (cur.indexOf(v) !== -1) return;
          ta.value = cur + "／" + v;
        }
        ta.focus();
      });

      return b;
    }

    btnRow.appendChild(makeChip("時間厳守", "時間厳守で対応します", "append"));
    btnRow.appendChild(makeChip("丁寧", "丁寧な対応・荷物の扱いを心がけています", "append"));
    btnRow.appendChild(makeChip("柔軟対応", "急なご依頼にもできる限り柔軟に対応します", "append"));
    btnRow.appendChild(makeChip("長距離OK", "長距離案件もご相談ください", "append"));
    btnRow.appendChild(makeChip("即レス", "連絡は早めに返します（チャットOK）", "append"));
    btnRow.appendChild(makeChip("夜間も可", "夜間帯の稼働もご相談ください", "append"));
    btnRow.appendChild(makeChip("清潔感", "車内外は清潔に保っています", "append"));
    btnRow.appendChild(makeChip("趣味", "趣味：ドライブ／アウトドア", "append"));

    btnRow.appendChild(makeChip(
      "例文を入れる",
      "【強み】時間厳守／丁寧対応／柔軟対応\n【対応】スポット・チャーターどちらもOK\n【エリア】山口県・北九州（周辺）\n【一言】まずはお気軽にご相談ください。",
      "set"
    ));

    wrap.appendChild(btnRow);

    var note = document.createElement("div");
    note.style.fontSize = "12px";
    note.style.opacity = "0.6";
    note.style.marginTop = "8px";
    note.textContent = "※公開は承認後（status=PUBLIC）に反映されます。";
    wrap.appendChild(note);

    insertAfter(ta, wrap);
  }

  function ensureSubmitWaitingNote() {
    var btn = document.getElementById("submitBtn");
    if (!btn) return;
    if (document.getElementById("submitWaitNote")) return;

    var note = document.createElement("div");
    note.id = "submitWaitNote";
    note.style.fontSize = "12px";
    note.style.opacity = "0.75";
    note.style.marginTop = "10px";
    note.style.display = "none";
    note.textContent = "写真の変換→送信の順で処理します。少し時間がかかることがあります。送信完了までこのままお待ちください。";

    insertAfter(btn, note);

    try {
      var form = btn.closest("form");
      if (form) {
        form.addEventListener("submit", function () {
          note.style.display = "block";
        }, true);
      }
    } catch (e) {}

    try {
      var mo = new MutationObserver(function () {
        if (btn.disabled) note.style.display = "block";
        else note.style.display = "none";
      });
      mo.observe(btn, { attributes: true, attributeFilter: ["disabled"] });
    } catch (e2) {}
  }

  function initExtraUI() {
    lockPublicFixedFields();
    ensurePublicAppealExamples();
    ensureSubmitWaitingNote();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initExtraUI);
  } else {
    initExtraUI();
  }

  window.FullRegisterEnhance = {
    CACHE_TTL_MS: CACHE_TTL_MS,
    FETCH_TIMEOUT_MS: FETCH_TIMEOUT_MS,
    getCitiesForPrefecture: getCitiesForPrefecture,
    loadBanksAll: loadBanksAll,
    loadBranchesForBank: loadBranchesForBank,
    filterSuggest: filterSuggest,
    createSuggestDropdown: createSuggestDropdown,
    getBankLabel: getBankLabel,
    getBranchDisplayLabel: getBranchDisplayLabel,
    getCache: getCache,
    setCache: setCache
  };
})();