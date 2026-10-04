$files = Get-ChildItem -Path "." -Recurse -File | Where-Object { $_.FullName -notmatch '\\\.git' -and $_.FullName -notmatch '\\\.gemini' } | Sort-Object LastWriteTime -Descending | Select-Object -First 30
foreach ($f in $files) {
    Write-Host "$($f.LastWriteTime.ToString('yyyy-MM-dd HH:mm:ss')) | $($f.Length) bytes | $($f.FullName)"
}
