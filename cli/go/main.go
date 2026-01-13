package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"time"
)

// Language detection by file extension
var languageMap = map[string]string{
	".cs": "C#", ".xaml": "XAML", ".java": "Java", ".js": "JavaScript",
	".jsx": "JavaScript", ".ts": "TypeScript", ".tsx": "TypeScript",
	".py": "Python", ".html": "HTML", ".css": "CSS", ".scss": "SCSS",
	".less": "LESS", ".json": "JSON", ".xml": "XML", ".sql": "SQL",
	".sh": "Shell", ".ps1": "PowerShell", ".yml": "YAML", ".yaml": "YAML",
	".md": "Markdown", ".rb": "Ruby", ".go": "Go", ".rs": "Rust",
	".cpp": "C++", ".c": "C", ".h": "C/C++ Header", ".swift": "Swift",
	".kt": "Kotlin", ".php": "PHP", ".vue": "Vue", ".svelte": "Svelte",
}

// Data structures
type Commit struct {
	Hash         string   `json:"hash"`
	AbbrevHash   string   `json:"abbrevHash"`
	Author       string   `json:"author"`
	Email        string   `json:"email"`
	Date         string   `json:"date"`
	Message      string   `json:"message"`
	Insertions   int      `json:"insertions"`
	Deletions    int      `json:"deletions"`
	FilesChanged []string `json:"filesChanged"`
	Repository   string   `json:"repository"`
}

type Author struct {
	Name         string   `json:"name"`
	Email        string   `json:"email"`
	CommitCount  int      `json:"commitCount"`
	Repositories []string `json:"repositories,omitempty"`
}

type Repository struct {
	Name        string            `json:"name"`
	CommitCount int               `json:"commitCount"`
	Authors     []Author          `json:"authors"`
	Languages   map[string]int    `json:"languages"`
}

type DateRange struct {
	Start   *string `json:"start"`
	End     *string `json:"end"`
	AllTime bool    `json:"allTime,omitempty"`
}

type ExportData struct {
	ExportVersion  string           `json:"exportVersion"`
	ExportDate     string           `json:"exportDate"`
	SourceApp      string           `json:"sourceApp"`
	Repositories   []Repository     `json:"repositories"`
	Commits        []Commit         `json:"commits"`
	TotalCommits   int              `json:"totalCommits"`
	Authors        []Author         `json:"authors"`
	Languages      map[string]int   `json:"languages"`
	DateRange      DateRange        `json:"dateRange"`
}

func printBanner() {
	fmt.Println(`
╔═══════════════════════════════════════════════════════════╗
║               Git Wrapped Export CLI (Go)                  ║
║           Standalone Binary - No Dependencies!             ║
╚═══════════════════════════════════════════════════════════╝
`)
}

func findGitRepos(rootPath string, maxDepth int) []string {
	var repos []string
	
	var scanDir func(path string, depth int)
	scanDir = func(path string, depth int) {
		if depth > maxDepth {
			return
		}
		
		gitDir := filepath.Join(path, ".git")
		if info, err := os.Stat(gitDir); err == nil && info.IsDir() {
			repos = append(repos, path)
			return // Don't recurse into git repos
		}
		
		entries, err := os.ReadDir(path)
		if err != nil {
			return
		}
		
		for _, entry := range entries {
			if !entry.IsDir() {
				continue
			}
			name := entry.Name()
			if strings.HasPrefix(name, ".") || name == "node_modules" {
				continue
			}
			scanDir(filepath.Join(path, name), depth+1)
		}
	}
	
	scanDir(rootPath, 0)
	return repos
}

func runGitCommand(repoPath string, args ...string) (string, error) {
	cmd := exec.Command("git", args...)
	cmd.Dir = repoPath
	output, err := cmd.Output()
	if err != nil {
		return "", err
	}
	return string(output), nil
}

