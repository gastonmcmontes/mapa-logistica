Add-Type -AssemblyName System.IO.Compression.FileSystem

function Get-SheetRows($zip, $sheetEntryName, $sharedStrings) {
    $sheetEntry = $zip.GetEntry($sheetEntryName)
    if (!$sheetEntry) { return @() }
    $sStream = $sheetEntry.Open()
    $sReader = New-Object System.IO.StreamReader($sStream)
    $sXml = [xml]$sReader.ReadToEnd()
    $sReader.Close()
    $sStream.Close()
    
    $rowsData = @()
    foreach ($row in $sXml.worksheet.sheetData.row) {
        $rowObj = [ordered]@{}
        foreach ($c in $row.c) {
            $colLetter = $c.r -replace '[0-9]', ''
            $val = $c.v
            if ($c.t -eq "s" -and $val -ne $null) {
                $idx = [int]$val
                if ($idx -lt $sharedStrings.Count) {
                    $val = $sharedStrings[$idx]
                }
            }
            $rowObj[$colLetter] = $val
        }
        $rowsData += ,$rowObj
    }
    return $rowsData
}

function Process-Workbook($filePath) {
    Write-Host "=== Analyzing $filePath ==="
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
            $sharedStrings += $si.t
        }
    }
    
    # Read workbook.xml
    $wbEntry = $zip.GetEntry("xl/workbook.xml")
    $wbStream = $wbEntry.Open()
    $wbReader = New-Object System.IO.StreamReader($wbStream)
    $wbXml = [xml]$wbReader.ReadToEnd()
    $wbReader.Close()
    $wbStream.Close()
    
    $sheets = $wbXml.workbook.sheets.sheet
    $sheetIdx = 1
    foreach ($sheet in $sheets) {
        Write-Host "--- Sheet: $($sheet.name) (sheet$sheetIdx.xml) ---"
        $rows = Get-SheetRows $zip "xl/worksheets/sheet$sheetIdx.xml" $sharedStrings
        Write-Host "Total rows: $($rows.Count)"
        if ($rows.Count -gt 0) {
            for ($i = 0; $i -lt [Math]::Min(10, $rows.Count); $i++) {
                $r = $rows[$i]
                $str = ($r.Keys | ForEach-Object { "$_=$($r[$_])" }) -join " | "
                Write-Host "Row $($i+1): $str"
            }
        }
        $sheetIdx++
    }
    
    $zip.Dispose()
}

Process-Workbook "data/Analisis plantas Logisticas act..xlsx"
Process-Workbook "data/RESUMEN_PAIS_UM_MAS_6.3 3.xlsx"
