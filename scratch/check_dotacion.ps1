Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead('RESUMEN_PAIS 98.6%_105300.xlsx')

# Load shared strings
$ssEntry = $zip.GetEntry('xl/sharedStrings.xml')
$sr = New-Object System.IO.StreamReader($ssEntry.Open())
$ssXml = [xml]$sr.ReadToEnd()
$sr.Dispose()
$strings = @()
foreach ($si in $ssXml.sst.si) {
    if ($si.t) { $strings += $si.t }
    elseif ($si.r) { $strings += ($si.r | ForEach-Object { $_.t }) -join '' }
    else { $strings += "" }
}

$sheet2 = $zip.GetEntry('xl/worksheets/sheet2.xml')
$sr = New-Object System.IO.StreamReader($sheet2.Open())
$xml = [xml]$sr.ReadToEnd()
$sr.Dispose()
$zip.Dispose()

$rows = $xml.worksheet.sheetData.row
foreach ($r in $rows | Select-Object -Skip 35 -First 20) {
    $vals = @()
    foreach ($c in $r.c) {
        $val = $c.v
        if ($c.t -eq 's') { $val = $strings[[int]$val] }
        $vals += "$($c.r): $val"
    }
    Write-Output "Row $($r.r): $($vals -join ' | ')"
}
