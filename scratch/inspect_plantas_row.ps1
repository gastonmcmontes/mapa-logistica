$excelPath = Resolve-Path ".\data\Analisis plantas Logisticas act..xlsx"
$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false
$wb = $excel.Workbooks.Open($excelPath)

$sheetPlantas = $wb.Sheets.Item("plantas")
$headers = @()
for ($c = 1; $c -le 50; $c++) {
    $h = $sheetPlantas.Cells.Item(1, $c).Text
    if ($h) { $headers += @{ col = $c; name = $h } }
}

Write-Host "=== HOJA 'plantas' FILA VAE Y RGA ==="
for ($r = 2; $r -le 45; $r++) {
    $cod = $sheetPlantas.Cells.Item($r, 1).Text
    $nom = $sheetPlantas.Cells.Item($r, 2).Text
    if ($cod -match "VAE|RGA" -or $nom -match "USHUAIA|RIO GRANDE") {
        Write-Host "`n--- $cod ($nom) [Fila $r] ---"
        foreach ($h in $headers) {
            $val = $sheetPlantas.Cells.Item($r, $h.col).Text
            Write-Host "$($h.name) (Col $($h.col)): '$val'"
        }
    }
}

$wb.Close($false)
$excel.Quit()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null
