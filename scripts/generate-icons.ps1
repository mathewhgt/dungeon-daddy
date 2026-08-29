Add-Type -AssemblyName System.Drawing

$null = New-Item -ItemType Directory -Force -Path 'build'
$null = New-Item -ItemType Directory -Force -Path 'public'

function Create-DndIcon([int]$size = 256) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)

    $scale = [float]$size / 256.0

    # Background rounded rectangle
    $bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        (New-Object System.Drawing.PointF(0, 0)),
        (New-Object System.Drawing.PointF($size, $size)),
        [System.Drawing.Color]::FromArgb(255, 18, 24, 38),
        [System.Drawing.Color]::FromArgb(255, 9, 13, 18)
    )

    $pad = [float](12.0 * $scale)
    $w = [float]($size - 2 * $pad)
    $h = [float]($size - 2 * $pad)
    $radius = [float](40.0 * $scale)

    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.AddArc($pad, $pad, $radius, $radius, 180, 90)
    $path.AddArc($pad + $w - $radius, $pad, $radius, $radius, 270, 90)
    $path.AddArc($pad + $w - $radius, $pad + $h - $radius, $radius, $radius, 0, 90)
    $path.AddArc($pad, $pad + $h - $radius, $radius, $radius, 90, 90)
    $path.CloseFigure()

    $g.FillPath($bgBrush, $path)

    # Gold Border Outline
    $borderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 245, 158, 11), [float](6.0 * $scale))
    $g.DrawPath($borderPen, $path)

    # D20 geometry
    $cx = [float]($size / 2.0)
    $cy = [float]($size / 2.0)
    $r = [float](72.0 * $scale)

    $pts = New-Object 'System.Drawing.PointF[]' 6
    for ($i = 0; $i -lt 6; $i++) {
        $angle = ($i * 60 - 30) * [Math]::PI / 180.0
        $px = [float]($cx + $r * [Math]::Cos($angle))
        $py = [float]($cy + $r * [Math]::Sin($angle))
        $pts[$i] = New-Object System.Drawing.PointF($px, $py)
    }

    $innerR = [float]($r * 0.58)
    $inPts = New-Object 'System.Drawing.PointF[]' 3
    for ($i = 0; $i -lt 3; $i++) {
        $angle = ($i * 120 - 90) * [Math]::PI / 180.0
        $px = [float]($cx + $innerR * [Math]::Cos($angle))
        $py = [float]($cy + $innerR * [Math]::Sin($angle))
        $inPts[$i] = New-Object System.Drawing.PointF($px, $py)
    }

    # Center triangle
    $facetBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 245, 158, 11))
    $g.FillPolygon($facetBrush, $inPts)

    # D20 Edges
    $edgePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 254, 243, 199), [float](3.5 * $scale))
    $g.DrawPolygon($edgePen, $pts)
    $g.DrawPolygon($edgePen, $inPts)

    $g.DrawLine($edgePen, $pts[0], $inPts[1])
    $g.DrawLine($edgePen, $pts[1], $inPts[0])
    $g.DrawLine($edgePen, $pts[2], $inPts[0])
    $g.DrawLine($edgePen, $pts[3], $inPts[2])
    $g.DrawLine($edgePen, $pts[4], $inPts[2])
    $g.DrawLine($edgePen, $pts[5], $inPts[1])

    # Center 'DD' symbol for Dungeon Daddy
    if ($size -ge 32) {
        $ddBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 15, 23, 42))
        $fontSize = [float](18.0 * $scale)
        $ddFont = New-Object System.Drawing.Font('Arial', $fontSize, [System.Drawing.FontStyle]::Bold)
        $sf = New-Object System.Drawing.StringFormat
        $sf.Alignment = [System.Drawing.StringAlignment]::Center
        $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
        $g.DrawString('DD', $ddFont, $ddBrush, $cx, ($cy - 1.0 * $scale), $sf)
    }

    $g.Dispose()
    return $bmp
}

$icon256 = Create-DndIcon 256
$icon256.Save('build/icon.png', [System.Drawing.Imaging.ImageFormat]::Png)
$icon256.Save('public/icon.png', [System.Drawing.Imaging.ImageFormat]::Png)

$sizes = @(256, 128, 64, 48, 32, 16)
$ms = New-Object System.IO.MemoryStream
$bw = New-Object System.IO.BinaryWriter($ms)

$bw.Write([UInt16]0)
$bw.Write([UInt16]1)
$bw.Write([UInt16]$sizes.Count)

$imgStreams = @()
$offset = 6 + ($sizes.Count * 16)

foreach ($s in $sizes) {
    $img = Create-DndIcon $s
    $imgMs = New-Object System.IO.MemoryStream
    $img.Save($imgMs, [System.Drawing.Imaging.ImageFormat]::Png)
    $bytes = $imgMs.ToArray()
    $imgStreams += ,$bytes

    $w = if ($s -eq 256) { 0 } else { $s }
    $h = if ($s -eq 256) { 0 } else { $s }
    $bw.Write([Byte]$w)
    $bw.Write([Byte]$h)
    $bw.Write([Byte]0)
    $bw.Write([Byte]0)
    $bw.Write([UInt16]1)
    $bw.Write([UInt16]32)
    $bw.Write([UInt32]$bytes.Length)
    $bw.Write([UInt32]$offset)

    $offset += $bytes.Length
    $img.Dispose()
}

foreach ($b in $imgStreams) {
    $bw.Write($b)
}

[System.IO.File]::WriteAllBytes('build/icon.ico', $ms.ToArray())
[System.IO.File]::WriteAllBytes('public/icon.ico', $ms.ToArray())
$ms.Dispose()
Write-Host "Icons successfully generated in build/ and public/!"
