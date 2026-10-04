Add-Type -AssemblyName System.IO.Compression.FileSystem

$filePath = "data/Maestro_kpis.xlsx"
$zip = [System.IO.Compression.ZipFile]::OpenRead($filePath)

# Read sharedStrings
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

function Analyze-SLA-Sheet($zip, $sheetEntryName, $sheetName) {
    Write-Host "=== Analyzing $sheetName ==="
    $entry = $zip.GetEntry($sheetEntryName)
    $stream = $entry.Open()
    $reader = New-Object System.IO.StreamReader($stream)
    $xml = [xml]$reader.ReadToEnd()
    $reader.Close()
    $stream.Close()
    
    $rows = $xml.worksheet.sheetData.row
    Write-Host "Total rows: $($rows.Count)"
    
    $products = @{}
    $sampleRows = @()
    
    foreach ($r in $rows) {
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
        if ($prod -and $prod -ne "Producto") {
            if (!$products.ContainsKey($prod)) { $products[$prod] = 0 }
            $products[$prod]++
            
            # Check if has numeric values in D, E, F, G
            if ($cells["E"] -or $cells["G"] -or $cells["D"]) {
                if ($sampleRows.Count -lt 25) {
                    $sampleRows += "$($cells['A']) | $($cells['B']) | Fecha:$($cells['C']) | QaVencer:$($cells['D']) | SLA:$($cells['E']) | QGest:$($cells['F']) | FV:$($cells['G'])"
                }
            }
        }
    }
    
    Write-Host "--- Products found in $sheetName ---"
    foreach ($p in $products.Keys) {
        Write-Host "$($p): $($products[$p]) rows"
    }
    
    Write-Host "--- Sample with Values ---"
    foreach ($s in $sampleRows) {
        Write-Host $s
    }
}

Analyze-SLA-Sheet $zip "xl/worksheets/sheet4.xml" "SLA FV Diario"
Analyze-SLA-Sheet $zip "xl/worksheets/sheet5.xml" "SLA FV Acumulado"

$zip.Dispose()
