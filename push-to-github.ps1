# PowerShell script to push GraduationProject to GitHub
# This script will initialize git (if needed), stage changes, commit, and push

# Configuration
$projectPath = "c:\Users\mohamed khaled\Desktop\test\GraduationProject-main\GraduationProject-main"
$githubRepo = "https://github.com/MOHAMEDMAGDY1230/GraduationProject.git"
$commitMessage = "Update configurations for IP and database settings"

# Colors for output
$successColor = "Green"
$errorColor = "Red"
$infoColor = "Cyan"

Write-Host "================================================" -ForegroundColor $infoColor
Write-Host "GitHub Push Script - GraduationProject" -ForegroundColor $infoColor
Write-Host "================================================" -ForegroundColor $infoColor
Write-Host ""

# Step 1: Navigate to project directory
Write-Host "[1/5] Navigating to project directory..." -ForegroundColor $infoColor
if (Test-Path $projectPath) {
    Set-Location $projectPath
    Write-Host "✓ Successfully navigated to: $projectPath" -ForegroundColor $successColor
} else {
    Write-Host "✗ Error: Project directory not found at $projectPath" -ForegroundColor $errorColor
    exit 1
}
Write-Host ""

# Step 2: Check/Initialize git repository
Write-Host "[2/5] Checking git repository status..." -ForegroundColor $infoColor
if (Test-Path ".git") {
    Write-Host "✓ Git repository already initialized" -ForegroundColor $successColor
    # Show current git status
    Write-Host ""
    Write-Host "Current git status:" -ForegroundColor $infoColor
    git status
} else {
    Write-Host "✓ Initializing new git repository..." -ForegroundColor $infoColor
    git init
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Git repository initialized" -ForegroundColor $successColor
        Write-Host "✓ Adding remote origin..." -ForegroundColor $infoColor
        git remote add origin $githubRepo
        Write-Host "✓ Remote origin added" -ForegroundColor $successColor
    } else {
        Write-Host "✗ Error initializing git repository" -ForegroundColor $errorColor
        exit 1
    }
}
Write-Host ""

# Step 3: Add all changes
Write-Host "[3/5] Adding all changes..." -ForegroundColor $infoColor
git add .
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ All changes staged successfully" -ForegroundColor $successColor
} else {
    Write-Host "✗ Error staging changes" -ForegroundColor $errorColor
    exit 1
}
Write-Host ""

# Step 4: Create commit
Write-Host "[4/5] Creating commit..." -ForegroundColor $infoColor
git commit -m "$commitMessage"
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Commit created successfully" -ForegroundColor $successColor
} else {
    Write-Host "⚠ No changes to commit or commit creation skipped" -ForegroundColor $infoColor
}
Write-Host ""

# Step 5: Push to GitHub
Write-Host "[5/5] Pushing to GitHub..." -ForegroundColor $infoColor
Write-Host "Repository: $githubRepo" -ForegroundColor $infoColor
git push -u origin master
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Successfully pushed to GitHub!" -ForegroundColor $successColor
} else {
    Write-Host "! Push completed with exit code: $LASTEXITCODE" -ForegroundColor $infoColor
    Write-Host ""
    Write-Host "Note: If authentication failed, you may need to:" -ForegroundColor $infoColor
    Write-Host "  - Use an SSH key instead of HTTPS" -ForegroundColor $infoColor
    Write-Host "  - Generate a Personal Access Token (PAT) on GitHub" -ForegroundColor $infoColor
    Write-Host "  - Run: git config --global user.name 'Your Name'" -ForegroundColor $infoColor
    Write-Host "  - Run: git config --global user.email 'your.email@domain.com'" -ForegroundColor $infoColor
}
Write-Host ""

Write-Host "================================================" -ForegroundColor $infoColor
Write-Host "Script Complete!" -ForegroundColor $infoColor
Write-Host "================================================" -ForegroundColor $infoColor
