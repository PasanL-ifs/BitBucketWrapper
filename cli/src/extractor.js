import { simpleGit } from 'simple-git';
import { readdirSync, statSync, existsSync } from 'fs';
import { join, basename } from 'path';

// Language detection by file extension
const LANGUAGE_MAP = {
  '.cs': 'C#',
  '.xaml': 'XAML',
  '.java': 'Java',
  '.js': 'JavaScript',
  '.jsx': 'JavaScript',
  '.ts': 'TypeScript',
  '.tsx': 'TypeScript',
  '.py': 'Python',
  '.html': 'HTML',
  '.css': 'CSS',
  '.scss': 'SCSS',
  '.less': 'LESS',
  '.json': 'JSON',
  '.xml': 'XML',
  '.sql': 'SQL',
  '.sh': 'Shell',
  '.ps1': 'PowerShell',
  '.yml': 'YAML',
  '.yaml': 'YAML',
  '.md': 'Markdown',
  '.rb': 'Ruby',
  '.go': 'Go',
  '.rs': 'Rust',
  '.cpp': 'C++',
  '.c': 'C',
  '.h': 'C/C++ Header',
  '.swift': 'Swift',
  '.kt': 'Kotlin',
  '.php': 'PHP',
  '.vue': 'Vue',
  '.svelte': 'Svelte'
};

/**
 * Find all Git repositories in a directory (recursive)
 */
function findGitRepos(dirPath, maxDepth = 3, currentDepth = 0) {
  const repos = [];
  
  if (currentDepth > maxDepth) return repos;
  
  try {
    const gitDir = join(dirPath, '.git');
    if (existsSync(gitDir) && statSync(gitDir).isDirectory()) {
      repos.push(dirPath);
      return repos;
    }
    
    const entries = readdirSync(dirPath);
    for (const entry of entries) {
      if (entry.startsWith('.') || entry === 'node_modules') continue;
      
      const fullPath = join(dirPath, entry);
      try {
        if (statSync(fullPath).isDirectory()) {
          repos.push(...findGitRepos(fullPath, maxDepth, currentDepth + 1));
        }
      } catch (e) {
        // Skip inaccessible directories
      }
    }
  } catch (error) {
    // Skip inaccessible directories
  }
  
  return repos;
}

/**
 * Parse commits from a single repository
 */
async function parseRepository(repoPath, dateRange) {
  const git = simpleGit(repoPath);
  const repoName = basename(repoPath);
  
  process.stdout.write(`  📖 Parsing ${repoName}...`);
  
  try {
    const isRepo = await git.checkIsRepo();
    if (!isRepo) {
      console.log(' ⚠️ Not a valid git repo');
      return null;
    }
    
    // Get commit log with stats
    const logOptions = {
      '--numstat': null,
      '--all': null,
      format: {
        hash: '%H',
        abbrevHash: '%h',
        author: '%an',
        email: '%ae',
        date: '%aI',
        message: '%s'
      }
    };
    
    // Add date range filtering if provided
    if (dateRange && dateRange.start) {
      logOptions['--since'] = dateRange.start;
    }
    if (dateRange && dateRange.end) {
      logOptions['--until'] = dateRange.end;
    }
    
    const log = await git.log(logOptions);
    
    if (!log || !log.all || log.all.length === 0) {
      console.log(' ℹ️ No commits found');
      return {
        name: repoName,
        path: repoPath,
        commits: [],
        commitCount: 0,
        authors: [],
        languages: {}
      };
    }
    
    // Process commits
    const commits = [];
    const authorsMap = new Map();
    const languagesMap = new Map();
    
    for (const commit of log.all) {
      let insertions = 0;
      let deletions = 0;
      const filesChanged = [];
      
      if (commit.diff) {
        for (const file of commit.diff.files || []) {
          insertions += file.insertions || 0;
          deletions += file.deletions || 0;
          filesChanged.push(file.file);
          
          const ext = getFileExtension(file.file);
          if (ext && LANGUAGE_MAP[ext]) {
            const lang = LANGUAGE_MAP[ext];
            languagesMap.set(lang, (languagesMap.get(lang) || 0) + (file.insertions || 0));
          }
        }
      }
      
      commits.push({
        hash: commit.hash,
        abbrevHash: commit.abbrevHash,
        author: commit.author,
        email: commit.email,
        date: commit.date,
        message: commit.message,
        insertions,
        deletions,
        filesChanged,
        repository: repoName
      });
      
      const authorKey = commit.email.toLowerCase();
      if (!authorsMap.has(authorKey)) {
        authorsMap.set(authorKey, {
          name: commit.author,
          email: commit.email,
          commitCount: 0
        });
      }
      authorsMap.get(authorKey).commitCount++;
    }
    
    console.log(` ✅ ${commits.length} commits`);
    
    return {
      name: repoName,
      path: repoPath,
      commits,
      commitCount: commits.length,
      authors: Array.from(authorsMap.values()),
      languages: Object.fromEntries(languagesMap)
    };
    
  } catch (error) {
    console.log(` ❌ Error: ${error.message}`);
    return null;
  }
}

function getFileExtension(filePath) {
  const match = filePath.match(/\.[^.]+$/);
  return match ? match[0].toLowerCase() : null;
}

/**
 * Extract Git data from all repositories in a directory
 */
export async function extractGitData(rootPath, year = null) {
  console.log('🔍 Finding Git repositories...');
  
  const repoPaths = findGitRepos(rootPath);
  console.log(`📁 Found ${repoPaths.length} repositories\n`);
  
  if (repoPaths.length === 0) {
    throw new Error('No Git repositories found in the specified path');
  }
  
  // Calculate date range
  let dateRange = null;
  if (year && year !== 'all') {
    dateRange = {
      start: `${year}-01-01`,
      end: `${year}-12-31`
    };
  }
  
  const repositories = [];
  const allCommits = [];
  const authorsMap = new Map();
  const languagesMap = new Map();
  
  for (const repoPath of repoPaths) {
    const repoData = await parseRepository(repoPath, dateRange);
    
    if (repoData && repoData.commits.length > 0) {
      repositories.push({
        name: repoData.name,
        commitCount: repoData.commitCount,
        authors: repoData.authors,
        languages: repoData.languages
      });
      
      allCommits.push(...repoData.commits);
      
      // Aggregate authors
      for (const author of repoData.authors) {
        const key = author.email.toLowerCase();
        if (!authorsMap.has(key)) {
          authorsMap.set(key, { ...author, repositories: [] });
        }
        const existing = authorsMap.get(key);
        existing.commitCount += author.commitCount;
        if (!existing.repositories.includes(repoData.name)) {
          existing.repositories.push(repoData.name);
        }
      }
      
      // Aggregate languages
      for (const [lang, lines] of Object.entries(repoData.languages)) {
        languagesMap.set(lang, (languagesMap.get(lang) || 0) + lines);
      }
    }
  }
  
  // Sort authors by commit count
  const authors = Array.from(authorsMap.values())
    .sort((a, b) => b.commitCount - a.commitCount);
  
  return {
    exportVersion: '1.0',
    exportDate: new Date().toISOString(),
    sourceApp: 'git-wrapped-export',
    repositories,
    commits: allCommits,
    totalCommits: allCommits.length,
    authors,
    languages: Object.fromEntries(languagesMap),
    dateRange: dateRange || { start: null, end: null, allTime: true }
  };
}
