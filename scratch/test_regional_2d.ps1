$raw = Get-Content .\nodos-data.js -Raw
$first = $raw.IndexOf('[')
$last = $raw.LastIndexOf(']')
$json = $raw.Substring($first, $last - $first + 1)
$nodes = $json | ConvertFrom-Json

Write-Host "Total nodes in dataset: $($nodes.Count)"
$with2D = $nodes | Where-Object { $_.volumen2DNum -gt 0 }
Write-Host "Nodes with 2D > 0: $($with2D.Count)"

$totD = ($nodes | Measure-Object -Property volumen2DNum -Sum).Sum
$totM = ($nodes | Measure-Object -Property volumen2dMensualNum -Sum).Sum
Write-Host ("Total Nacional 2D -> Diario: {0:N0} ({1:N1}), Mensual: {2:N0}" -f $totD, $totD, $totM)

Write-Host "`n--- RESUMEN REGIONAL 2D ---"
$nodes | Group-Object regionKey | ForEach-Object {
    $regSumD = ($_.Group | Measure-Object -Property volumen2DNum -Sum).Sum
    $regSumM = ($_.Group | Measure-Object -Property volumen2dMensualNum -Sum).Sum
    Write-Host ("Región {0,-10} ({1} nodos) -> Diario: {2,8:N0} | Mensual: {3,10:N0}" -f $_.Name, $_.Count, $regSumD, $regSumM)
}
