$path = 'data/nodos_dataset.json'
$raw = Get-Content $path -Raw -Encoding UTF8
$data = $raw | ConvertFrom-Json

foreach($n in $data){
    if($n.tipo -eq 'CLOG' -and $n.nombreCompleto -like 'CTP*'){
        $n.nombreCompleto = $n.nombreCompleto.Replace('CTP', 'CLOG')
    }
    if($n.tipo -eq 'CTP' -and $n.nombreCompleto -like 'CLOG*'){
        $n.nombreCompleto = $n.nombreCompleto.Replace('CLOG', 'CTP')
    }
}

$json = $data | ConvertTo-Json -Depth 10
[System.IO.File]::WriteAllText((Join-Path (Get-Location) 'data/nodos_dataset.json'), $json, [System.Text.Encoding]::UTF8)

$jsContent = "const NODOS_DATA_OFICIAL = " + $json + ";" + [Environment]::NewLine + "if (typeof module !== 'undefined') { module.exports = { NODOS_DATA_OFICIAL }; }" + [Environment]::NewLine
[System.IO.File]::WriteAllText((Join-Path (Get-Location) 'data/nodos-data.js'), $jsContent, [System.Text.Encoding]::UTF8)
[System.IO.File]::WriteAllText((Join-Path (Get-Location) 'nodos-data.js'), $jsContent, [System.Text.Encoding]::UTF8)

Write-Host "Sync completed."
