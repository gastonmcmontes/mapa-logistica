Add-Type -AssemblyName System.IO.Compression.FileSystem

function Get-FullData {
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

    # Read Sheet 1 (plantas)
    $s1 = $zipAP.GetEntry('xl/worksheets/sheet1.xml')
    $sr = New-Object System.IO.StreamReader($s1.Open())
    $xmlS1 = [xml]$sr.ReadToEnd()
    $sr.Dispose()
    
    $apPlants = @()
    foreach ($r in $xmlS1.worksheet.sheetData.row) {
        $rowObj = @{ RowNum = [int]$r.r }
        foreach ($c in $r.c) {
            $val = $c.v
            if ($c.t -eq 's') { $val = $stringsAP[[int]$val] }
            $colLetter = ($c.r -replace '[0-9]', '')
            $rowObj[$colLetter] = $val
        }
        $apPlants += [PSCustomObject]$rowObj
    }

    # Read Sheet 6 (Resumen)
    $s6 = $zipAP.GetEntry('xl/worksheets/sheet6.xml')
    $sr = New-Object System.IO.StreamReader($s6.Open())
    $xmlS6 = [xml]$sr.ReadToEnd()
    $sr.Dispose()
    
    $apResumen = @()
    foreach ($r in $xmlS6.worksheet.sheetData.row) {
        $rowObj = @{ RowNum = [int]$r.r }
        foreach ($c in $r.c) {
            $val = $c.v
            if ($c.t -eq 's') { $val = $stringsAP[[int]$val] }
            $colLetter = ($c.r -replace '[0-9]', '')
            $rowObj[$colLetter] = $val
        }
        $apResumen += [PSCustomObject]$rowObj
    }

    # Read transport from Sheets 2, 3, 4, 5
    $regSheets = @(
        @{ Name = 'SUR'; File = 'sheet2.xml' },
        @{ Name = 'CUYO NOA'; File = 'sheet3.xml' },
        @{ Name = 'CENTRO NEA'; File = 'sheet4.xml' },
        @{ Name = 'PBA'; File = 'sheet5.xml' }
    )
    $allTransport = @()
    foreach ($rs in $regSheets) {
        $entry = $zipAP.GetEntry("xl/worksheets/$($rs.File)")
        $sr = New-Object System.IO.StreamReader($entry.Open())
        $xmlRS = [xml]$sr.ReadToEnd()
        $sr.Dispose()
        foreach ($r in $xmlRS.worksheet.sheetData.row) {
            $rowObj = @{ RowNum = [int]$r.r; Region = $rs.Name }
            foreach ($c in $r.c) {
                $val = $c.v
                if ($c.t -eq 's') { $val = $stringsAP[[int]$val] }
                $colLetter = ($c.r -replace '[0-9]', '')
                $rowObj[$colLetter] = $val
            }
            if ($rowObj.B -and $rowObj.D -and $rowObj.B -notmatch '^(COD|REGION|CODIGO)') {
                $allTransport += [PSCustomObject]$rowObj
            }
        }
    }
    $zipAP.Dispose()

    # Read RESUMEN_PAIS
    $zipRP = [System.IO.Compression.ZipFile]::OpenRead('data/RESUMEN_PAIS_UM_MAS_6.3 3.xlsx')
    $ssRP = $zipRP.GetEntry('xl/sharedStrings.xml')
    $sr = New-Object System.IO.StreamReader($ssRP.Open())
    $xmlSSRP = [xml]$sr.ReadToEnd()
    $sr.Dispose()
    $stringsRP = @()
    foreach ($si in $xmlSSRP.sst.si) {
        if ($si.t -ne $null) { $stringsRP += $si.t }
        elseif ($si.r -ne $null) { $stringsRP += ($si.r | ForEach-Object { $_.t }) -join '' }
        else { $stringsRP += '' }
    }

    $sRP1 = $zipRP.GetEntry('xl/worksheets/sheet1.xml')
    $sr = New-Object System.IO.StreamReader($sRP1.Open())
    $xmlRP1 = [xml]$sr.ReadToEnd()
    $sr.Dispose()
    
    $rpRows = @()
    foreach ($r in $xmlRP1.worksheet.sheetData.row) {
        $rowObj = @{ RowNum = [int]$r.r }
        foreach ($c in $r.c) {
            $val = $c.v
            if ($c.t -eq 's') { $val = $stringsRP[[int]$val] }
            $colLetter = ($c.r -replace '[0-9]', '')
            $rowObj[$colLetter] = $val
        }
        $rpRows += [PSCustomObject]$rowObj
    }
    $zipRP.Dispose()

    return @{
        AP_Plants = $apPlants
        AP_Resumen = $apResumen
        AP_Transport = $allTransport
        RP_Rows = $rpRows
    }
}

$data = Get-FullData
Write-Output "AP Plants: $($data.AP_Plants.Count)"
Write-Output "AP Resumen: $($data.AP_Resumen.Count)"
Write-Output "AP Transport: $($data.AP_Transport.Count)"
Write-Output "RP Rows: $($data.RP_Rows.Count)"
