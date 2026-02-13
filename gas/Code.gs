/**
 * 協力ドライバー登録フォーム用 GAS Webアプリ
 *
 * 【埋め込み固定値】
 *   SHEET_ID, SHEET_TAB, DRIVE_FOLDER_ID, ADMIN_EMAIL, ADMIN_LINE_USER_ID
 *
 * 【Script Properties】（シークレット・直書き禁止）
 *   LINE_CHANNEL_ACCESS_TOKEN - LINE Messaging API のチャネルアクセストークン
 *
 * デプロイ: 種類「Web アプリ」／実行ユーザー「自分」／アクセス「全員」
 * デプロイ後のURLを config.js の GAS_ENDPOINT に貼る。
 */

var SHEET_ID = "1mEPSJsN0Pt1GULgLIBqQXyUQg-L7a4QCvSLMvADejN8";
var SHEET_TAB = "Drivers";
var DRIVE_FOLDER_ID = "1jJeND1RbxHS0rcCUJC116um2VL-UXAiC";
var ADMIN_EMAIL = "takeshimonoseki@gmail.com";
var ADMIN_LINE_USER_ID = "U94fa1bd99a801f9d531193705c108b65";

var MAX_FILE_BYTES = 5 * 1024 * 1024;

var DRIVER_HEADERS = [
  "driver_id",
  "created_at",
  "nickname",
  "city",
  "vehicle_type",
  "availability",
  "specialties",
  "profile",
  "fullName",
  "address",
  "contactPhone",
  "contactEmail",
  "contactLineName",
  "bankName",
  "bankBranch",
  "bankAccountType",
  "bankAccountNumber",
  "bankAccountHolder",
  "autoInsurance",
  "cargoInsurance",
  "insuranceCompany",
  "insurancePolicyNumber",
  "license_front_url",
  "license_back_url",
  "vehicle_inspection_url",
  "vehicle_inspection_file_id",
  "vehicle_photo1_url",
  "vehicle_photo2_url",
  "cargo_insurance_file_url",
  "notification_line_status",
  "notification_email_status",
  "notification_error_message",
  "extra_files_note",
  "black_plate_pledge",
  "terms_agreed"
];

function doPost(e) {
  var result = { ok: false };
  try {
    var raw = e.postData && e.postData.contents ? e.postData.contents : "";
    var body = JSON.parse(raw);
    var type = body.type;

    if (type === "driver_register") {
      result = handleDriverRegister(body);
    } else if (type === "driver_files") {
      result = handleDriverFiles(body);
    } else if (type === "vehicle_consult") {
      result = handleVehicleConsult(body);
    } else {
      result.error = "unknown_type";
    }
  } catch (err) {
    result.error = "parse_or_runtime";
    result.message = err.toString();
    Logger.log("doPost error: " + err.toString());
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  var result = { ok: false, drivers: [] };
  try {
    var sheet = getDriverSheet();
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    }
    var data = sheet.getDataRange().getValues();
    if (data.length < 2) {
      result.ok = true;
      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    }
    var headers = data[0];
    var driverIdIdx = headers.indexOf("driver_id");
    var nicknameIdx = headers.indexOf("nickname");
    var cityIdx = headers.indexOf("city");
    var vehicleTypeIdx = headers.indexOf("vehicle_type");
    var availabilityIdx = headers.indexOf("availability");
    var specialtiesIdx = headers.indexOf("specialties");
    var profileIdx = headers.indexOf("profile");
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      result.drivers.push({
        driver_id: driverIdIdx >= 0 ? row[driverIdIdx] : "",
        nickname: nicknameIdx >= 0 ? row[nicknameIdx] : "",
        city: cityIdx >= 0 ? row[cityIdx] : "",
        vehicle_type: vehicleTypeIdx >= 0 ? row[vehicleTypeIdx] : "",
        availability: availabilityIdx >= 0 ? (row[availabilityIdx] ? String(row[availabilityIdx]).split(" ") : []) : [],
        specialties: specialtiesIdx >= 0 ? (row[specialtiesIdx] ? String(row[specialtiesIdx]).split(" ") : []) : [],
        profile: profileIdx >= 0 ? row[profileIdx] : ""
      });
    }
    result.ok = true;
  } catch (err) {
    Logger.log("doGet error: " + err.toString());
  }
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function getLineChannelAccessToken() {
  return PropertiesService.getScriptProperties().getProperty("LINE_CHANNEL_ACCESS_TOKEN") || "";
}

function getDriverSheet() {
  try {
    var spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    var sheet = spreadsheet.getSheetByName(SHEET_TAB);
    if (!sheet) {
      sheet = spreadsheet.insertSheet(SHEET_TAB);
      sheet.getRange(1, 1, 1, DRIVER_HEADERS.length).setValues([DRIVER_HEADERS]);
      sheet.getRange(1, 1, 1, DRIVER_HEADERS.length).setFontWeight("bold");
    } else if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, DRIVER_HEADERS.length).setValues([DRIVER_HEADERS]);
      sheet.getRange(1, 1, 1, DRIVER_HEADERS.length).setFontWeight("bold");
    }
    return sheet;
  } catch (e) {
    Logger.log("getDriverSheet: " + e.toString());
    return null;
  }
}

