#!/usr/bin/env node

import { extractGitData } from '../src/extractor.js';
import { writeFileSync } from 'fs';
import { resolve, basename } from 'path';

// Parse command line arguments
const args = process.argv.slice(2);
let inputPath = process.cwd();
let outputFile = 'wrapped-data.json';
let year = null;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--path' || args[i] === '-p') {
    inputPath = args[++i];
  } else if (args[i] === '--output' || args[i] === '-o') {
    outputFile = args[++i];
  } else if (args[i] === '--year' || args[i] === '-y') {
    year = args[++i];
  } else if (args[i] === '--help' || args[i] === '-h') {
    printHelp();
    process.exit(0);
  }
}

function printHelp() {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                   Git Wrapped Export CLI                   ║
╚═══════════════════════════════════════════════════════════╝

Export your Git history for use with Git Wrapped on GitHub Pages.

Usage:
  git-wrapped-export [options]

Options:
  -p, --path <path>      Path to workspace folder (default: current directory)
  -o, --output <file>    Output file name (default: wrapped-data.json)
  -y, --year <year>      Filter by year (e.g., 2024, 2025), omit for all-time
  -h, --help             Show this help message

Examples:
  git-wrapped-export --path "C:\\Users\\pakulk\\Workspace" --output my-wrapped.json
  git-wrapped-export --path /home/user/projects --year 2025
  git-wrapped-export  (uses current directory, all-time)

The output file can be uploaded to the Git Wrapped web app.
`);
}

async function main() {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                   Git Wrapped Export CLI                   ║
╚═══════════════════════════════════════════════════════════╝
`);

  const resolvedPath = resolve(inputPath);
  console.log(`📂 Scanning: ${resolvedPath}`);
  
  if (year) {
    console.log(`📅 Year filter: ${year}`);
  } else {
    console.log(`📅 All-time mode (no date filter)`);
  }
  
  console.log('');

  try {
    const startTime = Date.now();
    const data = await extractGitData(resolvedPath, year);
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    // Write output file
    const outputPath = resolve(outputFile);
    writeFileSync(outputPath, JSON.stringify(data, null, 2));

    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ Export Complete!');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`📁 Repositories scanned: ${data.repositories.length}`);
    console.log(`👥 Authors found: ${data.authors.length}`);
    console.log(`📝 Total commits: ${data.totalCommits}`);
    console.log(`⏱️  Time taken: ${duration}s`);
    console.log(`💾 Output file: ${outputPath}`);
    console.log(`📊 File size: ${(JSON.stringify(data).length / 1024).toFixed(2)} KB`);
    console.log('');
    console.log('Upload this file to Git Wrapped web app to view your stats!');
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
