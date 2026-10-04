$data = Get-Content -Raw "data/nodos_dataset.json" | ConvertFrom-Json

Write-Host "Comparando Dotación Total vs Suma de Turnos..."
$totDiff = 0
foreach ($p in $data) {
    $t = $p.turnos
    $jn = [int]$t.noche.jerarquico
    $an = [int]$t.noche.auxiliares
    $jm = [int]$t.manana.jerarquico
    $am = [int]$t.manana.auxiliares
    $jt = [int]$t.tarde.jerarquico
    $at = [int]$t.tarde.auxiliares
    
    $sumaTurnos = $jn + $an + $jm + $am + $jt + $at
    $dotTotal = [int]$p.dotacionTotal
    $diff = $dotTotal - $sumaTurnos
    if ($diff -ne 0) {
        $totDiff += $diff
        Write-Host "$($p.cod) ($($p.nombre)): DotTotal=$dotTotal | SumaTurnos=$sumaTurnos | Diferencia=+$diff (Jerárquicos en turnos: $($jn+$jm+$jt), Auxiliares: $($an+$am+$at), AuxTotal: $($p.dotacionAuxiliares))"
    }
}

Write-Host "Diferencia Total Nacional: +$totDiff personas (1402 + $totDiff = 1431)"
