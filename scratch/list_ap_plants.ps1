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

    $results = @()
    foreach ($r in $xml.worksheet.sheetData.row) {
        $rowObj = @{ RowNum = [int]$r.r }
        foreach ($c in $r.c) {
            $val = $c.v
            if ($c.t -eq 's') { $val = $strings[[int]$val] }
            $colLetter = ($c.r -replace '[0-9]', '')
            $rowObj[$colLetter] = $val
        }
        $results += [PSCustomObject]$rowObj
    }
    return $results
}

$p = Get-SheetData "data/Analisis plantas Logisticas act..xlsx" "xl/worksheets/sheet1.xml"
Write-Output "--- ALL PLANTS IN SHEET 1 (Analisis plantas Logisticas act..xlsx) ---"
foreach ($r in ($p | Where-Object { $_.RowNum -ge 2 })) {
    Write-Output "Cod=$($r.A) | Nombre=$($r.B) | Region=$($r.G) | DotTot=$($r.J) | DotAux=$($r.K) | Vta=$($r.Y) | Jur=$($r.Z)"
}
