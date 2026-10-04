$commitData = git show d09d73c:data/nodos_dataset.json | ConvertFrom-Json
Write-Host "Total in d09d73c: $($commitData.Count)"
$commitData | ForEach-Object {
    Write-Host "$($_.cod) | $($_.nombre) | special: $($_.isSpecialEstanco)"
}
