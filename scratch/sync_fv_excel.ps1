$excelPath = (Join-Path (Get-Location) "data\fv desde enero.xlsx")
$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false

$fvMap = @{}
try {
    $wb = $excel.Workbooks.Open($excelPath)
    $sheet = $wb.Sheets.Item(1)
    $arr = $sheet.UsedRange.Value2
    $wb.Close($false)
    
    # Paq.AR is rows 77 to 112, Col 13 is name, Col 22 is sep-26
    for ($r = 78; $r -le 112; $r++) {
        $pName = [string]$arr[$r, 13]
        $sepVal = $arr[$r, 22]
        if ($null -ne $sepVal -and "$sepVal" -ne "") {
            $numVal = [Math]::Round([double]$sepVal * 100, 1)
            $fvMap[$pName.Trim().ToUpper()] = $numVal
        }
    }
} finally {
    $excel.Quit()
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null
}

Write-Host "Read $($fvMap.Count) plants from Excel."

# Load dataset
$jsonPath = (Join-Path (Get-Location) "data\nodos_dataset.json")
$dataset = Get-Content $jsonPath -Raw -Encoding UTF8 | ConvertFrom-Json

foreach ($n in $dataset) {
    $cod = $n.cod
    $nom = $n.nombre.ToUpper()
    $nomComp = $n.nombreCompleto.ToUpper()
    
    $val = $null
    
    if ($cod -eq "DP4" -or $nom -like "*MERCADO CENTRAL*") { $val = $fvMap["CENTRO PAQUETERIA LOMAS"] }
    elseif ($cod -eq "DP5" -or $nom -like "*MORENO*") { $val = $fvMap["CENTRO PAQUETERIA MORON"] }
    elseif ($cod -eq "DP2" -or $nom -like "*BARRACAS*" -or $nom -like "*CABA SUR*") { $val = $fvMap["CENTRO PAQUETERIA CABA SUR"] }
    elseif ($cod -eq "DP3" -or $nom -like "*QUILMES*") { $val = $fvMap["CENTRO PAQUETERIA QUILMES"] }
    elseif ($cod -eq "DP6" -or $nom -like "*VICENTE LOPEZ*") { $val = $fvMap["PAQUETERIA VICENTE LOPEZ"] }
    elseif ($cod -eq "C10" -or $nom -like "*TUCUMAN*") { $val = $fvMap["SAN MIGUEL DE TUCUMAN"] }
    elseif ($fvMap.ContainsKey($nom)) { $val = $fvMap[$nom] }
    else {
        foreach ($k in $fvMap.Keys) {
            if ($nom.Contains($k) -or $k.Contains($nom)) {
                $val = $fvMap[$k]
                break
            }
        }
    }
    
    if ($null -ne $val) {
        if ($null -eq $n.calidad) {
            $n | Add-Member -MemberType NoteProperty -Name "calidad" -Value ([PSCustomObject]@{})
        }
        $n.calidad.fvPaqAr = [double]$val
        $n.calidad.fvPaqArStr = "$val%"
        Write-Host "[$cod] $($n.nombre) -> FV = $val%"
    } else {
        Write-Host "WARNING: [$cod] $($n.nombre) not matched, keeping existing ($($n.calidad.fvPaqAr)%)" -ForegroundColor Yellow
    }
}

$jsonOut = $dataset | ConvertTo-Json -Depth 10
[System.IO.File]::WriteAllText($jsonPath, $jsonOut, [System.Text.Encoding]::UTF8)

$jsContent = "const NODOS_DATA_OFICIAL = " + $jsonOut + ";" + [Environment]::NewLine + "if (typeof module !== 'undefined') { module.exports = { NODOS_DATA_OFICIAL }; }" + [Environment]::NewLine
[System.IO.File]::WriteAllText((Join-Path (Get-Location) "data\nodos-data.js"), $jsContent, [System.Text.Encoding]::UTF8)
[System.IO.File]::WriteAllText((Join-Path (Get-Location) "nodos-data.js"), $jsContent, [System.Text.Encoding]::UTF8)

Write-Host "Dataset successfully synced with fv desde enero.xlsx."
