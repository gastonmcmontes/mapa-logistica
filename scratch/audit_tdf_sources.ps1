# 1. Search for images in folders
Write-Host "=== FOTOGRAFIAS DISPONIBLES EN DISCO ==="
$imgs = Get-ChildItem -Path ".\imagenes" -Recurse -File
$imgsTdf = $imgs | Where-Object { $_.Name -match "rga|vae|grande|ushuaia|fuego" }
Write-Host "Imagenes que coinciden con RGA/VAE/Tierra del Fuego: $($imgsTdf.Count)"
foreach ($img in $imgsTdf) {
    Write-Host " - $($img.FullName)"
}

# 2. Check Analisis plantas Logisticas act..xlsx
Write-Host "`n=== DATOS EN Analisis plantas Logisticas act..xlsx ==="
$excelPath = Resolve-Path ".\data\Analisis plantas Logisticas act..xlsx"
$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false
$wb = $excel.Workbooks.Open($excelPath)

foreach ($sheet in $wb.Sheets) {
    $name = $sheet.Name
    $used = $sheet.UsedRange
    $rows = $used.Rows.Count
    $cols = $used.Columns.Count
    
    $found = @()
    for ($r = 1; $r -le [Math]::Min($rows, 200); $r++) {
        for ($c = 1; $c -le [Math]::Min($cols, 30); $c++) {
            $val = $sheet.Cells.Item($r, $c).Text
            if ($val -match "RIO GRANDE|USHUAIA|RGA|VAE") {
                $found += ("Fila " + $r + ", Col " + $c + ": " + $val)
            }
        }
    }
    if ($found.Count -gt 0) {
        Write-Host "Hoja '$name' -> $($found.Count) menciones:"
        $found | Select-Object -First 8 | ForEach-Object { Write-Host "   $_" }
    } else {
        Write-Host "Hoja '$name' -> Sin menciones"
    }
}

# 3. Check RESUMEN_PAIS_UM_MAS_6.3 3.xlsx
Write-Host "`n=== DATOS EN RESUMEN_PAIS_UM_MAS_6.3 3.xlsx ==="
$excelResumenPath = Resolve-Path ".\data\RESUMEN_PAIS_UM_MAS_6.3 3.xlsx"
$wbRes = $excel.Workbooks.Open($excelResumenPath)
foreach ($sheet in $wbRes.Sheets) {
    $name = $sheet.Name
    $used = $sheet.UsedRange
    $rows = $used.Rows.Count
    $cols = $used.Columns.Count
    $found = @()
    for ($r = 1; $r -le [Math]::Min($rows, 200); $r++) {
        for ($c = 1; $c -le [Math]::Min($cols, 30); $c++) {
            $val = $sheet.Cells.Item($r, $c).Text
            if ($val -match "RIO GRANDE|USHUAIA|RGA|VAE") {
                $found += ("Fila " + $r + ", Col " + $c + ": " + $val)
            }
        }
    }
    if ($found.Count -gt 0) {
        Write-Host "Hoja '$name' -> $($found.Count) menciones:"
        $found | Select-Object -First 8 | ForEach-Object { Write-Host "   $_" }
    }
}

# 4. Check Info Plantas julio.xlsx
Write-Host "`n=== DATOS EN Info Plantas julio.xlsx ==="
$excelJulioPath = Resolve-Path ".\data\Info Plantas julio.xlsx"
$wbJulio = $excel.Workbooks.Open($excelJulioPath)
foreach ($sheet in $wbJulio.Sheets) {
    $name = $sheet.Name
    $used = $sheet.UsedRange
    $rows = $used.Rows.Count
    $cols = $used.Columns.Count
    $found = @()
    for ($r = 1; $r -le [Math]::Min($rows, 200); $r++) {
        for ($c = 1; $c -le [Math]::Min($cols, 30); $c++) {
            $val = $sheet.Cells.Item($r, $c).Text
            if ($val -match "RIO GRANDE|USHUAIA|RGA|VAE") {
                $found += ("Fila " + $r + ", Col " + $c + ": " + $val)
            }
        }
    }
    if ($found.Count -gt 0) {
        Write-Host "Hoja '$name' -> $($found.Count) menciones:"
        $found | Select-Object -First 8 | ForEach-Object { Write-Host "   $_" }
    } else {
        Write-Host "Hoja '$name' -> Sin menciones"
    }
}

$wb.Close($false)
$wbRes.Close($false)
$wbJulio.Close($false)
$excel.Quit()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null