function pushLineMessage(userId, text) {
  var token = getLineChannelAccessToken();
  if (!token) return false;
  try {
    UrlFetchApp.fetch("https://api.line.me/v2/bot/message/push", {
      method: "post",
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json"
      },
      payload: JSON.stringify({
        to: userId,
        messages: [{ type: "text", text: text }]
      })
    });
    return true;
  } catch (e) {
    Logger.log("LINE push error: " + e.toString());
    return false;
  }
}

function handleDriverRegister(body) {
  var data = body.data || {};
  var sheet = getDriverSheet();
  if (!sheet) return { ok: false, error: "sheet_not_found", message: "スプレッドシートの設定を確認してください。" };

  var driverId = "D" + new Date().getTime() + "-" + Math.random().toString(36).slice(2, 8);
  var createdAt = new Date().toISOString();

  var licenseFrontUrl = "";
  var licenseBackUrl = "";
  var vehicleInspectionUrl = "";
  var vehicleInspectionFileId = "";
  var vehiclePhoto1Url = "";
  var vehiclePhoto2Url = "";
  var cargoInsuranceFileUrl = "";

  var folder = null;
  try {
    folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  } catch (e) {}

  if (folder && body.licenseFront && body.licenseFront.data) {
    var subFolder;
    try {
      subFolder = folder.createFolder(driverId);
    } catch (e) {
      subFolder = folder;
    }
    if (body.licenseFront && body.licenseFront.data) {
      var f = saveBase64ReturnFile(subFolder, "免許証_表.jpg", body.licenseFront.data);
      if (f) licenseFrontUrl = f.getUrl();
    }
    if (body.licenseBack && body.licenseBack.data) {
      f = saveBase64ReturnFile(subFolder, "免許証_裏.jpg", body.licenseBack.data);
      if (f) licenseBackUrl = f.getUrl();
    }
    if (body.vehicleInspection && body.vehicleInspection.data) {
      f = saveBase64ReturnFile(subFolder, "車検証." + getExt(body.vehicleInspection.name || "jpg"), body.vehicleInspection.data);
      if (f) {
        vehicleInspectionUrl = f.getUrl();
        vehicleInspectionFileId = f.getId();
      }
    }
    if (body.vehiclePhoto1 && body.vehiclePhoto1.data) {
      f = saveBase64ReturnFile(subFolder, "車両1.jpg", body.vehiclePhoto1.data);
      if (f) vehiclePhoto1Url = f.getUrl();
    }
    if (body.vehiclePhoto2 && body.vehiclePhoto2.data) {
      f = saveBase64ReturnFile(subFolder, "車両2.jpg", body.vehiclePhoto2.data);
      if (f) vehiclePhoto2Url = f.getUrl();
    }
    if (body.autoInsuranceFile && body.autoInsuranceFile.data) {
      saveBase64(subFolder, "自賠責証券." + getExt(body.autoInsuranceFile.name), body.autoInsuranceFile.data);
    }
    if (body.cargoInsuranceFile && body.cargoInsuranceFile.data) {
      f = saveBase64ReturnFile(subFolder, "貨物保険." + getExt(body.cargoInsuranceFile.name), body.cargoInsuranceFile.data);
      if (f) cargoInsuranceFileUrl = f.getUrl();
    }
  }

  var lineStatus = "";
  var emailStatus = "";
  var errMsg = "";

  var row = [
    driverId,
    createdAt,
    data.nickname || "",
    data.city || "",
    data.vehicle_type || data.vehicle || "",
    data.availability ? (Array.isArray(data.availability) ? data.availability.join(" ") : data.availability) : "",
    data.specialties ? (Array.isArray(data.specialties) ? data.specialties.join(" ") : data.specialties) : "",
    (data.profile || "").slice(0, 1000),
    data.fullName || (data.lastName + " " + data.firstName) || "",
    data.address || "",
    data.contactPhone || "",
    data.contactEmail || "",
    data.contactLineName || "",
    data.bankName || "",
    data.bankBranch || "",
    data.bankAccountType || "",
    data.bankAccountNumber || "",
    data.bankAccountHolder || "",
    data.autoInsurance || "",
    data.cargoInsurance || "",
    data.insuranceCompany || "",
    data.insurancePolicyNumber || "",
    licenseFrontUrl,
    licenseBackUrl,
    vehicleInspectionUrl,
    vehicleInspectionFileId,
    vehiclePhoto1Url,
    vehiclePhoto2Url,
    cargoInsuranceFileUrl,
    lineStatus,
    emailStatus,
    errMsg,
    "",
    data.black_plate_pledge ? "1" : "0",
    data.terms_agreed ? "1" : "0"
  ];

  sheet.appendRow(row);

  var vehicleInfo = (data.vehicle_type || data.vehicle || "") + (data.vehicleOther ? " " + data.vehicleOther : "");
  var insuranceInfo = "自賠責:" + (data.autoInsurance || "—") + " 貨物:" + (data.cargoInsurance || "—");

  var lineText = "【協力ドライバー新規登録】\n" +
    "日時: " + createdAt + "\n" +
    "ニックネーム: " + (data.nickname || "—") + "\n" +
    "市町村: " + (data.city || "—") + "\n" +
    "稼働エリア: " + (data.availability ? (Array.isArray(data.availability) ? data.availability.join(",") : data.availability) : "—") + "\n" +
    "車両: " + vehicleInfo + "\n" +
    "保険: " + insuranceInfo + "\n" +
    "車検証: " + (vehicleInspectionUrl || "—") + "\n" +
    "ID: " + driverId;

  if (pushLineMessage(ADMIN_LINE_USER_ID, lineText)) {
    lineStatus = "ok";
  } else {
    lineStatus = "failed";
    errMsg = "LINE:" + (getLineChannelAccessToken() ? "push失敗" : "トークン未設定");
    Logger.log("LINE push failed");
  }

  try {
    MailApp.sendEmail({
      to: ADMIN_EMAIL,
      subject: "協力ドライバー新規登録: " + (data.nickname || driverId),
      body: lineText + "\n\n--\n登録フォームから送信されました。"
    });
    emailStatus = "ok";
  } catch (mailErr) {
    emailStatus = "failed";
    errMsg = (errMsg ? errMsg + "; " : "") + "Mail:" + mailErr.toString();
    Logger.log("Mail error: " + mailErr.toString());
  }

  var lastRow = sheet.getLastRow();
  if (lastRow > 0) {
    sheet.getRange(lastRow, 30).setValue(lineStatus);
    sheet.getRange(lastRow, 31).setValue(emailStatus);
    sheet.getRange(lastRow, 32).setValue(errMsg);
  }

  return { ok: true, receiptId: driverId, driver_id: driverId };
}

