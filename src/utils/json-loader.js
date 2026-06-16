import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_DIR = join(__dirname, '..', 'data');

export function loadJSON(filename) {
  const path = join(DATA_DIR, filename);
  const raw = readFileSync(path, 'utf-8');
  return JSON.parse(raw);
}
