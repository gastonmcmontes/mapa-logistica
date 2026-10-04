$lines = Get-Content .\nodos-data.js
$jsonLines = $lines | Where-Object { $_ -notmatch '^const NODOS_DATA_OFICIAL =' -and $_ -notmatch 'module\.exports' }
$jsonText = $jsonLines -join "`n"
$jsonText = $jsonText.Trim()
if ($jsonText.EndsWith(";")) {
    $jsonText = $jsonText.Substring(0, $jsonText.Length - 1).Trim()
}
$data = $jsonText | ConvertFrom-Json
Write-Host "Total nodes: $($data.Count)"
for ($i = 0; $i -lt $data.Count; $i++) {
    $n = $data[$i]
    Write-Host ("[{0}] {1} | {2} | {3} | {4} | VolTotal: {5}" -f $i, $n.nombre, $n.nombreCompleto, $n.tipo, $n.provincia, $n.volumenTotalNum)
}
