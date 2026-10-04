Add-Type -AssemblyName System.IO.Compression.FileSystem

$filePath = "data/Maestro_kpis.xlsx"
Write-Host "=== Inspecting: $filePath ==="
$zip = [System.IO.Compression.ZipFile]::OpenRead($filePath)

# Read workbook.xml to get sheet names
$wbEntry = $zip.GetEntry("xl/workbook.xml")
$wbStream = $wbEntry.Open()
$wbReader = New-Object System.IO.StreamReader($wbStream)
$wbXml = [xml]$wbReader.ReadToEnd()
$wbReader.Close()
$wbStream.Close()

$sheets = $wbXml.workbook.sheets.sheet
$sheetIdx = 1
foreach ($sheet in $sheets) {
    Write-Host "Sheet $($sheetIdx): $($sheet.name) (Id: $($sheet.sheetId), r:id: $($sheet.id))"
    $sheetIdx++
}

$zip.Dispose()
