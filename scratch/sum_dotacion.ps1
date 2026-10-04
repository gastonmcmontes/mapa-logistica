$content = Get-Content 'nodos-data.js' -Raw
$matchesTot = [regex]::Matches($content, '"dotacionTotal":\s*(\d+)')
$sumTot = ($matchesTot | ForEach-Object { [int]$_.Groups[1].Value } | Measure-Object -Sum).Sum

$matchesAux = [regex]::Matches($content, '"dotacionAuxiliares":\s*(\d+)')
$sumAux = ($matchesAux | ForEach-Object { [int]$_.Groups[1].Value } | Measure-Object -Sum).Sum

Write-Output "Sum dotacionTotal: $sumTot"
Write-Output "Sum dotacionAuxiliares: $sumAux"

# Let's also check each node's dotacionTotal and dotacionAuxiliares
$nodes = [regex]::Matches($content, 'id:\s*"([^"]+)",\s*nombre:\s*"([^"]+)"[\s\S]*?"dotacionTotal":\s*(\d+),\s*"dotacionAuxiliares":\s*(\d+)')
foreach ($n in $nodes) {
    Write-Output "$($n.Groups[1].Value) - $($n.Groups[2].Value): Total=$($n.Groups[3].Value), Aux=$($n.Groups[4].Value)"
}
