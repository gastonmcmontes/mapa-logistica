$raw = Get-Content .\nodos-data.js -Raw
$first = $raw.IndexOf('[')
$last = $raw.LastIndexOf(']')
$json = $raw.Substring($first, $last - $first + 1)
$data = $json | ConvertFrom-Json
$ctc = $data | Where-Object { $_.cod -eq 'CTC' }
Write-Host "Nombre: $($ctc.nombre)"
Write-Host "Cod: $($ctc.cod)"
Write-Host "Volumen 2D Diario (Col G): $($ctc.volumen2D) ($($ctc.volumen2DNum))"
Write-Host "Volumen 2D Mensual: $($ctc.volumen2dMensual) ($($ctc.volumen2dMensualNum))"
Write-Host "Volumen Paqueteria Diario: $($ctc.volumenTotalNum)"
