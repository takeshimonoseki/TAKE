// drivers-site 共通設定
// GitHub Pages ルート直下に index.html / register.html / vehicle.html を配置
// ※LINEは「友だち追加」用URLのみ使用。QR/ログイン誘導は禁止。
window.CONFIG = {
  REGION_LABEL: "山口県",
  REGIONS: ["山口県", "福岡県"],
  COMPANY_NAME: "軽貨物TAKE",
  TEL: "09078834125",
  EMAIL_TO: "takeshimonoseki@gmail.com",

  // たけのLINE（友だち追加用URL）。全ページのLINEボタンはここに統一。
  LINE_ADD_FRIEND_URL: "https://line.me/ti/p/azXpkv3_bQ",
  LINE_URL: "https://line.me/ti/p/azXpkv3_bQ",

  // GAS WebアプリのURL（デプロイ後に取得して config.js の GAS_ENDPOINT に貼る）
  GAS_WEBAPP_URL: "https://script.google.com/macros/s/AKfycbwzSFlI7k_eUkHzCyMY8isEyhOCSMrdAovFM2g7XGFZAfA9_3LS2J7F-HNIb5RtCkrAqg/exec",
  GAS_ENDPOINT: "https://script.google.com/macros/s/AKfycbwzSFlI7k_eUkHzCyMY8isEyhOCSMrdAovFM2g7XGFZAfA9_3LS2J7F-HNIb5RtCkrAqg/exec",

  // 公開OKの固定値（参照用。実際の保存先はGAS側で使用）
  SHEET_ID: "1mEPSJsN0Pt1GULgLIBqQXyUQg-L7a4QCvSLMvADejN8",
  SHEET_TAB: "Drivers",
  DRIVE_FOLDER_ID: "1jJeND1RbxHS0rcCUJC116um2VL-UXAiC",
  ADMIN_EMAIL: "takeshimonoseki@gmail.com",

  MAX_FILE_MB: 5
};
