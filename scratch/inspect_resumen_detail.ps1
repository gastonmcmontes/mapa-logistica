Add-Type -AssemblyName System.IO.Compression.FileSystem

function Get-SheetData($xlsxPath, $sheetEntryName) {
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

    return @{ Strings = $strings; Rows = $xml.worksheet.sheetData.row }
}

$d1 = Get-SheetData "data/RESUMEN_PAIS_UM_MAS_6.3 3.xlsx" "xl/worksheets/sheet1.xml"
Write-Output "=== RESUMEN PAIS: Sheet 1 (Total Rows: $($d1.Rows.Count)) ==="
$r1 = $d1.Rows | Where-Object { [int]$_.r -eq 1 }
foreach ($c in $r1.c) {
    $val = $c.v
    if ($c.t -eq 's') { $val = $d1.Strings[[int]$val] }
    Write-Output "Col $($c.r): $val"
}

Write-Output "`n--- First 3 data rows of Sheet 1 ---"
foreach ($r in ($d1.Rows | Select-Object -Skip 1 -First 3)) {
    $vals = @()
    foreach ($c in $r.c) {
        $val = $c.v
        if ($c.t -eq 's') { $val = $d1.Strings[[int]$val] }
        $vals += "$($c.r): $val"
    }
    Write-Output "Row $($r.r): $($vals -join ' | ')"
}

$d2 = Get-SheetData "data/RESUMEN_PAIS_UM_MAS_6.3 3.xlsx" "xl/worksheets/sheet2.xml"
Write-Output "`n=== RESUMEN PAIS: Sheet 2 (PLANTAS DOTACION, Total Rows: $($d2.Rows.Count)) ==="
$r2_1 = $d2.Rows | Where-Object { [int]$_.r -eq 1 }
foreach ($c in $r2_1.c) {
    $val = $c.v
    if ($c.t -eq 's') { $val = $d2.Strings[[int]$val] }
    Write-Output "Col $($c.r): $val"
}

Write-Output "`n--- First 5 data rows of Sheet 2 ---"
foreach ($r in ($d2.Rows | Select-Object -Skip 1 -First 5)) {
    $vals = @()
    foreach ($c in $r.c) {
        $val = $c.v
        if ($c.t -eq 's') { $val = $d2.Strings[[int]$val] }
        $vals += "$($c.r): $val"
    }
    Write-Output "Row $($r.r): $($vals -join ' | ')"
}
