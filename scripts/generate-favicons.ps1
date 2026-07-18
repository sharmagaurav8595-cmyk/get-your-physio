param(
  [string]$Source = "src/assets/favicon.png",
  [double]$ArtworkCoverage = 0.89
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$sourcePath = Join-Path $root $Source
$publicDir = Join-Path $root "public"
New-Item -ItemType Directory -Force -Path $publicDir | Out-Null

$loaded = [System.Drawing.Bitmap]::FromFile($sourcePath)
$sourceBitmap = New-Object System.Drawing.Bitmap($loaded)
$loaded.Dispose()

$bounds = @{
  MinX = $sourceBitmap.Width
  MinY = $sourceBitmap.Height
  MaxX = -1
  MaxY = -1
}

for ($y = 0; $y -lt $sourceBitmap.Height; $y++) {
  for ($x = 0; $x -lt $sourceBitmap.Width; $x++) {
    $pixel = $sourceBitmap.GetPixel($x, $y)
    $isArtwork = $pixel.A -gt 32 -and ($pixel.R -lt 238 -or $pixel.G -lt 238 -or $pixel.B -lt 238)
    if ($isArtwork) {
      $bounds.MinX = [Math]::Min($bounds.MinX, $x)
      $bounds.MinY = [Math]::Min($bounds.MinY, $y)
      $bounds.MaxX = [Math]::Max($bounds.MaxX, $x)
      $bounds.MaxY = [Math]::Max($bounds.MaxY, $y)
    }
  }
}

if ($bounds.MaxX -lt 0) {
  $sourceBitmap.Dispose()
  throw "No colored favicon artwork was detected."
}

$canvasSize = 512
$artworkHeight = $bounds.MaxY - $bounds.MinY + 1
$scale = ($canvasSize * $ArtworkCoverage) / $artworkHeight
$artworkCenterX = ($bounds.MinX + $bounds.MaxX) / 2.0
$artworkCenterY = ($bounds.MinY + $bounds.MaxY) / 2.0
$canvasCenter = ($canvasSize - 1) / 2.0
$drawWidth = $sourceBitmap.Width * $scale
$drawHeight = $sourceBitmap.Height * $scale
$drawX = $canvasCenter - ($artworkCenterX * $scale)
$drawY = $canvasCenter - ($artworkCenterY * $scale)

$master = New-Object System.Drawing.Bitmap($canvasSize, $canvasSize, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$graphics = [System.Drawing.Graphics]::FromImage($master)
$graphics.Clear([System.Drawing.Color]::Transparent)
$graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
$graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$destination = New-Object System.Drawing.RectangleF([single]$drawX, [single]$drawY, [single]$drawWidth, [single]$drawHeight)
$graphics.DrawImage($sourceBitmap, $destination)
$graphics.Dispose()
$sourceBitmap.Dispose()

# Reapply a clean circular alpha boundary after scaling so the background stays
# circular and the source logo colors remain untouched.
$radius = ($canvasSize - 1) / 2.0
for ($y = 0; $y -lt $canvasSize; $y++) {
  for ($x = 0; $x -lt $canvasSize; $x++) {
    $dx = $x - $canvasCenter
    $dy = $y - $canvasCenter
    $distance = [Math]::Sqrt(($dx * $dx) + ($dy * $dy))
    $coverage = [Math]::Max(0.0, [Math]::Min(1.0, ($radius + 0.5) - $distance))
    $pixel = $master.GetPixel($x, $y)
    $alpha = [int][Math]::Round($pixel.A * $coverage)
    if ($alpha -ne $pixel.A) {
      $master.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $pixel.R, $pixel.G, $pixel.B))
    }
  }
}

function Save-ResizedPng {
  param(
    [System.Drawing.Bitmap]$Image,
    [int]$Size,
    [string]$OutputPath
  )

  $output = New-Object System.Drawing.Bitmap($Size, $Size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $draw = [System.Drawing.Graphics]::FromImage($output)
  $draw.Clear([System.Drawing.Color]::Transparent)
  $draw.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
  $draw.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $draw.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $draw.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $draw.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $draw.DrawImage($Image, 0, 0, $Size, $Size)
  $draw.Dispose()
  $output.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $output.Dispose()
}

$outputs = @{
  16 = Join-Path $publicDir "favicon-16x16.png"
  32 = Join-Path $publicDir "favicon-32x32.png"
  48 = Join-Path $publicDir "favicon-48x48.png"
  180 = Join-Path $publicDir "apple-touch-icon.png"
  192 = Join-Path $publicDir "android-chrome-192x192.png"
  512 = Join-Path $publicDir "android-chrome-512x512.png"
}

foreach ($entry in $outputs.GetEnumerator()) {
  Save-ResizedPng -Image $master -Size $entry.Key -OutputPath $entry.Value
}

$masterTemp = Join-Path $publicDir "favicon-master.tmp.png"
$master.Save($masterTemp, [System.Drawing.Imaging.ImageFormat]::Png)
$master.Dispose()
Move-Item -Force -LiteralPath $masterTemp -Destination $sourcePath

# ICO stores the optimized 16px, 32px, and 48px PNGs in one browser-compatible file.
$icoImages = @(16, 32, 48) | ForEach-Object {
  [PSCustomObject]@{ Size = $_; Bytes = [System.IO.File]::ReadAllBytes($outputs[$_]) }
}
$icoPath = Join-Path $publicDir "favicon.ico"
$stream = [System.IO.File]::Open($icoPath, [System.IO.FileMode]::Create)
$writer = New-Object System.IO.BinaryWriter($stream)
$writer.Write([uint16]0)
$writer.Write([uint16]1)
$writer.Write([uint16]$icoImages.Count)
$offset = 6 + (16 * $icoImages.Count)
foreach ($image in $icoImages) {
  $writer.Write([byte]$image.Size)
  $writer.Write([byte]$image.Size)
  $writer.Write([byte]0)
  $writer.Write([byte]0)
  $writer.Write([uint16]1)
  $writer.Write([uint16]32)
  $writer.Write([uint32]$image.Bytes.Length)
  $writer.Write([uint32]$offset)
  $offset += $image.Bytes.Length
}
foreach ($image in $icoImages) {
  $writer.Write($image.Bytes)
}
$writer.Dispose()
$stream.Dispose()

Write-Host "Generated optimized favicon assets at $([Math]::Round($ArtworkCoverage * 100))% artwork-height coverage."
