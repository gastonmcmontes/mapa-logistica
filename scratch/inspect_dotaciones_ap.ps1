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

$ap_p = Get-SheetData "data/Analisis plantas Logisticas act..xlsx" "xl/worksheets/sheet1.xml"
Write-Output "=== Analisis plantas: Sheet 1 (plantas) ==="
foreach ($r in ($ap_p | Where-Object { $_.RowNum -ge 2 })) {
    Write-Output "Row $($r.RowNum): Cod=$($r.A) | Nombre=$($r.B) | DotTotal=$($r.J) | DotAux=$($r.K) | NocheAux=$($r.N) | MananaAux=$($r.Q) | TardeAux=$($r.T) | Vta=$($r.Y) | Jur=$($r.Z)"
}

$ap_r = Get-SheetData "data/Analisis plantas Logisticas act..xlsx" "xl/worksheets/sheet6.xml"
Write-Output "`n=== Analisis plantas: Sheet 6 (Resumen - Filas 11 a 50) ==="
foreach ($r in ($ap_r | Where-Object { $_.RowNum -ge 10 -and $_.RowNum -le 50 })) {
    Write-Output "Row $($r.RowNum): Reg=$($r.A) | Cod=$($r.B) | Nom=$($r.C) | DotTot=$($r.D) | AuxOp=$($r.E) | Noc=$($r.F) | Man=$($r.G) | Tar=$($r.H) | Manip=$($r.I) | Transp=$($r.J) | Reubic=$($r.K)"
}
