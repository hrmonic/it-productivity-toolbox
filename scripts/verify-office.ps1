param([string]$ArtifactDirectory = (Join-Path $PSScriptRoot '../test-results/document-artifacts'))
$ErrorActionPreference = 'Stop'
$toolboxDirectory = (Resolve-Path -LiteralPath $ArtifactDirectory).Path
$toolboxBefore = @(Get-Process POWERPNT -ErrorAction SilentlyContinue)
$toolboxOffice = $null
$toolboxPresentation = $null
$toolboxResults = @()
try {
  $toolboxOffice = New-Object -ComObject PowerPoint.Application
  foreach ($toolboxName in @('atlas', 'atlas-fr')) {
    $toolboxInput = Join-Path $toolboxDirectory ($toolboxName + '.pptx')
    $toolboxHashBefore = (Get-FileHash -LiteralPath $toolboxInput -Algorithm SHA256).Hash
    $toolboxPresentation = $toolboxOffice.Presentations.Open($toolboxInput, -1, 0, 0)
    $toolboxResult = [ordered]@{ file=($toolboxName + '.pptx'); slides=$toolboxPresentation.Slides.Count; textShapes=0; overflow=@(); outOfSlide=@(); inputSha256=$toolboxHashBefore }
    foreach ($toolboxSlide in $toolboxPresentation.Slides) {
      foreach ($toolboxShape in $toolboxSlide.Shapes) {
        if ($toolboxShape.Left -lt -1 -or $toolboxShape.Top -lt -1 -or ($toolboxShape.Left + $toolboxShape.Width) -gt ($toolboxPresentation.PageSetup.SlideWidth + 1) -or ($toolboxShape.Top + $toolboxShape.Height) -gt ($toolboxPresentation.PageSetup.SlideHeight + 1)) { $toolboxResult.outOfSlide += [ordered]@{ slide=$toolboxSlide.SlideIndex; shape=$toolboxShape.Name } }
        if ($toolboxShape.HasTextFrame -and $toolboxShape.TextFrame.HasText) {
          $toolboxResult.textShapes++
          if ($toolboxShape.TextFrame2.TextRange.BoundHeight -gt ($toolboxShape.Height + 2) -or $toolboxShape.TextFrame2.TextRange.BoundWidth -gt ($toolboxShape.Width + 2)) { $toolboxResult.overflow += [ordered]@{ slide=$toolboxSlide.SlideIndex; shape=$toolboxShape.Name } }
        }
      }
    }
    $toolboxPresentation.SaveAs((Join-Path $toolboxDirectory ($toolboxName + '-powerpoint.pdf')), 32)
    $toolboxPresentation.Close()
    [void][Runtime.InteropServices.Marshal]::ReleaseComObject($toolboxPresentation)
    $toolboxPresentation = $null
    if ((Get-FileHash -LiteralPath $toolboxInput -Algorithm SHA256).Hash -ne $toolboxHashBefore) { throw 'The read-only source presentation changed.' }
    $toolboxResults += $toolboxResult
  }
  $toolboxEvidence = [ordered]@{ checkedAt=[DateTime]::UtcNow.ToString('o'); renderer='Microsoft PowerPoint'; applicationVersion=$toolboxOffice.Version; boundTolerancePoints=2; results=$toolboxResults }
  $toolboxEvidence | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath (Join-Path $toolboxDirectory 'powerpoint-validation.json') -Encoding utf8
  $toolboxEvidence | ConvertTo-Json -Depth 8
  if (@($toolboxResults | Where-Object { $_.overflow.Count -gt 0 -or $_.outOfSlide.Count -gt 0 }).Count -gt 0) { throw 'Native Office validation detected an overflow.' }
} finally {
  if ($null -ne $toolboxPresentation) { $toolboxPresentation.Close(); [void][Runtime.InteropServices.Marshal]::ReleaseComObject($toolboxPresentation) }
  if ($null -ne $toolboxOffice) { if ($toolboxBefore.Count -eq 0 -and $toolboxOffice.Presentations.Count -eq 0) { $toolboxOffice.Quit() }; [void][Runtime.InteropServices.Marshal]::ReleaseComObject($toolboxOffice) }
}
