<#
  把站点打包上传到 ECS 并发布。只带 index.html / styles / js / assets，
  vibe_images(50MB 原图)、tools、preview、serve.js 不会上云。

  用法：
    .\deploy\deploy.ps1 -Server 47.xx.xx.xx -User root
    .\deploy\deploy.ps1 -Server example.com -User deploy -Port 22 -WebRoot /var/www/digital-forecast
#>
param(
    [Parameter(Mandatory = $true)][string]$Server,
    [string]$User = 'root',
    [int]$Port = 22,
    [string]$WebRoot = '/var/www/digital-forecast'
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$bundle = Join-Path $env:TEMP 'digital-forecast.tgz'
$stamp = Get-Date -Format 'yyyyMMddHHmmss'
$remoteTgz = '/tmp/digital-forecast-' + $stamp + '.tgz'
$target = $User + '@' + $Server

# publish.sh 必须是 LF。在 Windows 上用记事本改一次就会变成 CRLF，bash 直接语法错，
# 所以这里本地清洗完再传，远端命令里就不需要任何引号了。
$publishSrc = Join-Path $PSScriptRoot 'publish.sh'
$publishClean = Join-Path $env:TEMP 'publish.sh'
$raw = [IO.File]::ReadAllText($publishSrc)
if ($raw -match "`r") { Write-Warning 'publish.sh 含 CRLF，已自动清洗为 LF 后上传' }
[IO.File]::WriteAllText($publishClean, ($raw -replace "`r", ''), (New-Object Text.UTF8Encoding $false))

Push-Location $root
try {
    tar -czf $bundle index.html styles js assets
    if ($LASTEXITCODE) { throw '打包失败，检查 tar 是否在 PATH 里（Win10 1803+ 自带）' }
    Write-Host ('打包完成 {0:N0} KB' -f ((Get-Item $bundle).Length / 1KB))

    scp -P $Port -q $bundle ($target + ':' + $remoteTgz)
    scp -P $Port -q $publishClean ($target + ':/tmp/publish.sh')
    ssh -p $Port $target bash /tmp/publish.sh $remoteTgz $WebRoot
}
finally {
    Pop-Location
}
