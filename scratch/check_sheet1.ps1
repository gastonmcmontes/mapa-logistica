Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead('RESUMEN_PAIS 98.6%_105300.xlsx')

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

$sheet1 = $zip.GetEntry('xl/worksheets/sheet1.xml')
$sr = New-Object System.IO.StreamReader($sheet1.Open())
$xml = [xml]$sr.ReadToEnd()
$sr.Dispose()
$zip.Dispose()

$rows = $xml.worksheet.sheetData.row
# Look at headers row 1 or 2
$r1 = $rows | Where-Object { $_.r -eq 1 -or $_.r -eq 2 }
foreach ($r in $r1) {
    $vals = @()
    foreach ($c in $r.c) {
        $val = $c.v
        if ($c.t -eq 's') { $val = $strings[[int]$val] }
        $vals += "$($c.r): $val"
    }
    Write-Output "Header Row $($r.r): $($vals -join ' | ')"
}

# Look at total row (e.g. row 38, 39, or last rows)
$lastRows = $rows | Select-Object -Last 10
foreach ($r in $lastRows) {
    $vals = @()
    foreach ($c in $r.c) {
        $val = $c.v
        if ($c.t -eq 's') { $val = $strings[[int]$val] }
        $vals += "$($c.r): $val"
    }
    Write-Output "Row $($r.r): $($vals -join ' | ')"
}
