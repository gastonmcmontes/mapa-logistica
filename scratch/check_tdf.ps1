$c = Get-Content ".\nodos-data.js" -Raw
$start = $c.IndexOf("const NODOS_DATA_OFICIAL = [")
$end = $c.IndexOf("const RESUMEN_EJECUTIVO_OFICIAL = {")
$jsonStr = $c.Substring($start + "const NODOS_DATA_OFICIAL = ".Length, $end - ($start + "const NODOS_DATA_OFICIAL = ".Length)).Trim().TrimEnd(';')
$nodos = $jsonStr | ConvertFrom-Json

$tdf = $nodos | Where-Object { $_.provincia -match "Tierra" -or $_.nombre -match "RIO GRANDE" -or $_.nombre -match "USHUAIA" }

Write-Host "Found TDF nodes:" ($tdf | Measure-Object).Count
foreach ($n in $tdf) {
    Write-Host "ID: $($n.id) | Cod: $($n.cod) | Nombre: $($n.nombre) | Provincia: $($n.provincia) | Lat: $($n.lat) | Lng: $($n.lng) | Fotos: $($n.fotos.Count)"
}
