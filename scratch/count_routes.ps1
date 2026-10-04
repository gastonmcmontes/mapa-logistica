$content = Get-Content 'data/nodos_dataset.json' -Raw
$data = $content | ConvertFrom-Json

$allRoutes = @()
foreach ($p in $data) {
    if ($p.transportes) {
        foreach ($t in $p.transportes) {
            $allRoutes += [PSCustomObject]@{
                Planta = $p.id
                Linea = $t.linea
                Tipo = $t.tipoServicio
            }
        }
    }
}

Write-Output "Total routes: $($allRoutes.Count)"
$byTipo = $allRoutes | Group-Object Tipo
foreach ($g in $byTipo) {
    Write-Output "Tipo: '$($g.Name)' -> Count: $($g.Count)"
}

$ltn_ltc = $allRoutes | Where-Object { 
    $_.Tipo -like '*LTN*' -or $_.Tipo -like '*LTC*' -or $_.Linea -like 'LTN*' -or $_.Linea -like 'LTC*' 
}
Write-Output "Total LTN/LTC routes: $($ltn_ltc.Count)"

# Unique lineas
$uniqueLineas = $allRoutes | Select-Object -ExpandProperty Linea -Unique
Write-Output "Unique lineas: $($uniqueLineas.Count)"
$uniqueLtnLtc = $ltn_ltc | Select-Object -ExpandProperty Linea -Unique
Write-Output "Unique LTN/LTC lineas: $($uniqueLtnLtc.Count)"
