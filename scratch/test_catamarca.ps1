$lines = Get-Content .\nodos-data.js
$jsonLines = $lines | Where-Object { $_ -notmatch '^const NODOS_DATA_OFICIAL =' -and $_ -notmatch 'module\.exports' }
$jsonText = ($jsonLines -join "`n").Trim()
if ($jsonText.EndsWith(";")) {
    $jsonText = $jsonText.Substring(0, $jsonText.Length - 1).Trim()
}
$data = $jsonText | ConvertFrom-Json
$ctc = $data | Where-Object { $_.cod -eq 'CTC' }
Write-Host "Nodo: $($ctc.nombre)"
Write-Host "Cod: $($ctc.cod)"
Write-Host "Volumen 2D Diario (Col G): $($ctc.volumen2D) ($($ctc.volumen2DNum))"
Write-Host "Volumen 2D Mensual: $($ctc.volumen2dMensual) ($($ctc.volumen2dMensualNum))"
Write-Host "Volumen Paqueteria Diario: $($ctc.volumenTotalNum)"
