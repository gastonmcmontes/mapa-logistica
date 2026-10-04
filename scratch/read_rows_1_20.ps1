$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false
$path = Resolve-Path ".\data\Info Plantas julio.xlsx"
$wb = $excel.Workbooks.Open($path.Path)
$ws = $wb.Sheets.Item(1)
for ($r = 1; $r -le 20; $r++) {
    $rowVals = @()
    for ($c = 1; $c -le 15; $c++) {
        $rowVals += [string]$ws.Cells.Item($r, $c).Text
    }
    Write-Host "Row $r : $($rowVals -join ' | ')"
}
$wb.Close($false)
$excel.Quit()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null
