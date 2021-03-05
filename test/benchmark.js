'use strict';

const { performance, PerformanceObserver } = require('perf_hooks');
const { spawn } = require('child_process');
const { spawn: spawnAsync } = require('hexo-util');
const { rmdir, exists } = require('hexo-fs');
const { join, resolve } = require('path');
const log = require('hexo-log')();
const { red } = require('chalk');
const hooks = [
  { regex: /Hexo version/, tag: 'hexo-begin' },
  { regex: /Start processing/, tag: 'processing' },
  { regex: /Rendering post/, tag: 'render-post' },
  { regex: /Files loaded/, tag: 'file-loaded' },
  { regex: /generated in/, tag: 'generated' },
  { regex: /Database saved/, tag: 'database-saved' }
];

const isWin32 = require('os').platform() === 'win32';

const npmScript = isWin32 ? 'npm.cmd' : 'npm';

const testDir = resolve('.tmp-hexo-theme-unit-test');
const zeroEksDir = process.env.TRAVIS_BUILD_DIR
  ? join(process.env.TRAVIS_BUILD_DIR, '0x')
  : resolve(testDir, '0x');
const hexoBin = resolve(testDir, 'node_modules/.bin/hexo');

const zeroEks = require('0x');

let isProfiling = process.argv.join(' ').includes('--profiling');
let isBenchmark = process.argv.join(' ').includes('--benchmark');

if (!isProfiling && !isBenchmark) {
  isProfiling = true;
  isBenchmark = true;
}

(async () => {
  await init();

  if (isBenchmark) {
    log.info('Running benchmark');
    await cleanUp();
    await run_benchmark('Cold processing');
    await run_benchmark('Hot processing');
    await cleanUp();
    await run_benchmark('Another Cold processing');
  }

  if (isProfiling) {
    await cleanUp();
    await profiling();
  }
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
        log.fatal(red('!! Performance regression detected !!'));
      }
    });
    obs.observe({ entryTypes: ['measure'] });

    const hexo = spawn('node', [hexoBin, 'g', '--debug'], { cwd: testDir });
    hooks.forEach(({ regex, tag }) => {
      hexo.stdout.on('data', function listener(data) {
        const string = data.toString('utf-8');
        if (regex.test(string)) {
          performance.mark(tag);
          hexo.stdout.removeListener('data', listener);
        }
      });
    });

    hexo.on('close', () => {
      performance.measure('Load Plugin/Scripts/Database', 'hexo-begin', 'processing');

      if (name === 'Hot processing') {
        performance.measure('Process Source', 'processing', 'file-loaded');
      } else {
        performance.measure('Process Source', 'processing', 'render-post');
        performance.measure('Render Posts', 'render-post', 'file-loaded');
      }

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

async function cleanUp() {
  return spawnAsync(hexoBin, ['clean'], { cwd: testDir });
}

async function gitClone(repo, dir, depth = 1) {
  return spawnAsync('git', ['clone', repo, dir, `--depth=${depth}`]);
}

async function init() {
  if (await exists(testDir)) {
    log.info(`"${testDir}" already exists. Skipping benchmark environment setup.`);
  } else {
    log.info('Setting up a dummy hexo site with 500 posts');
    await gitClone('https://github.com/hexojs/hexo-theme-unit-test.git', testDir);
    await gitClone('https://github.com/hexojs/hexo-theme-landscape', resolve(testDir, 'themes', 'landscape'));
    await gitClone('https://github.com/SukkaLab/hexo-many-posts.git', resolve(testDir, 'source', '_posts', 'hexo-many-posts'));
  }

  log.info('Installing dependencies');
  // Always re-install dependencies
  if (await exists(resolve(testDir, 'node_modules'))) await rmdir(resolve(testDir, 'node_modules'));
  await spawnAsync(npmScript, ['install', '--silent'], { cwd: testDir });

  log.info('Replacing hexo');
  await rmdir(resolve(testDir, 'node_modules', 'hexo'));

  if (isWin32) {
    await spawnAsync('cmd', [
      '/s', '/c', 'mklink', '/D',
      resolve(testDir, 'node_modules', 'hexo'),
      resolve(__dirname, '..')
    ]);

    await rmdir(resolve(testDir, 'node_modules', 'hexo-cli'));

    await spawnAsync('cmd', [
      '/s', '/c', 'mklink', '/D',
      resolve(testDir, 'node_modules', 'hexo-cli'),
      resolve(__dirname, '..', 'node_modules', 'hexo-cli')
    ]);
  } else {
    await spawnAsync('ln', [
      '-sf',
      resolve(__dirname, '..'),
      resolve(testDir, 'node_modules', 'hexo')
    ]);
  }
}

async function profiling() {
  // Clean up 0x dir before profiling
  if (await exists(zeroEksDir)) await rmdir(zeroEksDir);

  const zeroEksOpts = {
    argv: [hexoBin, 'g', '--cwd', testDir],
    workingDir: '.', // A workaround for https://github.com/davidmarkclements/0x/issues/228
    outputDir: zeroEksDir,
    title: 'Hexo Flamegraph'
  };

  log.info('Profiling');

  const file = await zeroEks(zeroEksOpts);

  // A small hack that workaround 0x's broken stdout handling
  console.log('');

  log.info(file);
}
