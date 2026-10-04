$c = Get-Content ".\nodos-data.js" -Raw
Write-Host "Contains NODOS_DATA_OFICIAL:" $c.Contains("const NODOS_DATA_OFICIAL = [")
Write-Host "Contains RESUMEN_EJECUTIVO_OFICIAL:" $c.Contains("const RESUMEN_EJECUTIVO_OFICIAL = {")
Write-Host "Contains TRANSPORTE_RED_OFICIAL:" $c.Contains("const TRANSPORTE_RED_OFICIAL = [")
