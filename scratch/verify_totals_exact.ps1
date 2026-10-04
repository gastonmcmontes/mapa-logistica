$c = Get-Content ".\nodos-data.js" -Raw
$start = $c.IndexOf("const NODOS_DATA_OFICIAL = [")
$end = $c.IndexOf("const RESUMEN_EJECUTIVO_OFICIAL = {")
$jsonStr = $c.Substring($start + "const NODOS_DATA_OFICIAL = ".Length, $end - ($start + "const NODOS_DATA_OFICIAL = ".Length)).Trim().TrimEnd(';')
$nodos = $jsonStr | ConvertFrom-Json

$auditNodes = $nodos | Where-Object { -not $_.isSpecialEstanco }
$totImp = 0
$totJur = 0

foreach ($n in $auditNodes) {
    $imp = 0
    $jur = 0
    $ing = $n.ingresoEnvios
    if ($ing -and ($ing.diarioMaquinable -or $ing.diarioNoMaquinable -or $ing.diarioUltimaMilla)) {
        $imp = ($ing.diarioMaquinable -as [double]) + ($ing.diarioNoMaquinable -as [double])
        $jur = $ing.diarioUltimaMilla -as [double]
    } else {
        $imp = $n.volumenVentaNum -as [double]
        $jur = $n.volumenJurisdiccionNum -as [double]
    }
    $totImp += $imp
    $totJur += $jur
}

$totVol = $totImp + $totJur
Write-Host "Total Plantas Auditadas: $($auditNodes.Count)"
Write-Host "Total Imposicion: $([Math]::Round($totImp)) (esperado: 105300)"
Write-Host "Total Jurisdiccion: $([Math]::Round($totJur)) (esperado: 110033)"
Write-Host "Total Volumen Diario: $([Math]::Round($totVol)) (esperado: 215333)"

$rga = $nodos | Where-Object { $_.id -eq "rga" }
$vae = $nodos | Where-Object { $_.id -eq "vae" }
Write-Host "`nRGA Card -> Capacidad: $($rga.capacidad) | Piezas: $($rga.piezasDia) ($($rga.volumenVenta) Imp / $($rga.volumenJurisdiccion) Jur) | 2D: $($rga.volumen2D)"
Write-Host "VAE Card -> Capacidad: $($vae.capacidad) | Piezas: $($vae.piezasDia) ($($vae.volumenVenta) Imp / $($vae.volumenJurisdiccion) Jur) | 2D: $($vae.volumen2D)"
