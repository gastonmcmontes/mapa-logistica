$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false
$path = Resolve-Path ".\data\Info Plantas julio.xlsx"
$wb = $excel.Workbooks.Open($path.Path)
$ws = $wb.Sheets.Item(1)

$tot_m = 0
$tot_d = 0
for ($r = 3; $r -le 38; $r++) {
    $name = [string]$ws.Cells.Item($r, 1).Value2
    $code = [string]$ws.Cells.Item($r, 2).Value2
    $vol2d_m = $ws.Cells.Item($r, 6).Value2
    $vol2d_d = $ws.Cells.Item($r, 7).Value2

    $num2d_m = 0
    if ($vol2d_m -is [double] -or $vol2d_m -is [int]) { $num2d_m = [double]$vol2d_m }
    elseif ($vol2d_m -match '[\d.,]+') { 
        $cleaned = ($vol2d_m -replace '\.', '') -replace ',', '.'
        [double]::TryParse($cleaned, [ref]$num2d_m) | Out-Null
    }

    $num2d_d = 0
    if ($vol2d_d -is [double] -or $vol2d_d -is [int]) { $num2d_d = [double]$vol2d_d }
    elseif ($vol2d_d -match '[\d.,]+') { 
        $cleaned = ($vol2d_d -replace '\.', '') -replace ',', '.'
        [double]::TryParse($cleaned, [ref]$num2d_d) | Out-Null
    }

    $tot_m += $num2d_m
    $tot_d += $num2d_d

    Write-Host ("{0,-5} | {1,-30} | {2,10:N0} mensual | {3,10:N1} diario" -f $code, $name, $num2d_m, $num2d_d)
}

$excelTotal_M = $ws.Cells.Item(39, 6).Value2
$excelTotal_D = $ws.Cells.Item(39, 7).Value2
Write-Host "--------------------------------------------------------"
Write-Host ("Calculated Sum  : {0,10:N0} mensual | {1,10:N1} diario" -f $tot_m, $tot_d)
Write-Host ("Excel Row 39    : {0,10:N0} mensual | {1,10:N1} diario" -f $excelTotal_M, $excelTotal_D)

$wb.Close($false)
$excel.Quit()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null
