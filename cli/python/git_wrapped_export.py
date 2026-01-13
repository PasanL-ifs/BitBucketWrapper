#!/usr/bin/env python3
"""
Git Wrapped Export CLI - Python Version
Exports Git commit history to JSON for use with Git Wrapped web app.

Usage:
    python git_wrapped_export.py --path "C:/Users/pakulk/Workspace" --output wrapped-data.json
    python git_wrapped_export.py --path /home/user/projects --year 2025
"""

import os
import sys
import json
import argparse
import subprocess
from datetime import datetime
from pathlib import Path
from collections import defaultdict

# Language detection by file extension
LANGUAGE_MAP = {
    '.cs': 'C#', '.xaml': 'XAML', '.java': 'Java', '.js': 'JavaScript',
    '.jsx': 'JavaScript', '.ts': 'TypeScript', '.tsx': 'TypeScript',
    '.py': 'Python', '.html': 'HTML', '.css': 'CSS', '.scss': 'SCSS',
    '.less': 'LESS', '.json': 'JSON', '.xml': 'XML', '.sql': 'SQL',
    '.sh': 'Shell', '.ps1': 'PowerShell', '.yml': 'YAML', '.yaml': 'YAML',
    '.md': 'Markdown', '.rb': 'Ruby', '.go': 'Go', '.rs': 'Rust',
    '.cpp': 'C++', '.c': 'C', '.h': 'C/C++ Header', '.swift': 'Swift',
    '.kt': 'Kotlin', '.php': 'PHP', '.vue': 'Vue', '.svelte': 'Svelte'
}


def print_banner():
    print("""
+===========================================================+
|              Git Wrapped Export CLI (Python)               |
+===========================================================+
""")


def find_git_repos(root_path, max_depth=3):
    """Find all Git repositories in a directory recursively."""
    repos = []
    root_path = Path(root_path).resolve()
    
    def scan_dir(path, depth):
        if depth > max_depth:
            return
        
        try:
            git_dir = path / '.git'
            if git_dir.exists() and git_dir.is_dir():
                repos.append(path)
                return  # Don't recurse into git repos
            
            for entry in path.iterdir():
                if entry.is_dir() and not entry.name.startswith('.') and entry.name != 'node_modules':
                    scan_dir(entry, depth + 1)
        except PermissionError:
            pass
    
    scan_dir(root_path, 0)
    return repos


def run_git_command(repo_path, args):
    """Run a git command and return the output."""
    try:
        result = subprocess.run(
            ['git'] + args,
            cwd=repo_path,
            capture_output=True,
            text=True,
            encoding='utf-8',
            errors='replace'
        )
        return result.stdout if result.returncode == 0 else None
    except Exception as e:
        return None


def parse_repository(repo_path, date_range=None):
    """Parse commits from a single repository."""
    repo_name = repo_path.name
    print(f"  [>] Parsing {repo_name}...", end='', flush=True)
    
    # Check if it's a valid git repo
    if not run_git_command(repo_path, ['rev-parse', '--git-dir']):
        print(" [!] Not a valid git repo")
        return None
    
    # Build git log command
    log_format = '%H|%h|%an|%ae|%aI|%s'
    git_args = ['log', f'--format={log_format}', '--numstat', '--all']
    
    if date_range:
        if date_range.get('start'):
            git_args.append(f'--since={date_range["start"]}')
        if date_range.get('end'):
            git_args.append(f'--until={date_range["end"]}')
    
    output = run_git_command(repo_path, git_args)
    if not output:
        print(" [i] No commits found")
        return {
            'name': repo_name,
            'commits': [],
            'commitCount': 0,
            'authors': [],
            'languages': {}
        }
    
    # Parse the output
    commits = []
    authors_map = defaultdict(lambda: {'name': '', 'email': '', 'commitCount': 0})
    languages_map = defaultdict(int)
    
    current_commit = None
    
    for line in output.strip().split('\n'):
        if not line:
            continue
        
        # Check if this is a commit line (contains | separators)
        if '|' in line and line.count('|') >= 5:
            parts = line.split('|')
            if len(parts) >= 6:
                # Save previous commit if exists
                if current_commit:
                    commits.append(current_commit)
                
                current_commit = {
                    'hash': parts[0],
                    'abbrevHash': parts[1],
                    'author': parts[2],
                    'email': parts[3],
                    'date': parts[4],
                    'message': '|'.join(parts[5:]),  # Message might contain |
                    'insertions': 0,
                    'deletions': 0,
                    'filesChanged': [],
                    'repository': repo_name
                }
                
                # Track author
                email_key = parts[3].lower()
                authors_map[email_key]['name'] = parts[2]
                authors_map[email_key]['email'] = parts[3]
                authors_map[email_key]['commitCount'] += 1
        
        # Check if this is a file stat line (numstat format: insertions deletions filename)
        elif current_commit and '\t' in line:
            parts = line.split('\t')
            if len(parts) >= 3:
                try:
                    insertions = int(parts[0]) if parts[0] != '-' else 0
                    deletions = int(parts[1]) if parts[1] != '-' else 0
                    filename = parts[2]
                    
                    current_commit['insertions'] += insertions
                    current_commit['deletions'] += deletions
                    current_commit['filesChanged'].append(filename)
                    
                    # Track language
                    ext = Path(filename).suffix.lower()
                    if ext in LANGUAGE_MAP:
                        languages_map[LANGUAGE_MAP[ext]] += insertions
                except ValueError:
                    pass
    
    # Don't forget the last commit
    if current_commit:
        commits.append(current_commit)
    
    print(f" [OK] {len(commits)} commits")
    
    return {
        'name': repo_name,
        'commits': commits,
        'commitCount': len(commits),
        'authors': [{'name': v['name'], 'email': v['email'], 'commitCount': v['commitCount']} 
                    for v in authors_map.values()],
        'languages': dict(languages_map)
    }


