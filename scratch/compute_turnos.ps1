Add-Type -AssemblyName System.IO.Compression.FileSystem

function Get-SheetRows($zip, $sheetEntryName, $sharedStrings) {
    $sheetEntry = $zip.GetEntry($sheetEntryName)
    if (!$sheetEntry) { return @() }
    $sStream = $sheetEntry.Open()
    $sReader = New-Object System.IO.StreamReader($sStream)
    $sXml = [xml]$sReader.ReadToEnd()
    $sReader.Close()
    $sStream.Close()
    
    $rowsData = @()
    foreach ($row in $sXml.worksheet.sheetData.row) {
        $rowObj = [ordered]@{}
        foreach ($c in $row.c) {
            $colLetter = $c.r -replace '[0-9]', ''
            $val = $c.v
            if ($c.t -eq "s" -and $val -ne $null) {
                $idx = [int]$val
                if ($idx -lt $sharedStrings.Count) {
                    $val = $sharedStrings[$idx]
                }
            }
            $rowObj[$colLetter] = $val
        }
        $rowsData += ,$rowObj
    }
    return $rowsData
}

$zip = [System.IO.Compression.ZipFile]::OpenRead("data/Analisis plantas Logisticas act..xlsx")
$sstEntry = $zip.GetEntry("xl/sharedStrings.xml")
$sharedStrings = @()
if ($sstEntry) {
    $sstStream = $sstEntry.Open()
    $sstReader = New-Object System.IO.StreamReader($sstStream)
    $sstXml = [xml]$sstReader.ReadToEnd()
    $sstReader.Close()
    $sstStream.Close()
    foreach ($si in $sstXml.sst.si) {
        $sharedStrings += $si.t
    }
}

$rows = Get-SheetRows $zip "xl/worksheets/sheet1.xml" $sharedStrings
$zip.Dispose()

Write-Host "Total rows in sheet1 (plantas): $($rows.Count)"

$header = $rows[0]
Write-Host "Headers:"
foreach ($k in $header.Keys) {
    Write-Host "$($k): $($header[$k])"
}

$totJN = 0; $totAN = 0
$totJM = 0; $totAM = 0
$totJT = 0; $totAT = 0

$plantasTurnos = @()

for ($i = 1; $i -lt $rows.Count; $i++) {
    $r = $rows[$i]
    $cod = $r["A"]
    $nombre = $r["B"]
    $region = $r["G"]
    $dotTotal = [int]$r["J"]
    $dotAux = [int]$r["K"]
    
    # Noche
    $fn = $r["L"]
    $jn = 0; if ($r["M"] -and $r["M"] -ne "no") { [int]::TryParse($r["M"], [ref]$jn) }
    $an = 0; if ($r["N"] -and $r["N"] -ne "no") { [int]::TryParse($r["N"], [ref]$an) }
    
    # Mañana
    $fm = $r["O"]
    $jm = 0; if ($r["P"] -and $r["P"] -ne "no") { [int]::TryParse($r["P"], [ref]$jm) }
    $am = 0; if ($r["Q"] -and $r["Q"] -ne "no") { [int]::TryParse($r["Q"], [ref]$am) }
    
    # Tarde
    $ft = $r["R"]
    $jt = 0; if ($r["S"] -and $r["S"] -ne "no") { [int]::TryParse($r["S"], [ref]$jt) }
    $at = 0; if ($r["T"] -and $r["T"] -ne "no") { [int]::TryParse($r["T"], [ref]$at) }
    
    $totN = $jn + $an
    $totM = $jm + $am
    $totT = $jt + $at
    $totTurnos = $totN + $totM + $totT
    
    $totJN += $jn; $totAN += $an
    $totJM += $jm; $totAM += $am
    $totJT += $jt; $totAT += $at
    
    Write-Host "$cod - $nombre ($region) | Dot:$dotTotal (Aux:$dotAux) | Noche: $totN (J:$jn, A:$an) | Mañana: $totM (J:$jm, A:$am) | Tarde: $totT (J:$jt, A:$at) | Suma Turnos: $totTurnos"
}

$grandN = $totJN + $totAN
$grandM = $totJM + $totAM
$grandT = $totJT + $totAT
$grandTotal = $grandN + $grandM + $grandT

Write-Host "=========================================="
Write-Host "TOTAL NACIONAL POR TURNO:"
Write-Host "Turno Noche:  $grandN (Jerarquico: $totJN, Auxiliares: $totAN) - $([Math]::Round($grandN * 100 / $grandTotal, 1))%"
Write-Host "Turno Mañana: $grandM (Jerarquico: $totJM, Auxiliares: $totAM) - $([Math]::Round($grandM * 100 / $grandTotal, 1))%"
Write-Host "Turno Tarde:  $grandT (Jerarquico: $totJT, Auxiliares: $totAT) - $([Math]::Round($grandT * 100 / $grandTotal, 1))%"
Write-Host "TOTAL TURNOS SUMA: $grandTotal (Total Auxiliares en turnos: $($totAN + $totAM + $totAT), Total Jerarquicos: $($totJN + $totJM + $totJT))"
Write-Host "=========================================="