func parseRepository(repoPath string, dateRange *DateRange) (*Repository, []Commit) {
	repoName := filepath.Base(repoPath)
	fmt.Printf("  📖 Parsing %s...", repoName)
	
	// Check if valid git repo
	_, err := runGitCommand(repoPath, "rev-parse", "--git-dir")
	if err != nil {
		fmt.Println(" ⚠️ Not a valid git repo")
		return nil, nil
	}
	
	// Build git log command
	args := []string{"log", "--format=%H|%h|%an|%ae|%aI|%s", "--numstat", "--all"}
	
	if dateRange != nil && dateRange.Start != nil {
		args = append(args, "--since="+*dateRange.Start)
	}
	if dateRange != nil && dateRange.End != nil {
		args = append(args, "--until="+*dateRange.End)
	}
	
	output, err := runGitCommand(repoPath, args...)
	if err != nil || strings.TrimSpace(output) == "" {
		fmt.Println(" ℹ️ No commits found")
		return &Repository{
			Name:        repoName,
			CommitCount: 0,
			Authors:     []Author{},
			Languages:   make(map[string]int),
		}, nil
	}
	
	// Parse output
	var commits []Commit
	authorsMap := make(map[string]*Author)
	languagesMap := make(map[string]int)
	
	var currentCommit *Commit
	
	lines := strings.Split(strings.TrimSpace(output), "\n")
	for _, line := range lines {
		if line == "" {
			continue
		}
		
		// Check if commit line
		if strings.Contains(line, "|") && strings.Count(line, "|") >= 5 {
			parts := strings.SplitN(line, "|", 6)
			if len(parts) >= 6 {
				if currentCommit != nil {
					commits = append(commits, *currentCommit)
				}
				
				currentCommit = &Commit{
					Hash:         parts[0],
					AbbrevHash:   parts[1],
					Author:       parts[2],
					Email:        parts[3],
					Date:         parts[4],
					Message:      parts[5],
					Insertions:   0,
					Deletions:    0,
					FilesChanged: []string{},
					Repository:   repoName,
				}
				
				// Track author
				emailKey := strings.ToLower(parts[3])
				if _, exists := authorsMap[emailKey]; !exists {
					authorsMap[emailKey] = &Author{
						Name:        parts[2],
						Email:       parts[3],
						CommitCount: 0,
					}
				}
				authorsMap[emailKey].CommitCount++
			}
		} else if currentCommit != nil && strings.Contains(line, "\t") {
			// File stat line
			parts := strings.Split(line, "\t")
			if len(parts) >= 3 {
				insertions, _ := strconv.Atoi(parts[0])
				deletions, _ := strconv.Atoi(parts[1])
				filename := parts[2]
				
				currentCommit.Insertions += insertions
				currentCommit.Deletions += deletions
				currentCommit.FilesChanged = append(currentCommit.FilesChanged, filename)
				
				// Track language
				ext := strings.ToLower(filepath.Ext(filename))
				if lang, ok := languageMap[ext]; ok {
					languagesMap[lang] += insertions
				}
			}
		}
	}
	
	// Don't forget last commit
	if currentCommit != nil {
		commits = append(commits, *currentCommit)
	}
	
	fmt.Printf(" ✅ %d commits\n", len(commits))
	
	// Convert authors map to slice
	var authors []Author
	for _, author := range authorsMap {
		authors = append(authors, *author)
	}
	
	return &Repository{
		Name:        repoName,
		CommitCount: len(commits),
		Authors:     authors,
		Languages:   languagesMap,
	}, commits
}

func extractGitData(rootPath string, year string) (*ExportData, error) {
	fmt.Println("🔍 Finding Git repositories...")
	
	repos := findGitRepos(rootPath, 3)
	fmt.Printf("📁 Found %d repositories\n\n", len(repos))
	
	if len(repos) == 0 {
		return nil, fmt.Errorf("no Git repositories found in the specified path")
	}
	
	// Calculate date range
	var dateRange *DateRange
	if year != "" && year != "all" {
		start := year + "-01-01"
		end := year + "-12-31"
		dateRange = &DateRange{Start: &start, End: &end}
	}
	
	var allCommits []Commit
	var allRepos []Repository
	authorsMap := make(map[string]*Author)
	languagesMap := make(map[string]int)
	
	for _, repoPath := range repos {
		repo, commits := parseRepository(repoPath, dateRange)
		
		if repo != nil && len(commits) > 0 {
			allRepos = append(allRepos, *repo)
			allCommits = append(allCommits, commits...)
			
			// Aggregate authors
			for _, author := range repo.Authors {
				key := strings.ToLower(author.Email)
				if _, exists := authorsMap[key]; !exists {
					authorsMap[key] = &Author{
						Name:         author.Name,
						Email:        author.Email,
						CommitCount:  0,
						Repositories: []string{},
					}
				}
				authorsMap[key].CommitCount += author.CommitCount
				authorsMap[key].Repositories = append(authorsMap[key].Repositories, repo.Name)
			}
			
			// Aggregate languages
			for lang, lines := range repo.Languages {
				languagesMap[lang] += lines
			}
		}
	}
	
	// Convert authors map to sorted slice
	var authors []Author
	for _, author := range authorsMap {
		authors = append(authors, *author)
	}
	sort.Slice(authors, func(i, j int) bool {
		return authors[i].CommitCount > authors[j].CommitCount
	})
	
	// Build result
	result := &ExportData{
		ExportVersion: "1.0",
		ExportDate:    time.Now().Format(time.RFC3339),
		SourceApp:     "git-wrapped-export-go",
		Repositories:  allRepos,
		Commits:       allCommits,
		TotalCommits:  len(allCommits),
		Authors:       authors,
		Languages:     languagesMap,
	}
	
	if dateRange != nil {
		result.DateRange = *dateRange
	} else {
		result.DateRange = DateRange{AllTime: true}
	}
	
	return result, nil
}

