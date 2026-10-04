$content = Get-Content -Raw "data/nodos_dataset.json"
$data = $content | ConvertFrom-Json

Write-Host "=== CURRENT PLANT TYPES ==="
$data | Group-Object tipo | Format-Table -AutoSize

Write-Host "`n=== DETALLE ACTUAL DE LAS 36 PLANTAS ==="
$data | Select-Object cod, nombre, tipo | Format-Table -AutoSize
