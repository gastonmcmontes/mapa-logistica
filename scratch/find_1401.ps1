Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead('RESUMEN_PAIS 98.6%_105300.xlsx')

foreach ($e in $zip.Entries) {
    if ($e.FullName -like 'xl/worksheets/*.xml') {
        $sr = New-Object System.IO.StreamReader($e.Open())
        $xml = [xml]$sr.ReadToEnd()
        $sr.Dispose()
        foreach ($c in $xml.SelectNodes('//c')) {
            if ($c.v -eq '1401' -or $c.v -eq '1115') {
                Write-Output "Found in $($e.FullName) at $($c.r): value=$($c.v)"
            }
        }
    }
}
$zip.Dispose()
