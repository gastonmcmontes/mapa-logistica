# Script to add BUE and TRT to datasets without artificial quality/transport/turnos
$jsonPath = "data\nodos_dataset.json"
$dataset = Get-Content $jsonPath -Raw | ConvertFrom-Json

# Filter out if already present
$filtered = @($dataset | Where-Object { $_.cod -ne "BUE" -and $_.cod -ne "TRT" -and $_.id -ne "bue" -and $_.id -ne "trt" })

$bueNode = [PSCustomObject]@{
    id = "bue"
    cod = "BUE"
    tipo = "CTP"
    nombre = "CTP BUENOS AIRES"
    nombreCompleto = "CTP BUENOS AIRES (BUE)"
    provincia = "Buenos Aires"
    region = "Metropolitana (AMBA)"
    regionKey = "amba"
    ubicacion = "Monte Grande / Ezeiza"
    domicilio = "Autopista Tte. Gral. Riccheri y Av. de la Tradición, Ezeiza / Monte Grande, Buenos Aires"
    lat = -34.8101138
    lng = -58.4921152
    capacidadM2 = 20980
    capacidad = "20.980 m²"
    dotacionTotal = 272
    dotacionAuxiliares = 272
    piezasDia = "76.998"
    volumenTotalNum = 76998
    volumenVenta = "7.926"
    volumenVentaNum = 7925.6
    volumenJurisdiccion = "0"
    volumenJurisdiccionNum = 0
    operatividad = "24 / 7"
    desc = "Centro de Tratamiento Postal Central (BUE). Nodo logístico neurálgico y principal hub mecanizado del país, ubicado estratégicamente sobre la Autopista Riccheri. Superficie total cubierta de 20.980 m² (contempla BUE-CPI y Rebut + Galpón electorales)."
    isSpecialEstanco = $true
    responsables = [PSCustomObject]@{
        jefePlanta = "José Tappa"
        jefeNodo = "José Tappa"
    }
    inmueble = [PSCustomObject]@{
        almacenamiento = "Planta de Tratamiento Integral y CPI"
        alquilada = "Propio"
        seguridadObservaciones = "BUE contempla superficie de BUE-CPI y Rebut + Galpón electorales"
    }
    ingresoEnvios = [PSCustomObject]@{
        diarioMaquinable = 63980.0
        impoMensualMaquinable = 1407559.0
        diarioNoMaquinable = 13018.1
        impoMensualNoMaquinable = 286398.0
        diarioUltimaMilla = 7925.6
        ingresoMensualUltimaMilla = 174364.0
        impoMensual = 174364.0
        procesoDiario = 76998.0
        piezasAProcesar = 1693957.0
    }
    fotos = @(
        "imagenes/metro-pba/ctp bue.jpg",
        "imagenes/metro-pba/ctp bue 2.jpg",
        "imagenes/metro-pba/ctp bue 3.jpg",
        "imagenes/metro-pba/ctp bue 4.jpg"
    )
    transportes = @()
}

$trtNode = [PSCustomObject]@{
    id = "trt"
    cod = "TRT"
    tipo = "CLOG"
    nombre = "TORTUGUITAS"
    nombreCompleto = "CLOG TORTUGUITAS (TRT / POD)"
    provincia = "Buenos Aires"
    region = "Metropolitana (AMBA)"
    regionKey = "amba"
    ubicacion = "Tortuguitas"
    domicilio = "Parque Industrial Tortuguitas, Panamericana Ramal Pilar, Buenos Aires"
    lat = -34.4551093
    lng = -58.7036353
    capacidadM2 = 50000
    capacidad = "50.000 m²"
    dotacionTotal = 172
    dotacionAuxiliares = 172
    piezasDia = "3.851"
    volumenTotalNum = 3851
    volumenVenta = "2.754"
    volumenVentaNum = 2754.2
    volumenJurisdiccion = "0"
    volumenJurisdiccionNum = 0
    operatividad = "24 / 7"
    desc = "Centro Logístico Tortuguitas (POD / TRT). Mega parque logístico de 50.000 m² cubiertos integrando todas las naves operativas, con capacidad para cross-docking, paquetería de gran porte, no maquinable y operaciones de grandes cuentas e imposición."
    isSpecialEstanco = $true
    responsables = [PSCustomObject]@{
        jefePlanta = "Magdalena Baldini"
        jefeNodo = "Magdalena Baldini"
    }
    inmueble = [PSCustomObject]@{
        almacenamiento = "Parque Logístico Multimodal"
        alquilada = "Alquilada"
        seguridadObservaciones = "POD contempla superficie de todas las naves (50.000 m²)"
    }
    ingresoEnvios = [PSCustomObject]@{
        diarioMaquinable = 0.0
        impoMensualMaquinable = 0.0
        diarioNoMaquinable = 2774.2
        impoMensualNoMaquinable = 61033.0
        diarioUltimaMilla = 2754.2
        ingresoMensualUltimaMilla = 60593.0
        impoMensual = 84727.0
        procesoDiario = 3851.2
        piezasAProcesar = 84727.0
    }
    fotos = @(
        "imagenes/metro-pba/foto trt.jpg",
        "imagenes/metro-pba/fotos trt 1.jpg",
        "imagenes/metro-pba/foto trt2.jpg",
        "imagenes/metro-pba/foto trt 3.jpg"
    )
    transportes = @()
}

$newDataset = $filtered + @($bueNode, $trtNode)

$jsonOut = $newDataset | ConvertTo-Json -Depth 10
[System.IO.File]::WriteAllText((Join-Path (Get-Location) "data\nodos_dataset.json"), $jsonOut, [System.Text.Encoding]::UTF8)

$jsContent = "const NODOS_DATA_OFICIAL = " + $jsonOut + ";" + [Environment]::NewLine + "if (typeof module !== 'undefined') { module.exports = { NODOS_DATA_OFICIAL }; }" + [Environment]::NewLine
[System.IO.File]::WriteAllText((Join-Path (Get-Location) "data\nodos-data.js"), $jsContent, [System.Text.Encoding]::UTF8)
[System.IO.File]::WriteAllText((Join-Path (Get-Location) "nodos-data.js"), $jsContent, [System.Text.Encoding]::UTF8)

Write-Host "Updated dataset cleanly with $($newDataset.Count) nodes (including BUE and TRT without artificial fields)."
