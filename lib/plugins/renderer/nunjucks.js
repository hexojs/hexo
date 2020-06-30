
'use strict';

const nunjucks = require('nunjucks');
const { readFileSync } = require('hexo-fs');
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

const nunjucksCfg = {
  autoescape: false,
  throwOnUndefined: false,
  trimBlocks: false,
  lstripBlocks: false
};

const nunjucksAddFilter = env => {
  env.addFilter('toarray', toArray);
  env.addFilter('safedump', safeJsonStringify);
};

function njkCompile(data) {
  let env;
  if (data.path) {
    env = nunjucks.configure(dirname(data.path), nunjucksCfg);
  } else {
    env = nunjucks.configure(nunjucksCfg);
  }
  nunjucksAddFilter(env);

  const text = 'text' in data ? data.text : readFileSync(data.path);

  return nunjucks.compile(text, env, data.path);
}

function njkRenderer(data, locals) {
  return njkCompile(data).render(locals);
}

njkRenderer.compile = data => {
  // Need a closure to keep the compiled template.
  return locals => njkCompile(data).render(locals);
};

module.exports = njkRenderer;
