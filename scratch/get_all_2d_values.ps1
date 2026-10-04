$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false
$path = Resolve-Path ".\data\Info Plantas julio.xlsx"
$wb = $excel.Workbooks.Open($path.Path)
$ws = $wb.Sheets.Item(1)
for ($r = 1; $r -le 40; $r++) {
    $name = [string]$ws.Cells.Item($r, 1).Value2
    $code = [string]$ws.Cells.Item($r, 2).Value2
    $vol2d_m = $ws.Cells.Item($r, 6).Value2
    $vol2d_d = $ws.Cells.Item($r, 7).Value2
    Write-Host "Row $r -> Name: '$name', Code: '$code', Vol2D_M: $vol2d_m, Vol2D_D (Col G): $vol2d_d"
}
$wb.Close($false)
$excel.Quit()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null
