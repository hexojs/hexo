import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const libDir = path.resolve(__dirname, '../lib');
const markerFile = path.resolve(__dirname, '../tmp/.last_build');
const extraFiles = [
  path.resolve(__dirname, '../test/scripts/dual_mode/dual.spec.ts'),
  __filename
];

function getAllFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(filePath));
    } else {
      results.push(filePath);
    }
  });
  return results;
}

function needsBuild() {
  if (!fs.existsSync(markerFile)) {
    console.log('[pretest] Build needed: marker file does not exist:', markerFile);
    return true;
  }
  const markerMtime = fs.statSync(markerFile).mtimeMs;
  const files = getAllFiles(libDir).concat(extraFiles);
  for (const f of files) {
    if (fs.existsSync(f)) {
      const mtime = fs.statSync(f).mtimeMs;
      if (mtime > markerMtime) {
        console.log(`[pretest] Build needed: file newer than marker: ${f} (mtime: ${mtime}, marker: ${markerMtime})`);
        return true;
      }
    } else {
      console.log(`[pretest] File missing (ignored for build check): ${f}`);
    }
  }
  console.log('[pretest] No build needed. Marker is up to date.');
  return false;
}

function isTestEnv() {
  return (
    process.env.MOCHA || process.argv.some(arg => arg.includes('mocha')) || process.env.JEST_WORKER_ID !== undefined
  );
}

// If the marker file is older than the source files, rebuild
if (needsBuild() && !isTestEnv()) {
  console.log('Building hexo...');
  spawnSync('npm', ['run', 'build'], {
    stdio: 'inherit',
    cwd: process.cwd(),
    shell: true
  });
  fs.mkdirSync(path.dirname(markerFile), { recursive: true });
  fs.writeFileSync(markerFile, String(Date.now()));
}

// Convert extension to .cjs for CommonJS files

/**
 * Recursively updates all import/require extensions from .js to .cjs, then copies .js files to .cjs in the specified directory and its subdirectories.
 * > while running CJS under ESM environment, we need to ensure that all CommonJS files use .cjs extension to avoid conflicts.
 * @param {string} [dir] - The directory to start from. Defaults to '../dist/cjs' relative to this file.
 */
function convertCjs(dir) {
  if (!dir) {
    dir = path.join(__dirname, '../dist/cjs');
  }

  const excludeList = ['highlight.js'];
  // Helper to check if the import path ends with an excluded name
  function isExcluded(fullPath) {
    const result = excludeList.some(name => fullPath === name || fullPath.endsWith('/' + name));
    if (result) {
      console.debug(`[convertCjs] Excluded from replacement: ${fullPath}`);
    }
    return result;
  }

  let failed = false;
  try {
    if (!fs.existsSync(dir)) {
      console.error(`[convertCjs] Directory does not exist: ${dir}`);
      return false;
    }
    fs.readdirSync(dir).forEach(file => {
      const filePath = path.join(dir, file);
      let stat;
      try {
        stat = fs.statSync(filePath);
      } catch (e) {
        console.error(`[convertCjs] Failed to stat: ${filePath}`, e);
        failed = true;
        return;
      }
      if (stat.isDirectory()) {
        if (!convertCjs(filePath)) failed = true;
      } else if (file.endsWith('.js')) {
        try {
          let content = fs.readFileSync(filePath, 'utf8');
          // Replace .js with .cjs in require/import statements, but exclude highlight.js and prism.js
          const originalContent = content;
          content = content.replace(/(require\(["'`].*?)([^"'`]+)\.js(["'`]\))/g, (match, p1, modulePath, p3) => {
            if (isExcluded(modulePath)) return match;
            return /require\(["'`](\.|\.\.)\//.test(match) ? p1 + modulePath + '.cjs' + p3 : match;
          });
          content = content.replace(/(from\s+["'`].*?)([^"'`]+)\.js(["'`])/g, (match, p1, modulePath, p3) => {
            if (isExcluded(modulePath)) return match;
            return /from\s+["'`](\.|\.\.)\//.test(match) ? p1 + modulePath + '.cjs' + p3 : match;
          });
          content = content.replace(/(import\s*\(["'`].*?)([^"'`]+)\.js(["'`]\))/g, (match, p1, modulePath, p3) => {
            if (isExcluded(modulePath)) return match;
            return /import\s*\(["'`](\.|\.\.)\//.test(match) ? p1 + modulePath + '.cjs' + p3 : match;
          });
          if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
          }
          // Copy the file to .cjs if it doesn't already exist or is different
          const newPath = filePath.replace(/\.js$/, '.cjs');
          if (!fs.existsSync(newPath) || fs.readFileSync(newPath, 'utf8') !== content) {
            fs.copyFileSync(filePath, newPath);
          }
        } catch (e) {
          console.error(`[convertCjs] Error processing file: ${filePath}`, e);
          failed = true;
        }
      }
    });
    return !failed;
  } catch (e) {
    console.error('[convertCjs] Fatal error:', e);
    return false;
  }
}

// Ensure CJS files are renamed before running tests
console.log('Converting CJS files...', convertCjs() ? 'done' : 'failed');
