Add-Type -AssemblyName System.IO.Compression.FileSystem

function Format-ExcelTime($val) {
    if (!$val) { return "" }
    $valStr = $val.ToString().Trim()
    
    # If already formatted like "14:00" or "14:00:00" or "05:00 a 12:42"
    if ($valStr -match '^\d{1,2}:\d{2}') {
        return $valStr
    }
    
    # If it's a numeric decimal like 0.58333333333333337
    $num = 0.0
    if ([double]::TryParse($valStr, [System.Globalization.NumberStyles]::Any, [System.Globalization.CultureInfo]::InvariantCulture, [ref]$num)) {
        if ($num -ge 0 -and $num -le 1) {
            $totalMinutes = [Math]::Round($num * 24 * 60)
            $hours = [Math]::Floor($totalMinutes / 60) % 24
            $mins = $totalMinutes % 60
            return ("{0:D2}:{1:D2} hs" -f [int]$hours, [int]$mins)
        }
    }
    
    return $valStr
}

Write-Host "Test 0.5833333333333333: $(Format-ExcelTime '0.5833333333333333')"
Write-Host "Test 0.229649511474665: $(Format-ExcelTime '0.229649511474665')"
Write-Host "Test 0.583902634170359: $(Format-ExcelTime '0.583902634170359')"
Write-Host "Test 0.674180411948137: $(Format-ExcelTime '0.674180411948137')"
Write-Host "Test 14:00 a 22:00: $(Format-ExcelTime '14:00 a 22:00')"
