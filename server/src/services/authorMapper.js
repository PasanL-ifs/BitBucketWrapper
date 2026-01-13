import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CONFIG_DIR = join(__dirname, '..', '..', '..', 'config');
const MAPPING_FILE = join(CONFIG_DIR, 'authors.json');

// Default author mapping with team colors
const DEFAULT_MAPPING = {
  "Pasan Kulatunge": {
    "emails": [],
    "color": "#FF6B6B"
  },
  "Pubudu Wijeyaratne": {
    "emails": [],
    "color": "#4ECDC4"
  },
  "Poshitha Harischandra": {
    "emails": [],
    "color": "#45B7D1"
  },
  "Daniel Meza": {
    "emails": [],
    "color": "#96CEB4"
  },
  "Gayani": {
    "emails": [],
    "color": "#FFEAA7"
  },
  "Kavisheshan": {
    "emails": [],
    "color": "#DDA0DD"
  },
  "Darshana": {
    "emails": [],
    "color": "#98D8C8"
  }
};

// Color palette for auto-assignment
const COLOR_PALETTE = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7",
  "#DDA0DD", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E9",
  "#F8B500", "#00CED1", "#FF69B4", "#32CD32", "#FFD700"
];

let authorMapping = null;

/**
 * Ensure config directory exists
 */
function ensureConfigDir() {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

/**
 * Load author mapping from file
 */
export function getAuthorMapping() {
  if (authorMapping) {
    return authorMapping;
  }

  ensureConfigDir();

  if (existsSync(MAPPING_FILE)) {
    try {
      authorMapping = JSON.parse(readFileSync(MAPPING_FILE, 'utf-8'));
      return authorMapping;
    } catch (error) {
      console.error('Failed to read author mapping:', error);
    }
  }

  // Create default mapping file
  authorMapping = DEFAULT_MAPPING;
  saveAuthorMapping(authorMapping);
  return authorMapping;
}

/**
 * Save author mapping to file
 */
export async function saveAuthorMapping(mapping) {
  ensureConfigDir();
  authorMapping = mapping;
  writeFileSync(MAPPING_FILE, JSON.stringify(mapping, null, 2));
}

/**
 * Resolve an email to a known author
 */
export function resolveAuthor(email) {
  const mapping = getAuthorMapping();
  
  for (const [name, config] of Object.entries(mapping)) {
    if (config.emails && config.emails.some(e => 
      e.toLowerCase() === email.toLowerCase()
    )) {
      return { name, color: config.color };
    }
  }
  
  return { name: null, color: null };
}

/**
 * Auto-assign a color to an unmapped author
 */
export function getAuthorColor(authorName, index = 0) {
  const mapping = getAuthorMapping();
  
  // Check if author has a mapped color
  if (mapping[authorName] && mapping[authorName].color) {
    return mapping[authorName].color;
  }
  
  // Auto-assign from palette based on index
  return COLOR_PALETTE[index % COLOR_PALETTE.length];
}

/**
 * Add or update an author in the mapping
 */
export async function addAuthorMapping(name, emails, color) {
  const mapping = getAuthorMapping();
  
  mapping[name] = {
    emails: emails || [],
    color: color || COLOR_PALETTE[Object.keys(mapping).length % COLOR_PALETTE.length]
  };
  
  await saveAuthorMapping(mapping);
  return mapping[name];
}
