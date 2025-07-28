const MOCHA_ENV = (process.env.MOCHA_ENV || 'ts').trim();
const isRunningCJS = MOCHA_ENV === 'cjs';
const isRunningESM = MOCHA_ENV === 'esm';
const isRunningTS = MOCHA_ENV === 'ts';

/**
 * @type {import('mocha').MochaOptions}
 */
const mochaOptions = {
  color: true,
  reporter: 'spec',
  ui: 'bdd',
  fullTrace: true,
  exit: true,
  watchFiles: ['lib/**/*.ts', 'test/**/*.ts'],
  watchIgnore: ['**/node_modules/**', '**/tmp/**', './dist'],
  recursive: true
};

if (isRunningCJS) {
  mochaOptions.extension = ['js', 'cjs'];
  mochaOptions.spec = 'test/scripts/**/*.{js,cjs}';
} else if (isRunningESM) {
  mochaOptions.extension = ['mjs'];
  mochaOptions.spec = 'test/scripts/**/*.mjs';
} else if (isRunningTS) {
  mochaOptions.extension = ['ts'];
  mochaOptions.require = ['ts-node/register/transpile-only'];
  mochaOptions.spec = 'test/scripts/**/*.ts';
} else {
  // Unknown mode, print error and exit
  throw new Error(`Unknown MOCHA_ENV: ${MOCHA_ENV}. Please set MOCHA_ENV to one of 'cjs', 'esm', or 'ts'.`);
}

let mode;
if (isRunningCJS) {
  mode = 'CommonJS';
} else if (isRunningESM) {
  mode = 'ESM';
} else if (isRunningTS) {
  mode = 'TypeScript';
} else {
  mode = 'unknown';
}
console.log(`Running tests in ${mode} mode`);

module.exports = mochaOptions;
