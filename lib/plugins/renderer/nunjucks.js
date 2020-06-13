
'use strict';

const nunjucks = require('nunjucks');
const fs = require('hexo-fs');

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
  } else if (typeof value === 'object' && Boolean(value)) {
    const arr = [];
    for (const k in value) { arr.push(value[k]); }
    return arr;
  }

  try {
    return [...value];
  } catch (e) {
    return [];
  }
}

const env = nunjucks.configure({
  noCache: true,
  autoescape: false,
  throwOnUndefined: false,
  trimBlocks: false,
  lstripBlocks: false
});

env.addFilter('toArray', toArray);

function render(data, locals) {
  if ('text' in data) {
    return nunjucks.renderString(data.text, locals);
  }

  return nunjucks.render(data.path, locals);
}
// hexo Renderer API implicitly requires 'compile' to be a value of the rendering function
render.compile = data => {
  const compiled = nunjucks.compile(
    'text' in data ? data.text : fs.readFileSync(data.path)
  );

  return compiled.render.bind(compiled);
};

module.exports = render;