func main() {
	pathFlag := flag.String("path", ".", "Path to workspace folder")
	pathShort := flag.String("p", "", "Path to workspace folder (shorthand)")
	outputFlag := flag.String("output", "wrapped-data.json", "Output file name")
	outputShort := flag.String("o", "", "Output file name (shorthand)")
	yearFlag := flag.String("year", "", "Filter by year (e.g., 2024, 2025)")
	yearShort := flag.String("y", "", "Filter by year (shorthand)")
	help := flag.Bool("help", false, "Show help")
	helpShort := flag.Bool("h", false, "Show help (shorthand)")
	
	flag.Parse()
	
	if *help || *helpShort {
		printBanner()
		fmt.Println(`Usage: git-wrapped-export [options]

Options:
  -p, --path <path>      Path to workspace folder (default: current directory)
  -o, --output <file>    Output file name (default: wrapped-data.json)
  -y, --year <year>      Filter by year (e.g., 2024, 2025), omit for all-time
  -h, --help             Show this help message

Examples:
  git-wrapped-export --path "C:\Users\pakulk\Workspace"
  git-wrapped-export --path /home/user/projects --year 2025
  git-wrapped-export -p . -o my-wrapped.json

The output file can be uploaded to the Git Wrapped web app.`)
		return
	}
	
	// Handle shorthand flags
	inputPath := *pathFlag
	if *pathShort != "" {
		inputPath = *pathShort
	}
	
	outputFile := *outputFlag
	if *outputShort != "" {
		outputFile = *outputShort
	}
	
	year := *yearFlag
	if *yearShort != "" {
		year = *yearShort
	}
	
	// Resolve absolute path
	absPath, err := filepath.Abs(inputPath)
	if err != nil {
		fmt.Printf("❌ Error: %v\n", err)
		os.Exit(1)
	}
	
	printBanner()
	fmt.Printf("📂 Scanning: %s\n", absPath)
	
	if year != "" {
		fmt.Printf("📅 Year filter: %s\n", year)
	} else {
		fmt.Println("📅 All-time mode (no date filter)")
	}
	fmt.Println()
	
	startTime := time.Now()
	data, err := extractGitData(absPath, year)
	if err != nil {
		fmt.Printf("❌ Error: %v\n", err)
		os.Exit(1)
	}
	
	duration := time.Since(startTime).Seconds()
	
	// Write output
	absOutput, _ := filepath.Abs(outputFile)
	jsonData, err := json.MarshalIndent(data, "", "  ")
	if err != nil {
		fmt.Printf("❌ Error: %v\n", err)
		os.Exit(1)
	}
	
	err = os.WriteFile(absOutput, jsonData, 0644)
	if err != nil {
		fmt.Printf("❌ Error: %v\n", err)
		os.Exit(1)
	}
	
	fileSize := float64(len(jsonData)) / 1024
	
	fmt.Println()
	fmt.Println("═══════════════════════════════════════════════════════════")
	fmt.Println("✅ Export Complete!")
	fmt.Println("═══════════════════════════════════════════════════════════")
	fmt.Printf("📁 Repositories scanned: %d\n", len(data.Repositories))
	fmt.Printf("👥 Authors found: %d\n", len(data.Authors))
	fmt.Printf("📝 Total commits: %d\n", data.TotalCommits)
	fmt.Printf("⏱️  Time taken: %.2fs\n", duration)
	fmt.Printf("💾 Output file: %s\n", absOutput)
	fmt.Printf("📊 File size: %.2f KB\n", fileSize)
	fmt.Println()
	fmt.Println("Upload this file to Git Wrapped web app to view your stats!")
	fmt.Println()
}
