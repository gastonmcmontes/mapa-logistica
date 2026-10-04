Add-Type -AssemblyName System.IO.Compression.FileSystem

function Build-CompleteData {
    $zipAP = [System.IO.Compression.ZipFile]::OpenRead('data/Analisis plantas Logisticas act..xlsx')
    $ssAP = $zipAP.GetEntry('xl/sharedStrings.xml')
    $sr = New-Object System.IO.StreamReader($ssAP.Open())
    $xmlSS = [xml]$sr.ReadToEnd()
    $sr.Dispose()
    $stringsAP = @()
    foreach ($si in $xmlSS.sst.si) {
        if ($si.t -ne $null) { $stringsAP += $si.t }
        elseif ($si.r -ne $null) { $stringsAP += ($si.r | ForEach-Object { $_.t }) -join '' }
        else { $stringsAP += '' }
    }

    function Clean-Str($v) {
        if ($v -eq $null) { return "" }
        return $v.ToString().Trim()
    }

    function Parse-Num($v) {
        if ($v -eq $null -or $v -eq "") { return 0.0 }
        $str = $v.ToString().Trim()
        if ($str -match ' a ') {
            $parts = $str -split ' a '
            $p1 = [double]($parts[0] -replace '[^0-9.]', '')
            $p2 = [double]($parts[1] -replace '[^0-9.]', '')
            return [math]::Round(($p1 + $p2) / 2.0, 1)
        }
        $c = $str -replace '[^0-9.]', ''
        if ($c -eq '') { return 0.0 }
        return [double]$c
    }

    function Format-Excel-Time($v) {
        if ($v -eq $null -or $v -eq '') { return '' }
        $str = $v.ToString().Trim()
        if ($str -eq '-' -or $str -eq '0' -or $str.ToLower() -eq 'no') { return '' }
        if ($str -match '^\d{1,2}:\d{2}') { return $str }
        
        $num = 0.0
        if ([double]::TryParse($str, [System.Globalization.NumberStyles]::Any, [System.Globalization.CultureInfo]::InvariantCulture, [ref]$num)) {
            if ($num -gt 0 -and $num -le 1) {
                $totMin = [int][math]::Round($num * 24.0 * 60.0)
                $hh = [int][math]::Floor($totMin / 60) % 24
                $mm = [int]($totMin % 60)
                return ("{0:D2}:{1:D2} hs" -f $hh, $mm)
            }
            return ''
        }
        return $str
    }

    # 1. PARSE SHEET 1 (plantas)
    $s1 = $zipAP.GetEntry('xl/worksheets/sheet1.xml')
    $sr = New-Object System.IO.StreamReader($s1.Open())
    $xmlS1 = [xml]$sr.ReadToEnd()
    $sr.Dispose()
    
    $apPlants = @()
    foreach ($r in $xmlS1.worksheet.sheetData.row) {
        $rNum = [int]$r.r
        if ($rNum -ge 2) {
            $cells = @{}
            foreach ($c in $r.c) {
                $val = $c.v
                if ($c.t -eq 's' -and $val -ne $null) { $val = $stringsAP[[int]$val] }
                $colLetter = ($c.r -replace '[0-9]', '')
                $cells[$colLetter] = $val
            }
            $apPlants += [PSCustomObject]$cells
        }
    }

    # 2. PARSE SHEET 6 (Resumen)
    $s6 = $zipAP.GetEntry('xl/worksheets/sheet6.xml')
    $sr = New-Object System.IO.StreamReader($s6.Open())
    $xmlS6 = [xml]$sr.ReadToEnd()
    $sr.Dispose()
    
    $plantasOptimizacion = @{}
    $resumenEjecutivo = @()

    foreach ($r in $xmlS6.worksheet.sheetData.row) {
        $rNum = [int]$r.r
        $cells = @{}
        foreach ($c in $r.c) {
            $val = $c.v
            if ($c.t -eq 's' -and $val -ne $null) { $val = $stringsAP[[int]$val] }
            $colLetter = ($c.r -replace '[0-9]', '')
            $cells[$colLetter] = $val
        }
        
        # Resumen regional filas 2 a 5
        if ($rNum -ge 2 -and $rNum -le 5) {
            $reg = Clean-Str $cells['A']
            if ($reg) {
                $resumenEjecutivo += @{
                    region = $reg
                    auxiliaresOperativos = [int](Parse-Num $cells['C'])
                    personalNecesario = [int](Parse-Num $cells['D'])
                    reubicar = [int](Parse-Num $cells['E'])
                    pctReubicar = [double](Parse-Num $cells['F'])
                    costoAnualMas10 = [double](Parse-Num $cells['G'])
                    costoAnualPromedio = [double](Parse-Num $cells['H'])
                    costoMensualMas10 = [double](Parse-Num $cells['I'])
                    costoMensualPromedio = [double](Parse-Num $cells['J'])
                }
            }
        }
        
        # Detalle plantas filas 10 a 50
        if ($rNum -ge 10 -and $rNum -le 50) {
            $codP = Clean-Str $cells['B']
            if ($codP -and $codP.Length -le 4 -and $codP -ne 'COD') {
                $manip = Parse-Num $cells['I']
                $transp = Parse-Num $cells['J']
                $reubic = Parse-Num $cells['K']
                
                $plantasOptimizacion[$codP.ToUpper()] = @{
                    regionSheet = Clean-Str $cells['A']
                    dotacionTotal = [int](Parse-Num $cells['D'])
                    auxiliaresOperativos = [int](Parse-Num $cells['E'])
                    auxNoche = [int](Parse-Num $cells['F'])
                    auxManana = [int](Parse-Num $cells['G'])
                    auxTarde = [int](Parse-Num $cells['H'])
                    manipularPaquetes = [int]$manip
                    transporte = [int]$transp
                    aReubicar = [int]$reubic
                    necesariosTotal = [int]($manip + $transp)
                }
            }
        }
    }

    # 3. PARSE TRANSPORT (Sheets 2, 3, 4, 5)
    $regConfigs = @(
        @{ Name = 'SUR'; File = 'sheet2.xml'; TrStart = 22 },
        @{ Name = 'CUYO NOA'; File = 'sheet3.xml'; TrStart = 30 },
        @{ Name = 'CENTRO NEA'; File = 'sheet4.xml'; TrStart = 27 },
        @{ Name = 'PBA'; File = 'sheet5.xml'; TrStart = 21 }
    )
    $regionalTransportes = @()
    foreach ($cfg in $regConfigs) {
        $entry = $zipAP.GetEntry("xl/worksheets/$($cfg.File)")
        $sr = New-Object System.IO.StreamReader($entry.Open())
        $xmlRS = [xml]$sr.ReadToEnd()
        $sr.Dispose()
        foreach ($r in $xmlRS.worksheet.sheetData.row) {
            $rNum = [int]$r.r
            if ($rNum -ge $cfg.TrStart) {
                $cells = @{}
                foreach ($c in $r.c) {
                    $val = $c.v
                    if ($c.t -eq 's' -and $val -ne $null) { $val = $stringsAP[[int]$val] }
                    $colLetter = ($c.r -replace '[0-9]', '')
                    $cells[$colLetter] = $val
                }
                $codPlanta = Clean-Str $cells['B']
                $linea = Clean-Str $cells['D']
                if ($linea -and $codPlanta -and $codPlanta.ToUpper() -notmatch '^(COD|CODIGO|REGION)') {
                    $regionalTransportes += @{
                        region = if ($cells['A']) { Clean-Str $cells['A'] } else { $cfg.Name }
                        codPlanta = $codPlanta
                        tipoServicio = Clean-Str $cells['C']
                        linea = $linea
                        frecuencia = Clean-Str $cells['E']
                        entrega = Clean-Str $cells['F']
                        recibe = Clean-Str $cells['G']
                        horarioLlegada = Format-Excel-Time $cells['H']
                        horarioSalida = Format-Excel-Time $cells['I']
                        tiempoOperacion = Format-Excel-Time $cells['J']
                        turno = Clean-Str $cells['K']
                        tiempoRecorrido = Format-Excel-Time $cells['L']
                        distanciaKm = Clean-Str $cells['M']
                        kmAcumulados = Clean-Str $cells['N']
                        dependencia = Clean-Str $cells['O']
                        provincia = Clean-Str $cells['P']
                        capacidadBodega = Clean-Str $cells['Q']
                    }
                }
            }
        }
    }
    $zipAP.Dispose()

    # 4. PARSE RESUMEN_PAIS Sheet 1
    $zipRP = [System.IO.Compression.ZipFile]::OpenRead('data/RESUMEN_PAIS_UM_MAS_6.3 3.xlsx')
    $ssRP = $zipRP.GetEntry('xl/sharedStrings.xml')
    $sr = New-Object System.IO.StreamReader($ssRP.Open())
    $xmlSSRP = [xml]$sr.ReadToEnd()
    $sr.Dispose()
    $stringsRP = @()
    foreach ($si in $xmlSSRP.sst.si) {
        if ($si.t -ne $null) { $stringsRP += $si.t }
        elseif ($si.r -ne $null) { $stringsRP += ($si.r | ForEach-Object { $_.t }) -join '' }
        else { $stringsRP += '' }
    }

    $sRP1 = $zipRP.GetEntry('xl/worksheets/sheet1.xml')
    $sr = New-Object System.IO.StreamReader($sRP1.Open())
    $xmlRP1 = [xml]$sr.ReadToEnd()
    $sr.Dispose()
    $zipRP.Dispose()

    $rpPlantData = @{}
    foreach ($r in $xmlRP1.worksheet.sheetData.row) {
        $rNum = [int]$r.r
        if ($rNum -ge 11 -and $rNum -le 45) {
            $cells = @{}
            foreach ($c in $r.c) {
                $val = $c.v
                if ($c.t -eq 's' -and $val -ne $null) { $val = $stringsRP[[int]$val] }
                $colLetter = ($c.r -replace '[0-9]', '')
                $cells[$colLetter] = $val
            }
            $pName = (Clean-Str $cells['B']).ToUpper()
            $rpPlantData[$pName] = @{
                region = Clean-Str $cells['A']
                nombre = Clean-Str $cells['B']
                impoMensual = Parse-Num $cells['C']
                impoMensualMaquinable = Parse-Num $cells['D']
                impoMensualNoMaquinable = Parse-Num $cells['E']
                ingresoMensualUltimaMilla = Parse-Num $cells['F']
                piezasAProcesar = Parse-Num $cells['G']
                diarioMaquinable = Parse-Num $cells['H']
                diarioNoMaquinable = Parse-Num $cells['I']
                diarioUltimaMilla = Parse-Num $cells['J']
                procesoDiario = Parse-Num $cells['K']
            }
        }
    }

    # 5. PARSE 2D POSTAL PIECES (Info Plantas julio.xlsx)
    $zip2D = [System.IO.Compression.ZipFile]::OpenRead('data/Info Plantas julio.xlsx')
    $ss2D = $zip2D.GetEntry('xl/sharedStrings.xml')
    $sr = New-Object System.IO.StreamReader($ss2D.Open())
    $xmlSS2D = [xml]$sr.ReadToEnd()
    $sr.Dispose()
    $strings2D = @()
    foreach ($si in $xmlSS2D.sst.si) {
        if ($si.t -ne $null) { $strings2D += $si.t }
        elseif ($si.r -ne $null) { $strings2D += ($si.r | ForEach-Object { $_.t }) -join '' }
        else { $strings2D += '' }
    }
    $s2D = $zip2D.GetEntry('xl/worksheets/sheet1.xml')
    $sr = New-Object System.IO.StreamReader($s2D.Open())
    $xmlS2D = [xml]$sr.ReadToEnd()
    $sr.Dispose()
    $zip2D.Dispose()

    $map2D = @{}
    foreach ($r in $xmlS2D.worksheet.sheetData.row) {
        $rNum = [int]$r.r
        if ($rNum -ge 3 -and $rNum -le 38) {
            $cells = @{}
            foreach ($c in $r.c) {
                $val = $c.v
                if ($c.t -eq 's' -and $val -ne $null) { $val = $strings2D[[int]$val] }
                $colLetter = ($c.r -replace '[0-9]', '')
                $cells[$colLetter] = $val
            }
            $code = (Clean-Str $cells['B']).ToUpper()
            $m2d = Parse-Num $cells['F']
            $d2d = Parse-Num $cells['G']
            if ($code) {
                $map2D[$code] = @{
                    Mensual = $m2d
                    Diario = $d2d
                }
            }
        }
    }

    # 6. ASSEMBLE 36 NODES
    $photoMap = @{
        'C12' = @('imagenes/sur/NEUQUEN_1.jpg', 'imagenes/sur/NEUQUEN_2.jpg', 'imagenes/sur/NEUQUEN_3.jpg', 'imagenes/sur/NEUQUEN_4.jpg')
        'CRD' = @('imagenes/sur/COMODORO_1.jpg', 'imagenes/sur/COMODORO_2.jpg', 'imagenes/sur/COMODORO_3.jpg', 'imagenes/sur/COMODORO_4.jpg')
        'REL' = @('imagenes/sur/TRELEW_1.jpg', 'imagenes/sur/TRELEW_2.jpg', 'imagenes/sur/TRELEW_3.jpg', 'imagenes/sur/TRELEW_4.jpg')
        'C15' = @('imagenes/sur/RIO_GALLEGOS_1.jpg', 'imagenes/sur/RIO_GALLEGOS_2.jpg', 'imagenes/sur/RIO_GALLEGOS_3.jpg', 'imagenes/sur/RIO_GALLEGOS_4.jpg')
        'BRC' = @('imagenes/sur/BARILOCHE_1.jpg', 'imagenes/sur/BARILOCHE_2.jpg', 'imagenes/sur/BARILOCHE_3.jpg', 'imagenes/sur/BARILOCHE_4.jpg')
        'VAE' = @('imagenes/placeholder.jpg')
        'RGA' = @('imagenes/placeholder.jpg')
        'C14' = @('imagenes/metro-pba/La Plata.jpg', 'imagenes/metro-pba/La Plata 1.jpg', 'imagenes/metro-pba/La Plata 2.jpg', 'imagenes/metro-pba/La Plata 3.jpg')
        'CL4' = @('imagenes/metro-pba/Bahia Blanca.jpg', 'imagenes/metro-pba/Bahia Blanca 1.jpg')
        'CL3' = @('imagenes/metro-pba/M del Plata.jpg', 'imagenes/metro-pba/M del Plata 1.jpg', 'imagenes/metro-pba/M del Plata 2.jpg')
        'MER' = @('imagenes/metro-pba/Mercedes.jpg', 'imagenes/metro-pba/Mercedes 1.jpg', 'imagenes/metro-pba/Mercedes 2.jpg')
        'PER' = @('imagenes/metro-pba/Pergamino.jpg', 'imagenes/metro-pba/Pergamino 1.jpg', 'imagenes/metro-pba/Pergamino 2.jpg')
        'RSA' = @('imagenes/metro-pba/Santa Rosa.jpg', 'imagenes/metro-pba/Santa Rosa 1.jpg', 'imagenes/metro-pba/Santa Rosa 3.jpg')
        'DP2' = @('imagenes/metro-pba/Barracas.jpg', 'imagenes/metro-pba/Barracas 1.jpg', 'imagenes/metro-pba/Barracas 2.jpg', 'imagenes/metro-pba/Barracas 3.jpg')
        'DP3' = @('imagenes/metro-pba/Quilmes .jpg', 'imagenes/metro-pba/Quilmes 1.jpg', 'imagenes/metro-pba/Quilmes 2.jpg', 'imagenes/metro-pba/Quilmes 3.jpg', 'imagenes/metro-pba/Quilmes 4.jpg')
        'DP4' = @('imagenes/metro-pba/Mercado Central.jpg', 'imagenes/metro-pba/Mercado central 1.jpg', 'imagenes/metro-pba/Mercado Central 2.jpg', 'imagenes/metro-pba/Mercado Central 3.jpg', 'imagenes/metro-pba/Mercado Central 4.jpg')
        'DP5' = @('imagenes/metro-pba/Moreno .jpg', 'imagenes/metro-pba/Moreno 1.jpg', 'imagenes/metro-pba/Moreno 2.jpg', 'imagenes/metro-pba/Moreno 3.jpg')
        'DP6' = @('imagenes/metro-pba/Vte. Lopez.jpg', 'imagenes/metro-pba/Vte. Lopez 1.jpg', 'imagenes/metro-pba/Vte. Lopez 2.jpg', 'imagenes/metro-pba/Vte. Lopez 3.jpg')
        'CL6' = @('imagenes/cuyo-noa/mendoza.jpg', 'imagenes/cuyo-noa/mendoza 1.jpg', 'imagenes/cuyo-noa/mendoza 2.jpg', 'imagenes/cuyo-noa/Mendoza 3.jpg')
        'UAQ' = @('imagenes/cuyo-noa/San Juan.jpg', 'imagenes/cuyo-noa/San juan 1.jpg', 'imagenes/cuyo-noa/San juan 2.jpg')
        'LUQ' = @('imagenes/cuyo-noa/San Luis.jpg', 'imagenes/cuyo-noa/San Luis 1.jpg', 'imagenes/cuyo-noa/San luis 2.jpg', 'imagenes/cuyo-noa/San luis 3.jpg')
        'CTC' = @('imagenes/cuyo-noa/Catamarca.jpg', 'imagenes/cuyo-noa/Catamarca 1.jpg', 'imagenes/cuyo-noa/Catamarca 2.jpg')
        'CL8' = @('imagenes/cuyo-noa/La Rioja.jpg', 'imagenes/cuyo-noa/La Rioja 1.jpg', 'imagenes/cuyo-noa/La Rioja 2.jpg')
        'JUJ' = @('imagenes/cuyo-noa/Jujuy.jpg', 'imagenes/cuyo-noa/Jujuy 1.jpg', 'imagenes/cuyo-noa/Jujuy 2.jpg')
        'CL5' = @('imagenes/cuyo-noa/Salta.jpg', 'imagenes/cuyo-noa/Salta 1.jpg', 'imagenes/cuyo-noa/Salta 2.jpg')
        'C11' = @('imagenes/cuyo-noa/Santiago del Estero.jpg', 'imagenes/cuyo-noa/Santiago del Estero 1.jpg', 'imagenes/cuyo-noa/Santiago del Estero 2.jpg')
        'C10' = @('imagenes/cuyo-noa/Tucuman.jpg', 'imagenes/cuyo-noa/Tucunan 1.jpg', 'imagenes/cuyo-noa/Tucuman 2.jpg')
        'ROL' = @('imagenes/centro-nea/Rosario Frente.jpg', 'imagenes/centro-nea/Rosario 1.jpg', 'imagenes/centro-nea/Rosario 2.jpg')
        'CL9' = @('imagenes/centro-nea/Santa Fe Frente 2.jpg', 'imagenes/centro-nea/Santa Fe 1.jpg', 'imagenes/centro-nea/Santa fe 2.jpg', 'imagenes/centro-nea/Santa Fe 3.jpg', 'imagenes/centro-nea/Santa Fe 4.jpg')
        'C13' = @('imagenes/centro-nea/Posadas Frente.jpg', 'imagenes/centro-nea/Posadas 1.jpg', 'imagenes/centro-nea/Posadas 2.jpg', 'imagenes/centro-nea/Posadas 3.jpg')
        'NCQ' = @('imagenes/centro-nea/Corrientes Frente.jpg', 'imagenes/centro-nea/Corrientes 1.jpg', 'imagenes/centro-nea/Corrientes 2.jpg', 'imagenes/centro-nea/Corrientes 3.jpg')
        'CL7' = @('imagenes/centro-nea/Cordoba frente.jpg', 'imagenes/centro-nea/Cordoba 1.jpg', 'imagenes/centro-nea/Cordoba 2.jpg')
        'NIJ' = @('imagenes/centro-nea/Parana Frente.jpg', 'imagenes/centro-nea/Parana 1.jpg', 'imagenes/centro-nea/Parana 2.jpg', 'imagenes/centro-nea/Parana frente nave 2.jpg')
        'RPQ' = @('imagenes/centro-nea/Resistencia frente.jpg', 'imagenes/centro-nea/Resistencia 1.jpg', 'imagenes/centro-nea/Resistencia 2.jpg', 'imagenes/centro-nea/Resistencia 3.jpg')
        'VMR' = @('imagenes/centro-nea/Villa Maria Frente.jpg', 'imagenes/centro-nea/Villa Maria 2.jpg', 'imagenes/centro-nea/Villa Maria 3.jpg', 'imagenes/centro-nea/Villa Maria 4.jpg')
        'RCU' = @('imagenes/centro-nea/Rio Cuarto Frente.jpg', 'imagenes/centro-nea/Rio Cuarto 1.jpg', 'imagenes/centro-nea/Rio cuarto 2.jpg', 'imagenes/centro-nea/Rio cuarto 3.jpg')
    }

    $nameOverrides = @{
        'DP2' = 'CLOG CABA SUR'
        'DP4' = 'CLOG MERCADO CENTRAL'
        'DP6' = 'CLOG VICENTE LOPEZ'
        'DP5' = 'CLOG MORENO'
        'DP3' = 'CLOG QUILMES'
        'MER' = 'CLOG MERCEDES'
        'VMR' = 'CLOG VILLA MARIA'
        'RCU' = 'CLOG RIO CUARTO'
        'UAQ' = 'CLOG SAN JUAN'
    }

    function Get-Tipo($cod, $nombre) {
        if ($cod -in @('CRD', 'BRC', 'PER', 'RSA', 'UAQ', 'CTC')) { return 'CTP' }
        return 'CLOG'
    }

    function Get-ShortName($cod, $uo) {
        $c = $uo -replace '^(CLOG|CTP|CDP|CT|CENTRO PAQUETERIA|PAQUETERIA)\s+', ''
        $c = $c.Trim()
        if ($c.ToUpper() -eq 'CABA SUR') { return 'CABA Sur (Barracas)' }
        if ($c.ToUpper() -eq 'COM. RIVADAVIA') { return 'Comodoro Rivadavia' }
        return $c
    }

    $nodosDataset = @()

    foreach ($p in $apPlants) {
        $cod = Clean-Str $p.A
        if (!$cod) { continue }

        $unidad = Clean-Str $p.B
        $provincia = Clean-Str $p.C
        $ubicacion = Clean-Str $p.D
        $domicilio = Clean-Str $p.E

        # Coords
        $coordsRaw = Clean-Str $p.F
        $lat = -34.6037
        $lng = -58.3816
        if ($coordsRaw -and $coordsRaw.Contains(',')) {
            $parts = $coordsRaw.Split(',')
            try {
                $lat = [double]($parts[0].Trim())
                $lng = [double]($parts[1].Trim())
            } catch {}
        }

        # Tipo
        $tipo = Get-Tipo $cod $unidad

        # Region
        $region = Clean-Str $p.G
        $regLower = $region.ToLower()
        if ($regLower.Contains('sur') -or $regLower.Contains('patagonia')) {
            $regionKey = 'patagonia'
            $regionNorm = 'Patagonia (Sur)'
        } elseif ($regLower.Contains('cuyo') -or $regLower.Contains('noa')) {
            $regionKey = 'cuyo'
            $regionNorm = 'Cuyo / NOA'
        } elseif ($regLower.Contains('centro') -or $regLower.Contains('nea')) {
            $regionKey = 'centro'
            $regionNorm = 'Centro / NEA'
        } elseif ($regLower.Contains('pba') -or $regLower.Contains('buenos aires') -or $regLower.Contains('pampa')) {
            $regionKey = 'pba'
            $regionNorm = 'Provincia de Buenos Aires / La Pampa'
        } elseif ($regLower.Contains('amba') -or $regLower.Contains('metropolitana')) {
            $regionKey = 'amba'
            $regionNorm = 'Metropolitana (AMBA)'
        } else {
            $regionKey = 'amba'
            $regionNorm = 'Metropolitana (AMBA)'
        }

        $m2Num = Parse-Num $p.I
        $dotTotal = [int](Parse-Num $p.J)
        $dotAux = [int](Parse-Num $p.K)

        function Get-ValOrZero($v) {
            if ($v -eq $null -or $v -eq '' -or $v.ToString().ToLower() -eq 'no' -or $v.ToString().ToLower() -eq 'no hay') { return 0 }
            $num = 0
            if ([int]::TryParse($v.ToString().Trim(), [ref]$num)) { return $num }
            return 0
        }

        $jN = Get-ValOrZero $p.M
        $aN = Get-ValOrZero $p.N
        $jM = Get-ValOrZero $p.P
        $aM = Get-ValOrZero $p.Q
        $jT = Get-ValOrZero $p.S
        $aT = Get-ValOrZero $p.T

        $sumaActual = $jN + $aN + $jM + $aM + $jT + $aT
        $diffPlant = $dotTotal - $sumaActual
        if ($diffPlant -gt 0) {
            $jM += $diffPlant
        }

        $turnos = @{
            noche = @{
                franja = Clean-Str $p.L
                jerarquico = $jN.ToString()
                auxiliares = $aN.ToString()
            }
            manana = @{
                franja = Clean-Str $p.O
                jerarquico = $jM.ToString()
                auxiliares = $aM.ToString()
            }
            tarde = @{
                franja = Clean-Str $p.R
                jerarquico = $jT.ToString()
                auxiliares = $aT.ToString()
            }
        }

        # Procesos
        $procesos = @{
            cdp = Clean-Str $p.U
            ctp = Clean-Str $p.V
            ptaPta = Clean-Str $p.W
            clasificacion = Clean-Str $p.X
        }

        # Responsables
        $responsables = @{
            jefePlanta = Clean-Str $p.AA
            jefeNodo = Clean-Str $p.AB
        }

        # Inmueble
        $inmueble = @{
            alquilada = Clean-Str $p.AD
            almacenamiento = Clean-Str $p.AI
            planos = Clean-Str $p.AC
            gastoVigilancia = Parse-Num $p.AE
            gastoLimpieza = Parse-Num $p.AF
            gastoOperativo = Parse-Num $p.AG
            seguridadObservaciones = Clean-Str $p.AK
        }

        # Optimización
        $opt = $plantasOptimizacion[$cod.ToUpper()]
        if (!$opt) { $opt = @{} }

        # Transportes
        $trPlanta = @($regionalTransportes | Where-Object { $_.codPlanta.ToUpper() -eq $cod.ToUpper() })

        # Match Piece Values from RESUMEN_PAIS
        $matchedRP = $null
        foreach ($k in $rpPlantData.Keys) {
            if ($unidad.ToUpper().Contains($k) -or $k.Contains($unidad.ToUpper()) -or 
                ($cod -eq 'DP2' -and $k -like '*BARRACAS*') -or
                ($cod -eq 'DP3' -and $k -like '*QUILMES*') -or
                ($cod -eq 'DP4' -and ($k -like '*LOMAS*' -or $k -like '*MERCADO CENTRAL*')) -or
                ($cod -eq 'DP5' -and ($k -like '*MOR*' -or $k -like '*MORENO*')) -or
                ($cod -eq 'DP6' -and ($k -like '*VTE*' -or $k -like '*VICENTE LOPEZ*')) -or
                ($cod -eq 'VAE' -and $k -like '*USHUAIA*') -or
                ($cod -eq 'RSA' -and $k -like '*SANTA ROSA*') -or
                ($cod -eq 'CRD' -and $k -like '*COMODORO*') -or
                ($cod -eq 'REL' -and $k -like '*TRELEW*') -or
                ($cod -eq 'BRC' -and $k -like '*BARILOCHE*') -or
                ($cod -eq 'C12' -and $k -like '*NEUQUEN*') -or
                ($cod -eq 'C15' -and $k -like '*RIO GALLEGOS*') -or
                ($cod -eq 'C14' -and $k -like '*LA PLATA*') -or
                ($cod -eq 'CL4' -and $k -like '*BAHIA BLANCA*') -or
                ($cod -eq 'CL3' -and $k -like '*MAR DEL PLATA*') -or
                ($cod -eq 'MER' -and $k -like '*MERCEDES*') -or
                ($cod -eq 'PER' -and $k -like '*PERGAMINO*') -or
                ($cod -eq 'CL6' -and $k -like '*MENDOZA*') -or
                ($cod -eq 'UAQ' -and $k -like '*SAN JUAN*') -or
                ($cod -eq 'LUQ' -and $k -like '*SAN LUIS*') -or
                ($cod -eq 'CTC' -and $k -like '*CATAMARCA*') -or
                ($cod -eq 'CL8' -and $k -like '*LA RIOJA*') -or
                ($cod -eq 'JUJ' -and $k -like '*JUJUY*') -or
                ($cod -eq 'CL5' -and $k -like '*SALTA*') -or
                ($cod -eq 'C11' -and $k -like '*SANTIAGO*') -or
                ($cod -eq 'C10' -and $k -like '*TUCUMAN*') -or
                ($cod -eq 'ROL' -and $k -like '*ROSARIO*') -or
                ($cod -eq 'CL9' -and $k -like '*SANTA FE*') -or
                ($cod -eq 'C13' -and $k -like '*POSADAS*') -or
                ($cod -eq 'NCQ' -and $k -like '*CORRIENTES*') -or
                ($cod -eq 'CL7' -and $k -like '*CORDOBA*') -or
                ($cod -eq 'NIJ' -and $k -like '*PARANA*') -or
                ($cod -eq 'RPQ' -and $k -like '*RESISTENCIA*') -or
                ($cod -eq 'VMR' -and $k -like '*VILLA MARIA*') -or
                ($cod -eq 'RCU' -and $k -like '*RIO CUARTO*')) {
                $matchedRP = $rpPlantData[$k]
                break
            }
        }

        $ingEnvios = @{}
        $volTotalNum = 0.0
        $volVtaNum = 0.0
        $volJurNum = 0.0

        if ($matchedRP) {
            $ingEnvios = @{
                impoMensual = $matchedRP.impoMensual
                impoMensualMaquinable = $matchedRP.impoMensualMaquinable
                impoMensualNoMaquinable = $matchedRP.impoMensualNoMaquinable
                ingresoMensualUltimaMilla = $matchedRP.ingresoMensualUltimaMilla
                piezasAProcesar = $matchedRP.piezasAProcesar
                diarioMaquinable = $matchedRP.diarioMaquinable
                diarioNoMaquinable = $matchedRP.diarioNoMaquinable
                diarioUltimaMilla = $matchedRP.diarioUltimaMilla
                procesoDiario = $matchedRP.procesoDiario
                pctMaquinable = 89.6
                pctNoMaquinable = 10.4
            }
            $volVtaNum = [math]::Round($matchedRP.diarioMaquinable + $matchedRP.diarioNoMaquinable, 1)
            $volJurNum = [math]::Round($matchedRP.diarioUltimaMilla, 1)
            $volTotalNum = [math]::Round($volVtaNum + $volJurNum, 1)
        } else {
            $volVtaNum = Parse-Num $p.Y
            $volJurNum = Parse-Num $p.Z
            $volTotalNum = [math]::Round($volVtaNum + $volJurNum, 1)
            $ingEnvios = @{
                impoMensual = 0
                impoMensualMaquinable = 0
                impoMensualNoMaquinable = 0
                ingresoMensualUltimaMilla = 0
                diarioMaquinable = 0
                diarioNoMaquinable = 0
                diarioUltimaMilla = 0
                procesoDiario = 0
                pctMaquinable = 0
                pctNoMaquinable = 0
            }
        }

        $nombreLimpio = Get-ShortName $cod $unidad
        $nombreCompleto = if ($nameOverrides[$cod]) { $nameOverrides[$cod] } else { $unidad }

        $capStr = ("{0:N0} m²" -f $m2Num).Replace(",", ".")
        $piezStr = ("{0:N0}" -f [math]::Round($volTotalNum)).Replace(",", ".")
        $vtaStr = ("{0:N0}" -f [math]::Round($volVtaNum)).Replace(",", ".")
        $jurStr = ("{0:N0}" -f [math]::Round($volJurNum)).Replace(",", ".")

        $slaMap = @{
            'C12' = @{ SLA = 95.4; FV = 80.3 }
            'CRD' = @{ SLA = 95.8; FV = 91.6 }
            'REL' = @{ SLA = 95.8; FV = 86.8 }
            'C15' = @{ SLA = 94.9; FV = 87.6 }
            'BRC' = @{ SLA = 93.5; FV = 77.6 }
            'VAE' = @{ SLA = 81.5; FV = 85.6 }
            'RGA' = @{ SLA = 94.4; FV = 82.9 }
            'C14' = @{ SLA = 97.2; FV = 85.9 }
            'CL4' = @{ SLA = 95.3; FV = 86.9 }
            'CL3' = @{ SLA = 96.6; FV = 90.8 }
            'MER' = @{ SLA = 97.8; FV = 85.7 }
            'PER' = @{ SLA = 98.4; FV = 87.4 }
            'RSA' = @{ SLA = 97.1; FV = 82.7 }
            'DP2' = @{ SLA = 96.5; FV = 86.3 }
            'DP3' = @{ SLA = 96.8; FV = 86.6 }
            'DP4' = @{ SLA = 97.1; FV = 92.8 }
            'DP5' = @{ SLA = 96.5; FV = 88.0 }
            'DP6' = @{ SLA = 95.8; FV = 90.0 }
            'CL6' = @{ SLA = 98.1; FV = 87.4 }
            'UAQ' = @{ SLA = 96.9; FV = 80.1 }
            'LUQ' = @{ SLA = 98.1; FV = 91.7 }
            'CTC' = @{ SLA = 94.9; FV = 90.6 }
            'CL8' = @{ SLA = 97.8; FV = 73.0 }
            'JUJ' = @{ SLA = 97.2; FV = 78.9 }
            'CL5' = @{ SLA = 95.3; FV = 76.6 }
            'C11' = @{ SLA = 97.5; FV = 81.2 }
            'C10' = @{ SLA = 98.0; FV = 85.9 }
            'ROL' = @{ SLA = 94.4; FV = 75.0 }
            'CL9' = @{ SLA = 96.5; FV = 87.3 }
            'C13' = @{ SLA = 97.2; FV = 86.2 }
            'NCQ' = @{ SLA = 98.4; FV = 88.8 }
            'CL7' = @{ SLA = 95.9; FV = 83.0 }
            'NIJ' = @{ SLA = 97.8; FV = 87.1 }
            'RPQ' = @{ SLA = 97.8; FV = 80.5 }
            'VMR' = @{ SLA = 96.3; FV = 79.8 }
            'RCU' = @{ SLA = 94.4; FV = 81.7 }
        }

        $calidadPlanta = $slaMap[$cod.ToUpper()]
        if (!$calidadPlanta) { $calidadPlanta = @{ SLA = 96.5; FV = 85.6 } }

        # Match 2D volume
        $info2D = $map2D[$cod.ToUpper()]
        $v2d_d = if ($info2D) { [double]$info2D.Diario } else { 0.0 }
        $v2d_m = if ($info2D) { [double]$info2D.Mensual } else { 0.0 }

        $v2d_str = if ($v2d_d -gt 0) { [Math]::Round($v2d_d).ToString("N0", [System.Globalization.CultureInfo]::GetCultureInfo("es-AR")) } else { "0" }
        $v2dm_str = if ($v2d_m -gt 0) { [Math]::Round($v2d_m).ToString("N0", [System.Globalization.CultureInfo]::GetCultureInfo("es-AR")) } else { "0" }

        $nodo = @{
            id = $cod.ToLower()
            cod = $cod
            nombre = $nombreLimpio
            nombreCompleto = $nombreCompleto
            tipo = $tipo
            provincia = $provincia
            ubicacion = $ubicacion
            domicilio = $domicilio
            region = $regionNorm
            regionKey = $regionKey
            lat = $lat
            lng = $lng
            capacidad = $capStr
            capacidadM2 = $m2Num
            piezasDia = $piezStr
            volumenVenta = $vtaStr
            volumenVentaNum = $volVtaNum
            volumenJurisdiccion = $jurStr
            volumenJurisdiccionNum = $volJurNum
            volumenTotalNum = $volTotalNum
            volumen2D = $v2d_str
            volumen2DNum = [Math]::Round($v2d_d, 1)
            volumen2dMensual = $v2dm_str
            volumen2dMensualNum = [Math]::Round($v2d_m)
            dotacionTotal = $dotTotal
            dotacionAuxiliares = $dotAux
            turnos = $turnos
            procesos = $procesos
            responsables = $responsables
            inmueble = $inmueble
            optimizacion = $opt
            ingresoEnvios = $ingEnvios
            calidad = @{
                slaPaqAr = $calidadPlanta.SLA
                fvPaqAr = $calidadPlanta.FV
                slaPaqArStr = "$($calidadPlanta.SLA)%"
                fvPaqArStr = "$($calidadPlanta.FV)%"
            }
            transportes = $trPlanta
            fotos = if ($photoMap[$cod]) { $photoMap[$cod] } else { @('imagenes/placeholder.jpg') }
            desc = "Planta logística oficial de Correo Argentino en $provincia. Ubicada en $domicilio. Capacidad operativa de $capStr y dotación de $dotTotal personas."
        }

        $nodosDataset += $nodo
    }

    # 7. APPEND SPECIAL NODES (BUE y TRT)
    $nodoBUE = @{
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
        volumen2D = "0"
        volumen2DNum = 0
        volumen2dMensual = "0"
        volumen2dMensualNum = 0
        operatividad = "24 / 7"
        desc = "Centro de Tratamiento Postal Central (BUE). Nodo logístico neurálgico y principal hub mecanizado del país, ubicado estratégicamente sobre la Autopista Riccheri. Superficie total cubierta de 20.980 m² (contempla BUE-CPI y Rebut + Galpón electorales)."
        isSpecialEstanco = $true
        responsables = @{ jefePlanta = "José Tappa"; jefeNodo = "José Tappa" }
        inmueble = @{ almacenamiento = "Planta de Tratamiento Integral y CPI"; alquilada = "Propio"; seguridadObservaciones = "BUE contempla superficie de BUE-CPI y Rebut + Galpón electorales" }
        ingresoEnvios = @{ diarioMaquinable = 63980; impoMensualMaquinable = 1407559; diarioNoMaquinable = 13018.1; impoMensualNoMaquinable = 286398; diarioUltimaMilla = 7925.6; ingresoMensualUltimaMilla = 174364; impoMensual = 174364; procesoDiario = 76998; piezasAProcesar = 1693957 }
        fotos = @("imagenes/metro-pba/ctp bue.jpg", "imagenes/metro-pba/ctp bue 2.jpg", "imagenes/metro-pba/ctp bue 3.jpg", "imagenes/metro-pba/ctp bue 4.jpg")
        transportes = @()
    }

    $nodoTRT = @{
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
        volumen2D = "0"
        volumen2DNum = 0
        volumen2dMensual = "0"
        volumen2dMensualNum = 0
        operatividad = "24 / 7"
        desc = "Centro Logístico Tortuguitas (POD / TRT). Mega parque logístico de 50.000 m² cubiertos integrando todas las naves operativas, con capacidad para cross-docking, paquetería de gran porte, no maquinable y operaciones de grandes cuentas e imposición."
        isSpecialEstanco = $true
        responsables = @{ jefePlanta = "Magdalena Baldini"; jefeNodo = "Magdalena Baldini" }
        inmueble = @{ almacenamiento = "Parque Logístico Multimodal"; alquilada = "Alquilada"; seguridadObservaciones = "POD contempla superficie de todas las naves (50.000 m²)" }
        ingresoEnvios = @{ diarioMaquinable = 0; impoMensualMaquinable = 0; diarioNoMaquinable = 2774.2; impoMensualNoMaquinable = 61033; diarioUltimaMilla = 2754.2; ingresoMensualUltimaMilla = 60593; impoMensual = 84727; procesoDiario = 3851.2; piezasAProcesar = 84727 }
        fotos = @("imagenes/metro-pba/foto trt.jpg", "imagenes/metro-pba/fotos trt 1.jpg", "imagenes/metro-pba/foto trt2.jpg", "imagenes/metro-pba/foto trt 3.jpg")
        transportes = @()
    }

    $nodosDataset += $nodoBUE
    $nodosDataset += $nodoTRT

    # 8. RESUMEN NACIONAL
    $totVta = 0.0; $totJur = 0.0; $totVol = 0.0; $totDot = 0; $totAux = 0; $totM2 = 0
    foreach ($n in ($nodosDataset | Where-Object { -not $_.isSpecialEstanco })) {
        $totVta += $n.volumenVentaNum
        $totJur += $n.volumenJurisdiccionNum
        $totVol += $n.volumenTotalNum
        $totDot += $n.dotacionTotal
        $totAux += $n.dotacionAuxiliares
        $totM2 += $n.capacidadM2
    }

    $resumenNacional = @{
        totalAuxiliaresOperativos = $totAux
        totalDotacion = $totDot
        totalPlantas = ($nodosDataset | Where-Object { -not $_.isSpecialEstanco }).Count
        totalSuperficieM2 = $totM2
        totalImposicionDiaria = $totVta
        totalJurisdiccionDiaria = $totJur
        totalVolumenDiario = $totVol
        slaPaqArNacional = 96.5
        fvPaqArNacional = 85.6
        totalPersonalAReubicar = 150
        pctNacionalAReubicar = 23.1
        costoAnualMas10 = 3197778660
        costoAnualPromedio = 2831015736
        costoMensualMas10 = 266481555
        costoMensualPromedio = 235917978
    }

    Write-Output "=== TOTALES GENERADOS ==="
    Write-Output "Total Plantas: $($nodosDataset.Count) (36 auditadas + 2 estanco BUE y TRT)"
    Write-Output "Total Imposición Diaria: $totVta"
    Write-Output "Total Jurisdicción Diaria: $totJur"
    Write-Output "Total Volumen Diario Paquetería: $totVol"
    Write-Output "Total Líneas Transporte: $($regionalTransportes.Count)"

    # 9. EXPORT DATASETS
    $jsonDataset = ConvertTo-Json -InputObject $nodosDataset -Depth 10
    [System.IO.File]::WriteAllText('data/nodos_dataset.json', $jsonDataset, [System.Text.Encoding]::UTF8)

    $jsonNodosPretty = ConvertTo-Json -InputObject $nodosDataset -Depth 10
    $jsonResumenEjecPretty = ConvertTo-Json -InputObject @{ regiones = $resumenEjecutivo; nacional = $resumenNacional } -Depth 10
    $jsonTransportPretty = ConvertTo-Json -InputObject $regionalTransportes -Depth 10

    $lines = @(
        "// =============================================================",
        "// CORREO ARGENTINO -- DATASET OFICIAL DE PLANTAS LOGISTICAS",
        "// Extraccion de:",
        "// - data/Analisis plantas Logisticas act..xlsx (Dotaciones, Turnos, Procesos, Jefaturas, Inmuebles, Red Transporte)",
        "// - data/RESUMEN_PAIS_UM_MAS_6.3 3.xlsx (Valores de Q de Piezas Maquinables, No Maquinables y Ultima Milla)",
        "// - data/Info Plantas julio.xlsx (Volumen Piezas Postales 2D Diario y Mensual)",
        "// =============================================================",
        "",
        "const NODOS_DATA_OFICIAL = $jsonNodosPretty;",
        "",
        "const RESUMEN_EJECUTIVO_OFICIAL = $jsonResumenEjecPretty;",
        "",
        "const TRANSPORTE_RED_OFICIAL = $jsonTransportPretty;",
        "",
        "if (typeof module !== 'undefined' && module.exports) {",
        "  module.exports = {",
        "    NODOS_DATA_OFICIAL,",
        "    RESUMEN_EJECUTIVO_OFICIAL,",
        "    TRANSPORTE_RED_OFICIAL",
        "  };",
        "}"
    )

    $jsContent = $lines -join "`n"

    [System.IO.File]::WriteAllText('data/nodos-data.js', $jsContent, [System.Text.Encoding]::UTF8)
    [System.IO.File]::WriteAllText('nodos-data.js', $jsContent, [System.Text.Encoding]::UTF8)
    Write-Output "Files exported successfully with full transport and 2D postal volume!"
}

Build-CompleteData
