Add-Type -AssemblyName System.IO.Compression.FileSystem

$filePath = "data/Maestro_kpis.xlsx"
$zip = [System.IO.Compression.ZipFile]::OpenRead($filePath)

$sstEntry = $zip.GetEntry("xl/sharedStrings.xml")
$sharedStrings = @()
if ($sstEntry) {
    $sstStream = $sstEntry.Open()
    $sstReader = New-Object System.IO.StreamReader($sstStream)
    $sstXml = [xml]$sstReader.ReadToEnd()
    $sstReader.Close()
    $sstStream.Close()
    foreach ($si in $sstXml.sst.si) {
        if ($si.t -ne $null) { $sharedStrings += $si.t }
        elseif ($si.r -ne $null) { $sharedStrings += ($si.r | ForEach-Object { $_.t }) -join '' }
        else { $sharedStrings += '' }
    }
}

function Get-PaqAR-Summary($sheetEntryName, $sheetName) {
    Write-Host "=== Paq.AR in $sheetName ==="
    $entry = $zip.GetEntry($sheetEntryName)
    $stream = $entry.Open()
    $reader = New-Object System.IO.StreamReader($stream)
    $xml = [xml]$reader.ReadToEnd()
    $reader.Close()
    $stream.Close()
    
    $plantMetrics = @{}
    $allDates = @{}
    
    foreach ($r in $xml.worksheet.sheetData.row) {
        $cells = @{}
        foreach ($c in $r.c) {
            $val = $c.v
            if ($c.t -eq "s" -and $val -ne $null) {
                $idx = [int]$val
                if ($idx -lt $sharedStrings.Count) { $val = $sharedStrings[$idx] }
            }
            $colLetter = ($c.r -replace '[0-9]', '')
            $cells[$colLetter] = $val
        }
        
        $prod = $cells["A"]
        $planta = $cells["B"]
        $fecha = $cells["C"]
        $qVencer = $cells["D"]
        $sla = $cells["E"]
        $qGest = $cells["F"]
        $fv = $cells["G"]
        
        if ($prod -like "*Paq*") {
            if ($fecha) { $allDates[$fecha] = 1 }
            
            # Numeric conversion
            $slaNum = 0.0
            $hasSla = [double]::TryParse($sla, [System.Globalization.NumberStyles]::Any, [System.Globalization.CultureInfo]::InvariantCulture, [ref]$slaNum)
            
            $qVencNum = 0.0
            $hasQVenc = [double]::TryParse($qVencer, [System.Globalization.NumberStyles]::Any, [System.Globalization.CultureInfo]::InvariantCulture, [ref]$qVencNum)
            
            $fvNum = 0.0
            $hasFv = [double]::TryParse($fv, [System.Globalization.NumberStyles]::Any, [System.Globalization.CultureInfo]::InvariantCulture, [ref]$fvNum)
            
            if (!$plantMetrics.ContainsKey($planta)) {
                $plantMetrics[$planta] = @{
                    Count = 0
                    TotalSLA = 0.0
                    TotalQVenc = 0.0
                    TotalFV = 0.0
                    LatestSLA = 0.0
                    LatestFV = 0.0
                    LatestDate = $fecha
                    LatestQVenc = 0.0
                }
            }
            
            if ($hasSla -and $slaNum -gt 0) {
                $pm = $plantMetrics[$planta]
                $pm.Count++
                $pm.TotalSLA += $slaNum
                $pm.TotalQVenc += $qVencNum
                $pm.TotalFV += $fvNum
                $pm.LatestSLA = $slaNum
                $pm.LatestFV = if ($hasFv) { $fvNum } else { 1.0 - $slaNum }
                $pm.LatestQVenc = $qVencNum
                $pm.LatestDate = $fecha
            }
        }
    }
    
    Write-Host "Total dates: $($allDates.Keys.Count)"
    Write-Host "Plant metrics count: $($plantMetrics.Keys.Count)"
    
    $totSlaPonderado = 0.0
    $totQVencNac = 0.0
    
    foreach ($k in ($plantMetrics.Keys | Sort-Object)) {
        $pm = $plantMetrics[$k]
        if ($pm.Count -gt 0) {
            $avgSla = $pm.TotalSLA / $pm.Count
            $slaPct = [math]::Round($pm.LatestSLA * 100, 1)
            $fvPct = [math]::Round($pm.LatestFV * 100, 1)
            Write-Host "$k | Ultimo SLA: $slaPct% | Ultimo FV: $fvPct% | Ultimo Q: $($pm.LatestQVenc) | Promedio SLA: $([math]::Round($avgSla*100, 1))% (Filas: $($pm.Count))"
            
            $totSlaPonderado += ($pm.LatestSLA * $pm.LatestQVenc)
            $totQVencNac += $pm.LatestQVenc
        } else {
            Write-Host "$k | Sin datos de SLA"
        }
    }
    
    if ($totQVencNac -gt 0) {
        $slaNacPond = [math]::Round(($totSlaPonderado / $totQVencNac) * 100, 1)
        $fvNacPond = [math]::Round(100.0 - $slaNacPond, 1)
        Write-Host "=========================================="
        Write-Host "TOTAL PAÍS PAQ.AR:"
        Write-Host "SLA Nacional: $slaNacPond%"
        Write-Host "FV Nacional: $fvNacPond%"
        Write-Host "Q a Vencer Total: $totQVencNac"
        Write-Host "=========================================="
    }
}

Get-PaqAR-Summary "xl/worksheets/sheet4.xml" "SLA FV Diario"
Get-PaqAR-Summary "xl/worksheets/sheet5.xml" "SLA FV Acumulado"

$zip.Dispose()
