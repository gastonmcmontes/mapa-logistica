Add-Type -AssemblyName System.IO.Compression.FileSystem

function Dump-FullSheet($xlsxPath, $sheetEntryName) {
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
    foreach ($r in $rows) {
        $cells = @()
        foreach ($c in $r.c) {
            $val = $c.v
            if ($c.t -eq 's') { $val = $strings[[int]$val] }
            $cells += "$($c.r): $val"
        }
        Write-Output "Row $($r.r): $($cells -join ' | ')"
    }
}

Dump-FullSheet "data/RESUMEN_PAIS_UM_MAS_6.3 3.xlsx" "xl/worksheets/sheet1.xml"
