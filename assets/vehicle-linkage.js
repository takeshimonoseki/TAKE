/**
 * 本登録で既に動いている「メーカー→軽のみ車種」確定リストを共通化。
 * 仮登録・本登録の両方から参照（重複コード禁止）。
 * 普通車は含めない。
 */
(function (global) {
  "use strict";

  /** 本登録 full-register.html で使用していた確定リスト（軽のみ） */
  var VEHICLE_LIGHT_ONLY = {
    "ダイハツ": ["ハイゼットカーゴ", "ハイゼットトラック", "アトレー"],
    "スズキ": ["エブリイ", "キャリイ"],
    "日産": ["NV100クリッパー"],
    "三菱": ["ミニキャブ"],
    "ホンダ": ["N-VAN"],
    "マツダ": ["スクラム"],
    "スバル": ["サンバー"]
  };

  /**
   * メーカー選択に応じて車種 select を更新し、disabled を切り替える。
   * メーカー未選択 → 車種は空＋placeholder＋disabled
   * メーカー選択 → 車種にそのメーカーの軽のみを表示し、disabled 解除
   * @param {HTMLSelectElement} makerSelect - メーカー select
   * @param {HTMLSelectElement} modelSelect - 車種 select
   */
  function updateLightVehicleSelect(makerSelect, modelSelect) {
    if (!modelSelect) return;
    var maker = (makerSelect && makerSelect.value) ? String(makerSelect.value).trim() : "";
    var models = VEHICLE_LIGHT_ONLY[maker] || [];

    modelSelect.innerHTML = "";
    var opt0 = document.createElement("option");
    opt0.value = "";
    opt0.textContent = models.length ? "選択してください" : "メーカーを選択すると車種が出ます";
    modelSelect.appendChild(opt0);

    models.forEach(function (m) {
      var opt = document.createElement("option");
      opt.value = m;
      opt.textContent = m;
      modelSelect.appendChild(opt);
    });

    modelSelect.disabled = !maker;
  }

  global.VehicleLinkage = {
    VEHICLE_LIGHT_ONLY: VEHICLE_LIGHT_ONLY,
    updateLightVehicleSelect: updateLightVehicleSelect
  };
})(typeof window !== "undefined" ? window : this);
