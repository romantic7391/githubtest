# PowerShell 스크립트: 모든 console 코드 제거
$files = Get-ChildItem -Path "src" -Recurse -Include "*.ts", "*.tsx" | Where-Object { $_.FullName -notlike "*node_modules*" }

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # console.log, console.error, console.warn, console.info, console.debug 제거
    $content = $content -replace 'console\.(log|error|warn|info|debug)\([^)]*\);?\s*', ''
    
    # 빈 줄 정리
    $content = $content -replace '\n\s*\n\s*\n', "`n`n"
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "수정됨: $($file.FullName)"
    }
}

Write-Host "완료! 모든 console 코드가 제거되었습니다." 