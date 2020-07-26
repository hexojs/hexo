'use strict';

const { env } = process;

const ANSI_RESET = '\u001b[0m';
const underline = str => '\u001b[4m' + str + ANSI_RESET;
const blue = str => '\u001b[34m' + str + ANSI_RESET;
const cyanBright = str => '\u001b[96m' + str + ANSI_RESET;
const HEXO = blue('Hexo');

// Adopted from opencollective-postinstall & core-js postinstall
// https://github.com/opencollective/opencollective-postinstall/blob/master/index.js
// https://github.com/zloirock/core-js/blob/master/packages/core-js/postinstall.js
const isTrue = value => Boolean(value)
  && value !== '0'
  && value !== 'false'
  && value !== 'False'; // Win32

const isCI = [
  'BUILD_NUMBER',
  'CI',
  'CONTINUOUS_INTEGRATION',
  'DRONE',
  'RUN_ID'
].some(k => isTrue(env[k]));

const envDisable = isTrue(process.env.DISABLE_OPENCO00ECTIVE) || isTrue(process.env.OPEN_SOURCE_CONTRIBUTOR) || isCI;
const npmLogLevelDisplay = ['silent', 'error', 'warn'].includes(env.npm_config_loglevel);

const output = `
${blue('         LLLL           ')}
${blue('      LLLLLLLLLL        ')}
${blue('   LLLLLLLLLLLLLLLL     ')}Thank you for using ${HEXO}!
${blue('LLLLLL  LLLLLL  LLLLLL  ')}
${blue('LLLLLL  LLLLLL  LLLLLL  ')}Please consider supporting the project:
${blue('LLLLLL          LLLLLL  ')}${cyanBright('> ' + underline('https://opencollective.com/hexo/donate'))}
${blue('LLLLLL  LLLLLL  LLLLLL  ')}
${blue('LLLLLL  LLLLLL  LLLLLL  ')}${HEXO} is looking for contributors:
${blue('   LLLLLLLLLLLLLLLL     ')}${cyanBright('> ' + underline('https://hexo.io/docs/contributing'))}
${blue('      LLLLLLLLLL        ')}
${blue('         LLLL           ')}
`;

if (!(envDisable || npmLogLevelDisplay)) {
  console.log(output);
}
