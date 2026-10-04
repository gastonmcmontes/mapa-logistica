$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false
$path = Resolve-Path ".\data\Info Plantas julio.xlsx"
$wb = $excel.Workbooks.Open($path.Path)
$ws = $wb.Sheets.Item(1)

$excelMap = @{}
for ($r = 3; $r -le 38; $r++) {
    $name = [string]$ws.Cells.Item($r, 1).Value2
    $code = [string]$ws.Cells.Item($r, 2).Value2
    $vol2d_m = $ws.Cells.Item($r, 6).Value2
    $vol2d_d = $ws.Cells.Item($r, 7).Value2

    $num2d_m = 0.0
    if ($vol2d_m -is [double] -or $vol2d_m -is [int]) { $num2d_m = [double]$vol2d_m }
    elseif ($vol2d_m -match '[\d.,]+') { 
        $cleaned = ($vol2d_m -replace '\.', '') -replace ',', '.'
        [double]::TryParse($cleaned, [ref]$num2d_m) | Out-Null
    }

    $num2d_d = 0.0
    if ($vol2d_d -is [double] -or $vol2d_d -is [int]) { $num2d_d = [double]$vol2d_d }
    elseif ($vol2d_d -match '[\d.,]+') { 
        $cleaned = ($vol2d_d -replace '\.', '') -replace ',', '.'
        [double]::TryParse($cleaned, [ref]$num2d_d) | Out-Null
    }

    $excelMap[$code.Trim().ToUpper()] = @{
        Name = $name.Trim()
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
$nodes = $json | ConvertFrom-Json

$updatedCount = 0
foreach ($n in $nodes) {
    $code = ""
    if ($n.cod) { $code = $n.cod.ToUpper() }
    elseif ($n.id) { $code = $n.id.ToUpper() }
    
    if ($code -eq 'TRT' -and -not $excelMap.ContainsKey('TRT') -and $excelMap.ContainsKey('POD')) {
        $code = 'POD'
    }

    if ($excelMap.ContainsKey($code)) {
        $item = $excelMap[$code]
        $d = [double]$item.Vol2D_Diario
        $m = [double]$item.Vol2D_Mensual
        
        $v2d_str = if ($d -gt 0) { [Math]::Round($d).ToString("N0", [System.Globalization.CultureInfo]::GetCultureInfo("es-AR")) } else { "0" }
        $v2d_num = [Math]::Round($d, 1)
        $v2dm_str = if ($m -gt 0) { [Math]::Round($m).ToString("N0", [System.Globalization.CultureInfo]::GetCultureInfo("es-AR")) } else { "0" }
        $v2dm_num = [Math]::Round($m)

        $n | Add-Member -NotePropertyName "volumen2D" -NotePropertyValue $v2d_str -Force
        $n | Add-Member -NotePropertyName "volumen2DNum" -NotePropertyValue $v2d_num -Force
        $n | Add-Member -NotePropertyName "volumen2dMensual" -NotePropertyValue $v2dm_str -Force
        $n | Add-Member -NotePropertyName "volumen2dMensualNum" -NotePropertyValue $v2dm_num -Force
        
        $updatedCount++
        Write-Host "Updated [$code] $($n.nombre): Vol2D_D = $v2d_str ($v2d_num), Vol2D_M = $v2dm_str ($v2dm_num)"
    } else {
        $n | Add-Member -NotePropertyName "volumen2D" -NotePropertyValue "0" -Force
        $n | Add-Member -NotePropertyName "volumen2DNum" -NotePropertyValue 0 -Force
        $n | Add-Member -NotePropertyName "volumen2dMensual" -NotePropertyValue "0" -Force
        $n | Add-Member -NotePropertyName "volumen2dMensualNum" -NotePropertyValue 0 -Force
        Write-Host "No 2D data for [$code] $($n.nombre) -> set to 0"
    }
}

Write-Host "`nTotal nodes processed: $($nodes.Count), Updated from Excel: $updatedCount"

# Convert back to JSON
$newJson = $nodes | ConvertTo-Json -Depth 10
$finalJs = "const NODOS_DATA_OFICIAL = $newJson;`nif (typeof module !== 'undefined') { module.exports = { NODOS_DATA_OFICIAL }; }`n"

[System.IO.File]::WriteAllText((Resolve-Path ".\nodos-data.js").Path, $finalJs, [System.Text.Encoding]::UTF8)
[System.IO.File]::WriteAllText((Resolve-Path ".\data\nodos-data.js").Path, $finalJs, [System.Text.Encoding]::UTF8)

Write-Host "Successfully saved nodos-data.js and data/nodos-data.js in UTF-8!"
