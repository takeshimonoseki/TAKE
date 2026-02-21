/**
 * teraren API から全銀行・全支店を取得し、assets/bank-data.js を生成する。
 * 実行: node scripts/fetch-bank-data.js
 * 出力: assets/bank-data.js (window.BANK_DATA に全行・全支店を格納)
 */
const fs = require("fs");
const path = require("path");

const BANKS_URL = "https://bank.teraren.com/banks.json?page=1&per=2000";
const BRANCH_URL = (code) => `https://bank.teraren.com/banks/${code}/branches.json?page=1&per=2000`;
const OUT_PATH = path.resolve(__dirname, "..", "assets", "bank-data.js");

const DELAY_MS = 300;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchJSON(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
      return await res.json();
    } catch (e) {
      if (i === retries - 1) throw e;
      console.warn(`  retry ${i + 1}/${retries} for ${url}: ${e.message}`);
      await sleep(1000);
    }
  }
}

(async () => {
  console.log("Fetching banks list...");
  const banksList = await fetchJSON(BANKS_URL);
  console.log(`  Found ${banksList.length} banks.`);

  const result = [];
  for (let i = 0; i < banksList.length; i++) {
    const b = banksList[i];
    const code = String(b.code || b.bank_code || "").padStart(4, "0");
    const name = b.name || b.bank_name || "";
    process.stdout.write(`\r  [${i + 1}/${banksList.length}] ${code} ${name}...`);

    let branches = [];
    try {
      const rawBranches = await fetchJSON(BRANCH_URL(code));
      branches = (rawBranches || []).map((br) => {
        const brCode = String(br.code || br.branch_code || "").padStart(3, "0");
        return { code: brCode.slice(-3), name: br.name || br.branch_name || "" };
      });
    } catch (e) {
      console.warn(`\n  WARN: failed to fetch branches for ${code} ${name}: ${e.message}`);
    }

    result.push({ code, name, branches });
    if (i < banksList.length - 1) await sleep(DELAY_MS);
  }

  console.log(`\nWriting ${result.length} banks to ${OUT_PATH}...`);

  const js =
    "/**\n" +
    " * 全銀行・全支店の静的データ (teraren API から自動生成)\n" +
    " * 生成日: " + new Date().toISOString().slice(0, 10) + "\n" +
    " * 再生成: node scripts/fetch-bank-data.js\n" +
    " */\n" +
    "(function(g){g.BANK_DATA=" +
    JSON.stringify(result) +
    ";})(typeof window!==\"undefined\"?window:this);\n";

  fs.writeFileSync(OUT_PATH, js, "utf-8");
  const sizeMB = (Buffer.byteLength(js, "utf-8") / 1024 / 1024).toFixed(2);
  console.log(`Done! ${result.length} banks, file size: ${sizeMB} MB`);
})();
