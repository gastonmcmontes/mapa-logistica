$c = Get-Content ".\nodos-data.js" -Raw
$nodosMatch = [regex]::Matches($c, '"id":\s*"([^"]+)"')
$transMatch = [regex]::Matches($c, '"linea":\s*"([^"]+)"')
$vol2dMatch = [regex]::Matches($c, '"volumen2DNum":\s*([0-9]+)')

Write-Host "Nodos count: $($nodosMatch.Count)"
Write-Host "Transport count: $($transMatch.Count)"
Write-Host "Nodos with 2D count: $($vol2dMatch.Count)"

$catMatch = [regex]::Match($c, '\{[^{}]*"nombre":\s*"CATAMARCA"[^{}]*\}')
Write-Host "Catamarca sample:"
Write-Host $catMatch.Value