def extract_git_data(root_path, year=None):
    """Extract Git data from all repositories."""
    print("[*] Finding Git repositories...")
    
    repos = find_git_repos(root_path)
    print(f"[+] Found {len(repos)} repositories\n")
    
    if not repos:
        raise Exception("No Git repositories found in the specified path")
    
    # Calculate date range
    date_range = None
    if year and year != 'all':
        date_range = {
            'start': f'{year}-01-01',
            'end': f'{year}-12-31'
        }
    
    all_commits = []
    all_repos = []
    authors_map = defaultdict(lambda: {'name': '', 'email': '', 'commitCount': 0, 'repositories': []})
    languages_map = defaultdict(int)
    
    for repo_path in repos:
        repo_data = parse_repository(repo_path, date_range)
        
        if repo_data and repo_data['commits']:
            all_repos.append({
                'name': repo_data['name'],
                'commitCount': repo_data['commitCount'],
                'authors': repo_data['authors'],
                'languages': repo_data['languages']
            })
            
            all_commits.extend(repo_data['commits'])
            
            # Aggregate authors
            for author in repo_data['authors']:
                key = author['email'].lower()
                authors_map[key]['name'] = author['name']
                authors_map[key]['email'] = author['email']
                authors_map[key]['commitCount'] += author['commitCount']
                if repo_data['name'] not in authors_map[key]['repositories']:
                    authors_map[key]['repositories'].append(repo_data['name'])
            
            # Aggregate languages
            for lang, lines in repo_data['languages'].items():
                languages_map[lang] += lines
    
    # Sort authors by commit count
    authors = sorted(authors_map.values(), key=lambda x: x['commitCount'], reverse=True)
    
    return {
        'exportVersion': '1.0',
        'exportDate': datetime.now().isoformat(),
        'sourceApp': 'git-wrapped-export-python',
        'repositories': all_repos,
        'commits': all_commits,
        'totalCommits': len(all_commits),
        'authors': authors,
        'languages': dict(languages_map),
        'dateRange': date_range or {'start': None, 'end': None, 'allTime': True}
    }


def main():
    parser = argparse.ArgumentParser(
        description='Export Git history for Git Wrapped web app',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python git_wrapped_export.py --path "C:\\Users\\pakulk\\Workspace"
  python git_wrapped_export.py --path /home/user/projects --year 2025
  python git_wrapped_export.py --path . --output my-wrapped.json
        """
    )
    parser.add_argument('-p', '--path', default='.', help='Path to workspace folder (default: current directory)')
    parser.add_argument('-o', '--output', default='wrapped-data.json', help='Output file name (default: wrapped-data.json)')
    parser.add_argument('-y', '--year', default=None, help='Filter by year (e.g., 2024, 2025), omit for all-time')
    
    args = parser.parse_args()
    
    print_banner()
    
    input_path = Path(args.path).resolve()
    print(f"[>] Scanning: {input_path}")
    
    if args.year:
        print(f"[>] Year filter: {args.year}")
    else:
        print("[>] All-time mode (no date filter)")
    
    print()
    
    try:
        start_time = datetime.now()
        data = extract_git_data(input_path, args.year)
        duration = (datetime.now() - start_time).total_seconds()
        
        # Write output
        output_path = Path(args.output).resolve()
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        file_size = output_path.stat().st_size / 1024
        
        print()
        print("===========================================================")
        print("[OK] Export Complete!")
        print("===========================================================")
        print(f"[+] Repositories scanned: {len(data['repositories'])}")
        print(f"[+] Authors found: {len(data['authors'])}")
        print(f"[+] Total commits: {data['totalCommits']}")
        print(f"[+] Time taken: {duration:.2f}s")
        print(f"[+] Output file: {output_path}")
        print(f"[+] File size: {file_size:.2f} KB")
        print()
        print("Upload this file to Git Wrapped web app to view your stats!")
        print()
        
    except Exception as e:
        print(f"[ERROR] {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()
