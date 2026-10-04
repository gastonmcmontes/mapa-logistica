Add-Type -AssemblyName System.IO.Compression.FileSystem

$zip = [System.IO.Compression.ZipFile]::OpenRead('data/Analisis plantas Logisticas act..xlsx')
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

$sheets = @('SUR', 'CUYO NOA', 'CENTRO NEA', 'PBA')
$sheetFiles = @('sheet2.xml', 'sheet3.xml', 'sheet4.xml', 'sheet5.xml')

$allTransport = @()
for ($i = 0; $i -lt $sheets.Count; $i++) {
    $sname = $sheets[$i]
    $sfile = $sheetFiles[$i]
    $sheetEntry = $zip.GetEntry("xl/worksheets/$sfile")
    $sr = New-Object System.IO.StreamReader($sheetEntry.Open())
    $xml = [xml]$sr.ReadToEnd()
    $sr.Dispose()

    foreach ($r in $xml.worksheet.sheetData.row) {
        $rowNum = [int]$r.r
        $c_b = ($r.c | Where-Object { $_.r -match "^B$rowNum`$" }).v
        $c_c = ($r.c | Where-Object { $_.r -match "^C$rowNum`$" }).v
        $c_d = ($r.c | Where-Object { $_.r -match "^D$rowNum`$" }).v
        
        $codPlanta = if ($c_b -ne $null) { $strings[[int]$c_b] } else { '' }
        $tipoServ = if ($c_c -ne $null) { $strings[[int]$c_c] } else { '' }
        $linea = if ($c_d -ne $null) { $strings[[int]$c_d] } else { '' }

        if ($codPlanta -and $linea -and $codPlanta -notmatch '^(COD|REGION|CODIGO)') {
            $allTransport += [PSCustomObject]@{
                Region = $sname
                Planta = $codPlanta
                Tipo = $tipoServ
                Linea = $linea
            }
        }
    }
}
$zip.Dispose()

Write-Output "Total Transport Lines: $($allTransport.Count)"
$byTipo = $allTransport | Group-Object Tipo
foreach ($g in $byTipo) {
    Write-Output "Tipo: '$($g.Name)' -> Count: $($g.Count)"
}

$ltc_ltn = $allTransport | Where-Object { 
    $_.Tipo -like 'LTC*' -or $_.Tipo -like 'LTN*' -or 
    $_.Linea -like 'LTC*' -or $_.Linea -like 'LTN*'
}
Write-Output "LTC + LTN count: $($ltc_ltn.Count)"

Write-Output "`nUnique LTC/LTN Lineas: $(($ltc_ltn | Select-Object -Unique Linea).Count)"
