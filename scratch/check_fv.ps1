Add-Type -AssemblyName System.IO.Compression.FileSystem

$zip = [System.IO.Compression.ZipFile]::OpenRead('data/Maestro_kpis.xlsx')
$entry = $zip.GetEntry('xl/sharedStrings.xml')
$sr = New-Object System.IO.StreamReader($entry.Open())
$xml = [xml]$sr.ReadToEnd()
$sr.Dispose()

$strings = @()
foreach ($si in $xml.sst.si) {
    if ($si.t -ne $null) { $strings += $si.t }
    elseif ($si.r -ne $null) { $strings += ($si.r | ForEach-Object { $_.t }) -join '' }
    else { $strings += '' }
}

# Find all strings mentioning FV or related words
$matched = @()
for ($i = 0; $i -lt $strings.Count; $i++) {
    $s = $strings[$i]
    if ($s -match '\bFV\b' -or $s -match 'SLA' -or $s -match 'Ventana' -or $s -match 'Visita' -or $s -match 'Fact' -or $s -match 'Vencimiento') {
        $matched += "$($i): $s"
    }
}
$matched | Select-Object -First 40 | Out-File -Encoding UTF8 "scratch/fv_strings.txt"

# Also check workbook sheets
$wbEntry = $zip.GetEntry('xl/workbook.xml')
$srWB = New-Object System.IO.StreamReader($wbEntry.Open())
$xmlWB = [xml]$srWB.ReadToEnd()
$srWB.Dispose()

$sheets = $xmlWB.workbook.sheets.sheet | ForEach-Object { "$($_.sheetId): $($_.name)" }
$sheets | Out-File -Append -Encoding UTF8 "scratch/fv_strings.txt"

$zip.Dispose()
Write-Host "Done scanning Maestro_kpis.xlsx"
