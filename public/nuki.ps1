# 가장자리 플러드필로 흰 배경만 투명 처리 (내부 흰색 보존). JPG -> 투명 PNG.
Add-Type -AssemblyName System.Drawing
$dir = "C:\htmls\dbx-guide\assets\icons"
$thr = 236   # 이 값 이상(R,G,B 모두)이면 흰색으로 간주
$maxdim = 220

$files = Get-ChildItem -Path "$dir\*" -Include *.png,*.jpg,*.jpeg -File
foreach ($f in $files) {
  try {
    $img = [System.Drawing.Image]::FromFile($f.FullName)
    $sc = [math]::Min($maxdim / $img.Width, $maxdim / $img.Height)
    if ($sc -gt 1) { $sc = 1 }
    $w = [int]($img.Width * $sc); $h = [int]($img.Height * $sc)
    $bmp = New-Object System.Drawing.Bitmap $w, $h, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.DrawImage($img, 0, 0, $w, $h); $g.Dispose(); $img.Dispose()

    $rect = New-Object System.Drawing.Rectangle 0, 0, $w, $h
    $data = $bmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadWrite, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $stride = $data.Stride; $len = $stride * $h
    $bytes = New-Object byte[] $len
    [System.Runtime.InteropServices.Marshal]::Copy($data.Scan0, $bytes, 0, $len)

    $visited = New-Object bool[] ($w * $h)
    $st = New-Object System.Collections.Generic.Stack[int]
    for ($x = 0; $x -lt $w; $x++) { [void]$st.Push($x); [void]$st.Push((($h - 1) * $w) + $x) }
    for ($y = 0; $y -lt $h; $y++) { [void]$st.Push($y * $w); [void]$st.Push(($y * $w) + ($w - 1)) }

    while ($st.Count -gt 0) {
      $p = $st.Pop()
      if ($visited[$p]) { continue }
      $visited[$p] = $true
      $x = $p % $w
      $y = [int](($p - $x) / $w)
      $o = $y * $stride + $x * 4
      if ($bytes[$o] -ge $thr -and $bytes[$o + 1] -ge $thr -and $bytes[$o + 2] -ge $thr) {
        $bytes[$o + 3] = 0
        if ($x -gt 0) { [void]$st.Push($p - 1) }
        if ($x -lt ($w - 1)) { [void]$st.Push($p + 1) }
        if ($y -gt 0) { [void]$st.Push($p - $w) }
        if ($y -lt ($h - 1)) { [void]$st.Push($p + $w) }
      }
    }

    [System.Runtime.InteropServices.Marshal]::Copy($bytes, 0, $data.Scan0, $len)
    $bmp.UnlockBits($data)
    $out = Join-Path $dir ($f.BaseName + ".png")
    $bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    if ($f.Extension -ne ".png") { Remove-Item $f.FullName -Force }
    Write-Output ("OK " + $f.Name + " -> " + $f.BaseName + ".png (" + $w + "x" + $h + ")")
  } catch {
    Write-Output ("FAIL " + $f.Name + " : " + $_.Exception.Message)
  }
}
Write-Output "DONE"
