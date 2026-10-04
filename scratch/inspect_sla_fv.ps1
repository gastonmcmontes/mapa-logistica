Add-Type -AssemblyName System.IO.Compression.FileSystem

$filePath = "data/Maestro_kpis.xlsx"
$zip = [System.IO.Compression.ZipFile]::OpenRead($filePath)

# Read sharedStrings
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

function Inspect-Sheet($zip, $sheetEntryName, $sheetName, $maxRows=15) {
    Write-Host "=== Inspecting Sheet: $sheetName ($sheetEntryName) ==="
    $entry = $zip.GetEntry($sheetEntryName)
    if (!$entry) { Write-Host "Entry not found"; return }
    $stream = $entry.Open()
    $reader = New-Object System.IO.StreamReader($stream)
    $xml = [xml]$reader.ReadToEnd()
    $reader.Close()
    $stream.Close()
    
    $rows = $xml.worksheet.sheetData.row | Select-Object -First $maxRows
    foreach ($row in $rows) {
        $cells = @()
        foreach ($c in $row.c) {
            $val = $c.v
            if ($c.t -eq "s" -and $val -ne $null) {
                $idx = [int]$val
                if ($idx -lt $sharedStrings.Count) { $val = $sharedStrings[$idx] }
            }
            $cells += "$($c.r): $val"
        }
        Write-Host ("Row $($row.r): " + ($cells -join " | "))
    }
}

# Sheet 4: SLA FV Diario is rId4 -> sheet4.xml
# Sheet 5: SLA FV Acumulado is rId5 -> sheet5.xml
Inspect-Sheet $zip "xl/worksheets/sheet4.xml" "SLA FV Diario" 12
Inspect-Sheet $zip "xl/worksheets/sheet5.xml" "SLA FV Acumulado" 12

$zip.Dispose()
