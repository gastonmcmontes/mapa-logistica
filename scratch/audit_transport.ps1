Add-Type -AssemblyName System.IO.Compression.FileSystem

$zipAP = [System.IO.Compression.ZipFile]::OpenRead('data/Analisis plantas Logisticas act..xlsx')
$ssAP = $zipAP.GetEntry('xl/sharedStrings.xml')
$sr = New-Object System.IO.StreamReader($ssAP.Open())
$xmlSS = [xml]$sr.ReadToEnd()
$sr.Dispose()

$stringsAP = @()
foreach ($si in $xmlSS.sst.si) {
    if ($si.t -ne $null) { $stringsAP += $si.t }
    elseif ($si.r -ne $null) { $stringsAP += ($si.r | ForEach-Object { $_.t }) -join '' }
    else { $stringsAP += '' }
}

function Clean-Str($v) {
    if ($v -eq $null) { return "" }
    return $v.ToString().Trim()
}

$regConfigs = @(
    @{ Name = 'SUR'; File = 'sheet2.xml'; TrStart = 22 },
    @{ Name = 'CUYO NOA'; File = 'sheet3.xml'; TrStart = 30 },
    @{ Name = 'CENTRO NEA'; File = 'sheet4.xml'; TrStart = 27 },
    @{ Name = 'PBA'; File = 'sheet5.xml'; TrStart = 21 }
)

$allTransportRows = @()

foreach ($cfg in $regConfigs) {
    $entry = $zipAP.GetEntry("xl/worksheets/$($cfg.File)")
    $sr = New-Object System.IO.StreamReader($entry.Open())
    $xmlRS = [xml]$sr.ReadToEnd()
    $sr.Dispose()
    
    foreach ($r in $xmlRS.worksheet.sheetData.row) {
        $rNum = [int]$r.r
        if ($rNum -ge $cfg.TrStart) {
            $cells = @{}
            foreach ($c in $r.c) {
                $val = $c.v
                if ($c.t -eq 's' -and $val -ne $null) { $val = $stringsAP[[int]$val] }
                $colLetter = ($c.r -replace '[0-9]', '')
                $cells[$colLetter] = $val
            }
            $codPlanta = Clean-Str $cells['B']
            $tipoServ = Clean-Str $cells['C']
            $linea = Clean-Str $cells['D']
            
            if ($linea -and $codPlanta -and $codPlanta.ToUpper() -notmatch '^(COD|CODIGO|REGION|TOTAL)') {
                $allTransportRows += [PSCustomObject]@{
                    RegionConfig = $cfg.Name
                    Row = $rNum
                    ColA_Region = Clean-Str $cells['A']
                    CodPlanta = $codPlanta
                    TipoServicio = $tipoServ
                    Linea = $linea
                    Frecuencia = Clean-Str $cells['E']
                    Entrega = Clean-Str $cells['F']
                    Recibe = Clean-Str $cells['G']
                    HorarioLlegada = Clean-Str $cells['H']
                    HorarioSalida = Clean-Str $cells['I']
                }
            }
        }
    }
}
$zipAP.Dispose()

Write-Host "Total Transport Rows: $($allTransportRows.Count)"

# Group by TipoServicio
Write-Host "`n=== GROUP BY TIPO SERVICIO ==="
$allTransportRows | Group-Object TipoServicio | ForEach-Object {
    Write-Host "$($_.Name) -> $($_.Count)"
}

# Check rows where TipoServicio or Linea has LTC or LTN
$ltc_rows = $allTransportRows | Where-Object { 
    $_.TipoServicio -like '*LTC*' -or $_.Linea -like '*LTC*' 
}
$ltn_rows = $allTransportRows | Where-Object { 
    $_.TipoServicio -like '*LTN*' -or $_.Linea -like '*LTN*' 
}

Write-Host "`nRows matching LTC: $($ltc_rows.Count)"
Write-Host "Rows matching LTN: $($ltn_rows.Count)"

# Let's list all distinct Linea names for LTC
Write-Host "`n=== UNIQUE LINEA VALUES FOR LTC ==="
$ltc_lines = $ltc_rows | Select-Object -ExpandProperty Linea -Unique | Sort-Object
$ltc_lines | ForEach-Object { Write-Host "  $_" }
Write-Host "Total unique LTC line names: $($ltc_lines.Count)"

# Let's list all distinct Linea names for LTN
Write-Host "`n=== UNIQUE LINEA VALUES FOR LTN ==="
$ltn_lines = $ltn_rows | Select-Object -ExpandProperty Linea -Unique | Sort-Object
$ltn_lines | ForEach-Object { Write-Host "  $_" }
Write-Host "Total unique LTN line names: $($ltn_lines.Count)"

# Unique combined LTC + LTN line names
$ltc_ltn_unique = ($ltc_rows + $ltn_rows) | Select-Object -ExpandProperty Linea -Unique | Sort-Object
Write-Host "`nTotal unique LTC + LTN line names (distinct): $($ltc_ltn_unique.Count)"

# Let's inspect all rows of LTC and LTN by Region
Write-Host "`n=== LTC + LTN ROWS BY REGION ==="
($ltc_rows + $ltn_rows) | Group-Object RegionConfig | ForEach-Object {
    Write-Host "$($_.Name): $($_.Count) asignaciones ($(($_.Group | Select -Expand Linea -Unique).Count) lineas unicas)"
}
