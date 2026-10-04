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
    $unidad = $cells["B"]
    $colAI = $cells["AI"]
    Write-Host "$cod | Unidad='$unidad' | Col AI='$colAI'"
}
