const { performance, PerformanceObserver } = require('perf_hooks');
const { spawn } = require('child_process');
const { spawn: spawnAsync } = require('hexo-util');
const { rmdir, exists } = require('hexo-fs');
const { appendFileSync: appendFile } = require('fs');
const { resolve } = require('path');
const log = require('hexo-log').default();
const { red } = require('picocolors');
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
const zeroEksDir = resolve(testDir, '0x');
const hexoBin = resolve(testDir, 'node_modules/.bin/hexo');

const isGitHubActions = process.env.GITHUB_ACTIONS;

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

    if (isGitHubActions) {
      log.info('Running in GitHub Actions.');
      appendFile(process.env.GITHUB_STEP_SUMMARY, '# Benchmark Result\n');
    }

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
  let measureFinished = false;

  return new Promise(resolve => {
    const result = {};
    const obs = new PerformanceObserver(list => {
      list
        .getEntries()
        .sort((a, b) => a.detail - b.detail)
        .forEach(entry => {
          const { name, duration: _duration } = entry;
          const duration = _duration / 1000;
          result[name] = {
            'Cost time (s)': `${duration.toFixed(2)}s`
          };
          if (duration > 20) {
            log.fatal(red('!! Performance regression detected !!'));
          }
        });

      if (measureFinished) {
        obs.disconnect();

        if (isGitHubActions) {
          appendFile(process.env.GITHUB_STEP_SUMMARY, `\n## ${name}\n\n| Step | Cost time (s) |\n| --- | --- |\n${Object.keys(result).map(name => `| ${name} | ${result[name]['Cost time (s)']} |`).join('\n')}\n`);
        }

        console.log(name);
        console.table(result);

        resolve(result);
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
        performance.measure('Process Source', {
          start: 'processing',
          end: 'file-loaded',
          detail: 0
        });
      } else {
        performance.measure('Process Source', {
          start: 'processing',
          end: 'render-post',
          detail: 1
        });
        performance.measure('Render Posts', {
          start: 'render-post',
          end: 'file-loaded',
          detail: 2
        });
      }

      performance.measure('Render Files', {
        start: 'file-loaded',
        end: 'generated',
        detail: 3
      });
      performance.measure('Save Database', {
        start: 'generated',
        end: 'database-saved',
        detail: 4
      });

      performance.measure('Total time', {
        start: 'hexo-begin',
        end: 'database-saved',
        detail: 5
      });

      measureFinished = true;
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
    await gitClone('https://github.com/hexojs/hexo-many-posts.git', resolve(testDir, 'source', '_posts', 'hexo-many-posts'));
  }

  log.info('Installing dependencies');
  // Always re-install dependencies
  if (await exists(resolve(testDir, 'node_modules'))) await rmdir(resolve(testDir, 'node_modules'));
  await spawnAsync(npmScript, ['install', '--silent'], { cwd: testDir });

  log.info('Build hexo');
  await spawnAsync(npmScript, ['run', 'build']);

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
