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

### Beautiful Visualizations
- 🎨 Animated slideshow presentation (like Spotify Wrapped)
- 📊 Interactive charts and heatmaps
- 🌙 Stunning dark theme with gradient accents
- 📱 Responsive design

### Export & Share
- 📥 Download stats as PNG image
- 🔗 Share summary card

## 🚀 Getting Started

### Option 1: Run Locally (Recommended)

#### Prerequisites
- Node.js 18+ installed
- Git repositories to analyze

#### Installation

1. **Clone or navigate to the project directory**

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

### Option 2: Use GitHub Pages (Hosted Version)

The hosted version requires you to export your Git data first using our CLI tool.

#### Step 1: Install the CLI Tool

```bash
cd cli
npm install
```

#### Step 2: Export Your Git Data

```bash
# From the cli directory
node bin/git-wrapped-export.js --path "C:\Users\pakulk\Workspace" --output wrapped-data.json

# Or with year filter
node bin/git-wrapped-export.js --path "C:\Users\pakulk\Workspace" --year 2025 --output wrapped-2025.json
```

#### Step 3: Upload to Hosted Version

1. Visit the hosted Git Wrapped site
2. Select "Upload File" option
3. Upload your `wrapped-data.json` file
4. View your stats!

## 📖 Usage Guide

### Local Mode

1. **Select Time Range** - Choose a year or "All Time" for lifetime stats
2. **Enter Workspace Path** - Enter your projects folder path (e.g., `C:\Users\pakulk\Workspace`)
3. **Select Repositories** - Check/uncheck the repos you want to include
4. **Choose Developer** - Select a team member from the discovered authors
5. **Generate Wrapped** - Watch the animated presentation!

### Hosted Mode (GitHub Pages)

1. **Export Data** - Run the CLI tool on your local machine
2. **Upload JSON** - Upload the exported file to the web app
3. **View Stats** - All processing happens in your browser

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
git-wrapped/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Wrapped/       # Slideshow slides
│   │   │   ├── Charts/        # Visualization components
│   │   │   └── UI/            # Reusable UI elements
│   │   ├── pages/             # Page components
│   │   ├── context/           # React context
│   │   └── utils/             # Utility functions
│   └── package.json
├── server/                    # Node.js backend (local mode)
│   ├── src/
│   │   ├── routes/            # API endpoints
│   │   └── services/          # Business logic
│   └── package.json
├── cli/                       # CLI export tool
│   ├── bin/
│   │   └── git-wrapped-export.js
│   ├── src/
│   │   └── extractor.js
│   └── package.json
├── config/
│   └── authors.json           # Author email mapping
└── package.json
```

## 💻 CLI Tool Reference

```bash
git-wrapped-export [options]

Options:
  -p, --path <path>      Path to workspace folder (default: current directory)
  -o, --output <file>    Output file name (default: wrapped-data.json)
  -y, --year <year>      Filter by year (e.g., 2024, 2025), omit for all-time
  -h, --help             Show help message

Examples:
  git-wrapped-export --path "C:\Projects" --output my-wrapped.json
  git-wrapped-export --path /home/user/projects --year 2025
  git-wrapped-export  (uses current directory, all-time)
```

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

## 🌐 Deploying to GitHub Pages

1. Fork/clone this repository
2. Enable GitHub Pages in repository settings
3. The GitHub Actions workflow will automatically build and deploy
4. Update `client/vite.config.js` base path if your repo name is different

## 📝 API Endpoints (Local Mode)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/scan/discover` | Discover repos in a folder |
| POST | `/api/scan` | Scan selected repositories |
| GET | `/api/authors` | List discovered authors |
| GET | `/api/stats/:email` | Get individual stats |
| GET | `/api/stats/team/overview` | Get team stats |
| GET | `/api/repos` | List repositories |

## 🔒 Privacy

- All analysis happens locally on your machine (local mode)
- Hosted mode processes data in your browser only
- No data is sent to external servers
- CLI export includes only commit metadata, not file contents

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - feel free to use this for your team!

---

Made with 💜 for developers who love to see their progress
