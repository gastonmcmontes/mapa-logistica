$excelPath = (Join-Path (Get-Location) "data\datos bue y trt.xlsx")
$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false

try {
    $wb = $excel.Workbooks.Open($excelPath)
    foreach ($sheet in $wb.Sheets) {
        Write-Host "================== SHEET: $($sheet.Name) =================="
        $arr = $sheet.UsedRange.Value2
        if ($null -ne $arr) {
            $rowCount = $arr.GetLength(0)
            $colCount = $arr.GetLength(1)
            Write-Host "Rows: $rowCount, Cols: $colCount"
            
            for ($r = 1; $r -le $rowCount; $r++) {
                $rowVals = @()
                for ($c = 1; $c -le $colCount; $c++) {
                    $val = $arr[$r, $c]
                    if ($null -eq $val) { $val = "" }
                    $rowVals += "$val"
                }
                if (($rowVals -join "").Trim() -ne "") {
                    Write-Host "R$($r): $($rowVals -join ' | ')"
                }
            }
        }
    }
    $wb.Close($false)
} finally {
    $excel.Quit()
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null
}
