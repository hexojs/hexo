'use strict';

const { performance, PerformanceObserver } = require('perf_hooks');
const { spawnSync, spawn } = require('child_process');
const os = require('os');
const fs = require('hexo-fs');
const path = require('path');
const chalk = require('chalk');
let npmScript = 'npm';
let npxScript = 'npx';
const testDir = path.resolve('.tmp-hexo-theme-unit-test');
const hooks = [
  { regex: /Hexo version/, tag: 'hexo-begin'},
  { regex: /Start processing/, tag: 'processing'},
  { regex: /Files loaded/, tag: 'file-loaded'},
  { regex: /generated in/, tag: 'generated'},
  { regex: /Database saved/, tag: 'database-saved'}
];

if (os.platform() === 'win32') {
  npmScript = 'npm.cmd';
  npxScript = 'npx.cmd';
}

(async () => {
  init();
  // make sure no cache files
  cleanup();
  await run_benchmark('Cold processing');
  await run_benchmark('Hot processing');
  cleanup();
  await run_benchmark('Another Cold processing');
  cleanup();
})();

async function run_benchmark(name) {
  return new Promise(resolve => {
    const result = {};
    const obs = new PerformanceObserver(list => {
      const { name, duration: _duration } = list.getEntries()[0];
      const duration = _duration / 1000;
      result[name] = {
        'Cost time (s)': `${duration.toFixed(2)}s`
      };
      if (duration > 20) {
        console.log(chalk.red('!! Performance regression detected !!'));
      }
    });
    obs.observe({ entryTypes: ['measure'] });

    const npx = spawn(npxScript, ['--no-install', 'hexo', 'g', '--debug'], { cwd: testDir });
    hooks.forEach(({ regex, tag}) => {
      npx.stdout.on('data', function listener(data) {
        const string = data.toString('utf-8');
        if (regex.test(string)) {
          performance.mark(tag);
          npx.stdout.removeListener('data', listener);
        }
      });
    });

    npx.on('close', () => {
      performance.measure('Load Plugin/Scripts/Database', 'hexo-begin', 'processing');
      performance.measure('Process Source', 'processing', 'file-loaded');
      performance.measure('Render Files', 'file-loaded', 'generated');
      performance.measure('Save Database', 'generated', 'database-saved');
      performance.measure('Total time', 'hexo-begin', 'database-saved');
      console.log(name);
      console.table(result);
      obs.disconnect();
      resolve();
    });
  });
}

function cleanup() {
  spawnSync(npxScript, ['--no-install', 'hexo', 'clean'], { cwd: testDir });
}

function init() {
  spawnSync('git',
    [
      'clone',
      'https://github.com/hexojs/hexo-theme-unit-test.git',
      testDir,
      '--depth=1']);
  spawnSync('git',
    [
      'clone',
      'https://github.com/hexojs/hexo-theme-landscape',
      path.resolve(testDir, 'themes', 'landscape'),
      '--depth=1'
    ]);
  spawnSync('git',
    [
      'clone',
      'https://github.com/SukkaLab/hexo-many-posts.git',
      path.resolve(testDir, 'source', '_posts', 'hexo-many-posts'),
      '--depth=1'
    ]);
  spawnSync(npmScript, ['install', '--silent'], { cwd: testDir });
  fs.rmdirSync(path.resolve(testDir, 'node_modules', 'hexo'));

  if (os.platform() === 'win32') {
    spawnSync('cmd', [
      '/s', '/c',
      'mklink',
      '/D',
      path.resolve(testDir, 'node_modules', 'hexo'),
      path.resolve(__dirname, '..')
    ]);
    spawnSync('cmd', [
      '/s', '/c',
      'mklink',
      '/D',
      path.resolve(testDir, 'node_modules', 'hexo-cli'),
      path.resolve(__dirname, '..', 'node_modules', 'hexo-cli')
    ]);
  } else {
    spawnSync('ln', [
      '-sf',
      path.resolve(__dirname, '..'),
      path.resolve(testDir, 'node_modules', 'hexo')
    ]);
  }
}
