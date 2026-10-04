$data = Get-Content 'data/nodos_dataset.json' -Raw | ConvertFrom-Json
Write-Output "Total Plants in JSON: $($data.Count)"
$vta = 0; $jur = 0; $vol = 0; $dot = 0; $aux = 0; $m2 = 0
foreach ($d in $data) {
    $vta += $d.volumenVentaNum
    $jur += $d.volumenJurisdiccionNum
    $vol += $d.volumenTotalNum
    $dot += $d.dotacionTotal
    $aux += $d.dotacionAuxiliares
    $m2 += $d.capacidadM2
    Write-Output "Cod=$($d.cod) | Nom=$($d.nombre) | Reg=$($d.regionKey) | Impo=$($d.volumenVentaNum) | Jur=$($d.volumenJurisdiccionNum) | Tot=$($d.volumenTotalNum) | Dot=$($d.dotacionTotal) | Aux=$($d.dotacionAuxiliares)"
}
Write-Output "=================================================="
Write-Output "TOTAL IMPOSICION (env/dia): $vta"
Write-Output "TOTAL JURISDICCION (env/dia): $jur"
Write-Output "TOTAL VOLUMEN (env/dia): $vol"
Write-Output "TOTAL DOTACION: $dot"
Write-Output "TOTAL AUXILIARES: $aux"
Write-Output "TOTAL SUPERFICIE: $m2 m²"
