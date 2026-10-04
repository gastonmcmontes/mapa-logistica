$c = Get-Content ".\nodos-data.js" -Raw
$start = $c.IndexOf("const NODOS_DATA_OFICIAL = [")
$end = $c.IndexOf("const RESUMEN_EJECUTIVO_OFICIAL = {")
$jsonStr = $c.Substring($start + "const NODOS_DATA_OFICIAL = ".Length, $end - ($start + "const NODOS_DATA_OFICIAL = ".Length)).Trim().TrimEnd(';')
$nodos = $jsonStr | ConvertFrom-Json

foreach ($n in $nodos) {
    $isArr = $n.fotos -is [System.Array]
    Write-Host "$($n.id) ($($n.nombre)) -> fotos type: $(if ($isArr) { 'Array (' + $n.fotos.Count + ')' } else { 'String: ' + $n.fotos })"
}
