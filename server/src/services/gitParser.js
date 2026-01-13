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
      return repos; // Don't recurse into git repos
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
    console.error(`Error scanning ${dirPath}:`, error.message);
  }
  
  return repos;
}

/**
 * Quickly discover Git repositories without parsing (for UI selection)
 */
export function discoverRepositories(dirPath, maxDepth = 3) {
  console.log(`🔍 Discovering Git repositories in ${dirPath}...`);
  
  const repoPaths = findGitRepos(dirPath, maxDepth);
  
  const repos = repoPaths.map(repoPath => ({
    name: basename(repoPath),
    path: repoPath
  }));
  
  console.log(`Found ${repos.length} repositories`);
  return repos;
}

/**
 * Parse commits from a single repository
 */
async function parseRepository(repoPath, dateRange) {
  const git = simpleGit(repoPath);
  const repoName = basename(repoPath);
  
  console.log(`  📖 Parsing ${repoName}...`);
  
  try {
    // Check if this is a valid git repo
    const isRepo = await git.checkIsRepo();
    if (!isRepo) {
      console.log(`  ⚠️ Not a valid git repo: ${repoPath}`);
      return null;
    }
    
    // Get the default branch (master or main)
    let defaultBranch = 'master';
    try {
      const branches = await git.branch();
      if (branches.all.includes('main')) {
        defaultBranch = 'main';
      } else if (branches.all.includes('master')) {
        defaultBranch = 'master';
      } else if (branches.current) {
        defaultBranch = branches.current;
      }
    } catch (e) {
      // Use master as fallback
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
        message: '%s',
        body: '%b'
      }
    };
    
    // Add date range filtering only if provided (not "All Time")
    if (dateRange && dateRange.start) {
      logOptions['--since'] = dateRange.start;
    }
    if (dateRange && dateRange.end) {
      logOptions['--until'] = dateRange.end;
    }
    
    const log = await git.log(logOptions);
    
    if (!log || !log.all || log.all.length === 0) {
      console.log(`  ℹ️ No commits found in date range for ${repoName}`);
      return {
        name: repoName,
        path: repoPath,
        defaultBranch,
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
      // Parse file changes from diff
      let insertions = 0;
      let deletions = 0;
      const filesChanged = [];
      
      if (commit.diff) {
        for (const file of commit.diff.files || []) {
          insertions += file.insertions || 0;
          deletions += file.deletions || 0;
          filesChanged.push(file.file);
          
          // Track language
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
      
      // Track author
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
    
    return {
      name: repoName,
      path: repoPath,
      defaultBranch,
      commits,
      commitCount: commits.length,
      authors: Array.from(authorsMap.values()),
      languages: Object.fromEntries(languagesMap)
    };
    
  } catch (error) {
    console.error(`  ❌ Error parsing ${repoName}:`, error.message);
    return null;
  }
}

/**
 * Get file extension from path
 */
function getFileExtension(filePath) {
  const match = filePath.match(/\.[^.]+$/);
  return match ? match[0].toLowerCase() : null;
}

/**
 * Scan all repositories in a directory or specific repos
 * @param {string|string[]} rootPathOrPaths - Either a root path to scan, or array of specific repo paths
 * @param {object|null} dateRange - Date range filter, or null for "All Time"
 */
export async function scanRepositories(rootPathOrPaths, dateRange) {
  let repoPaths;
  
  // Check if we're given specific repo paths or a root directory
  if (Array.isArray(rootPathOrPaths)) {
    repoPaths = rootPathOrPaths;
    console.log(`📂 Scanning ${repoPaths.length} selected repositories...`);
  } else {
    console.log(`🔍 Finding Git repositories in ${rootPathOrPaths}...`);
    repoPaths = findGitRepos(rootPathOrPaths);
    console.log(`Found ${repoPaths.length} repositories`);
  }
  
  if (dateRange) {
    console.log(`📅 Date range: ${dateRange.start || 'beginning'} to ${dateRange.end || 'now'}`);
  } else {
    console.log(`📅 All Time mode - no date filtering`);
  }
  
  const repositories = [];
  const allCommits = [];
  const authorsMap = new Map();
  const languagesMap = new Map();
  
  for (const repoPath of repoPaths) {
    const repoData = await parseRepository(repoPath, dateRange);
    
    if (repoData && repoData.commits.length > 0) {
      repositories.push(repoData);
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
    repositories,
    commits: allCommits,
    totalCommits: allCommits.length,
    authors,
    languages: Object.fromEntries(languagesMap),
    dateRange
  };
}

/**
 * Get detailed commit info with file changes
 */
export async function getCommitDetails(repoPath, commitHash) {
  const git = simpleGit(repoPath);
  
  try {
    const show = await git.show([commitHash, '--numstat', '--format=%H|%an|%ae|%aI|%s']);
    return show;
  } catch (error) {
    console.error('Error getting commit details:', error);
    return null;
  }
}
