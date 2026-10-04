$content = Get-Content -Raw "data/nodos_dataset.json"
$data = $content | ConvertFrom-Json

Write-Host "Total Plantas: $($data.Count)"
$totVol = 0
$totDot = 0
$totAux = 0
$totImp = 0
$totJur = 0

foreach ($p in $data) {
    $totVol += $p.volumenTotalNum
    $totDot += $p.dotacionTotal
    $totAux += $p.dotacionAuxiliares
    $totImp += $p.volumenVentaNum
    $totJur += $p.volumenJurisdiccionNum
    Write-Host "[$($p.cod)] $($p.nombre): SLA Paq.AR = $($p.calidad.slaPaqAr)% | FV = $($p.calidad.fvPaqAr)%"
}

Write-Host "=== TOTALES ==="
Write-Host "Total Volumen: $totVol"
Write-Host "Total Dotación: $totDot"
Write-Host "Total Auxiliares: $totAux"
Write-Host "Total Imposición: $totImp"
Write-Host "Total Jurisdicción: $totJur"

