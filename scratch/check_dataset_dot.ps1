$content = Get-Content 'data/nodos_dataset.json' -Raw
$data = $content | ConvertFrom-Json
Write-Output "Count: $($data.Count)"
$tot = 0
$aux = 0
foreach ($p in $data) {
    $t = $p.dotacionTotal
    $a = $p.dotacionAuxiliares
    $tot += $t
    $aux += $a
    Write-Output "$($p.id) ($($p.nombre)): Total=$t, Aux=$a"
}
Write-Output "TOTAL COUNTRY: Total=$tot, Aux=$aux"
