Add-Type -AssemblyName System.IO.Compression.FileSystem

$zip = [System.IO.Compression.ZipFile]::OpenRead("data/Analisis plantas Logisticas act..xlsx")
$sstEntry = $zip.GetEntry("xl/sharedStrings.xml")
$sharedStrings = @()
if ($sstEntry) {
    $sstStream = $sstEntry.Open()
    $sstReader = New-Object System.IO.StreamReader($sstStream)
    $sstXml = [xml]$sstReader.ReadToEnd()
    $sstReader.Close()
    $sstStream.Close()
    foreach ($si in $sstXml.sst.si) {
        if ($si.t -ne $null) { $sharedStrings += $si.t }
        elseif ($si.r -ne $null) { $sharedStrings += ($si.r | ForEach-Object { $_.t }) -join '' }
        else { $sharedStrings += '' }
    }
}

$sEntry = $zip.GetEntry("xl/worksheets/sheet1.xml")
$sStream = $sEntry.Open()
$sReader = New-Object System.IO.StreamReader($sStream)
$sXml = [xml]$sReader.ReadToEnd()
$sReader.Close()
$sStream.Close()
$zip.Dispose()

$rows = $sXml.worksheet.sheetData.row
Write-Host "Total rows in sheet1: $($rows.Count)"

$plantasAudit = @()

for ($i = 1; $i -lt $rows.Count; $i++) {
    $r = $rows[$i]
    $cells = @{}
    foreach ($c in $r.c) {
        $val = $c.v
        if ($c.t -eq "s" -and $val -ne $null) {
            $val = $sharedStrings[[int]$val]
        }
        $colLetter = ($c.r -replace '[0-9]', '')
        $cells[$colLetter] = $val
    }
    
    $cod = $cells["A"]
    $nombre = $cells["B"]
    $dotTotal = $cells["J"]
    $dotAux = $cells["K"]
    
    # Noche
    $fNoche = $cells["L"]
    $jNoche = $cells["M"]
    $aNoche = $cells["N"]
    
    # Mañana
    $fManana = $cells["O"]
    $jManana = $cells["P"]
    $aManana = $cells["Q"]
    
    # Tarde
    $fTarde = $cells["R"]
    $jTarde = $cells["S"]
    $aTarde = $cells["T"]
    
    $plantasAudit += [PSCustomObject]@{
        Idx = $i
        Cod = $cod
        Nombre = $nombre
        DotTotal = $dotTotal
        DotAux = $dotAux
        Noche = "Franja: '$fNoche', J: '$jNoche', A: '$aNoche'"
        Manana = "Franja: '$fManana', J: '$jManana', A: '$aManana'"
        Tarde = "Franja: '$fTarde', J: '$jTarde', A: '$aTarde'"
    }
}

$plantasAudit | Format-Table -AutoSize
