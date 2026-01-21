#!/usr/bin/env powershell

<#
.SYNOPSIS
    WebSocket Testing Coordinator for FinRight-AI
    
.DESCRIPTION
    Starts backend and frontend servers, then runs tests
    
.EXAMPLE
    .\run-tests.ps1 -Mode browser
    .\run-tests.ps1 -Mode auto
    .\run-tests.ps1 -Mode manual
#>

param(
    [ValidateSet('browser', 'auto', 'manual', 'setup')]
    [string]$Mode = 'manual',
    [switch]$NoWait = $false,
    [switch]$SkipBackend = $false,
    [switch]$SkipFrontend = $false
)

$ErrorActionPreference = "Continue"
$WarningPreference = "Continue"

# Colors for output
function Write-Header {
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host $args -ForegroundColor Cyan
    Write-Host "========================================`n" -ForegroundColor Cyan
}

function Write-Success {
    Write-Host "✅ " -ForegroundColor Green -NoNewline
    Write-Host $args -ForegroundColor White
}

function Write-Error-Custom {
    Write-Host "❌ " -ForegroundColor Red -NoNewline
    Write-Host $args -ForegroundColor White
}

function Write-Warning-Custom {
    Write-Host "⚠️  " -ForegroundColor Yellow -NoNewline
    Write-Host $args -ForegroundColor White
}

function Write-Info {
    Write-Host "ℹ️  " -ForegroundColor Blue -NoNewline
    Write-Host $args -ForegroundColor White
}

function Write-Step {
    Write-Host "🔹 " -ForegroundColor Cyan -NoNewline
    Write-Host $args -ForegroundColor White
}

# Check if port is in use
function Test-Port {
    param([int]$Port)
    
    try {
        $tcp = New-Object System.Net.Sockets.TcpClient
        $tcp.Connect('127.0.0.1', $Port)
        $tcp.Close()
        return $true
    }
    catch {
        return $false
    }
}

# Kill process on port
function Kill-Port {
    param([int]$Port)
    
    try {
        $process = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Select-Object -First 1 OwningProcess
        if ($process) {
            Stop-Process -Id $process.OwningProcess -Force
            Write-Success "Killed process on port $Port"
            return $true
        }
    }
    catch {
        return $false
    }
}

# Setup
function Invoke-Setup {
    Write-Header "SETUP"
    
    # Check Node.js
    Write-Step "Checking Node.js..."
    if (Get-Command node -ErrorAction SilentlyContinue) {
        $version = node --version
        Write-Success "Node.js installed: $version"
    }
    else {
        Write-Error-Custom "Node.js not found. Please install from https://nodejs.org"
        exit 1
    }
    
    # Check Python
    Write-Step "Checking Python..."
    if (Get-Command python -ErrorAction SilentlyContinue) {
        $version = python --version 2>&1
        Write-Success "Python installed: $version"
    }
    else {
        Write-Error-Custom "Python not found. Please install from https://python.org"
        exit 1
    }
    
    # Check npm packages
    Write-Step "Checking npm packages..."
    if (-not (Test-Path "node_modules/ws")) {
        Write-Warning-Custom "Installing ws package..."
        npm install ws | Out-Null
    }
    Write-Success "npm packages ready"
    
    # Check Python packages
    Write-Step "Checking Python packages..."
    $daphne = python -c "import daphne" 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Warning-Custom "Installing daphne..."
        pip install daphne | Out-Null
    }
    Write-Success "Python packages ready"
    
    Write-Success "Setup complete!"
}

# Start backend
function Start-Backend {
    if ($SkipBackend) {
        Write-Warning-Custom "Backend startup skipped"
        return
    }
    
    Write-Step "Starting backend WebSocket server..."
    
    if (Test-Port 8000) {
        Write-Warning-Custom "Port 8000 already in use"
        Write-Info "Attempting to kill existing process..."
        if (Kill-Port 8000) {
            Start-Sleep -Seconds 1
        }
    }
    
    $backendPath = "backend"
    if (-not (Test-Path $backendPath)) {
        Write-Error-Custom "Backend directory not found at $backendPath"
        return $false
    }
    
    Push-Location $backendPath
    
    try {
        Write-Info "Running: daphne -b 0.0.0.0 -p 8000 core.asgi:application"
        $backendProcess = Start-Process -FilePath "daphne" -ArgumentList "-b 0.0.0.0 -p 8000 core.asgi:application" `
            -NoNewWindow -PassThru
        
        Write-Success "Backend started (PID: $($backendProcess.Id))"
        
        # Wait for backend to be ready
        Write-Info "Waiting for backend to be ready..."
        $maxAttempts = 30
        $attempts = 0
        
        while ($attempts -lt $maxAttempts) {
            if (Test-Port 8000) {
                Write-Success "Backend is ready on port 8000"
                return $backendProcess
            }
            Start-Sleep -Milliseconds 500
            $attempts++
        }
        
        Write-Error-Custom "Backend failed to start"
        $backendProcess | Stop-Process -Force
        return $false
    }
    finally {
        Pop-Location
    }
}

# Start frontend
function Start-Frontend {
    if ($SkipFrontend) {
        Write-Warning-Custom "Frontend startup skipped"
        return
    }
    
    Write-Step "Starting frontend development server..."
    
    $frontendPath = "frontend"
    if (-not (Test-Path $frontendPath)) {
        Write-Error-Custom "Frontend directory not found at $frontendPath"
        return $false
    }
    
    Push-Location $frontendPath
    
    try {
        Write-Info "Running: npm start"
        $frontendProcess = Start-Process -FilePath "npm" -ArgumentList "start" `
            -NoNewWindow -PassThru
        
        Write-Success "Frontend started (PID: $($frontendProcess.Id))"
        Write-Info "Frontend will open at http://localhost:3000 when ready"
        
        return $frontendProcess
    }
    finally {
        Pop-Location
    }
}

