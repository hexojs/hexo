'use strict';

const backtickCodeBlock = require('./backtick_codeblock');

// eslint-disable-next-line node/no-unsupported-features/node-builtins
const { isMainThread, parentPort } = require('worker_threads');

if (isMainThread) throw new Error('It is not a worker, it is now at Main Thread.');

parentPort.on('message', ({ input, siteCfg }) => {
  const result = backtickCodeBlock(input, siteCfg);

  parentPort.postMessage(result);
});
