// Client-side stats calculation for file upload mode

const COLOR_PALETTE = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7",
  "#DDA0DD", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E9"
];

export function calculateDeveloperStatsFromData(email, scanData) {
  const normalizedEmail = email.toLowerCase();
  
  // Find all commits by this author
  const authorCommits = scanData.commits.filter(c => 
    c.email.toLowerCase() === normalizedEmail
  );
  
  if (authorCommits.length === 0) {
    return null;
  }
  
  const authorName = authorCommits[0].author;
  const authorIndex = scanData.authors.findIndex(a => a.email.toLowerCase() === normalizedEmail);
  const authorColor = COLOR_PALETTE[authorIndex % COLOR_PALETTE.length];
  
  // Basic stats
  const totalCommits = authorCommits.length;
  const totalInsertions = authorCommits.reduce((sum, c) => sum + (c.insertions || 0), 0);
  const totalDeletions = authorCommits.reduce((sum, c) => sum + (c.deletions || 0), 0);
  
  // Monthly breakdown
  const monthlyStats = calculateMonthlyStats(authorCommits);
  
  // Hour of day stats
  const hourlyStats = calculateHourlyStats(authorCommits);
  
  // Day of week stats
  const dailyStats = calculateDailyStats(authorCommits);
  
  // Language breakdown
  const languages = calculateLanguageStats(authorCommits);
  
  // Repository breakdown
  const repositories = calculateRepoStats(authorCommits);
  
  // Streak calculations
  const streakStats = calculateStreakStats(authorCommits);
  
  // Biggest commit
  const biggestCommit = findBiggestCommit(authorCommits);
  
  // Time patterns
  const timePatterns = analyzeTimePatterns(hourlyStats, dailyStats);
  
  // Achievement badges
  const badges = calculateBadges(authorCommits, {
    totalCommits,
    totalInsertions,
    languages,
    timePatterns,
    streakStats
  });
  
  // Fun insights
  const insights = generateInsights(authorName, {
    totalCommits,
    languages,
    timePatterns,
    repositories,
    streakStats
  });
  
  return {
    author: {
      name: authorName,
      email: email,
      color: authorColor
    },
    summary: {
      totalCommits,
      totalInsertions,
      totalDeletions,
      totalLinesChanged: totalInsertions + totalDeletions,
      repositoriesContributed: repositories.length,
      languagesUsed: Object.keys(languages.breakdown || {}).length
    },
    monthlyStats,
    hourlyStats,
    dailyStats,
    languages,
    repositories,
    streakStats,
    biggestCommit,
    timePatterns,
    badges,
    insights,
    dateRange: scanData.dateRange
  };
}

function calculateMonthlyStats(commits) {
  const months = {};
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  for (let i = 0; i < 12; i++) {
    months[i] = { name: monthNames[i], commits: 0, insertions: 0, deletions: 0 };
  }
  
  for (const commit of commits) {
    const date = new Date(commit.date);
    const month = date.getMonth();
    months[month].commits++;
    months[month].insertions += commit.insertions || 0;
    months[month].deletions += commit.deletions || 0;
  }
  
  const sortedMonths = Object.values(months).sort((a, b) => b.commits - a.commits);
  
  return {
    byMonth: Object.values(months),
    mostProductiveMonth: sortedMonths[0].commits > 0 ? sortedMonths[0].name : null,
    mostProductiveMonthCommits: sortedMonths[0].commits
  };
}

function calculateHourlyStats(commits) {
  const hours = {};
  for (let i = 0; i < 24; i++) {
    hours[i] = { hour: i, commits: 0 };
  }
  
  for (const commit of commits) {
    const date = new Date(commit.date);
    const hour = date.getHours();
    hours[hour].commits++;
  }
  
  const sortedHours = Object.values(hours).sort((a, b) => b.commits - a.commits);
  
  return {
    byHour: Object.values(hours),
    peakHour: sortedHours[0].hour,
    peakHourCommits: sortedHours[0].commits
  };
}

