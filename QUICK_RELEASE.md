# Quick Release Guide

Fast reference for creating a new release with CLI executables.

## 1. Build Executables (Windows)
```cmd
cd cli\go
build.bat
```

## 2. Test One Executable
```cmd
cd ..\releases
git-wrapped-export-windows-amd64.exe --help
```

## 3. Create GitHub Release
1. Go to: https://github.com/PasanL-ifs/BitBucketWrapper/releases
2. Click: **"Draft a new release"**
3. Tag: `v1.0.0` (increment as needed)
4. Title: `Git Wrapped v1.0.0`
5. Description: Copy from template below

## 4. Upload Files
Drag these files from `cli\releases\` to the release:
- ✅ git-wrapped-export-windows-amd64.exe
- ✅ git-wrapped-export-windows-386.exe
- ✅ git-wrapped-export-macos-amd64
- ✅ git-wrapped-export-macos-arm64
- ✅ git-wrapped-export-linux-amd64

## 5. Publish
Click **"Publish release"**

---

## Release Description Template

```markdown
## 🎉 Git Wrapped v1.0.0

### Download CLI Tool

Choose the version for your operating system:

| Platform | Download |
|----------|----------|
| **Windows 64-bit** (recommended) | `git-wrapped-export-windows-amd64.exe` |
| Windows 32-bit | `git-wrapped-export-windows-386.exe` |
| macOS Intel | `git-wrapped-export-macos-amd64` |
| macOS Apple Silicon (M1/M2) | `git-wrapped-export-macos-arm64` |
| Linux 64-bit | `git-wrapped-export-linux-amd64` |

### Quick Start

**Windows:**
```cmd
git-wrapped-export-windows-amd64.exe --path "C:\Your\Workspace" --output wrapped-data.json
```

**macOS/Linux:**
```bash
chmod +x git-wrapped-export-macos-arm64
./git-wrapped-export-macos-arm64 --path "/your/workspace" --output wrapped-data.json
```

### What's New
- 🎉 Initial release
- 📊 Individual and team statistics
- 🎨 Beautiful animated presentation
- 📁 Local folder scanning
- 📤 File upload support

### Usage
1. Download the CLI tool for your platform
2. Run it on your workspace folder
3. Upload the generated JSON to the web app
4. View your Git Wrapped! ✨

For full documentation, see the [README](https://github.com/PasanL-ifs/BitBucketWrapper/blob/main/README.md)
```

---

## Version Numbers

- **v1.0.0** - Initial release
- **v1.1.0** - New features
- **v1.0.1** - Bug fixes
- **v2.0.0** - Breaking changes

## Done! 🎉

Users can now download from:
- GitHub Releases page
- Links in the web app (Setup → Upload File)
