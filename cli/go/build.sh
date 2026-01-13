#!/bin/bash
echo "Building Git Wrapped Export CLI..."
echo

mkdir -p ../releases

# Build for Windows (64-bit)
echo "Building Windows (64-bit)..."
GOOS=windows GOARCH=amd64 go build -ldflags="-s -w" -o ../releases/git-wrapped-export-windows-amd64.exe .
echo "  ✓ git-wrapped-export-windows-amd64.exe"

# Build for Windows (32-bit)
echo "Building Windows (32-bit)..."
GOOS=windows GOARCH=386 go build -ldflags="-s -w" -o ../releases/git-wrapped-export-windows-386.exe .
echo "  ✓ git-wrapped-export-windows-386.exe"

# Build for macOS (Intel)
echo "Building macOS (Intel)..."
GOOS=darwin GOARCH=amd64 go build -ldflags="-s -w" -o ../releases/git-wrapped-export-macos-amd64 .
echo "  ✓ git-wrapped-export-macos-amd64"

# Build for macOS (Apple Silicon)
echo "Building macOS (Apple Silicon)..."
GOOS=darwin GOARCH=arm64 go build -ldflags="-s -w" -o ../releases/git-wrapped-export-macos-arm64 .
echo "  ✓ git-wrapped-export-macos-arm64"

# Build for Linux (64-bit)
echo "Building Linux (64-bit)..."
GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o ../releases/git-wrapped-export-linux-amd64 .
echo "  ✓ git-wrapped-export-linux-amd64"

echo
echo "All builds complete! Binaries are in cli/releases/"
