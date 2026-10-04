$c = Get-Content ".\nodos-data.js" -Raw
$start = $c.IndexOf("const NODOS_DATA_OFICIAL = [")
$end = $c.IndexOf("const RESUMEN_EJECUTIVO_OFICIAL = {")
$jsonStr = $c.Substring($start + "const NODOS_DATA_OFICIAL = ".Length, $end - ($start + "const NODOS_DATA_OFICIAL = ".Length)).Trim().TrimEnd(';')
$nodos = $jsonStr | ConvertFrom-Json

Write-Host "Total nodos: $($nodos.Count)"
$totM2All = 0
$totM2Parsed = 0

foreach ($n in $nodos) {
    # Extract from capacidad string e.g. "18.500 m²" or capacidadM2
    $capStr = $n.capacidad
    $clean = $capStr -replace '[^0-9]', ''
    $num = 0
    if ($clean) { $num = [double]$clean }
    $m2Num = $n.capacidadM2
    $totM2All += $num
    $totM2Parsed += $m2Num
    Write-Host "$($n.cod) ($($n.nombre)) -> capacidad: '$($n.capacidad)' ($num m2) | capacidadM2: $m2Num | isSpecial: $($n.isSpecialEstanco)"
}

Write-Host "`n=== TOTALES DE SUPERFICIE ==="
Write-Host "Suma de strings de capacidad de las tarjetas: $totM2All m2"
Write-Host "Suma de capacidadM2 campo numerico: $totM2Parsed m2"

$bue = $nodos | Where-Object { $_.id -eq "bue" }
$trt = $nodos | Where-Object { $_.id -eq "trt" }
Write-Host "BUE: $($bue.capacidad) ($($bue.capacidadM2) m2)"
Write-Host "TRT: $($trt.capacidad) ($($trt.capacidadM2) m2)"