function calculateDailyStats(commits) {
  const days = {
    0: { name: 'Sunday', short: 'Sun', commits: 0 },
    1: { name: 'Monday', short: 'Mon', commits: 0 },
    2: { name: 'Tuesday', short: 'Tue', commits: 0 },
    3: { name: 'Wednesday', short: 'Wed', commits: 0 },
    4: { name: 'Thursday', short: 'Thu', commits: 0 },
    5: { name: 'Friday', short: 'Fri', commits: 0 },
    6: { name: 'Saturday', short: 'Sat', commits: 0 }
  };
  
  for (const commit of commits) {
    const date = new Date(commit.date);
    days[date.getDay()].commits++;
  }
  
  const sortedDays = Object.values(days).sort((a, b) => b.commits - a.commits);
  const weekendCommits = days[0].commits + days[6].commits;
  const weekdayCommits = days[1].commits + days[2].commits + days[3].commits + days[4].commits + days[5].commits;
  
  return {
    byDay: Object.values(days),
    mostActiveDay: sortedDays[0].name,
    mostActiveDayCommits: sortedDays[0].commits,
    weekendCommits,
    weekdayCommits,
    weekendPercentage: Math.round((weekendCommits / (weekendCommits + weekdayCommits)) * 100) || 0
  };
}

function calculateLanguageStats(commits) {
  const LANGUAGE_MAP = {
    '.cs': 'C#', '.xaml': 'XAML', '.java': 'Java', '.js': 'JavaScript',
    '.jsx': 'JavaScript', '.ts': 'TypeScript', '.tsx': 'TypeScript',
    '.py': 'Python', '.html': 'HTML', '.css': 'CSS', '.scss': 'SCSS',
    '.json': 'JSON', '.xml': 'XML', '.sql': 'SQL'
  };
  
  const languages = {};
  
  for (const commit of commits) {
    for (const file of commit.filesChanged || []) {
      const ext = file.match(/\.[^.]+$/)?.[0]?.toLowerCase();
      if (ext && LANGUAGE_MAP[ext]) {
        const lang = LANGUAGE_MAP[ext];
        languages[lang] = (languages[lang] || 0) + 1;
      }
    }
  }
  
  const total = Object.values(languages).reduce((sum, count) => sum + count, 0);
  const sorted = Object.entries(languages)
    .map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / total) * 100)
    }))
    .sort((a, b) => b.count - a.count);
  
  return {
    breakdown: sorted,
    topLanguage: sorted[0]?.name || 'Unknown',
    topLanguagePercentage: sorted[0]?.percentage || 0,
    totalLanguages: sorted.length
  };
}

function calculateRepoStats(commits) {
  const repos = {};
  
  for (const commit of commits) {
    const repo = commit.repository;
    if (!repos[repo]) {
      repos[repo] = { name: repo, commits: 0, insertions: 0, deletions: 0 };
    }
    repos[repo].commits++;
    repos[repo].insertions += commit.insertions || 0;
    repos[repo].deletions += commit.deletions || 0;
  }
  
  return Object.values(repos).sort((a, b) => b.commits - a.commits);
}

