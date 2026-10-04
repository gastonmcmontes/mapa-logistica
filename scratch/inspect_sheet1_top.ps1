Add-Type -AssemblyName System.IO.Compression.FileSystem

$zip = [System.IO.Compression.ZipFile]::OpenRead('data/RESUMEN_PAIS_UM_MAS_6.3 3.xlsx')
$ssEntry = $zip.GetEntry('xl/sharedStrings.xml')
$sr = New-Object System.IO.StreamReader($ssEntry.Open())
$ssXml = [xml]$sr.ReadToEnd()
$sr.Dispose()
$strings = @()
foreach ($si in $ssXml.sst.si) {
    if ($si.t -ne $null) { $strings += $si.t }
    elseif ($si.r -ne $null) { $strings += ($si.r | ForEach-Object { $_.t }) -join '' }
    else { $strings += '' }
}

$sheet1 = $zip.GetEntry('xl/worksheets/sheet1.xml')
$sr = New-Object System.IO.StreamReader($sheet1.Open())
$xml = [xml]$sr.ReadToEnd()
$sr.Dispose()
$zip.Dispose()

foreach ($r in ($xml.worksheet.sheetData.row | Select-Object -First 15)) {
    $cells = @()
    foreach ($c in $r.c) {
        $val = $c.v
        if ($c.t -eq 's') { $val = $strings[[int]$val] }
        $cells += "$($c.r): $val"
    }
    Write-Output "Row $($r.r): $($cells -join ' | ')"
}
