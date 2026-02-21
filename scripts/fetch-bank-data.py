"""
zengin-code/source-data (GitHub) から全銀行・全支店データを取得し
assets/bank-data.js を生成する。

実行: python scripts/fetch-bank-data.py
出力: assets/bank-data.js (window.BANK_DATA に全行・全支店を格納)
"""
import json, os, sys, io, zipfile, urllib.request
from datetime import date

REPO_ZIP = "https://github.com/zengin-code/source-data/archive/refs/heads/master.zip"
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUT_PATH = os.path.join(SCRIPT_DIR, "..", "assets", "bank-data.js")

def main():
    print("Downloading zengin-code source-data repo (zip)...")
    req = urllib.request.Request(REPO_ZIP, headers={"User-Agent": "bank-data-fetcher/1.0"})
    with urllib.request.urlopen(req, timeout=60) as resp:
        zip_bytes = resp.read()
    print(f"  Downloaded {len(zip_bytes) / 1024:.0f} KB")

    zf = zipfile.ZipFile(io.BytesIO(zip_bytes))
    prefix = "source-data-master/data/"

    banks_path = prefix + "banks.json"
    with zf.open(banks_path) as f:
        banks_dict = json.loads(f.read().decode("utf-8"))
    print(f"  Found {len(banks_dict)} banks")

    branch_files = [n for n in zf.namelist() if n.startswith(prefix + "branches/") and n.endswith(".json")]
    branch_map = {}
    for bf in branch_files:
        bank_code = os.path.splitext(os.path.basename(bf))[0]
        with zf.open(bf) as f:
            branch_map[bank_code] = json.loads(f.read().decode("utf-8"))

    result = []
    for code in sorted(banks_dict.keys()):
        b = banks_dict[code]
        name = b.get("name", "")
        branches_raw = branch_map.get(code, {})
        branches = []
        for br_code in sorted(branches_raw.keys()):
            br = branches_raw[br_code]
            c = str(br.get("code", br_code)).zfill(3)[-3:]
            branches.append({"code": c, "name": br.get("name", "")})
        result.append({"code": code, "name": name, "branches": branches})

    total_branches = sum(len(b["branches"]) for b in result)
    print(f"  Total: {len(result)} banks, {total_branches} branches")

    data_json = json.dumps(result, ensure_ascii=False, separators=(",", ":"))
    js = (
        "/**\n"
        " * 全銀行・全支店の静的データ (zengin-code/source-data から自動生成)\n"
        f" * 生成日: {date.today().isoformat()}\n"
        f" * 銀行数: {len(result)}, 支店数: {total_branches}\n"
        " * 再生成: python scripts/fetch-bank-data.py\n"
        " * ライセンス: MIT (zengin-code)\n"
        " */\n"
        '(function(g){g.BANK_DATA=' + data_json + ';})(typeof window!=="undefined"?window:this);\n'
    )

    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        f.write(js)

    size_mb = len(js.encode("utf-8")) / 1024 / 1024
    print(f"Done! {len(result)} banks, {total_branches} branches, file: {size_mb:.2f} MB")
    print(f"Output: {OUT_PATH}")

if __name__ == "__main__":
    main()
