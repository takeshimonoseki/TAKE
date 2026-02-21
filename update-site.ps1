Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$Repo = "D:\副業\軽貨物TAKE\ホームページ\ドライバー用ホームページ\takeshimonoseki.github.io-main"
Set-Location $Repo

Get-Process git -ErrorAction SilentlyContinue | Stop-Process -Force
Remove-Item ".git\index.lock" -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "=== SITE UPDATE START ==="
Write-Host "Repo: $Repo"
Write-Host ""

git status -sb

git add -A

git diff --cached --quiet
if ($LASTEXITCODE -eq 0) {
  Write-Host ""
  Write-Host "No changes to commit."
} else {
  $msg = "Update site " + (Get-Date -Format "yyyy-MM-dd_HH-mm")
  git commit -m $msg
}

git pull --rebase
git push -u origin HEAD

Write-Host ""
Write-Host "=== DONE ==="
Read-Host "Enterで閉じる"