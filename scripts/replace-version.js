// Replace __HEXO_VERSION__ placeholder in Hexo dist files with actual version

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
const version = pkg.version;

const targets = [
  path.join(__dirname, '../dist/cjs/hexo/index.js'),
  path.join(__dirname, '../dist/esm/hexo/index.js')
];

for (const file of targets) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/__HEXO_VERSION__/g, version);
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Replaced version in ${file}`);
  } else {
    console.warn(`File not found: ${file}`);
  }
}
