$excelPath = (Resolve-Path ".\data\Analisis plantas Logisticas act..xlsx").Path
$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false
try {
    $wb = $excel.Workbooks.Open($excelPath)
    Write-Host "Sheets in workbook:"
    foreach ($s in $wb.Sheets) {
        Write-Host " - $($s.Name)"
    }
    
    $sheet = $wb.Sheets.Item(1) # First sheet
    Write-Host "`nInspecting sheet '$($sheet.Name)':"
    for ($r = 1; $r -le 45; $r++) {
        $c1 = $sheet.Cells.Item($r, 1).Value2
        $c2 = $sheet.Cells.Item($r, 2).Value2
        $c3 = $sheet.Cells.Item($r, 3).Value2
        $c4 = $sheet.Cells.Item($r, 4).Value2
        if ($c1 -match "VAE|RGA" -or $c2 -match "USHUAIA|RIO GRANDE" -or $r -eq 1) {
            Write-Host "Row $r -> Col1: '$c1' | Col2: '$c2' | Col3: '$c3' | Col4: '$c4'"
            for ($col = 1; $col -le 25; $col++) {
                $h = $sheet.Cells.Item(1, $col).Value2
                $v = $sheet.Cells.Item($r, $col).Value2
                if ($r -gt 1) {
                    Write-Host "   Col $col ($h): '$v'"
                }
            }
        }
    }
    $wb.Close($false)
} finally {
    $excel.Quit()
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null
}
