# Git Wrapped Export CLI Tools

Export your Git commit history to a JSON file for use with the Git Wrapped web application.

## 🚀 Quick Start

Choose the version that works best for you:

| Version | Requirements | Best For |
|---------|-------------|----------|
| **Go (Standalone)** | None! | Windows users, no setup needed |
| **Python** | Python 3.7+ | Cross-platform, easy to modify |
| **Node.js** | Node.js 18+ | JavaScript developers |

---

## 📦 Download Pre-built Binaries (Recommended for Windows)

Download the latest release from the **Releases** page:

- `git-wrapped-export-windows-amd64.exe` - Windows 64-bit (most common)
- `git-wrapped-export-windows-386.exe` - Windows 32-bit
- `git-wrapped-export-macos-amd64` - macOS Intel
- `git-wrapped-export-macos-arm64` - macOS Apple Silicon (M1/M2)
- `git-wrapped-export-linux-amd64` - Linux 64-bit

### Usage (Windows)

```cmd
git-wrapped-export-windows-amd64.exe --path "C:\Users\pakulk\Workspace" --output wrapped-data.json
```

---

## 🐍 Python Version

### Requirements
- Python 3.7 or higher
- Git installed and in PATH

### Usage

```bash
cd cli/python

# Basic usage (current directory, all-time)
python git_wrapped_export.py

# Specify workspace path
python git_wrapped_export.py --path "C:\Users\pakulk\Workspace"

# Filter by year
python git_wrapped_export.py --path "C:\Users\pakulk\Workspace" --year 2025

# Custom output file
python git_wrapped_export.py --path "C:\Users\pakulk\Workspace" --output my-wrapped.json
```

### Options

| Option | Short | Description |
|--------|-------|-------------|
| `--path` | `-p` | Path to workspace folder (default: current directory) |
| `--output` | `-o` | Output file name (default: wrapped-data.json) |
| `--year` | `-y` | Filter by year (e.g., 2024, 2025), omit for all-time |

---

## 📦 Node.js Version

### Requirements
- Node.js 18 or higher
- Git installed and in PATH

### Installation

```bash
cd cli/nodejs
npm install
```

### Usage

```bash
# Basic usage
node bin/git-wrapped-export.js

# With options
node bin/git-wrapped-export.js --path "C:\Users\pakulk\Workspace" --output wrapped-data.json

# Filter by year
node bin/git-wrapped-export.js --path "C:\Users\pakulk\Workspace" --year 2025
```

### Global Installation (Optional)

```bash
cd cli/nodejs
npm link

# Now you can use it anywhere
git-wrapped-export --path "C:\Projects"
```

---

## 🔧 Go Version (Compile Yourself)

### Requirements (for building)
- Go 1.21 or higher

### Build

```bash
cd cli/go

# Build for current platform
go build -o git-wrapped-export.exe .

# Build for all platforms (Windows)
build.bat

# Build for all platforms (Linux/macOS)
./build.sh
```

### Usage

```bash
# Same options as other versions
./git-wrapped-export --path "C:\Users\pakulk\Workspace" --year 2025
```

---

## 📋 Command Reference

All versions support the same command-line options:

```
Usage: git-wrapped-export [options]

Options:
  -p, --path <path>      Path to workspace folder (default: current directory)
  -o, --output <file>    Output file name (default: wrapped-data.json)
  -y, --year <year>      Filter by year (e.g., 2024, 2025), omit for all-time
  -h, --help             Show help message

Examples:
  git-wrapped-export --path "C:\Users\pakulk\Workspace"
  git-wrapped-export --path /home/user/projects --year 2025
  git-wrapped-export -p . -o my-wrapped.json
```

---

## 📊 Output Format

The exported JSON file contains:

```json
{
  "exportVersion": "1.0",
  "exportDate": "2025-01-13T12:00:00Z",
  "sourceApp": "git-wrapped-export-go",
  "repositories": [
    {
      "name": "MyProject",
      "commitCount": 150,
      "authors": [...],
      "languages": {"C#": 5000, "JavaScript": 2000}
    }
  ],
  "commits": [
    {
      "hash": "abc123...",
      "author": "Pasan Kulatunge",
      "email": "pasan@example.com",
      "date": "2025-01-10T10:30:00+05:30",
      "message": "Add new feature",
      "insertions": 50,
      "deletions": 10,
      "filesChanged": ["src/app.cs"],
      "repository": "MyProject"
    }
  ],
  "totalCommits": 1500,
  "authors": [
    {
      "name": "Pasan Kulatunge",
      "email": "pasan@example.com",
      "commitCount": 500,
      "repositories": ["MyProject", "OtherProject"]
    }
  ],
  "languages": {"C#": 10000, "JavaScript": 5000, "XAML": 3000},
  "dateRange": {"start": "2025-01-01", "end": "2025-12-31"}
}
```

---

## 🔒 Privacy

- **No data is uploaded** - Everything runs locally on your machine
- **No API keys needed** - Uses local Git commands
- **Output file contains only metadata** - No source code is included, just commit messages and statistics

---

## 🐛 Troubleshooting

### "Git not found"
Make sure Git is installed and available in your system PATH.

### "No repositories found"
- Check that the path contains valid Git repositories
- The tool searches up to 3 levels deep by default

### Large repositories are slow
For very large repos with millions of commits, consider using the `--year` filter to limit the date range.

---

## 📝 Next Steps

After exporting:

1. Visit the **Git Wrapped** web application
2. Click **"Upload File"** option
3. Select your `wrapped-data.json` file
4. View your beautiful stats! 🎉
