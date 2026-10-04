$excelPath = (Join-Path (Get-Location) "data\fv desde enero.xlsx")
$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false

try {
    $wb = $excel.Workbooks.Open($excelPath)
    foreach ($sheet in $wb.Sheets) {
        Write-Host "================== SHEET: $($sheet.Name) =================="
        $usedRange = $sheet.UsedRange
        $rowCount = [Math]::Min($usedRange.Rows.Count, 30)
        $colCount = [Math]::Min($usedRange.Columns.Count, 20)
        
        for ($r = 1; $r -le $rowCount; $r++) {
            $rowVals = @()
            for ($c = 1; $c -le $colCount; $c++) {
                $val = $sheet.Cells.Item($r, $c).Text
                $rowVals += $val
            }
            if (($rowVals -join "").Trim() -ne "") {
                Write-Host "Row $r : $($rowVals -join ' | ')"
            }
        }
    }
    $wb.Close($false)
} finally {
    $excel.Quit()
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null
}
