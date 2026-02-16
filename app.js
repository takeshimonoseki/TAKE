/**
 * app.js — お客様用HP: 運賃計算機（純粋関数＋UI）・送信同梱用payload
 * 式はメインホームページに無かったため暫定式で実装（定数化で差し替え可）
 */
(function () {
  "use strict";

  /* ─── 暫定定数（後で差し替え） ─── */
  var FARE = {
    A_BASE_KM: 20,
    A_BASE_UPTO_20: 6600,
    A_21_100_PER_KM: 220,
    A_100_KM: 80,
    A_OVER_100_PER_KM: 180,
    A_WORK_UNIT_MIN: 30,
    A_WORK_RATE: 1650,
    A_WAIT_FREE_MIN: 30,
    A_WAIT_RATE: 1650,
    B_BASE_HOURS: 8,
    B_BASE_KM: 100,
    B_BASE: 44000,
    B_OVER_TIME_UNIT: 30,
    B_OVER_TIME_RATE: 2750,
    B_OVER_KM_RATE: 220,
    C_BASE_HOURS: 8,
    C_BASE: 66000,
    C_OVER_TIME_UNIT: 30,
    C_OVER_TIME_RATE: 3300,
    NIGHT_RATIO: 1.2,
    LOAD_HOURS: { small: 0.5, medium: 1.0, large: 2.0 },
    STAIRS_HOUR_PER_FLOOR: 0.25
  };

  /**
   * 純粋関数: 入力 → A/B/C 金額と推奨
   * @param {Object} input - { distanceKm, driveHr, loadSize, pickupFloors, dropoffFloors, waitMin, night }
   * @returns {{ planA: number, planB: number, planC: number, recommended: 'A'|'B'|'C', recommendedAmount: number, breakdown: Object }}
   */
  function calculateFare(input) {
    var d = Number(input.distanceKm) || 0;
    var driveHr = Number(input.driveHr) || 0;
    var loadSize = (input.loadSize || "small").toLowerCase();
    var pickupFloors = Math.max(0, Math.floor(Number(input.pickupFloors) || 0));
    var dropoffFloors = Math.max(0, Math.floor(Number(input.dropoffFloors) || 0));
    var waitMin = Math.max(0, Math.floor(Number(input.waitMin) || 0));
    var night = !!input.night;

    var baseHr = FARE.LOAD_HOURS[loadSize] !== undefined ? FARE.LOAD_HOURS[loadSize] : FARE.LOAD_HOURS.small;
    var stairsHr = (Math.max(0, pickupFloors - 1) + Math.max(0, dropoffFloors - 1)) * FARE.STAIRS_HOUR_PER_FLOOR;
    var workHr = baseHr + stairsHr;

    function ceilToHalf(h) {
      return Math.ceil(h * 2) / 2;
    }
    function ceilTo30Min(min) {
      return Math.ceil(min / 30) * 30;
    }

    /* プランA */
    var planA = 0;
    if (d <= FARE.A_BASE_KM) {
      planA = FARE.A_BASE_UPTO_20;
    } else if (d <= 100) {
      planA = FARE.A_BASE_UPTO_20 + (d - FARE.A_BASE_KM) * FARE.A_21_100_PER_KM;
    } else {
      planA = FARE.A_BASE_UPTO_20 + (100 - FARE.A_BASE_KM) * FARE.A_21_100_PER_KM + (d - 100) * FARE.A_OVER_100_PER_KM;
    }
    var workUnits = Math.ceil((workHr * 60) / FARE.A_WORK_UNIT_MIN);
    planA += workUnits * FARE.A_WORK_RATE;
    if (waitMin > FARE.A_WAIT_FREE_MIN) {
      var billableWait = ceilTo30Min(waitMin - FARE.A_WAIT_FREE_MIN);
      planA += (billableWait / 30) * FARE.A_WAIT_RATE;
    }
    planA = Math.round(planA);

    /* プランB */
    var planB = FARE.B_BASE;
    var overTimeB = Math.max(0, (driveHr + workHr) - FARE.B_BASE_HOURS);
    if (overTimeB > 0) {
      planB += Math.ceil((overTimeB * 60) / FARE.B_OVER_TIME_UNIT) * FARE.B_OVER_TIME_RATE;
    }
    if (d > FARE.B_BASE_KM) {
      planB += (d - FARE.B_BASE_KM) * FARE.B_OVER_KM_RATE;
    }
    planB = Math.round(planB);

    /* プランC */
    var planC = FARE.C_BASE;
    var overTimeC = Math.max(0, (driveHr + workHr) - FARE.C_BASE_HOURS);
    if (overTimeC > 0) {
      planC += Math.ceil((overTimeC * 60) / FARE.C_OVER_TIME_UNIT) * FARE.C_OVER_TIME_RATE;
    }
    planC = Math.round(planC);

    if (night) {
      planA = Math.round(planA * FARE.NIGHT_RATIO);
      planB = Math.round(planB * FARE.NIGHT_RATIO);
      planC = Math.round(planC * FARE.NIGHT_RATIO);
    }

    var a = planA, b = planB, c = planC;
    var recommended = "A";
    var recommendedAmount = a;
    if (b < recommendedAmount) { recommended = "B"; recommendedAmount = b; }
    if (c < recommendedAmount) { recommended = "C"; recommendedAmount = c; }

    return {
      planA: a,
      planB: b,
      planC: c,
      recommended: recommended,
      recommendedAmount: recommendedAmount,
      breakdown: {
        workHr: workHr,
        baseHr: baseHr,
        stairsHr: stairsHr,
        driveHr: driveHr,
        waitMin: waitMin,
        night: night
      }
    };
  }

  /**
   * 見積テキスト（LINE貼り付け用）
   */
  function formatEstimateText(result, input) {
    var lines = [];
    lines.push("【運賃目安】");
    lines.push("距離: " + (input.distanceKm || "—") + "km");
    if (input.driveHr) lines.push("走行時間: " + input.driveHr + "h");
    lines.push("荷物: " + (input.loadSize === "medium" ? "中" : input.loadSize === "large" ? "大" : "小"));
    lines.push("プランA: ¥" + result.planA.toLocaleString());
    lines.push("プランB: ¥" + result.planB.toLocaleString());
    lines.push("プランC: ¥" + result.planC.toLocaleString());
    lines.push("推奨: プラン" + result.recommended + " ¥" + result.recommendedAmount.toLocaleString());
    return lines.join("\n");
  }

  /* ─── DOM と UI 初期化 ─── */
  var calcEl = document.getElementById("fareCalculator");
  if (!calcEl) return;

  var distanceEl = document.getElementById("fareDistance");
  var driveHrEl = document.getElementById("fareDriveHr");
  var loadSizeEl = document.getElementById("fareLoadSize");
  var pickupFloorsEl = document.getElementById("farePickupFloors");
  var dropoffFloorsEl = document.getElementById("fareDropoffFloors");
  var waitMinEl = document.getElementById("fareWaitMin");
  var nightEl = document.getElementById("fareNight");
  var outA = document.getElementById("fareOutA");
  var outB = document.getElementById("fareOutB");
  var outC = document.getElementById("fareOutC");
  var outRec = document.getElementById("fareOutRecommended");
  var outRecAmount = document.getElementById("fareOutRecommendedAmount");
  var breakdownWrap = document.getElementById("fareBreakdownWrap");
  var payloadHidden = document.getElementById("fareEstimatePayload");
  var btnCopy = document.getElementById("fareCopyText");

  function getInput() {
    return {
      distanceKm: distanceEl ? distanceEl.value : "",
      driveHr: driveHrEl ? driveHrEl.value : "0",
      loadSize: loadSizeEl ? loadSizeEl.value : "small",
      pickupFloors: pickupFloorsEl ? pickupFloorsEl.value : "0",
      dropoffFloors: dropoffFloorsEl ? dropoffFloorsEl.value : "0",
      waitMin: waitMinEl ? waitMinEl.value : "0",
      night: nightEl ? nightEl.checked : false
    };
  }

  function updateUI() {
    var input = getInput();
    var dist = parseFloat(input.distanceKm, 10);
    if (isNaN(dist) || dist <= 0) {
      if (outA) outA.textContent = "—";
      if (outB) outB.textContent = "—";
      if (outC) outC.textContent = "—";
      if (outRec) outRec.textContent = "—";
      if (outRecAmount) outRecAmount.textContent = "距離を入力";
      if (payloadHidden) payloadHidden.value = "";
      return;
    }
    var numInput = {
      distanceKm: dist,
      driveHr: parseFloat(input.driveHr, 10) || 0,
      loadSize: input.loadSize,
      pickupFloors: parseInt(input.pickupFloors, 10) || 0,
      dropoffFloors: parseInt(input.dropoffFloors, 10) || 0,
      waitMin: parseInt(input.waitMin, 10) || 0,
      night: input.night
    };
    var result = calculateFare(numInput);
    if (outA) outA.textContent = "¥" + result.planA.toLocaleString();
    if (outB) outB.textContent = "¥" + result.planB.toLocaleString();
    if (outC) outC.textContent = "¥" + result.planC.toLocaleString();
    if (outRec) outRec.textContent = "プラン" + result.recommended;
    if (outRecAmount) outRecAmount.textContent = "¥" + result.recommendedAmount.toLocaleString();
    if (payloadHidden) {
      try {
        payloadHidden.value = JSON.stringify({
          planA: result.planA,
          planB: result.planB,
          planC: result.planC,
          recommended: result.recommended,
          recommendedAmount: result.recommendedAmount,
          text: formatEstimateText(result, numInput)
        });
      } catch (e) {
        payloadHidden.value = "";
      }
    }
  }

  function addListeners() {
    var inputs = [distanceEl, driveHrEl, loadSizeEl, pickupFloorsEl, dropoffFloorsEl, waitMinEl, nightEl];
    inputs.forEach(function (el) {
      if (!el) return;
      el.addEventListener("input", updateUI);
      el.addEventListener("change", updateUI);
    });
    if (nightEl) nightEl.addEventListener("change", updateUI);
  }

  if (btnCopy) {
    btnCopy.addEventListener("click", function () {
      var input = getInput();
      var dist = parseFloat(input.distanceKm, 10);
      if (isNaN(dist) || dist <= 0) return;
      var numInput = {
        distanceKm: dist,
        driveHr: parseFloat(input.driveHr, 10) || 0,
        loadSize: input.loadSize,
        pickupFloors: parseInt(input.pickupFloors, 10) || 0,
        dropoffFloors: parseInt(input.dropoffFloors, 10) || 0,
        waitMin: parseInt(input.waitMin, 10) || 0,
        night: input.night
      };
      var result = calculateFare(numInput);
      var text = formatEstimateText(result, numInput);
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(function () {
            btnCopy.textContent = "コピーしました";
            setTimeout(function () { btnCopy.textContent = "見積テキストをコピー"; }, 2000);
          });
        } else {
          var ta = document.createElement("textarea");
          ta.value = text;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          document.body.removeChild(ta);
          btnCopy.textContent = "コピーしました";
          setTimeout(function () { btnCopy.textContent = "見積テキストをコピー"; }, 2000);
        }
      } catch (e) {}
    });
  }

  addListeners();
  updateUI();

  window.FareCalculator = { calculateFare: calculateFare, formatEstimateText: formatEstimateText };
})();
