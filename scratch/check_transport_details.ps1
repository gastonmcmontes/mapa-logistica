Add-Type -AssemblyName System.IO.Compression.FileSystem

$zipAP = [System.IO.Compression.ZipFile]::OpenRead('data/Analisis plantas Logisticas act..xlsx')
$ssAP = $zipAP.GetEntry('xl/sharedStrings.xml')
$sr = New-Object System.IO.StreamReader($ssAP.Open())
$xmlSS = [xml]$sr.ReadToEnd()
$sr.Dispose()
$stringsAP = @()
foreach ($si in $xmlSS.sst.si) {
    if ($si.t -ne $null) { $stringsAP += $si.t }
    elseif ($si.r -ne $null) { $stringsAP += ($si.r | ForEach-Object { $_.t }) -join '' }
    else { $stringsAP += '' }
}

function Clean-Str($v) {
    if ($v -eq $null) { return "" }
    return $v.ToString().Trim()
}

$regConfigs = @(
    @{ Name = 'SUR'; File = 'sheet2.xml'; TrStart = 22 },
    @{ Name = 'CUYO NOA'; File = 'sheet3.xml'; TrStart = 30 },
    @{ Name = 'CENTRO NEA'; File = 'sheet4.xml'; TrStart = 27 },
    @{ Name = 'PBA'; File = 'sheet5.xml'; TrStart = 21 }
)

$all = @()
foreach ($cfg in $regConfigs) {
    $entry = $zipAP.GetEntry("xl/worksheets/$($cfg.File)")
    $sr = New-Object System.IO.StreamReader($entry.Open())
    $xmlRS = [xml]$sr.ReadToEnd()
    $sr.Dispose()
    foreach ($r in $xmlRS.worksheet.sheetData.row) {
        $rNum = [int]$r.r
        if ($rNum -ge $cfg.TrStart) {
            $cells = @{}
            foreach ($c in $r.c) {
                $val = $c.v
                if ($c.t -eq 's' -and $val -ne $null) { $val = $stringsAP[[int]$val] }
                $colLetter = ($c.r -replace '[0-9]', '')
                $cells[$colLetter] = $val
            }
            $codPlanta = Clean-Str $cells['B']
            $tipoServ = Clean-Str $cells['C']
            $linea = Clean-Str $cells['D']
            if ($linea -and $codPlanta -and $codPlanta.ToUpper() -notmatch '^(COD|CODIGO|REGION|TOTAL)') {
                $all += [PSCustomObject]@{
                    Sheet = $cfg.Name
                    Row = $rNum
                    CodPlanta = $codPlanta
                    TipoServicio = $tipoServ
                    Linea = $linea
                    Frecuencia = Clean-Str $cells['E']
                    Entrega = Clean-Str $cells['F']
                    Recibe = Clean-Str $cells['G']
                }
            }
        }
    }
}
$zipAP.Dispose()

Write-Host "Checking non-standard lines:"
$all | Where-Object { $_.Linea -eq 't' -or $_.TipoServicio -eq '' } | Format-Table -AutoSize

Write-Host "Checking strictly TipoServicio == 'LTC' or 'LTN*':"
$strict = $all | Where-Object { $_.TipoServicio -eq 'LTC' -or $_.TipoServicio -like 'LTN*' }
Write-Host "Strict Count: $($strict.Count) (LTC: $(($strict | Where-Object {$_.TipoServicio -eq 'LTC'}).Count), LTN: $(($strict | Where-Object {$_.TipoServicio -like 'LTN*'}).Count))"

# Check all TipoServicio
$all | Group-Object TipoServicio | Format-Table -AutoSize
