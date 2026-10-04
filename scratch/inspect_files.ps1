Add-Type -AssemblyName System.IO.Compression.FileSystem

function Inspect-Xlsx($path) {
    Write-Output "=================================================="
    Write-Output "INSPECTING: $path"
    $zip = [System.IO.Compression.ZipFile]::OpenRead($path)
    
    $wbEntry = $zip.GetEntry('xl/workbook.xml')
    $sr = New-Object System.IO.StreamReader($wbEntry.Open())
    $wbXml = [xml]$sr.ReadToEnd()
    $sr.Dispose()
    
    $sheets = $wbXml.workbook.sheets.sheet
    foreach ($s in $sheets) {
        Write-Output "Sheet: name=$($s.name), id=$($s.sheetId), r:id=$($s.id)"
    }
    $zip.Dispose()
}

Inspect-Xlsx "data/RESUMEN_PAIS_UM_MAS_6.3 3.xlsx"
Inspect-Xlsx "data/Analisis plantas Logisticas act..xlsx"
