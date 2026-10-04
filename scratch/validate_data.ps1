$lines = Get-Content .\nodos-data.js
$jsonLines = $lines | Where-Object { $_ -notmatch '^const NODOS_DATA_OFICIAL =' -and $_ -notmatch 'module\.exports' }
$jsonText = ($jsonLines -join "`n").Trim()
if ($jsonText.EndsWith(";")) {
    $jsonText = $jsonText.Substring(0, $jsonText.Length - 1).Trim()
}
try {
    $data = $jsonText | ConvertFrom-Json
    Write-Host "Success parsing nodos-data.js! Total nodes: $($data.Count)"
    $ctc = $data | Where-Object { $_.cod -eq 'CTC' -or $_.id -eq 'ctc' }
    Write-Host "Catamarca -> Nombre: $($ctc.nombre), Cod: $($ctc.cod), Vol2D: $($ctc.volumen2D), Vol2DNum: $($ctc.volumen2DNum), Vol2dMensual: $($ctc.volumen2dMensual)"
} catch {
    Write-Host "Error parsing JSON: $_"
}