function handleDriverFiles(body) {
  var receiptId = body.receiptId || body.driver_id;
  if (!receiptId) return { ok: false, error: "no_receipt_id" };

  var folder;
  try {
    var main = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    var it = main.getFoldersByName(receiptId);
    folder = it.hasNext() ? it.next() : main.createFolder(receiptId);
  } catch (e) {
    return { ok: false, error: "drive_error" };
  }

  if (body.extraFile1 && body.extraFile1.data) saveBase64(folder, "追加1_" + (body.extraFile1.name || "file"), body.extraFile1.data);
  if (body.extraFile2 && body.extraFile2.data) saveBase64(folder, "追加2_" + (body.extraFile2.name || "file"), body.extraFile2.data);
  if (body.extraFile3 && body.extraFile3.data) saveBase64(folder, "追加3_" + (body.extraFile3.name || "file"), body.extraFile3.data);

  var sheet = getDriverSheet();
  if (sheet) {
    var lastRow = sheet.getLastRow();
    for (var r = 1; r <= lastRow; r++) {
      if (sheet.getRange(r, 1).getValue() === receiptId) {
        sheet.getRange(r, 33).setValue("追加書類受付済 " + new Date().toISOString());
        break;
      }
    }
  }

  return { ok: true, receiptId: receiptId };
}

function handleVehicleConsult(body) {
  var data = body.data || {};
  var spreadsheet = SpreadsheetApp.openById(SHEET_ID);
  var sheet = spreadsheet.getSheetByName("車両相談");
  if (!sheet) sheet = spreadsheet.insertSheet("車両相談");
  var consultId = "V" + new Date().getTime() + "-" + Math.random().toString(36).slice(2, 8);
  var row = [consultId, new Date().toISOString(), data.use || "", data.budget || "", data.maker || "", data.model || "", data.remark || "", data.delivery || "", data.contact || ""];
  sheet.appendRow(row);
  return { ok: true, receiptId: consultId };
}

function saveBase64(folder, fileName, base64Data) {
  if (!base64Data || base64Data.length > MAX_FILE_BYTES * 1.4) return;
  var blob = Utilities.newBlob(Utilities.base64Decode(base64Data), "application/octet-stream", fileName);
  folder.createFile(blob);
}

function saveBase64ReturnFile(folder, fileName, base64Data) {
  if (!base64Data || base64Data.length > MAX_FILE_BYTES * 1.4) return null;
  var blob = Utilities.newBlob(Utilities.base64Decode(base64Data), "application/octet-stream", fileName);
  return folder.createFile(blob);
}

function getExt(name) {
  if (!name) return "jpg";
  var i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i).toLowerCase() : "jpg";
}
