Add-Type -AssemblyName System.IO.Compression.FileSystem

function Build-CompleteDataset {
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

    # Helper function to clean string
    function Clean-Str($v) {
        if ($v -eq $null) { return "" }
        return $v.ToString().Trim()
    }

    # Helper function to parse numbers
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

    # Sheet 1: plantas
    $s1 = $zipAP.GetEntry('xl/worksheets/sheet1.xml')
    $sr = New-Object System.IO.StreamReader($s1.Open())
    $xmlS1 = [xml]$sr.ReadToEnd()
    $sr.Dispose()
    
    $apPlants = @()
    $headerMap = @{}
    foreach ($r in $xmlS1.worksheet.sheetData.row) {
        $rNum = [int]$r.r
        $cells = @{}
        foreach ($c in $r.c) {
            $val = $c.v
            if ($c.t -eq 's' -and $val -ne $null) { $val = $stringsAP[[int]$val] }
            $colLetter = ($c.r -replace '[0-9]', '')
            $cells[$colLetter] = $val
        }
        if ($rNum -eq 1) {
            $headerMap = $cells
        } else {
            $named = @{}
            foreach ($k in $cells.Keys) {
                $h = $headerMap[$k]
                if (!$h) { $h = $k }
                $named[$h] = $cells[$k]
            }
            $named['_RAW_ROW'] = $cells
            $apPlants += [PSCustomObject]$named
        }
    }

    # Sheet 6: Resumen
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
                    personalAReubicar = [int](Parse-Num $cells['E'])
                    pctAReubicar = [math]::Round((Parse-Num $cells['F']) * 100, 1)
                    costoMensualAuxiliar = Parse-Num $cells['I']
                    costoEmpresaMensual = if ($cells['L']) { Parse-Num $cells['L'] } else { 0 }
                    costoEmpresaAnual = if ($rNum -eq 5) { Parse-Num ($cells['I'] -or $cells['K']) } else { 0 }
                }
            }
        }

        # Plantas optimizacion filas 11 a 49
        if ($rNum -ge 11 -and $rNum -le 50) {
            $cod = Clean-Str $cells['B']
            if ($cod -and $cod.Length -le 5 -and $cod.ToUpper() -notmatch '^(COD|REGION|CODIGO|TOTAL)') {
                $manip = Parse-Num $cells['I']
                $transp = Parse-Num $cells['J']
                $reubic = Parse-Num $cells['K']
                $plantasOptimizacion[$cod.ToUpper()] = @{
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

    # Transport lines from Sheets 2, 3, 4, 5
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
                        horarioLlegada = Clean-Str $cells['H']
                        horarioSalida = Clean-Str $cells['I']
                        tiempoOperacion = Clean-Str $cells['J']
                        turno = Clean-Str $cells['K']
                        tiempoRecorrido = Clean-Str $cells['L']
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

    # Read RESUMEN_PAIS Sheet 1
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
                umParticRegional = Parse-Num $cells['H']
                umParticNacional = Parse-Num $cells['I']
                diarioMaquinable = Parse-Num $cells['J']
                diarioNoMaquinable = Parse-Num $cells['K']
                diarioUltimaMilla = Parse-Num $cells['L']
                procesoDiario = Parse-Num $cells['M']
                pctMaquinable = [math]::Round(((Parse-Num $cells['N']) * 100), 1)
                pctNoMaquinable = [math]::Round(((Parse-Num $cells['O']) * 100), 1)
                fteNecesarioTotal = Parse-Num $cells['P']
                dotacionAuxiliarRP = [int](Parse-Num $cells['Q'])
                dotacionAReubicarRP = Parse-Num $cells['R']
            }
        }
    }

    Write-Output "Loaded $($apPlants.Count) AP Plants, $($regionalTransportes.Count) Transport Lines, $($rpPlantData.Keys.Count) RP Plants."
    
    return @{
        Plants = $apPlants
        Opt = $plantasOptimizacion
        Resumen = $resumenEjecutivo
        Transport = $regionalTransportes
        RP_Pieces = $rpPlantData
    }
}

$dataset = Build-CompleteDataset
