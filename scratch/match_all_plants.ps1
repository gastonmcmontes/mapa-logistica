$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false
$path = Resolve-Path ".\data\Info Plantas julio.xlsx"
$wb = $excel.Workbooks.Open($path.Path)
$ws = $wb.Sheets.Item(1)

$excelNodes = @()
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

    $excelNodes += [PSCustomObject]@{
        Row = $r
        Name = $name.Trim()
        Code = $code.Trim()
        Vol2D_Mensual = $num2d_m
        Vol2D_Diario = $num2d_d
    }
}
$wb.Close($false)
$excel.Quit()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null

$raw = Get-Content .\nodos-data.js -Raw
$first = $raw.IndexOf('[')
$last = $raw.LastIndexOf(']')
$json = $raw.Substring($first, $last - $first + 1)
$jsNodes = $json | ConvertFrom-Json

Write-Host "--- MATCHING PLANTS ---"
foreach ($en in $excelNodes) {
    # Match by code
    $match = $jsNodes | Where-Object { 
        ($_.cod -and $_.cod.ToUpper() -eq $en.Code.ToUpper()) -or 
        ($_.id -and $_.id.ToUpper() -eq $en.Code.ToUpper())
    }
    
    # If not matched by code, try by name
    if (-not $match) {
        $cleanName = ($en.Name -replace 'CLOG|CTP|CDP|CENTRO|PAQUETERIA', '').Trim()
        $match = $jsNodes | Where-Object { 
            $_.nombre -like "*$cleanName*" -or $_.nombreCompleto -like "*$cleanName*"
        }
    }
    
    if ($match) {
        Write-Host "MATCH: Excel '[$($en.Code)] $($en.Name)' -> JS '[$($match.cod)] $($match.nombreCompleto)' | Vol2D_D: $($en.Vol2D_Diario) | Vol2D_M: $($en.Vol2D_Mensual)"
    } else {
        Write-Host "NO MATCH: Excel '[$($en.Code)] $($en.Name)' (Code: $($en.Code))"
    }
}

Write-Host "`n--- CHECK UNMATCHED JS NODES ---"
foreach ($jn in $jsNodes) {
    $match = $excelNodes | Where-Object {
        ($_.Code.ToUpper() -eq $jn.cod.ToUpper()) -or 
        ($_.Code.ToUpper() -eq $jn.id.ToUpper())
    }
    if (-not $match) {
        Write-Host "JS Node not matched with Excel: [$($jn.cod)] $($jn.nombreCompleto) (id: $($jn.id))"
    }
}
