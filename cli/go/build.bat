@echo off
echo Building Git Wrapped Export CLI...
echo.

REM Build for Windows (64-bit)
echo Building Windows (64-bit)...
set GOOS=windows
set GOARCH=amd64
go build -ldflags="-s -w" -o ..\releases\git-wrapped-export-windows-amd64.exe .
echo   ✓ git-wrapped-export-windows-amd64.exe

REM Build for Windows (32-bit)
echo Building Windows (32-bit)...
set GOOS=windows
set GOARCH=386
go build -ldflags="-s -w" -o ..\releases\git-wrapped-export-windows-386.exe .
echo   ✓ git-wrapped-export-windows-386.exe

REM Build for macOS (Intel)
echo Building macOS (Intel)...
set GOOS=darwin
set GOARCH=amd64
go build -ldflags="-s -w" -o ..\releases\git-wrapped-export-macos-amd64 .
echo   ✓ git-wrapped-export-macos-amd64

REM Build for macOS (Apple Silicon)
echo Building macOS (Apple Silicon)...
set GOOS=darwin
set GOARCH=arm64
go build -ldflags="-s -w" -o ..\releases\git-wrapped-export-macos-arm64 .
echo   ✓ git-wrapped-export-macos-arm64

REM Build for Linux (64-bit)
echo Building Linux (64-bit)...
set GOOS=linux
set GOARCH=amd64
go build -ldflags="-s -w" -o ..\releases\git-wrapped-export-linux-amd64 .
echo   ✓ git-wrapped-export-linux-amd64

echo.
echo All builds complete! Binaries are in cli\releases\
