$path = Resolve-Path ".\nodos-data.js"
$lines = Get-Content $path
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match 'CATAMARCA|Catamarca|CTC') {
        Write-Host "Line $i : $($lines[$i])"
    }
}
