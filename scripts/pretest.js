import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const libDir = path.resolve(__dirname, '../lib');
const markerFile = path.resolve(__dirname, '../tmp/.last_build');
const extraFiles = [
  path.resolve(__dirname, '../test/utils.cjs'),
  path.resolve(__dirname, '../test/dual_mode.spec.ts'),
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
  if (!fs.existsSync(markerFile)) return true;
  const markerMtime = fs.statSync(markerFile).mtimeMs;
  const files = getAllFiles(libDir).concat(extraFiles);
  return files.some(f => fs.existsSync(f) && fs.statSync(f).mtimeMs > markerMtime);
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