# Run browser tester
function Open-BrowserTester {
    Write-Header "BROWSER TESTER"
    
    $htmlPath = Resolve-Path "websocket-test.html"
    
    if (-not (Test-Path $htmlPath)) {
        Write-Error-Custom "websocket-test.html not found"
        return
    }
    
    Write-Step "Opening browser tester..."
    Write-Info "Path: $htmlPath"
    
    Start-Process "cmd" -ArgumentList "/c start $htmlPath"
    
    Write-Success "Browser tester opened"
    Write-Info "Default URL: ws://localhost:8000/ws/ai/chat/"
    Write-Info "Steps:"
    Write-Info "  1. Click 'Connect' button"
    Write-Info "  2. Type a test message"
    Write-Info "  3. Click 'Send' or press Enter"
    Write-Info "  4. Watch for real-time token streaming"
}

# Run automated tests
function Invoke-AutoTests {
    Write-Header "AUTOMATED TESTS"
    
    Write-Step "Running Node.js test suite..."
    
    if (-not (Test-Path "test-websocket.js")) {
        Write-Error-Custom "test-websocket.js not found"
        return
    }
    
    try {
        & node test-websocket.js
    }
    catch {
        Write-Error-Custom "Test execution failed: $_"
    }
}

# Manual testing guide
function Show-ManualGuide {
    Write-Header "MANUAL TESTING GUIDE"
    
    Write-Host @"
Prerequisites:
  ✓ Backend running on http://localhost:8000
  ✓ Frontend running on http://localhost:3000

Test Scenario 1: React App
  1. Navigate to http://localhost:3000/insights
  2. Look for green "🟢 Connected" badge in header
  3. Type: "How much did I spend?"
  4. Click Send
  5. Watch for typing indicator
  6. Observe tokens streaming in real-time
  
Test Scenario 2: HTML Tester Page
  1. Open websocket-test.html in your browser
  2. URL: ws://localhost:8000/ws/ai/chat/
  3. Click Connect
  4. Send test messages:
     - "Hello"
     - "What is 2+2?"
     - "" (empty - should error)
  
Debugging:
  - Browser Console: F12 → Console tab
  - Network: F12 → Network tab → WS filter
  - Terminal: Check for backend errors

Success Indicators:
  ✅ Connection badge shows green
  ✅ Typing indicator appears
  ✅ Tokens stream one-by-one
  ✅ Message completes with done event
  ✅ No console errors

Common Issues:
  ❌ Connection refused
     → Backend not running
     → Check: netstat -ano | findstr :8000
  
  ❌ No response
     → Check backend logs for errors
     → Try simpler question first
  
  ❌ Tokens appear all at once
     → Check message parsing
     → Inspect Network → WS frames

"@ -ForegroundColor White
}

# Cleanup on exit
function Cleanup {
    Write-Warning-Custom "Cleaning up..."
    
    if ($script:backendProcess -and -not $script:backendProcess.HasExited) {
        Write-Step "Stopping backend..."
        $script:backendProcess | Stop-Process -Force
    }
    
    if ($script:frontendProcess -and -not $script:frontendProcess.HasExited) {
        Write-Step "Stopping frontend..."
        $script:frontendProcess | Stop-Process -Force
    }
    
    Write-Success "Cleanup complete"
}

# Main execution
Write-Host "`n🧪 FinRight-AI WebSocket Testing Suite" -ForegroundColor Cyan
Write-Host "Version 1.0.0" -ForegroundColor Gray

switch ($Mode) {
    'setup' {
        Invoke-Setup
    }
    
    'browser' {
        Write-Header "BROWSER TEST MODE"
        $backend = Start-Backend
        $frontend = Start-Frontend
        
        if ($backend -and $frontend) {
            Start-Sleep -Seconds 3
            Open-BrowserTester
            
            Write-Info "Press Ctrl+C to stop servers"
            
            if (-not $NoWait) {
                try {
                    $backend | Wait-Process
                    $frontend | Wait-Process
                }
                catch {
                    # Interrupted
                }
            }
        }
        
        Cleanup
    }
    
    'auto' {
        Write-Header "AUTOMATED TEST MODE"
        $backend = Start-Backend
        
        if ($backend) {
            Start-Sleep -Seconds 2
            Invoke-AutoTests
        }
        
        Cleanup
    }
    
    'manual' {
        Write-Header "MANUAL TEST MODE"
        Show-ManualGuide
        
        $startServers = Read-Host "Start servers now? (y/n)"
        if ($startServers -eq 'y') {
            $backend = Start-Backend
            $frontend = Start-Frontend
            
            if ($backend -and $frontend) {
                Write-Info "Servers started. Press Ctrl+C to stop"
                
                try {
                    $backend | Wait-Process
                    $frontend | Wait-Process
                }
                catch {
                    # Interrupted
                }
            }
            
            Cleanup
        }
    }
}

Write-Host "`n" -ForegroundColor White
