Add-Type -AssemblyName System.IO.Compression.FileSystem

$zip = [System.IO.Compression.ZipFile]::OpenRead('data/Maestro_kpis.xlsx')
$entrySS = $zip.GetEntry('xl/sharedStrings.xml')
$srSS = New-Object System.IO.StreamReader($entrySS.Open())
$xmlSS = [xml]$srSS.ReadToEnd()
$srSS.Dispose()
$strings = @()
foreach ($si in $xmlSS.sst.si) {
    if ($si.t -ne $null) { $strings += $si.t }
    elseif ($si.r -ne $null) { $strings += ($si.r | ForEach-Object { $_.t }) -join '' }
    else { $strings += '' }
}

$entryS3 = $zip.GetEntry('xl/worksheets/sheet4.xml') # SLA FV Diario
$srS3 = New-Object System.IO.StreamReader($entryS3.Open())
$xmlS3 = [xml]$srS3.ReadToEnd()
$srS3.Dispose()
$zip.Dispose()

$rows = $xmlS3.worksheet.sheetData.row | Select-Object -First 10
foreach ($r in $rows) {
    $rowText = @()
    foreach ($c in $r.c) {
        $val = $c.v
        if ($c.t -eq 's' -and $val -ne $null) { $val = $strings[[int]$val] }
        $rowText += "$($c.r): $val"
    }
    Write-Host "Row $($r.r): $($rowText -join ' | ')"
}
