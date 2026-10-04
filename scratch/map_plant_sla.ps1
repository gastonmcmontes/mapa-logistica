Add-Type -AssemblyName System.IO.Compression.FileSystem

$zip = [System.IO.Compression.ZipFile]::OpenRead("data/Maestro_kpis.xlsx")
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

$entry = $zip.GetEntry("xl/worksheets/sheet5.xml") # SLA FV Acumulado
$stream = $entry.Open()
$reader = New-Object System.IO.StreamReader($stream)
$xml = [xml]$reader.ReadToEnd()
$reader.Close()
$stream.Close()
$zip.Dispose()

$slaData = @{}

foreach ($r in $xml.worksheet.sheetData.row) {
    $cells = @{}
    foreach ($c in $r.c) {
        $val = $c.v
        if ($c.t -eq "s" -and $val -ne $null) {
            $val = $sharedStrings[[int]$val]
        }
        $colLetter = ($c.r -replace '[0-9]', '')
        $cells[$colLetter] = $val
    }
    
    $prod = $cells["A"]
    $planta = $cells["B"]
    $sla = $cells["E"]
    $fv = $cells["G"]
    
    if ($prod -like "*Paq*" -and $planta -and $sla) {
        $slaNum = 0.0
        $hasSla = [double]::TryParse($sla, [System.Globalization.NumberStyles]::Any, [System.Globalization.CultureInfo]::InvariantCulture, [ref]$slaNum)
        $fvNum = 0.0
        $hasFv = [double]::TryParse($fv, [System.Globalization.NumberStyles]::Any, [System.Globalization.CultureInfo]::InvariantCulture, [ref]$fvNum)
        
        if ($hasSla -and $slaNum -gt 0) {
            $key = $planta.ToUpper().Trim()
            $slaData[$key] = @{
                SLA = [math]::Round($slaNum * 100, 1)
                FV = if ($hasFv -and $fvNum -gt 0) { [math]::Round($fvNum * 100, 1) } else { [math]::Round((1.0 - $slaNum) * 100, 1) }
            }
        }
    }
}

Write-Host "Total SLA Plants mapped: $($slaData.Keys.Count)"
foreach ($k in ($slaData.Keys | Sort-Object)) {
    Write-Host "$k -> SLA: $($slaData[$k].SLA)%, FV: $($slaData[$k].FV)%"
}
