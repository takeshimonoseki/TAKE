// FILE: config.js（全文）
// drivers-site 共通設定（LINEは公式アカウントに統一）
window.CONFIG = {
  REGION_LABEL: "山口県",
  REGIONS: ["山口県", "福岡県"],
  COMPANY_NAME: "軽貨物TAKE",
  TEL: "09078834125",

  // ✅ 友だち追加（単純リンク用：ボタンがただLINEを開くだけの時に使える）
  LINE_URL: "https://line.me/R/ti/p/%40277rcesk",

  // ✅ 公式アカウントのベーシックID（メッセージ下書き送信で使用）
  LINE_OA_ID: "@277rcesk",

  EMAIL_TO: "takeshimonoseki@gmail.com",

  // GAS WebアプリのURL（あなたの現状値を保持）
  GAS_WEBAPP_URL: "https://script.google.com/macros/s/AKfycbwzSFlI7k_eUkHzCyMY8isEyhOCSMrdAovFM2g7XGFZAfA9_3LS2J7F-HNIb5RtCkrAqg/exec",
  GAS_ENDPOINT: "https://script.google.com/macros/s/AKfycbwG3AtO8oAIn72V0NVJ42dNtjT3XOiUkVp6en0hxtnwaUs_pWqeuNLCY0q54Wb4FQnmwA/exec",

  MAX_FILE_MB: 5
};
