// ① path: assets/vehicle-linkage.js
/**
 * 車両（軽のみ）: カスケード型 “単一入力” コンボボックス（Autocomplete Combobox）
 * - 目的：検索欄とプルダウンが二重に見える違和感をなくす（入力欄1つに統一）
 * - 裏では <select> を残し、値を同期する（既存の送信/保存ロジックを壊さない）
 *
 * 対象IDペア（存在するものだけ自動で有効化）:
 * - 仮登録:   #vehicleMaker -> #vehicleModel
 * - 本登録:   #maker        -> #model
<<<<<<< Updated upstream
<<<<<<< Updated upstream
 * - 公開用:   #publicMaker  -> #publicModel（上の選択と同一＝表示専用・編集不可）
 *
 * 既存互換:
 * - window.VehicleLinkage.updateLightVehicleSelect(makerSelect, modelSelect)
=======
=======
>>>>>>> Stashed changes
 * - 公開用:   #publicMaker  -> #publicModel（上と同一車両＝表示専用にする）
 *
 * 注意：
 * - 住所/銀行などは今回は触らない（車両だけ）
 * - 既存互換: window.VehicleLinkage.updateLightVehicleSelect(makerSelect, modelSelect)
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
 */
(function (global) {
  "use strict";

  // -----------------------------
  // 1) 軽のみ：メーカー→車種（現行中心）
  // -----------------------------
<<<<<<< Updated upstream
<<<<<<< Updated upstream
  var VEHICLE_LIGHT_ONLY = {
=======
  var VEHICLE_KEI_ONLY = {
>>>>>>> Stashed changes
=======
  var VEHICLE_KEI_ONLY = {
>>>>>>> Stashed changes
    "ダイハツ": [
      "アトレー",
      "ハイゼットカーゴ",
      "ハイゼットデッキバン",
      "ハイゼットトラック",
      "タント",
      "タントカスタム",
      "タントファンクロス",
      "ムーヴ",
      "ムーヴキャンバス",
      "タフト",
      "ミライース",
      "コペン"
    ],
    "スズキ": [
      "アルト",
      "ラパン",
      "ラパンLC",
      "ワゴンR",
      "ワゴンRスマイル",
      "ジムニー",
      "スペーシア",
      "スペーシア カスタム",
      "スペーシア ギア",
      "スペーシア ベース",
      "ハスラー",
      "ハスラー タフワイルド",
      "エブリイ",
      "エブリイワゴン",
      "キャリイ",
      "スーパーキャリイ"
    ],
    "ホンダ": [
      "N-BOX",
      "N-BOXカスタム",
      "N-WGN",
      "N-WGNカスタム",
      "N-ONE",
      "N-VAN",
      "N-VAN e:"
    ],
    "日産": [
      "デイズ",
      "ルークス",
      "サクラ",
      "クリッパーバン",
      "クリッパートラック",
<<<<<<< Updated upstream
<<<<<<< Updated upstream
      "クリッパーリオ",
      "NV100クリッパー"
=======
      "クリッパーリオ"
>>>>>>> Stashed changes
=======
      "クリッパーリオ"
>>>>>>> Stashed changes
    ],
    "三菱": [
      "eKワゴン",
      "eKクロス",
      "eKスペース",
      "デリカミニ",
      "eKクロスEV",
      "タウンボックス",
      "ミニキャブバン",
      "ミニキャブトラック",
      "ミニキャブEV"
    ],
    "マツダ": [
      "フレア",
      "フレアワゴン",
      "フレアクロスオーバー",
      "キャロル",
      "スクラムワゴン",
      "スクラムバン",
      "スクラムトラック"
    ],
    "スバル": [
      "ディアス",
      "シフォン",
      "シフォン カスタム",
      "シフォン トライ",
      "ステラ",
      "プレオプラス",
      "サンバーバン",
      "サンバートラック"
    ]
  };

  // -----------------------------
  // 2) ユーティリティ
  // -----------------------------
  function str(v) {
    return v === null || v === undefined ? "" : String(v);
  }

  function normalizeJP(s) {
    var t = str(s).trim();
    t = t.replace(/\u3000/g, " ");
    t = t.replace(/\s+/g, "");
    t = t.replace(/－/g, "-");
    return t.toLowerCase();
  }

  function uniq(arr) {
    var out = [];
    var seen = {};
    for (var i = 0; i < arr.length; i++) {
      var v = str(arr[i]).trim();
      if (!v) continue;
      if (seen[v]) continue;
      seen[v] = true;
      out.push(v);
    }
    return out;
  }

  function sortJP(arr) {
    var a = arr.slice();
    a.sort(function (x, y) {
      return str(x).localeCompare(str(y), "ja");
    });
    return a;
  }

  function getMakers() {
<<<<<<< Updated upstream
<<<<<<< Updated upstream
    return sortJP(Object.keys(VEHICLE_LIGHT_ONLY));
=======
    return sortJP(Object.keys(VEHICLE_KEI_ONLY));
>>>>>>> Stashed changes
=======
    return sortJP(Object.keys(VEHICLE_KEI_ONLY));
>>>>>>> Stashed changes
  }

  function getModels(maker) {
    var m = str(maker).trim();
<<<<<<< Updated upstream
<<<<<<< Updated upstream
    return uniq(VEHICLE_LIGHT_ONLY[m] || []);
=======
    return uniq(VEHICLE_KEI_ONLY[m] || []);
>>>>>>> Stashed changes
=======
    return uniq(VEHICLE_KEI_ONLY[m] || []);
>>>>>>> Stashed changes
  }

  function ensureOption(selectEl, value, label) {
    var opt = document.createElement("option");
    opt.value = value;
    opt.textContent = label;
    selectEl.appendChild(opt);
  }

  function rebuildMakerSelect(makerSelect) {
    if (!makerSelect) return;
    var makers = getMakers();
    var current = str(makerSelect.value).trim();

    makerSelect.innerHTML = "";
    ensureOption(makerSelect, "", "選択してください");

    for (var i = 0; i < makers.length; i++) {
      ensureOption(makerSelect, makers[i], makers[i]);
    }

<<<<<<< Updated upstream
<<<<<<< Updated upstream
    if (current && VEHICLE_LIGHT_ONLY[current]) makerSelect.value = current;
    else makerSelect.value = "";
  }

  // -----------------------------
  // 3) 既存互換: メーカー→車種（軽のみ）で select を作り直す
  // -----------------------------
=======
=======
>>>>>>> Stashed changes
    if (current && VEHICLE_KEI_ONLY[current]) makerSelect.value = current;
    else makerSelect.value = "";
  }

  // 既存互換：メーカー→車種（軽のみ）で select を作り直す
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
  function updateLightVehicleSelect(makerSelect, modelSelect) {
    if (!modelSelect) return;

    var maker = makerSelect && makerSelect.value ? str(makerSelect.value).trim() : "";
    var models = maker ? getModels(maker) : [];

    modelSelect.innerHTML = "";

    if (!maker) {
      ensureOption(modelSelect, "", "メーカーを選択すると車種が出ます");
      modelSelect.disabled = true;
      modelSelect.value = "";
      return;
    }

    ensureOption(modelSelect, "", "選択してください");
    for (var i = 0; i < models.length; i++) {
      ensureOption(modelSelect, models[i], models[i]);
    }

    modelSelect.disabled = false;
  }

  // -----------------------------
<<<<<<< Updated upstream
<<<<<<< Updated upstream
  // 4) 単一入力コンボボックス（input + listbox）を select に被せる
=======
  // 3) 単一入力コンボボックス（input + listbox）を select に被せる
>>>>>>> Stashed changes
=======
  // 3) 単一入力コンボボックス（input + listbox）を select に被せる
>>>>>>> Stashed changes
  // -----------------------------
  function addStyleOnce() {
    if (document.getElementById("keiComboboxStyle")) return;

    var css = ""
      + ".kei-combobox-wrap{position:relative;}"
      + ".kei-combobox-input{width:100%;}"
      + ".kei-combobox-list{position:absolute;z-index:9999;left:0;right:0;top:calc(100% + 6px);max-height:240px;overflow:auto;border:1px solid rgba(255,255,255,.15);background:rgba(15,23,42,.98);backdrop-filter:blur(6px);border-radius:10px;box-shadow:0 10px 30px rgba(0,0,0,.35);padding:6px;display:none;}"
      + ".kei-combobox-item{padding:10px 10px;border-radius:8px;cursor:pointer;font-size:14px;line-height:1.2;}"
      + ".kei-combobox-item[aria-selected='true']{background:rgba(59,130,246,.25);}"
      + ".kei-combobox-item:hover{background:rgba(59,130,246,.18);}"
<<<<<<< Updated upstream
<<<<<<< Updated upstream
      + ".kei-combobox-empty{padding:10px;color:rgba(255,255,255,.65);font-size:13px;}"
      + ".kei-readonly{pointer-events:none;}";
=======
      + ".kei-combobox-empty{padding:10px;color:rgba(255,255,255,.65);font-size:13px;}";
>>>>>>> Stashed changes
=======
      + ".kei-combobox-empty{padding:10px;color:rgba(255,255,255,.65);font-size:13px;}";
>>>>>>> Stashed changes
    var style = document.createElement("style");
    style.id = "keiComboboxStyle";
    style.textContent = css;
    document.head.appendChild(style);
  }

  function hideSelectButKeepValue(selectEl) {
    if (!selectEl) return;
    if (selectEl.getAttribute("data-kei-hidden-select") === "1") return;
    selectEl.style.display = "none";
    selectEl.setAttribute("data-kei-hidden-select", "1");
  }

  function retargetLabel(selectEl, newInputId) {
    if (!selectEl || !newInputId) return;
    var selector = "label[for='" + selectEl.id + "']";
    var label = document.querySelector(selector);
    if (label) label.setAttribute("for", newInputId);
  }

  function filterList(list, query) {
    var q = normalizeJP(query);
    if (!q) return list.slice();
    var out = [];
    for (var i = 0; i < list.length; i++) {
      if (normalizeJP(list[i]).indexOf(q) !== -1) out.push(list[i]);
    }
    return out;
  }

  function exactOrSingle(list, query) {
    var q = normalizeJP(query);
    if (!q) return "";
    var exact = "";
    for (var i = 0; i < list.length; i++) {
      if (normalizeJP(list[i]) === q) exact = list[i];
    }
    if (exact) return exact;

    var filtered = filterList(list, query);
    if (filtered.length === 1) return filtered[0];
    return "";
  }

  function createSingleFieldComboboxForSelect(selectEl, opts) {
    if (!selectEl) return null;
    if (selectEl.__keiCombobox) return selectEl.__keiCombobox;

    addStyleOnce();

    var inputId = selectEl.id + "__combo";
    var listId = selectEl.id + "__listbox";

    var wrap = document.createElement("div");
    wrap.className = "kei-combobox-wrap";
    wrap.setAttribute("data-kei-wrap-for", selectEl.id);

    var input = document.createElement("input");
    input.type = "text";
    input.id = inputId;
    input.className = (opts && opts.inputClass) ? opts.inputClass : "field-input";
    input.classList.add("kei-combobox-input");
    input.autocomplete = "off";
    input.placeholder = (opts && opts.placeholder) ? opts.placeholder : "入力して選択";

    var readOnly = !!(opts && opts.readOnly);
    if (readOnly) {
      input.readOnly = true;
<<<<<<< Updated upstream
<<<<<<< Updated upstream
      input.tabIndex = -1;
      input.classList.add("kei-readonly");
      input.setAttribute("aria-readonly", "true");
      input.setAttribute("aria-disabled", "true");
=======
      input.setAttribute("aria-readonly", "true");
>>>>>>> Stashed changes
=======
      input.setAttribute("aria-readonly", "true");
>>>>>>> Stashed changes
    }

    input.setAttribute("role", "combobox");
    input.setAttribute("aria-expanded", "false");
    input.setAttribute("aria-controls", listId);
    input.setAttribute("aria-autocomplete", "list");
    input.setAttribute("aria-haspopup", "listbox");

    var listbox = document.createElement("div");
    listbox.id = listId;
    listbox.className = "kei-combobox-list";
    listbox.setAttribute("role", "listbox");

    selectEl.parentNode.insertBefore(wrap, selectEl);
    wrap.appendChild(input);
    wrap.appendChild(listbox);

    hideSelectButKeepValue(selectEl);
    retargetLabel(selectEl, inputId);

    var state = {
      open: false,
      activeIndex: -1,
      items: [],
      disabled: false,
      readOnly: readOnly
    };

    function setExpanded(v) {
      if (state.readOnly) v = false;
      input.setAttribute("aria-expanded", v ? "true" : "false");
      listbox.style.display = v ? "block" : "none";
      state.open = v;
      if (!v) {
        state.activeIndex = -1;
        input.removeAttribute("aria-activedescendant");
      }
    }

    function clearListbox() {
      while (listbox.firstChild) listbox.removeChild(listbox.firstChild);
      state.items = [];
      state.activeIndex = -1;
      input.removeAttribute("aria-activedescendant");
    }

    function renderList(items) {
      clearListbox();

      if (!items || items.length === 0) {
        var empty = document.createElement("div");
        empty.className = "kei-combobox-empty";
        empty.textContent = "該当なし";
        listbox.appendChild(empty);
        return;
      }

      for (var i = 0; i < items.length; i++) {
        var item = document.createElement("div");
        item.className = "kei-combobox-item";
        item.setAttribute("role", "option");
        item.setAttribute("aria-selected", "false");
        item.id = listId + "__opt_" + i;
        item.textContent = items[i];

        (function (value) {
          item.addEventListener("mousedown", function (ev) {
            ev.preventDefault();
            selectValue(value, true);
          });
        })(items[i]);

        listbox.appendChild(item);
        state.items.push(item);
      }
    }

    function updateActiveIndex(nextIndex) {
      if (!state.items || state.items.length === 0) return;

      if (nextIndex < 0) nextIndex = 0;
      if (nextIndex >= state.items.length) nextIndex = state.items.length - 1;

      for (var i = 0; i < state.items.length; i++) {
        state.items[i].setAttribute("aria-selected", i === nextIndex ? "true" : "false");
      }
      state.activeIndex = nextIndex;
      input.setAttribute("aria-activedescendant", state.items[nextIndex].id);

      var el = state.items[nextIndex];
      if (el && typeof el.scrollIntoView === "function") {
        el.scrollIntoView({ block: "nearest" });
      }
    }

    function getOptionsList() {
      if (opts && typeof opts.getOptions === "function") {
        var arr = opts.getOptions();
        return Array.isArray(arr) ? arr : [];
      }
      var out = [];
      for (var i = 0; i < selectEl.options.length; i++) {
        var v = str(selectEl.options[i].value).trim();
        if (!v) continue;
        out.push(v);
      }
      return out;
    }

    function setDisabled(v) {
      state.disabled = !!v;
      input.disabled = state.disabled;
      if (state.disabled) {
        input.value = "";
        setExpanded(false);
      }
    }

    function syncInputFromSelect() {
      input.value = str(selectEl.value).trim();
      setDisabled(selectEl.disabled);
    }

    function syncSelectFromValue(value, triggerChange) {
      var v = str(value).trim();
      selectEl.value = v;
      if (triggerChange) {
        selectEl.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }

    function selectValue(value, closeAfter) {
      var v = str(value).trim();
      input.value = v;
      syncSelectFromValue(v, true);
      if (closeAfter) setExpanded(false);
    }

    function openAndRender(query) {
      if (state.disabled || state.readOnly) return;
      var list = getOptionsList();
      var filtered = filterList(list, query);
      renderList(filtered);
      setExpanded(true);
      updateActiveIndex(filtered.length > 0 ? 0 : -1);
    }

    function tryAutoPickOnBlur() {
      if (state.disabled || state.readOnly) return;
      var list = getOptionsList();
      var pick = exactOrSingle(list, input.value);
      if (pick) {
        selectValue(pick, true);
      } else {
        input.value = "";
        syncSelectFromValue("", true);
        setExpanded(false);
      }
    }

    input.addEventListener("focus", function () {
      if (state.disabled || state.readOnly) return;
      openAndRender(input.value);
    });

    input.addEventListener("input", function () {
      if (state.disabled || state.readOnly) return;
      openAndRender(input.value);
    });

    input.addEventListener("keydown", function (ev) {
      if (state.disabled || state.readOnly) return;

      if (ev.key === "ArrowDown") {
        ev.preventDefault();
        if (!state.open) openAndRender(input.value);
        else updateActiveIndex(state.activeIndex + 1);
        return;
      }
      if (ev.key === "ArrowUp") {
        ev.preventDefault();
        if (!state.open) openAndRender(input.value);
        else updateActiveIndex(state.activeIndex - 1);
        return;
      }
      if (ev.key === "Enter") {
        if (!state.open) {
          var list = getOptionsList();
          var pick = exactOrSingle(list, input.value);
          if (pick) {
            ev.preventDefault();
            selectValue(pick, true);
          }
          return;
        }
        ev.preventDefault();
        if (state.items && state.items.length > 0 && state.activeIndex >= 0) {
          var pickedText = state.items[state.activeIndex].textContent;
          selectValue(pickedText, true);
        }
        return;
      }
      if (ev.key === "Escape") {
        ev.preventDefault();
        setExpanded(false);
        return;
      }
    });

    input.addEventListener("blur", function () {
      setTimeout(function () {
        if (!state.open) return;
        tryAutoPickOnBlur();
      }, 120);
    });

    document.addEventListener("mousedown", function (ev) {
      if (!wrap.contains(ev.target)) setExpanded(false);
    });

    syncInputFromSelect();

    var api = {
      input: input,
      listbox: listbox,
      refreshFromSelect: syncInputFromSelect,
      setDisabled: setDisabled
    };

    selectEl.__keiCombobox = api;
    return api;
  }

  // -----------------------------
<<<<<<< Updated upstream
<<<<<<< Updated upstream
  // 5) カスケード（メーカー→車種）を “単一入力” で初期化
  // -----------------------------
  function initCascadingKeiComboboxPair(makerSelect, modelSelect, opts) {
    if (!makerSelect || !modelSelect) return null;
    if (makerSelect.getAttribute("data-kei-cascade-init") === "1") return null;
=======
=======
>>>>>>> Stashed changes
  // 4) カスケード（メーカー→車種）を “単一入力” で初期化
  // -----------------------------
  function initCascadingKeiComboboxPair(makerSelect, modelSelect, opts) {
    if (!makerSelect || !modelSelect) return;
    if (makerSelect.getAttribute("data-kei-cascade-init") === "1") return;
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
    makerSelect.setAttribute("data-kei-cascade-init", "1");

    rebuildMakerSelect(makerSelect);

    var makerCombo = createSingleFieldComboboxForSelect(makerSelect, {
      inputClass: makerSelect.className || "field-input",
      placeholder: "メーカーを入力して選択",
      getOptions: function () { return getMakers(); },
      readOnly: !!(opts && opts.makerReadOnly)
    });

    updateLightVehicleSelect(makerSelect, modelSelect);

    var modelCombo = createSingleFieldComboboxForSelect(modelSelect, {
      inputClass: modelSelect.className || "field-input",
      placeholder: "車種を入力して選択",
      getOptions: function () {
        var maker = str(makerSelect.value).trim();
        if (!maker) return [];
        return getModels(maker);
      },
      readOnly: !!(opts && opts.modelReadOnly)
    });

    if (!str(makerSelect.value).trim()) {
      modelSelect.disabled = true;
      if (modelCombo) modelCombo.setDisabled(true);
    } else {
      modelSelect.disabled = false;
      if (modelCombo) modelCombo.setDisabled(false);
    }

<<<<<<< Updated upstream
<<<<<<< Updated upstream
    if (!(opts && opts.makerReadOnly)) {
      makerSelect.addEventListener("change", function () {
        updateLightVehicleSelect(makerSelect, modelSelect);

=======
=======
>>>>>>> Stashed changes
    var makerReadOnly = !!(opts && opts.makerReadOnly);
    if (!makerReadOnly) {
      makerSelect.addEventListener("change", function () {
        updateLightVehicleSelect(makerSelect, modelSelect);
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
        modelSelect.value = "";
        if (modelCombo && modelCombo.input) modelCombo.input.value = "";

        if (!str(makerSelect.value).trim()) {
          modelSelect.disabled = true;
          if (modelCombo) modelCombo.setDisabled(true);
        } else {
          modelSelect.disabled = false;
          if (modelCombo) modelCombo.setDisabled(false);
        }
      });
    }
<<<<<<< Updated upstream
<<<<<<< Updated upstream

    return { makerCombo: makerCombo, modelCombo: modelCombo };
  }

  // -----------------------------
  // 6) select の値がプログラムから変わっても、表示（input）が追従するように監視
=======
=======
>>>>>>> Stashed changes
  }

  // -----------------------------
  // 5) プログラムから select.value が変わった時も表示が追従するようにする（監視）
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
  // -----------------------------
  var watchStarted = false;
  function startWatchLoop() {
    if (watchStarted) return;
    watchStarted = true;

    var last = new Map();

    setInterval(function () {
      try {
        if (document.hidden) return;
      } catch (e) {}

      var selects = document.querySelectorAll("select[data-kei-hidden-select='1']");
      for (var i = 0; i < selects.length; i++) {
        var s = selects[i];
        var combo = s.__keiCombobox;
        if (!combo) continue;

        var key = s.id;
        var val = str(s.value);
        var dis = !!s.disabled;
        var prev = last.get(key);

        if (!prev || prev.v !== val || prev.d !== dis) {
          last.set(key, { v: val, d: dis });
          try { combo.refreshFromSelect(); } catch (e2) {}
        }
      }
    }, 200);
  }

<<<<<<< Updated upstream
<<<<<<< Updated upstream
  // -----------------------------
  // 7) 本登録：上（maker/model）→ 公開（publicMaker/publicModel）へ同期（保険）
  // -----------------------------
  function bindMirrorOnce(mainMaker, mainModel, pubMaker, pubModel) {
    if (!mainMaker || !mainModel || !pubMaker || !pubModel) return;
    if (mainMaker.getAttribute("data-kei-mirror") === "1") return;
    mainMaker.setAttribute("data-kei-mirror", "1");

    function mirror() {
      try {
        pubMaker.value = mainMaker.value;
        updateLightVehicleSelect(pubMaker, pubModel);
        pubModel.value = mainModel.value;
      } catch (e) {}
    }

    mainMaker.addEventListener("change", mirror);
    mainModel.addEventListener("change", mirror);
    mirror();
  }

  function autoInit() {
    // 仮登録
=======
  function autoInit() {
>>>>>>> Stashed changes
=======
  function autoInit() {
>>>>>>> Stashed changes
    var vm = document.getElementById("vehicleMaker");
    var vmod = document.getElementById("vehicleModel");
    if (vm && vmod) initCascadingKeiComboboxPair(vm, vmod, { makerReadOnly: false, modelReadOnly: false });

<<<<<<< Updated upstream
<<<<<<< Updated upstream
    // 本登録
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
    var m = document.getElementById("maker");
    var mod = document.getElementById("model");
    if (m && mod) initCascadingKeiComboboxPair(m, mod, { makerReadOnly: false, modelReadOnly: false });

<<<<<<< Updated upstream
<<<<<<< Updated upstream
    // 公開用（表示専用）
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
    var pm = document.getElementById("publicMaker");
    var pmod = document.getElementById("publicModel");
    if (pm && pmod) initCascadingKeiComboboxPair(pm, pmod, { makerReadOnly: true, modelReadOnly: true });

<<<<<<< Updated upstream
<<<<<<< Updated upstream
    // 同期（保険）
    if (m && mod && pm && pmod) bindMirrorOnce(m, mod, pm, pmod);

=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
    startWatchLoop();
  }

  function onReady(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  global.VehicleLinkage = {
<<<<<<< Updated upstream
<<<<<<< Updated upstream
    VEHICLE_LIGHT_ONLY: VEHICLE_LIGHT_ONLY,
=======
    VEHICLE_LIGHT_ONLY: VEHICLE_KEI_ONLY,
>>>>>>> Stashed changes
=======
    VEHICLE_LIGHT_ONLY: VEHICLE_KEI_ONLY,
>>>>>>> Stashed changes
    updateLightVehicleSelect: updateLightVehicleSelect,
    initCascadingKeiComboboxPair: initCascadingKeiComboboxPair,
    autoInit: autoInit
  };

  onReady(autoInit);

})(typeof window !== "undefined" ? window : this);