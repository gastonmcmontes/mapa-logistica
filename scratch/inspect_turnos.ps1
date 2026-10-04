Add-Type -AssemblyName System.IO.Compression.FileSystem

function Inspect-ExcelSheets($filePath) {
    Write-Host "=== Inspecting: $filePath ==="
    $zip = [System.IO.Compression.ZipFile]::OpenRead($filePath)
    
    # Read workbook.xml to get sheet names
    $wbEntry = $zip.GetEntry("xl/workbook.xml")
    $wbStream = $wbEntry.Open()
    $wbReader = New-Object System.IO.StreamReader($wbStream)
    $wbXml = [xml]$wbReader.ReadToEnd()
    $wbReader.Close()
    $wbStream.Close()
    
    # Read sharedStrings.xml
    $sstEntry = $zip.GetEntry("xl/sharedStrings.xml")
    $sharedStrings = @()
    if ($sstEntry) {
        $sstStream = $sstEntry.Open()
        $sstReader = New-Object System.IO.StreamReader($sstStream)
        $sstXml = [xml]$sstReader.ReadToEnd()
        $sstReader.Close()
        $sstStream.Close()
        foreach ($si in $sstXml.sst.si) {
            $sharedStrings += $si.t
        }
    }
    
    $sheets = $wbXml.workbook.sheets.sheet
    foreach ($sheet in $sheets) {
        Write-Host "Sheet: $($sheet.name) (Id: $($sheet.sheetId), r:id: $($sheet.id))"
    }

    # Inspect first sheet rows
    $sheet1Entry = $zip.GetEntry("xl/worksheets/sheet1.xml")
    if ($sheet1Entry) {
        $sStream = $sheet1Entry.Open()
        $sReader = New-Object System.IO.StreamReader($sStream)
        $sXml = [xml]$sReader.ReadToEnd()
        $sReader.Close()
        $sStream.Close()
        
        Write-Host "--- Sheet1 First 5 Rows ---"
        $rows = $sXml.worksheet.sheetData.row | Select-Object -First 6
        foreach ($row in $rows) {
            $cells = @()
            foreach ($c in $row.c) {
                $val = $c.v
                if ($c.t -eq "s" -and $val -ne $null) {
                    $idx = [int]$val
                    if ($idx -lt $sharedStrings.Count) {
                        $val = $sharedStrings[$idx]
                    }
                }
                $cells += "$($c.r): $val"
            }
            Write-Host ("Row $($row.r): " + ($cells -join " | "))
        }
    }
    
    $zip.Dispose()
}

Inspect-ExcelSheets "data/Analisis plantas Logisticas act..xlsx"
Inspect-ExcelSheets "data/RESUMEN_PAIS_UM_MAS_6.3 3.xlsx"
