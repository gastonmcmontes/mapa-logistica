# Update coordinates of DP3, DP4, DP5, DP6 across all data files

# 1. Update data/plantas_dump.json
$plantasFile = 'data/plantas_dump.json'
if (Test-Path $plantasFile) {
    $content = [System.IO.File]::ReadAllText((Resolve-Path $plantasFile), [System.Text.Encoding]::UTF8)
    $arr = $content | ConvertFrom-Json
    foreach ($p in $arr) {
        $cod = $p.'Cod de Planta'
        if ($cod -eq 'DP3') {
            $p.Coordenadas = "-34.7226221,-58.2823639"
        } elseif ($cod -eq 'DP4') {
            $p.Coordenadas = "-34.7139416,-58.4939291"
        } elseif ($cod -eq 'DP5') {
            $p.Coordenadas = "-34.6304111,-58.7644768"
        } elseif ($cod -eq 'DP6') {
            $p.Coordenadas = "-34.5179159,-58.5133463"
        }
    }
    $newJson = $arr | ConvertTo-Json -Depth 10
    [System.IO.File]::WriteAllText((Resolve-Path $plantasFile), $newJson, [System.Text.Encoding]::UTF8)
    Write-Host "Updated $plantasFile"
}

# 2. Update data/nodos_dataset.json
$datasetFile = 'data/nodos_dataset.json'
if (Test-Path $datasetFile) {
    $content = [System.IO.File]::ReadAllText((Resolve-Path $datasetFile), [System.Text.Encoding]::UTF8)
    $arr = $content | ConvertFrom-Json
    foreach ($n in $arr) {
        if ($n.cod -eq 'DP3') {
            $n.lat = -34.7226221
            $n.lng = -58.2823639
        } elseif ($n.cod -eq 'DP4') {
            $n.lat = -34.7139416
            $n.lng = -58.4939291
        } elseif ($n.cod -eq 'DP5') {
            $n.lat = -34.6304111
            $n.lng = -58.7644768
        } elseif ($n.cod -eq 'DP6') {
            $n.lat = -34.5179159
            $n.lng = -58.5133463
        }
    }
    $newJson = $arr | ConvertTo-Json -Depth 50
    [System.IO.File]::WriteAllText((Resolve-Path $datasetFile), $newJson, [System.Text.Encoding]::UTF8)
    Write-Host "Updated $datasetFile"
}

# 3. Update nodos-data.js and data/nodos-data.js
$jsFiles = @('nodos-data.js', 'data/nodos-data.js')
foreach ($jsFile in $jsFiles) {
    if (Test-Path $jsFile) {
        $content = [System.IO.File]::ReadAllText((Resolve-Path $jsFile), [System.Text.Encoding]::UTF8)
        
        # Regex replacement per node chunk or exact coords around DP3, DP4, DP5, DP6
        # DP3 Quilmes was (-34.7139416, -58.4939291) -> now (-34.7226221, -58.2823639)
        # DP4 Mercado Central was (-34.6304111, -58.7644768) -> now (-34.7139416, -58.4939291)
        # DP5 Moreno was (-34.5179159, -58.5133463) -> now (-34.6304111, -58.7644768)
        # DP6 Vicente Lopez was (-34.7226221, -58.2823639) -> now (-34.5179159, -58.5133463)
        
        # Let's parse NODOS_DATA_OFICIAL section
        $startIdx = $content.IndexOf("const NODOS_DATA_OFICIAL = [")
        $endIdx = $content.IndexOf("const RESUMEN_EJECUTIVO_OFICIAL =")
        
        if ($startIdx -ge 0 -and $endIdx -gt $startIdx) {
            $prefix = $content.Substring(0, $startIdx + "const NODOS_DATA_OFICIAL = ".Length)
            $jsonPart = $content.Substring($startIdx + "const NODOS_DATA_OFICIAL = ".Length, $endIdx - ($startIdx + "const NODOS_DATA_OFICIAL = ".Length)).TrimEnd(";", "`r", "`n", " ")
            $suffix = $content.Substring($endIdx)
            
            $arr = $jsonPart | ConvertFrom-Json
            foreach ($n in $arr) {
                if ($n.cod -eq 'DP3') {
                    $n.lat = -34.7226221
                    $n.lng = -58.2823639
                } elseif ($n.cod -eq 'DP4') {
                    $n.lat = -34.7139416
                    $n.lng = -58.4939291
                } elseif ($n.cod -eq 'DP5') {
                    $n.lat = -34.6304111
                    $n.lng = -58.7644768
                } elseif ($n.cod -eq 'DP6') {
                    $n.lat = -34.5179159
                    $n.lng = -58.5133463
                }
            }
            $newNodosJson = $arr | ConvertTo-Json -Depth 50
            $finalContent = $prefix + $newNodosJson + ";`r`n`r`n" + $suffix
            [System.IO.File]::WriteAllText((Resolve-Path $jsFile), $finalContent, [System.Text.Encoding]::UTF8)
            Write-Host "Updated $jsFile"
        }
    }
}
