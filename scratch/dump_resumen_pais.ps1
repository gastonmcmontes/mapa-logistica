Add-Type -AssemblyName System.IO.Compression.FileSystem

function Dump-Sheet($xlsxPath, $sheetEntryName, $maxRows = 50) {
    Write-Output "`n========================================================"
    Write-Output "FILE: $xlsxPath | SHEET: $sheetEntryName"
    Write-Output "========================================================"
    $zip = [System.IO.Compression.ZipFile]::OpenRead($xlsxPath)
    
    $ssEntry = $zip.GetEntry('xl/sharedStrings.xml')
    $strings = @()
    if ($ssEntry) {
        $sr = New-Object System.IO.StreamReader($ssEntry.Open())
        $ssXml = [xml]$sr.ReadToEnd()
        $sr.Dispose()
        foreach ($si in $ssXml.sst.si) {
            if ($si.t -ne $null) { $strings += $si.t }
            elseif ($si.r -ne $null) { $strings += ($si.r | ForEach-Object { $_.t }) -join '' }
            else { $strings += '' }
        }
    }

    $sheetEntry = $zip.GetEntry($sheetEntryName)
    $sr = New-Object System.IO.StreamReader($sheetEntry.Open())
    $xml = [xml]$sr.ReadToEnd()
    $sr.Dispose()
    $zip.Dispose()

    $rows = $xml.worksheet.sheetData.row
    $count = 0
    foreach ($r in $rows) {
        $count++
        if ($count -gt $maxRows) { break }
        $cells = @()
        foreach ($c in $r.c) {
            $val = $c.v
            if ($c.t -eq 's') { $val = $strings[[int]$val] }
            $cells += "$($c.r): $val"
        }
        Write-Output "Row $($r.r): $($cells -join ' | ')"
    }
}

Dump-Sheet "data/RESUMEN_PAIS_UM_MAS_6.3 3.xlsx" "xl/worksheets/sheet1.xml" 45
Dump-Sheet "data/RESUMEN_PAIS_UM_MAS_6.3 3.xlsx" "xl/worksheets/sheet2.xml" 45
