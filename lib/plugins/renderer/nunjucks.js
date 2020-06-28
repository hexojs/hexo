
'use strict';

const nunjucks = require('nunjucks');
const fs = require('hexo-fs');
const { dirname } = require('path');

function toArray(value) {
  if (Array.isArray(value)) {
    // Return if given value is an Array
    return value;
  } else if (typeof value.toArray === 'function') {
    return value.toArray();
  } else if (value instanceof Map) {
    const arr = [];
    value.forEach(v => arr.push(v));
    return arr;
  } else if (value instanceof Set || typeof value === 'string') {
    return [...value];
  } else if (typeof value === 'object' && value instanceof Object && Boolean(value)) {
    return Object.values(value);
  }

  return [];
}

function safeJsonStringify(json, spacer = undefined) {
  if (typeof json !== 'undefined' && json !== null) {
    return JSON.stringify(json, null, spacer);
  }

  return '""';
}

function njkCompile(data) {
  const env = nunjucks.configure(dirname(data.path), {
    autoescape: false,
    throwOnUndefined: false,
    trimBlocks: false,
    lstripBlocks: false
  });
  env.addFilter('toArray', toArray);
  env.addFilter('safeDump', safeJsonStringify);

  return nunjucks.compile(
    'text' in data ? data.text : fs.readFileSync(data.path),
    env,
    data.path
  );
}

function njkRenderer(data, locals) {
  return njkCompile(data).render(locals);
}

njkRenderer.compile = data => {
  const compiled = njkCompile(data);
  // Need a closure to keep the compiled template.
  return locals => compiled.render(locals);
};

module.exports = njkRenderer;
