$c = Get-Content ".\nodos-data.js" -Raw
$start = $c.IndexOf("const NODOS_DATA_OFICIAL = [")
$end = $c.IndexOf("const RESUMEN_EJECUTIVO_OFICIAL = {")
$jsonStr = $c.Substring($start + "const NODOS_DATA_OFICIAL = ".Length, $end - ($start + "const NODOS_DATA_OFICIAL = ".Length)).Trim().TrimEnd(';')
$nodos = $jsonStr | ConvertFrom-Json

$checkCod = @('CRD', 'REL', 'RSA', 'PER', 'CTC', 'C15')

foreach ($cod in $checkCod) {
    $n = $nodos | Where-Object { $_.cod -eq $cod }
    Write-Host "=== $($n.nombre) ($($n.cod)) - Total fotos: $($n.fotos.Count) ==="
    $idx = 1
    foreach ($f in $n.fotos) {
        Write-Host ("  Foto " + $idx + ": " + $f)
        $idx++
    }
}
