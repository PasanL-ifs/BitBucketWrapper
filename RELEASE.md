# Creating a Release

This guide explains how to create a new release with pre-built CLI executables.

## Step 1: Build the Executables

### On Windows:
```cmd
cd cli\go
build.bat
```

### On Linux/macOS:
```bash
cd cli/go
chmod +x build.sh
./build.sh
```

This will create executables in the `cli/releases/` directory:
- `git-wrapped-export-windows-amd64.exe`
- `git-wrapped-export-windows-386.exe`
- `git-wrapped-export-macos-amd64`
- `git-wrapped-export-macos-arm64`
- `git-wrapped-export-linux-amd64`

## Step 2: Create a GitHub Release

1. Go to https://github.com/PasanL-ifs/BitBucketWrapper/releases
2. Click "Draft a new release"
3. Create a new tag (e.g., `v1.0.0`, `v1.1.0`)
4. Set the release title (e.g., "Git Wrapped v1.0.0")
5. Add release notes describing changes

## Step 3: Upload Executables

Drag and drop all files from `cli/releases/` to the release assets section:
- ✅ git-wrapped-export-windows-amd64.exe
- ✅ git-wrapped-export-windows-386.exe
- ✅ git-wrapped-export-macos-amd64
- ✅ git-wrapped-export-macos-arm64
- ✅ git-wrapped-export-linux-amd64

## Step 4: Publish

Click "Publish release" to make it available to users.

## Release Notes Template

```markdown
## Git Wrapped v1.0.0

### Features
- 🎉 Initial release
- 📊 Support for individual and team statistics
- 🎨 Beautiful animated slideshow presentation
- 📁 Local folder scanning
- 📤 File upload support

### CLI Tools
Download the appropriate version for your system:
- **Windows (64-bit)**: `git-wrapped-export-windows-amd64.exe` (recommended)
- **Windows (32-bit)**: `git-wrapped-export-windows-386.exe`
- **macOS (Intel)**: `git-wrapped-export-macos-amd64`
- **macOS (Apple Silicon)**: `git-wrapped-export-macos-arm64`
- **Linux (64-bit)**: `git-wrapped-export-linux-amd64`

### Usage
```cmd
# Windows
git-wrapped-export-windows-amd64.exe --path "C:\Your\Workspace" --output wrapped-data.json

# macOS/Linux
./git-wrapped-export-macos-arm64 --path "/path/to/workspace" --output wrapped-data.json
```

### What's Changed
- Initial release with full feature set
```

## Testing Before Release

Before creating a release, test the executables:

### Windows:
```cmd
cd cli\releases
git-wrapped-export-windows-amd64.exe --help
git-wrapped-export-windows-amd64.exe --path "C:\Test\Path" --year 2025
```

### macOS/Linux:
```bash
cd cli/releases
chmod +x git-wrapped-export-macos-arm64
./git-wrapped-export-macos-arm64 --help
./git-wrapped-export-macos-arm64 --path "/test/path" --year 2025
```

## Versioning

Follow semantic versioning (MAJOR.MINOR.PATCH):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backwards compatible)
- **PATCH**: Bug fixes

Examples:
- `v1.0.0` - Initial release
- `v1.1.0` - Added new feature
- `v1.1.1` - Fixed bug
- `v2.0.0` - Breaking changes
