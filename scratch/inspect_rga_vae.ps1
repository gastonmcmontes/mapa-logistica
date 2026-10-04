$c = Get-Content ".\nodos-data.js" -Raw
$start = $c.IndexOf("const NODOS_DATA_OFICIAL = [")
$end = $c.IndexOf("const RESUMEN_EJECUTIVO_OFICIAL = {")
$jsonStr = $c.Substring($start + "const NODOS_DATA_OFICIAL = ".Length, $end - ($start + "const NODOS_DATA_OFICIAL = ".Length)).Trim().TrimEnd(';')
$nodos = $jsonStr | ConvertFrom-Json

$rga = $nodos | Where-Object { $_.id -eq "rga" }
$vae = $nodos | Where-Object { $_.id -eq "vae" }

Write-Host "=== RGA ==="
Write-Host ($rga | ConvertTo-Json -Depth 5)

Write-Host "=== VAE ==="
Write-Host ($vae | ConvertTo-Json -Depth 5)
