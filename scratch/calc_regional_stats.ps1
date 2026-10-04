$data = Get-Content 'data/nodos_dataset.json' -Raw | ConvertFrom-Json

$regions = @('amba', 'pba', 'centro', 'cuyo', 'patagonia')
$regNames = @{
    'amba' = 'Metropolitana / AMBA'
    'pba' = 'PBA / La Pampa'
    'centro' = 'Centro / NEA'
    'cuyo' = 'Cuyo / NOA'
    'patagonia' = 'Patagonia / Sur'
}

$totVolAll = 0.0
foreach ($d in $data) { $totVolAll += [double]$d.volumenTotalNum }

foreach ($r in $regions) {
    $plants = $data | Where-Object { $_.regionKey -eq $r }
    $impo = 0.0; $jur = 0.0; $vol = 0.0; $dot = 0; $aux = 0; $m2 = 0.0
    foreach ($p in $plants) {
        $impo += [double]$p.volumenVentaNum
        $jur += [double]$p.volumenJurisdiccionNum
        $vol += [double]$p.volumenTotalNum
        $dot += [int]$p.dotacionTotal
        $aux += [int]$p.dotacionAuxiliares
        $m2 += [double]$p.capacidadM2
    }
    $pct = [math]::Round(($vol / $totVolAll * 100), 1)

    $allTr = @()
    foreach ($p in $plants) {
        if ($p.transportes) { $allTr += $p.transportes }
    }
    $ltc_ltn = $allTr | Where-Object { 
        $_.tipoServicio -like 'LTC*' -or $_.tipoServicio -like 'LTN*' -or 
        $_.linea -like 'LTC*' -or $_.linea -like 'LTN*'
    }

    Write-Output "--------------------------------------------------"
    Write-Output "REGION: $($regNames[$r]) ($($plants.Count) plantas)"
    Write-Output "Imposicion: {0:N1} env/dia" -f $impo
    Write-Output "Jurisdiccion: {0:N1} env/dia" -f $jur
    Write-Output "Total Volumen: {0:N1} env/dia ($pct%)" -f $vol
    Write-Output "Dotacion Total: $dot (Auxiliares: $aux)"
    Write-Output "Superficie: {0:N0} m²" -f $m2
    Write-Output "LTC+LTN Troncales: $($ltc_ltn.Count) (Total rutas regionales: $($allTr.Count))"
}
