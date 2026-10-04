Add-Type -AssemblyName System.IO.Compression.FileSystem

function Get-SheetData($xlsxPath, $sheetEntryName) {
    $zip = [System.IO.Compression.ZipFile]::OpenRead($xlsxPath)
    $ssEntry = $zip.GetEntry('xl/sharedStrings.xml')
    $strings = @()
    if ($ssEntry) {
        $sr = New-Object System.IO.StreamReader($ssEntry.Open())
        $ssXml = [xml]$sr.ReadToEnd()
        $sr.Dispose()
        foreach ($si in $ssXml.sst.si) {
            if ($si.t -ne $null) { $strings += $si.t }
            elseif ($si.r -ne $null) { $strings += ($si.r | ForEach-Object { $_.t }) -join '' }
            else { $strings += '' }
        }
    }
    $sheetEntry = $zip.GetEntry($sheetEntryName)
    $sr = New-Object System.IO.StreamReader($sheetEntry.Open())
    $xml = [xml]$sr.ReadToEnd()
    $sr.Dispose()
    $zip.Dispose()

    $results = @()
    foreach ($r in $xml.worksheet.sheetData.row) {
        $rowObj = @{ RowNum = [int]$r.r }
        foreach ($c in $r.c) {
            $val = $c.v
            if ($c.t -eq 's') { $val = $strings[[int]$val] }
            $colLetter = ($c.r -replace '[0-9]', '')
            $rowObj[$colLetter] = $val
        }
        $results += [PSCustomObject]$rowObj
    }
    return $results
}

$rp1 = Get-SheetData "data/RESUMEN_PAIS_UM_MAS_6.3 3.xlsx" "xl/worksheets/sheet1.xml"
$ap1 = Get-SheetData "data/Analisis plantas Logisticas act..xlsx" "xl/worksheets/sheet1.xml"

Write-Output "=== MAPPING PLANTS BETWEEN RESUMEN_PAIS AND ANALISIS PLANTAS ==="

$rp_plants = @{}
foreach ($r in ($rp1 | Where-Object { $_.RowNum -ge 11 -and $_.RowNum -le 45 })) {
    $name = $r.B.Trim().ToUpper()
    $rp_plants[$name] = $r
}

foreach ($r in ($ap1 | Where-Object { $_.RowNum -ge 2 })) {
    $cod = $r.A.Trim()
    $nom = $r.B.Trim()
    
    # Try match
    $matched = $null
    foreach ($k in $rp_plants.Keys) {
        if ($nom.ToUpper().Contains($k) -or $k.Contains($nom.ToUpper()) -or 
            ($cod -eq 'DP2' -and $k -like '*BARRACAS*') -or
            ($cod -eq 'DP3' -and $k -like '*QUILMES*') -or
            ($cod -eq 'DP4' -and ($k -like '*LOMAS*' -or $k -like '*MERCADO CENTRAL*')) -or
            ($cod -eq 'DP5' -and ($k -like '*MOR*' -or $k -like '*MORENO*')) -or
            ($cod -eq 'DP6' -and ($k -like '*VTE*' -or $k -like '*VICENTE LOPEZ*')) -or
            ($cod -eq 'VAE' -and $k -like '*USHUAIA*') -or
            ($cod -eq 'RSA' -and $k -like '*SANTA ROSA*') -or
            ($cod -eq 'CRD' -and $k -like '*COMODORO*') -or
            ($cod -eq 'REL' -and $k -like '*TRELEW*') -or
            ($cod -eq 'BRC' -and $k -like '*BARILOCHE*') -or
            ($cod -eq 'C12' -and $k -like '*NEUQUEN*') -or
            ($cod -eq 'C15' -and $k -like '*RIO GALLEGOS*') -or
            ($cod -eq 'C14' -and $k -like '*LA PLATA*') -or
            ($cod -eq 'CL4' -and $k -like '*BAHIA BLANCA*') -or
            ($cod -eq 'CL3' -and $k -like '*MAR DEL PLATA*') -or
            ($cod -eq 'MER' -and $k -like '*MERCEDES*') -or
            ($cod -eq 'PER' -and $k -like '*PERGAMINO*') -or
            ($cod -eq 'CL6' -and $k -like '*MENDOZA*') -or
            ($cod -eq 'UAQ' -and $k -like '*SAN JUAN*') -or
            ($cod -eq 'LUQ' -and $k -like '*SAN LUIS*') -or
            ($cod -eq 'CTC' -and $k -like '*CATAMARCA*') -or
            ($cod -eq 'CL8' -and $k -like '*LA RIOJA*') -or
            ($cod -eq 'JUJ' -and $k -like '*JUJUY*') -or
            ($cod -eq 'CL5' -and $k -like '*SALTA*') -or
            ($cod -eq 'C11' -and $k -like '*SANTIAGO*') -or
            ($cod -eq 'C10' -and $k -like '*TUCUMAN*') -or
            ($cod -eq 'ROL' -and $k -like '*ROSARIO*') -or
            ($cod -eq 'CL9' -and $k -like '*SANTA FE*') -or
            ($cod -eq 'C13' -and $k -like '*POSADAS*') -or
            ($cod -eq 'NCQ' -and $k -like '*CORRIENTES*') -or
            ($cod -eq 'CL7' -and $k -like '*CORDOBA*') -or
            ($cod -eq 'NIJ' -and $k -like '*PARANA*') -or
            ($cod -eq 'RPQ' -and $k -like '*RESISTENCIA*') -or
            ($cod -eq 'VMR' -and $k -like '*VILLA MARIA*') -or
            ($cod -eq 'RCU' -and $k -like '*RIO CUARTO*')
        ) {
            $matched = $rp_plants[$k]
            $matchedKey = $k
            break
        }
    }
    
    if ($matched) {
        Write-Output "OK: Cod=$cod | AP_Nom=$nom -> RP_Nom=$matchedKey | ImpoM=$($matched.C) | MaqM=$($matched.D) | NoMaqM=$($matched.E) | UMM=$($matched.F) | ProcM=$($matched.G) | MaqDia=$($matched.J) | NoMaqDia=$($matched.K) | UMDia=$($matched.L) | ProcDia=$($matched.M)"
    } else {
        Write-Output "MISSING IN RP: Cod=$cod | AP_Nom=$nom"
    }
}
