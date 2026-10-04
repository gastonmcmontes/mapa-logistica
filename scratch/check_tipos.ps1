$data = Get-Content -Raw "data/nodos_dataset.json" | ConvertFrom-Json

Write-Host "Contando tipos de planta..."
$tipos = @{}
foreach ($p in $data) {
    $t = $p.tipo
    if (!$tipos.ContainsKey($t)) { $tipos[$t] = 0 }
    $tipos[$t]++
    Write-Host "$($p.cod) - $($p.nombre) ($($p.region)): tipo = '$t'"
}

Write-Host "=== Resumen de tipos ==="
foreach ($k in $tipos.Keys) {
    Write-Host "$($k): $($tipos[$k])"
}