function calculateStreakStats(commits) {
  if (commits.length === 0) {
    return { currentStreak: 0, longestStreak: 0, totalActiveDays: 0, activeDays: [] };
  }
  
  const commitDays = new Set();
  for (const commit of commits) {
    const date = new Date(commit.date);
    const dayKey = date.toISOString().split('T')[0];
    commitDays.add(dayKey);
  }
  
  const sortedDays = Array.from(commitDays).sort();
  let longestStreak = 1;
  let tempStreak = 1;
  
  for (let i = 1; i < sortedDays.length; i++) {
    const prevDate = new Date(sortedDays[i - 1]);
    const currDate = new Date(sortedDays[i]);
    const diffDays = Math.round((currDate - prevDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }
  
  return {
    currentStreak: tempStreak,
    longestStreak,
    totalActiveDays: sortedDays.length,
    activeDays: sortedDays
  };
}

function findBiggestCommit(commits) {
  if (commits.length === 0) return null;
  
  const sorted = commits
    .filter(c => c.insertions || c.deletions)
    .sort((a, b) => {
      const aTotal = (a.insertions || 0) + (a.deletions || 0);
      const bTotal = (b.insertions || 0) + (b.deletions || 0);
      return bTotal - aTotal;
    });
  
  if (sorted.length === 0) return null;
  
  const biggest = sorted[0];
  return {
    hash: biggest.abbrevHash || biggest.hash?.substring(0, 7),
    message: biggest.message,
    date: biggest.date,
    insertions: biggest.insertions || 0,
    deletions: biggest.deletions || 0,
    totalChanges: (biggest.insertions || 0) + (biggest.deletions || 0),
    repository: biggest.repository
  };
}

function analyzeTimePatterns(hourlyStats, dailyStats) {
  const total = hourlyStats.byHour.reduce((sum, h) => sum + h.commits, 0);
  
  const morning = hourlyStats.byHour.slice(6, 12).reduce((sum, h) => sum + h.commits, 0);
  const afternoon = hourlyStats.byHour.slice(12, 18).reduce((sum, h) => sum + h.commits, 0);
  const evening = hourlyStats.byHour.slice(18, 24).reduce((sum, h) => sum + h.commits, 0);
  const night = hourlyStats.byHour.slice(0, 6).reduce((sum, h) => sum + h.commits, 0);
  
  const timeOfDay = [
    { name: 'Morning (6AM-12PM)', commits: morning, percentage: Math.round((morning / total) * 100) || 0 },
    { name: 'Afternoon (12PM-6PM)', commits: afternoon, percentage: Math.round((afternoon / total) * 100) || 0 },
    { name: 'Evening (6PM-12AM)', commits: evening, percentage: Math.round((evening / total) * 100) || 0 },
    { name: 'Night (12AM-6AM)', commits: night, percentage: Math.round((night / total) * 100) || 0 }
  ].sort((a, b) => b.commits - a.commits);
  
  let coderType = 'Balanced';
  if (morning > afternoon && morning > evening) coderType = 'Morning Person';
  else if (afternoon > morning && afternoon > evening) coderType = 'Afternoon Coder';
  else if (evening > morning && evening > afternoon) coderType = 'Night Owl';
  
  return {
    timeOfDay,
    preferredTime: timeOfDay[0].name,
    coderType,
    isNightOwl: (evening + night) / total > 0.4,
    isEarlyBird: morning / total > 0.4,
    isWeekendWarrior: dailyStats.weekendPercentage > 20
  };
}

function calculateBadges(commits, stats) {
  const badges = [];
  
  if (stats.streakStats?.longestStreak >= 30) {
    badges.push({ id: 'streak-master', name: 'Streak Master', icon: '🔥', description: `${stats.streakStats.longestStreak} day streak!` });
  }
  
  if (stats.timePatterns?.isNightOwl) {
    badges.push({ id: 'night-owl', name: 'Night Owl', icon: '🌙', description: 'Codes best after dark' });
  }
  
  if (stats.timePatterns?.isEarlyBird) {
    badges.push({ id: 'early-bird', name: 'Early Bird', icon: '🌅', description: 'Catches the morning bugs' });
  }
  
  if (stats.timePatterns?.isWeekendWarrior) {
    badges.push({ id: 'weekend-warrior', name: 'Weekend Warrior', icon: '⚔️', description: 'Codes on weekends too' });
  }
  
  if (stats.totalCommits >= 500) {
    badges.push({ id: 'code-machine', name: 'Code Machine', icon: '🤖', description: '500+ commits!' });
  } else if (stats.totalCommits >= 200) {
    badges.push({ id: 'commit-hero', name: 'Commit Hero', icon: '🦸', description: '200+ commits' });
  }
  
  if (stats.totalInsertions >= 50000) {
    badges.push({ id: 'line-slayer', name: 'Line Slayer', icon: '⚔️', description: '50K+ lines written!' });
  }
  
  if (stats.languages?.totalLanguages >= 5) {
    badges.push({ id: 'polyglot', name: 'Polyglot', icon: '🌍', description: `${stats.languages.totalLanguages} languages` });
  }
  
  const topLang = stats.languages?.topLanguage;
  const topLangPct = stats.languages?.topLanguagePercentage || 0;
  
  if (topLang === 'C#' && topLangPct >= 50) {
    badges.push({ id: 'dotnet-wizard', name: '.NET Wizard', icon: '🧙', description: 'C# master' });
  }
  if (topLang === 'Java' && topLangPct >= 50) {
    badges.push({ id: 'java-expert', name: 'Java Expert', icon: '☕', description: 'Java aficionado' });
  }
  
  return badges;
}

function generateInsights(authorName, stats) {
  const insights = [];
  
  if (stats.languages?.topLanguage) {
    const lang = stats.languages.topLanguage;
    const pct = stats.languages.topLanguagePercentage;
    
    if (lang === 'C#' || lang === 'XAML') {
      insights.push(`You're a .NET MAUI wizard! ${pct}% of your commits were in ${lang}`);
    } else {
      insights.push(`${lang} is your superpower - ${pct}% of your commits`);
    }
  }
  
  if (stats.timePatterns?.coderType === 'Night Owl') {
    insights.push(`🌙 Night owl alert! You code best when the stars are out`);
  } else if (stats.timePatterns?.coderType === 'Morning Person') {
    insights.push(`🌅 Early bird catches the bugs! Peak coding before noon`);
  }
  
  if (stats.totalCommits >= 500) {
    insights.push(`🚀 ${stats.totalCommits} commits?! You're absolutely unstoppable!`);
  } else if (stats.totalCommits >= 200) {
    insights.push(`💪 ${stats.totalCommits} commits - you've been crushing it!`);
  }
  
  if (stats.streakStats?.longestStreak >= 14) {
    insights.push(`🔥 ${stats.streakStats.longestStreak}-day streak! That's dedication!`);
  }
  
  if (stats.repositories?.length >= 3) {
    insights.push(`📚 You touched ${stats.repositories.length} different repositories - true team player!`);
  }
  
  return insights;
}

export function calculateTeamStatsFromData(scanData) {
  const { commits, authors, repositories, languages, dateRange } = scanData;
  
  const totalCommits = commits.length;
  const totalInsertions = commits.reduce((sum, c) => sum + (c.insertions || 0), 0);
  const totalDeletions = commits.reduce((sum, c) => sum + (c.deletions || 0), 0);
  
  const leaderboard = authors.map((author, index) => {
    const authorCommits = commits.filter(c => c.email.toLowerCase() === author.email.toLowerCase());
    const insertions = authorCommits.reduce((sum, c) => sum + (c.insertions || 0), 0);
    
    return {
      rank: index + 1,
      name: author.name,
      email: author.email,
      commits: author.commitCount,
      insertions,
      color: COLOR_PALETTE[index % COLOR_PALETTE.length]
    };
  });
  
  const repoStats = repositories?.map(r => ({
    name: r.name,
    commits: r.commitCount,
    authors: r.authors?.length || 0
  })).sort((a, b) => b.commits - a.commits) || [];
  
  const monthlyActivity = calculateMonthlyStats(commits).byMonth;
  
  const sortedLanguages = Object.entries(languages || {})
    .map(([name, lines]) => ({ name, lines }))
    .sort((a, b) => b.lines - a.lines);
  
  return {
    summary: {
      totalCommits,
      totalInsertions,
      totalDeletions,
      totalAuthors: authors.length,
      totalRepositories: repositories?.length || 0,
      dateRange
    },
    leaderboard,
    topRepositories: repoStats.slice(0, 10),
    mostActiveRepo: repoStats[0],
    monthlyActivity,
    languages: sortedLanguages.slice(0, 10),
    topLanguage: sortedLanguages[0]?.name || 'Unknown',
    collaborations: []
  };
}
