# DBX Guide -> app shortcut (Gargantua-style black hole .ico + Edge --app .lnk)
Add-Type -AssemblyName System.Drawing

$S = 256
$bmp = New-Object System.Drawing.Bitmap $S, $S
$g   = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality

# rounded-corner clip (corners stay transparent)
$rad = 46; $d = 2*$rad
$round = New-Object System.Drawing.Drawing2D.GraphicsPath
$round.AddArc(0, 0, $d, $d, 180, 90)
$round.AddArc(($S-$d), 0, $d, $d, 270, 90)
$round.AddArc(($S-$d), ($S-$d), $d, $d, 0, 90)
$round.AddArc(0, ($S-$d), $d, $d, 90, 90)
$round.CloseFigure()
$g.SetClip($round)

$cx = 128.0; $cy = 128.0; $rHole = 56.0

function GlowEllipse($ecx,$ecy,$rx,$ry,$inner,$outer){
  $p = New-Object System.Drawing.Drawing2D.GraphicsPath
  $p.AddEllipse([single]($ecx-$rx),[single]($ecy-$ry),[single](2*$rx),[single](2*$ry))
  $b = New-Object System.Drawing.Drawing2D.PathGradientBrush $p
  $b.CenterColor = $inner
  $b.SurroundColors = @($outer)
  $g.FillPath($b,$p)
  $b.Dispose(); $p.Dispose()
}
function C($a,$r,$gr,$bl){ return [System.Drawing.Color]::FromArgb($a,$r,$gr,$bl) }

# background: deep space, subtle center glow
$bgp = New-Object System.Drawing.Drawing2D.GraphicsPath
$bgp.AddEllipse(-60,-60,($S+120),($S+120))
$bgb = New-Object System.Drawing.Drawing2D.PathGradientBrush $bgp
$bgb.CenterPoint  = New-Object System.Drawing.PointF 128,124
$bgb.CenterColor  = (C 255 22 12 30)
$bgb.SurroundColors = @((C 255 5 4 9))
$g.FillRectangle($bgb, 0, 0, $S, $S)
$bgb.Dispose(); $bgp.Dispose()

# --- total solar eclipse style: black disc + soft symmetric corona ---
$rHole = 62.0

# soft outer corona (bright near the disc edge, fading outward)
GlowEllipse $cx $cy 122 122 (C 225 255 246 220) (C 0 255 214 158)
# warmer inner corona for richness
GlowEllipse $cx $cy 90 90 (C 255 255 228 182) (C 0 255 196 128)

# black disc
$blk = New-Object System.Drawing.SolidBrush (C 255 4 2 8)
$g.FillEllipse($blk, [single]($cx-$rHole),[single]($cy-$rHole),[single](2*$rHole),[single](2*$rHole))
$blk.Dispose()

# crisp bright ring right at the edge + a softer wider halo (diamond-ring glow)
$p2 = New-Object System.Drawing.Pen ((C 110 255 238 196)), 7
$g.DrawEllipse($p2, [single]($cx-$rHole-2),[single]($cy-$rHole-2),[single](2*$rHole+4),[single](2*$rHole+4))
$p2.Dispose()
$p1 = New-Object System.Drawing.Pen ((C 255 255 250 230)), 3
$g.DrawEllipse($p1, [single]($cx-$rHole),[single]($cy-$rHole),[single](2*$rHole),[single](2*$rHole))
$p1.Dispose()

# --- subtle glossy depth (crystal-app look) ---
# top sheen (glass reflection)
$gRect = New-Object System.Drawing.Rectangle 0,0,256,140
$gloss = New-Object System.Drawing.Drawing2D.LinearGradientBrush $gRect,(C 42 255 255 255),(C 0 255 255 255),([single]90)
$g.FillRectangle($gloss,0,0,256,140); $gloss.Dispose()
# inner rim highlight (raised edge)
$rim = New-Object System.Drawing.Pen ((C 70 255 255 255)),2
$g.DrawPath($rim,$round); $rim.Dispose()
# bottom inner shade for depth
$sRect = New-Object System.Drawing.Rectangle 0,158,256,98
$sh = New-Object System.Drawing.Drawing2D.LinearGradientBrush $sRect,(C 0 0 0 0),(C 62 0 0 0),([single]90)
$g.FillRectangle($sh,0,158,256,98); $sh.Dispose()

$g.Dispose()

# PNG bytes
$ms = New-Object System.IO.MemoryStream
$bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
$png = $ms.ToArray(); $ms.Dispose(); $bmp.Dispose()
[System.IO.File]::WriteAllBytes("C:\htmls\dbx-guide\assets\favicon-preview.png", $png)

# assemble PNG-in-ICO
$ico = New-Object System.IO.MemoryStream
$bw  = New-Object System.IO.BinaryWriter $ico
$bw.Write([UInt16]0); $bw.Write([UInt16]1); $bw.Write([UInt16]1)
$bw.Write([Byte]0); $bw.Write([Byte]0); $bw.Write([Byte]0); $bw.Write([Byte]0)
$bw.Write([UInt16]1); $bw.Write([UInt16]32)
$bw.Write([UInt32]$png.Length); $bw.Write([UInt32]22)
$bw.Write($png); $bw.Flush()
# fresh icon filename each run -> busts Windows per-path icon cache
Get-ChildItem "C:\htmls\dbx-guide\assets" -Filter 'app-icon*.ico' -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue
$icoPath = "C:\htmls\dbx-guide\assets\app-icon-$((Get-Date).ToString('yyyyMMddHHmmss')).ico"
[System.IO.File]::WriteAllBytes($icoPath, $ico.ToArray()); $ico.Dispose()

# shortcut (English name to avoid encoding garble)
$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if (-not (Test-Path $edge)) { $edge = "C:\Program Files\Google\Chrome\Application\chrome.exe" }
$url  = "file:///C:/htmls/dbx-guide/dbx-guide.html"
$desktop = [Environment]::GetFolderPath('Desktop')

# remove any previous DBX shortcut (incl. garbled name)
Get-ChildItem $desktop -Filter '*.lnk' -ErrorAction SilentlyContinue |
  Where-Object { $_.Name -match 'DBX' } | Remove-Item -Force -ErrorAction SilentlyContinue

$wsh = New-Object -ComObject WScript.Shell
$lnkPath = Join-Path $desktop 'DBX Guide.lnk'
$sc = $wsh.CreateShortcut($lnkPath)
$sc.TargetPath   = $edge
$sc.Arguments    = "--app=`"$url`""
$sc.IconLocation = "$icoPath,0"
$sc.Description  = "DBX Guide"
$sc.Save()

# force icon cache refresh: clear cache DBs + restart explorer
Remove-Item "$env:LocalAppData\IconCache.db" -Force -ErrorAction SilentlyContinue
Remove-Item "$env:LocalAppData\Microsoft\Windows\Explorer\iconcache_*.db" -Force -ErrorAction SilentlyContinue
Start-Process -FilePath "ie4uinit.exe" -ArgumentList "-show" -WindowStyle Hidden -ErrorAction SilentlyContinue
Stop-Process -Name explorer -Force -ErrorAction SilentlyContinue
Start-Sleep -Milliseconds 900
if (-not (Get-Process -Name explorer -ErrorAction SilentlyContinue)) { Start-Process explorer }

Write-Output ("ICON  " + $icoPath)
Write-Output ("SHORTCUT  " + $lnkPath)
