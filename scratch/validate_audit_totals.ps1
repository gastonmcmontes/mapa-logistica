$data = Get-Content -Raw "data\nodos_dataset.json" | ConvertFrom-Json

$auditNodes = $data | Where-Object { -not $_.isSpecialEstanco }
$specialNodes = $data | Where-Object { $_.isSpecialEstanco }

Write-Host "Total Nodos Dataset: $($data.Count)"
Write-Host "Audit Nodos (para métricas y Analytics): $($auditNodes.Count)"
Write-Host "Special Estanco Nodos (BUE y TRT): $($specialNodes.Count)"

$totVol = 0
$totImp = 0
$totJur = 0
$totDot = 0
$totAux = 0
$totM2 = 0

foreach ($p in $auditNodes) {
    $imp = 0
    $jur = 0
    if ($p.ingresoEnvios -and ($p.ingresoEnvios.diarioMaquinable -or $p.ingresoEnvios.diarioNoMaquinable -or $p.ingresoEnvios.diarioUltimaMilla)) {
        $imp = [double]($p.ingresoEnvios.diarioMaquinable + $p.ingresoEnvios.diarioNoMaquinable)
        $jur = [double]($p.ingresoEnvios.diarioUltimaMilla)
    } else {
        $imp = [double]$p.volumenVentaNum
        $jur = [double]$p.volumenJurisdiccionNum
    }
    $totImp += $imp
    $totJur += $jur
    $totVol += ($imp + $jur)
    $totDot += [int]$p.dotacionTotal
    $totAux += [int]$p.dotacionAuxiliares
    $totM2 += [int]$p.capacidadM2
}

Write-Host "`n=== AUDIT TOTALS (Must match exact dashboard KPIs) ==="
Write-Host "Volumen Total Diario: $([Math]::Round($totVol)) (Esperado: 215333)"
Write-Host "Imposición Diaria: $([Math]::Round($totImp)) (Esperado: 105300)"
Write-Host "Jurisdicción Diaria: $([Math]::Round($totJur)) (Esperado: 110033)"
Write-Host "Dotación Total: $totDot (Esperado: 1431)"
Write-Host "Dotación Auxiliares: $totAux (Esperado: 1125)"
Write-Host "Superficie M2: $totM2 (Esperado: 73196)"

Write-Host "`n=== SPECIAL ESTANCO NODES (Solo en su tarjeta de mapa) ==="
foreach ($s in $specialNodes) {
    Write-Host "[$($s.cod)] $($s.nombreCompleto)"
    Write-Host "  - Superficie: $($s.capacidad) (M2: $($s.capacidadM2))"
    Write-Host "  - Dotación: $($s.dotacionTotal) (Jefe: $($s.responsables.jefePlanta))"
    Write-Host "  - Piezas/Día: $($s.piezasDia)"
    Write-Host "  - Fotos: $($s.fotos -join ', ')"
    Write-Host "  - Observaciones: $($s.inmueble.seguridadObservaciones)"
}
