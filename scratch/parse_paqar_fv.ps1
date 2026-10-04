$excelPath = (Join-Path (Get-Location) "data\fv desde enero.xlsx")
$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false

try {
    $wb = $excel.Workbooks.Open($excelPath)
    $sheet = $wb.Sheets.Item(1)
    $arr = $sheet.UsedRange.Value2
    $wb.Close($false)
    
    Write-Host "=== REGIONAL & NACIONAL (Paq.AR - Left Table, Rows 19 to 25) ==="
    for ($r = 19; $r -le 25; $r++) {
        $name = $arr[$r, 1]
        $ene = $arr[$r, 2]
        $ago = $arr[$r, 9]
        $sep = $arr[$r, 10]
        Write-Host "$name -> ene: $ene, ago: $ago, sep: $sep"
    }

    Write-Host "`n=== PLANTAS / NODOS (Paq.AR - Right Table, Rows 77 to 112) ==="
    for ($r = 77; $r -le 112; $r++) {
        $pName = $arr[$r, 13]
        $ene = $arr[$r, 14]
        $ago = $arr[$r, 21]
        $sep = $arr[$r, 22]
        Write-Host "R$r : $pName -> sep-26 = $sep (ene=$ene, ago=$ago)"
    }
} finally {
    $excel.Quit()
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null
}
