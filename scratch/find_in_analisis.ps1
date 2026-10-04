Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead('data/Analisis plantas Logisticas act..xlsx')

foreach ($e in $zip.Entries) {
    if ($e.FullName -like 'xl/worksheets/*.xml') {
        $sr = New-Object System.IO.StreamReader($e.Open())
        $xml = [xml]$sr.ReadToEnd()
        $sr.Dispose()
        foreach ($c in $xml.SelectNodes('//c')) {
            if ($c.v -like '*1401*' -or $c.v -like '*1115*') {
                Write-Output "Found in $($e.FullName) at $($c.r): value=$($c.v)"
            }
        }
    }
}
$zip.Dispose()
