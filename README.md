# Git Wrapped 🎉

A beautiful year-in-review application that analyzes your Git commit history and creates stunning visualizations of your coding contributions — similar to Spotify Wrapped, but for code!

![Git Wrapped](https://img.shields.io/badge/Git-Wrapped-purple?style=for-the-badge&logo=git)

## ✨ Features

### Individual Developer Stats
- 📊 Total commits and lines of code (additions/deletions)
- 📅 Most productive months and days
- ⏰ Peak coding hours and time patterns
- 💻 Programming languages breakdown
- 🔥 Longest commit streak
- 🏆 Achievement badges

### Team Dashboard
- 🥇 Leaderboard with top contributors
- 📈 Monthly activity timeline
- 🤝 Collaboration insights
- 📁 Most active repositories

## 🚀 Getting Started

### Option 1: Run Locally (Recommended)

#### Prerequisites
- Node.js 18+ installed
- Git repositories to analyze

#### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/PasanL-ifs/BitBucketWrapper.git
   cd BitBucketWrapper
   ```

2. **Install all dependencies**
   ```bash
   npm run install:all
   ```

3. **Start the development servers**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Option 2: Use Hosted Version with Exported Data

The hosted version requires you to export your Git data first using the CLI tool.

#### Step 1: Download the CLI Tool

**Windows Users (Easiest):**
- Download the pre-built executable from the [Releases Page](https://github.com/PasanL-ifs/BitBucketWrapper/releases)
- Choose `git-wrapped-export-windows-amd64.exe` for 64-bit Windows
- No installation required - just download and run!

**Other Options:**
- **Node.js Version:** Requires Node.js 18+ (see [CLI README](./cli/README.md))
- **Python Version:** Requires Python 3.7+ (see [CLI README](./cli/README.md))
- **Go Version:** Build from source (see [CLI README](./cli/README.md))

#### Step 2: Export Your Git Data

**Using Windows Executable:**
```cmd
git-wrapped-export-windows-amd64.exe --path "C:\Users\YourName\Workspace" --output wrapped-data.json

# Filter by year
git-wrapped-export-windows-amd64.exe --path "C:\Users\YourName\Workspace" --year 2025 --output wrapped-2025.json
```

**Using Node.js:**
```bash
cd cli/nodejs
npm install
node bin/git-wrapped-export.js --path "C:\Users\YourName\Workspace" --output wrapped-data.json
```

**Using Python:**
```bash
cd cli/python
python git_wrapped_export.py --path "C:\Users\YourName\Workspace" --output wrapped-data.json
```

#### Step 3: Upload to Hosted Version

1. Visit the hosted Git Wrapped site
2. Select "Upload File" option
3. Upload your `wrapped-data.json` file
4. View your stats!

## 📖 Usage Guide

### Local Mode

1. **Select Time Range** - Choose a year or "All Time" for lifetime stats
2. **Choose Data Source** - Select "Local Folder" to scan repositories directly
3. **Enter Workspace Path** - Enter your projects folder path (e.g., `C:\Users\YourName\Workspace`)
4. **Select Repositories** - Check/uncheck the repos you want to include
5. **Choose Developer** - Select a team member from the discovered authors
6. **Generate Wrapped** - Watch the animated presentation!

### Hosted Mode (Upload File)

1. **Export Data** - Download and run the CLI tool on your local machine (see Getting Started)
2. **Select Time Range** - Choose a year or "All Time"
3. **Choose Data Source** - Select "Upload File"
4. **Upload JSON** - Upload the exported `wrapped-data.json` file
5. **Choose Developer** - Select a team member
6. **Generate Wrapped** - View your stats! All processing happens in your browser

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Charts | Recharts |
| Backend | Node.js + Express |
| Git Parsing | simple-git |
| Export | html2canvas |

## 📁 Project Structure

```
BitBucketWrapper/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/        # UI components
│   │   ├── pages/             # Page components
│   │   ├── context/           # React context
│   │   └── utils/             # Utility functions
│   └── package.json
├── server/                    # Node.js backend (local mode)
│   ├── src/
│   │   ├── routes/            # API endpoints
│   │   └── services/          # Business logic
│   └── package.json
├── cli/                       # CLI export tools
│   ├── go/                    # Go version (standalone executable)
│   ├── nodejs/                # Node.js version
│   ├── python/                # Python version
│   └── releases/              # Pre-built binaries
├── config/
│   └── authors.json           # Author email mapping
└── package.json
```

## 💻 CLI Tool Reference

All CLI versions (Windows .exe, Node.js, Python, Go) support the same options:

```bash
git-wrapped-export [options]

Options:
  -p, --path <path>      Path to workspace folder (default: current directory)
  -o, --output <file>    Output file name (default: wrapped-data.json)
  -y, --year <year>      Filter by year (e.g., 2024, 2025), omit for all-time
  -h, --help             Show help message

Examples:
  # Windows executable
  git-wrapped-export-windows-amd64.exe --path "C:\Projects" --output my-wrapped.json
  git-wrapped-export-windows-amd64.exe --path "C:\Projects" --year 2025
  
  # Node.js
  node bin/git-wrapped-export.js --path "C:\Projects" --year 2025
  
  # Python
  python git_wrapped_export.py --path "C:\Projects" --output my-wrapped.json
```

For detailed CLI documentation, see [CLI README](./cli/README.md)

## 🎨 Author Mapping

To properly identify team members (handling multiple emails), edit `config/authors.json`:

```json
{
  "Pasan Kulatunge": {
    "emails": ["pasan@company.com", "pasan.personal@gmail.com"],
    "color": "#FF6B6B"
  },
  "Pubudu Wijeyaratne": {
    "emails": ["pubudu@company.com"],
    "color": "#4ECDC4"
  }
}
```

## 🏆 Achievement Badges

| Badge | Criteria |
|-------|----------|
| 🔥 Streak Master | 30+ consecutive days with commits |
| 🌙 Night Owl | 40%+ commits after 8 PM |
| 🌅 Early Bird | 40%+ commits before 9 AM |
| ⚔️ Weekend Warrior | 20%+ commits on weekends |
| 🤖 Code Machine | 500+ commits in a year |
| 🌍 Polyglot | Commits in 5+ languages |
| 🧙 .NET Wizard | 50%+ commits in C# |
| ☕ Java Expert | 50%+ commits in Java |

## 🌐 Deploying to Production

### GitHub Pages

1. Fork/clone this repository
2. Enable GitHub Pages in repository settings
3. The GitHub Actions workflow will automatically build and deploy
4. Update `client/vite.config.js` base path if your repo name is different

### Building CLI Executables

To create standalone executables for distribution:

**Windows:**
```cmd
cd cli\go
build.bat
```

**Linux/macOS:**
```bash
cd cli/go
chmod +x build.sh
./build.sh
```

Executables will be created in `cli/releases/` directory:
- `git-wrapped-export-windows-amd64.exe` (Windows 64-bit)
- `git-wrapped-export-windows-386.exe` (Windows 32-bit)
- `git-wrapped-export-macos-amd64` (macOS Intel)
- `git-wrapped-export-macos-arm64` (macOS Apple Silicon)
- `git-wrapped-export-linux-amd64` (Linux 64-bit)

Upload these to GitHub Releases so users can download them directly.

## 📝 API Endpoints (Local Mode)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/scan/discover` | Discover repos in a folder |
| POST | `/api/scan` | Scan selected repositories |
| GET | `/api/authors` | List discovered authors |
| GET | `/api/stats/:email` | Get individual stats |
| GET | `/api/stats/team/overview` | Get team stats |
| GET | `/api/repos` | List repositories |


## 🔒 Privacy & Security

- **Local Mode:** All analysis happens locally on your machine
- **Hosted Mode:** Data processing happens entirely in your browser
- **No External Servers:** No data is sent to external servers
- **CLI Export:** Includes only commit metadata (no source code)
- **Open Source:** Review the code yourself at [GitHub](https://github.com/PasanL-ifs/BitBucketWrapper)

## 📄 License

MIT License - feel free to use this for your team!

---

Made with 💜 for developers who love to see their progress
