$data = Get-Content -Raw "data/nodos_dataset.json" | ConvertFrom-Json

Write-Host "Verificando turnos de las 36 plantas..."
$okCount = 0
foreach ($p in $data) {
    $t = $p.turnos
    $jn = [int]$t.noche.jerarquico
    $an = [int]$t.noche.auxiliares
    $jm = [int]$t.manana.jerarquico
    $am = [int]$t.manana.auxiliares
    $jt = [int]$t.tarde.jerarquico
    $at = [int]$t.tarde.auxiliares
    
    $totTurnos = $jn + $an + $jm + $am + $jt + $at
    Write-Host "$($p.cod) ($($p.nombre)): Dotacion=$($p.dotacionTotal) (Aux=$($p.dotacionAuxiliares)) | Mañana=$($jm+$am) (J:$jm, A:$am) | Tarde=$($jt+$at) (J:$jt, A:$at) | Noche=$($jn+$an) (J:$jn, A:$an) | SumaTurnos=$totTurnos"
    $okCount++
}

Write-Host "Total plantas con turnos completos: $okCount de $($data.Count)"
